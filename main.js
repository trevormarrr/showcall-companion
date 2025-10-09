const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const WebSocket = require('ws')

class ShowCallInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.ws = null
		this.reconnectTimer = null
		this.status = {
			connected: false,
			program: [],
			preview: null,
			bpm: 120,
			layers: {}, // Track active clips per layer
			columns: {}, // Track active clips per column
			clips: {}, // Track individual clip states
			composition: {
				name: '',
				columns: 32,
				layers: 8
			}
		}
		this.lastStatusUpdate = Date.now()
		this.connectionRetryCount = 0
		this.maxRetries = 10
	}

	async init(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)
		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()
		this.connectWebSocket()
		
		// Initialize empty state
		this.updateClipStates()
	}

	async destroy() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
		}
		if (this.ws) {
			this.ws.close()
		}
	}

	async configUpdated(config) {
		this.config = config
		this.reconnectWebSocket()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'ShowCall Host',
				width: 8,
				default: 'localhost'
			},
			{
				type: 'number',
				id: 'port',
				label: 'ShowCall Port',
				width: 4,
				min: 1,
				max: 65535,
				default: 3200
			}
		]
	}

	connectWebSocket() {
		if (this.ws) {
			this.ws.close()
		}

		const wsUrl = `ws://${this.config.host || 'localhost'}:${this.config.port || 3200}/api/companion`
		this.log('info', `Connecting to ShowCall at ${wsUrl} (attempt ${this.connectionRetryCount + 1}/${this.maxRetries})`)

		this.ws = new WebSocket(wsUrl)

		this.ws.on('open', () => {
			this.log('info', 'Connected to ShowCall')
			this.updateStatus(InstanceStatus.Ok)
			this.status.connected = true
			this.connectionRetryCount = 0
			this.setVariableValues({ connection_status: 'Connected' })
			
			// Request initial status and composition info
			this.sendCommand('get_status')
			this.sendCommand('get_composition')
			
			// Check feedbacks immediately on connection
			this.checkFeedbacks()
		})

		this.ws.on('message', (data) => {
			try {
				const message = JSON.parse(data)
				this.handleMessage(message)
			} catch (error) {
				this.log('error', `Error parsing WebSocket message: ${error.message}`)
			}
		})

		this.ws.on('close', () => {
			this.log('warn', 'Disconnected from ShowCall')
			this.updateStatus(InstanceStatus.Disconnected)
			this.status.connected = false
			this.setVariableValues({ connection_status: 'Disconnected' })
			
			// Clear all active states on disconnect
			this.clearAllStates()
			
			// Attempt to reconnect with exponential backoff
			if (this.connectionRetryCount < this.maxRetries) {
				const delay = Math.min(5000 * Math.pow(1.5, this.connectionRetryCount), 30000)
				this.connectionRetryCount++
				this.reconnectTimer = setTimeout(() => {
					this.connectWebSocket()
				}, delay)
			} else {
				this.log('error', 'Max reconnection attempts reached. Please check ShowCall connection.')
				this.updateStatus(InstanceStatus.ConnectionFailure)
			}
		})

		this.ws.on('error', (error) => {
			this.log('error', `WebSocket error: ${error.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure)
		})
	}

	reconnectWebSocket() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
		}
		this.connectWebSocket()
	}

	sendCommand(action, params = {}) {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			const message = { action, ...params }
			this.ws.send(JSON.stringify(message))
		} else {
			this.log('warn', 'Cannot send command - not connected to ShowCall')
		}
	}

	handleMessage(message) {
		this.lastStatusUpdate = Date.now()
		
		if (message.type === 'status') {
			// Deep merge the status data
			this.status = { ...this.status, ...message.data }
			this.updateClipStates()
			this.updateVariables()
			this.checkFeedbacks()
		} else if (message.type === 'composition') {
			this.status.composition = { ...this.status.composition, ...message.data }
			this.log('debug', `Composition updated: ${message.data.name || 'Unknown'} (${message.data.columns}x${message.data.layers})`)
		} else if (message.type === 'response') {
			this.log('debug', `Command response: ${message.message}`)
		} else if (message.type === 'error') {
			this.log('error', `ShowCall error: ${message.message}`)
		} else if (message.type === 'clip_triggered') {
			// Handle real-time clip trigger notifications
			this.log('debug', `Clip triggered: Layer ${message.layer}, Column ${message.column}`)
			this.checkFeedbacks()
		} else if (message.type === 'column_triggered') {
			// Handle real-time column trigger notifications
			this.log('debug', `Column triggered: ${message.column}`)
			this.checkFeedbacks()
		}
	}

	updateClipStates() {
		// Reset all states
		this.status.layers = {}
		this.status.columns = {}
		this.status.clips = {}

		// Process active clips in program
		if (this.status.program && Array.isArray(this.status.program)) {
			this.status.program.forEach(clip => {
				const layer = clip.layer
				const column = clip.column
				const clipKey = `${layer}-${column}`

				// Track individual clips
				this.status.clips[clipKey] = {
					active: true,
					layer: layer,
					column: column,
					clipName: clip.clipName || '',
					opacity: clip.opacity || 1.0,
					volume: clip.volume || 1.0,
					position: clip.position || 0,
					duration: clip.duration || 0
				}

				// Track layers
				if (!this.status.layers[layer]) {
					this.status.layers[layer] = { active: true, clips: [] }
				}
				this.status.layers[layer].clips.push(clipKey)

				// Track columns
				if (!this.status.columns[column]) {
					this.status.columns[column] = { active: true, clips: [] }
				}
				this.status.columns[column].clips.push(clipKey)
			})
		}
	}

	clearAllStates() {
		this.status.layers = {}
		this.status.columns = {}
		this.status.clips = {}
		this.status.program = []
		this.checkFeedbacks()
	}

	initActions() {
		this.setActionDefinitions({
			trigger_clip: {
				name: 'Trigger Clip',
				options: [
					{
						type: 'number',
						label: 'Layer',
						id: 'layer',
						min: 1,
						max: 8,
						default: 1,
						required: true
					},
					{
						type: 'number',
						label: 'Column',
						id: 'column',
						min: 1,
						max: 32,
						default: 1,
						required: true
					}
				],
				callback: async (action) => {
					this.sendCommand('trigger_clip', {
						layer: action.options.layer,
						column: action.options.column
					})
				}
			},
			trigger_column: {
				name: 'Trigger Column',
				options: [
					{
						type: 'number',
						label: 'Column',
						id: 'column',
						min: 1,
						max: 32,
						default: 1,
						required: true
					}
				],
				callback: async (action) => {
					this.sendCommand('trigger_column', {
						column: action.options.column
					})
				}
			},
			stop_clip: {
				name: 'Stop Clip',
				options: [
					{
						type: 'number',
						label: 'Layer',
						id: 'layer',
						min: 1,
						max: 8,
						default: 1,
						required: true
					},
					{
						type: 'number',
						label: 'Column',
						id: 'column',
						min: 1,
						max: 32,
						default: 1,
						required: true
					}
				],
				callback: async (action) => {
					this.sendCommand('stop_clip', {
						layer: action.options.layer,
						column: action.options.column
					})
				}
			},
			stop_layer: {
				name: 'Stop Layer',
				options: [
					{
						type: 'number',
						label: 'Layer',
						id: 'layer',
						min: 1,
						max: 8,
						default: 1,
						required: true
					}
				],
				callback: async (action) => {
					this.sendCommand('stop_layer', {
						layer: action.options.layer
					})
				}
			},
			stop_column: {
				name: 'Stop Column',
				options: [
					{
						type: 'number',
						label: 'Column',
						id: 'column',
						min: 1,
						max: 32,
						default: 1,
						required: true
					}
				],
				callback: async (action) => {
					this.sendCommand('stop_column', {
						column: action.options.column
					})
				}
			},
			cut_to_program: {
				name: 'Cut to Program',
				options: [],
				callback: async () => {
					this.sendCommand('cut_to_program')
				}
			},
			clear_all: {
				name: 'Clear All',
				options: [],
				callback: async () => {
					this.sendCommand('clear_all')
				}
			},
			execute_macro: {
				name: 'Execute Macro',
				options: [
					{
						type: 'textinput',
						label: 'Macro ID',
						id: 'macro_id',
						default: '',
						required: true
					}
				],
				callback: async (action) => {
					this.sendCommand('execute_macro', {
						macro_id: action.options.macro_id
					})
				}
			},
			set_bpm: {
				name: 'Set BPM',
				options: [
					{
						type: 'number',
						label: 'BPM',
						id: 'bpm',
						min: 60,
						max: 200,
						default: 120,
						required: true
					}
				],
				callback: async (action) => {
					this.sendCommand('set_bpm', {
						bpm: action.options.bpm
					})
				}
			},
			adjust_layer_opacity: {
				name: 'Adjust Layer Opacity',
				options: [
					{
						type: 'number',
						label: 'Layer',
						id: 'layer',
						min: 1,
						max: 8,
						default: 1,
						required: true
					},
					{
						type: 'number',
						label: 'Opacity (0-100)',
						id: 'opacity',
						min: 0,
						max: 100,
						default: 100,
						required: true
					}
				],
				callback: async (action) => {
					this.sendCommand('set_layer_opacity', {
						layer: action.options.layer,
						opacity: action.options.opacity / 100
					})
				}
			},
			tap_tempo: {
				name: 'Tap Tempo',
				options: [],
				callback: async () => {
					this.sendCommand('tap_tempo')
				}
			},
			resync_composition: {
				name: 'Resync Composition',
				options: [],
				callback: async () => {
					this.sendCommand('get_composition')
					this.sendCommand('get_status')
				}
			}
		})
	}

	initFeedbacks() {
		this.setFeedbackDefinitions({
			clip_active: {
				name: 'Clip Active',
				type: 'boolean',
				label: 'Clip is active in program',
				description: 'Show if a specific clip is currently active',
				options: [
					{
						type: 'number',
						label: 'Layer',
						id: 'layer',
						min: 1,
						max: 8,
						default: 1,
						required: true
					},
					{
						type: 'number',
						label: 'Column',
						id: 'column',
						min: 1,
						max: 32,
						default: 1,
						required: true
					}
				],
				defaultStyle: {
					bgcolor: 0xff0000, // Red
					color: 0xffffff    // White
				},
				callback: (feedback) => {
					const { layer, column } = feedback.options
					const clipKey = `${layer}-${column}`
					return this.status.clips[clipKey]?.active === true
				}
			},
			
			layer_active: {
				name: 'Layer Active',
				type: 'boolean',
				label: 'Layer has active clips',
				description: 'Show if any clips are active in this layer',
				options: [
					{
						type: 'number',
						label: 'Layer',
						id: 'layer',
						min: 1,
						max: 8,
						default: 1,
						required: true
					}
				],
				defaultStyle: {
					bgcolor: 0xffaa00, // Orange
					color: 0x000000    // Black
				},
				callback: (feedback) => {
					const { layer } = feedback.options
					return this.status.layers[layer]?.active === true
				}
			},
			
			column_active: {
				name: 'Column Active',
				type: 'boolean',
				label: 'Column has active clips',
				description: 'Show if any clips are active in this column',
				options: [
					{
						type: 'number',
						label: 'Column',
						id: 'column',
						min: 1,
						max: 32,
						default: 1,
						required: true
					}
				],
				defaultStyle: {
					bgcolor: 0x00aaff, // Blue
					color: 0xffffff    // White
				},
				callback: (feedback) => {
					const { column } = feedback.options
					return this.status.columns[column]?.active === true
				}
			},
			
			any_clips_active: {
				name: 'Any Clips Active',
				type: 'boolean',
				label: 'Any clips are running',
				description: 'Show if any clips are currently active',
				options: [],
				defaultStyle: {
					bgcolor: 0x8a2be2, // Purple
					color: 0xffffff    // White
				},
				callback: () => {
					return this.status.program && this.status.program.length > 0
				}
			},
			
			connection_status: {
				name: 'Connection Status',
				type: 'boolean',
				label: 'ShowCall connected',
				description: 'Show connection status to ShowCall',
				options: [],
				defaultStyle: {
					bgcolor: 0x00ff00, // Green
					color: 0x000000    // Black
				},
				callback: () => {
					return this.status.connected
				}
			},
			
			bpm_range: {
				name: 'BPM in Range',
				type: 'boolean',
				label: 'BPM within specified range',
				description: 'Show when BPM is within the specified range',
				options: [
					{
						type: 'number',
						label: 'Min BPM',
						id: 'min_bpm',
						min: 60,
						max: 200,
						default: 110,
						required: true
					},
					{
						type: 'number',
						label: 'Max BPM',
						id: 'max_bpm',
						min: 60,
						max: 200,
						default: 130,
						required: true
					}
				],
				defaultStyle: {
					bgcolor: 0x32cd32, // Lime Green
					color: 0x000000    // Black
				},
				callback: (feedback) => {
					const { min_bpm, max_bpm } = feedback.options
					const currentBpm = this.status.bpm || 120
					return currentBpm >= min_bpm && currentBpm <= max_bpm
				}
			},
			
			clip_opacity_level: {
				name: 'Clip Opacity Level',
				type: 'advanced',
				label: 'Clip opacity affects button brightness',
				description: 'Button brightness reflects clip opacity (0-100%)',
				options: [
					{
						type: 'number',
						label: 'Layer',
						id: 'layer',
						min: 1,
						max: 8,
						default: 1,
						required: true
					},
					{
						type: 'number',
						label: 'Column',
						id: 'column',
						min: 1,
						max: 32,
						default: 1,
						required: true
					}
				],
				callback: (feedback) => {
					const { layer, column } = feedback.options
					const clipKey = `${layer}-${column}`
					const clip = this.status.clips[clipKey]
					
					if (!clip || !clip.active) {
						return {}
					}
					
					const opacity = clip.opacity || 1.0
					const brightness = Math.floor(opacity * 255)
					
					return {
						bgcolor: (brightness << 16) | (brightness << 8) | brightness,
						color: brightness > 128 ? 0x000000 : 0xffffff
					}
				}
			},
			
			clip_position: {
				name: 'Clip Position',
				type: 'advanced',
				label: 'Clip position affects button color',
				description: 'Button color changes based on clip playback position',
				options: [
					{
						type: 'number',
						label: 'Layer',
						id: 'layer',
						min: 1,
						max: 8,
						default: 1,
						required: true
					},
					{
						type: 'number',
						label: 'Column',
						id: 'column',
						min: 1,
						max: 32,
						default: 1,
						required: true
					}
				],
				callback: (feedback) => {
					const { layer, column } = feedback.options
					const clipKey = `${layer}-${column}`
					const clip = this.status.clips[clipKey]
					
					if (!clip || !clip.active || !clip.duration) {
						return {}
					}
					
					const position = clip.position || 0
					const duration = clip.duration
					const progress = Math.min(position / duration, 1.0)
					
					// Color gradient from green (start) to red (end)
					const red = Math.floor(progress * 255)
					const green = Math.floor((1 - progress) * 255)
					const blue = 0
					
					return {
						bgcolor: (red << 16) | (green << 8) | blue,
						color: 0xffffff
					}
				}
			},

			clip_preview: {
				name: 'Clip in Preview',
				type: 'boolean',
				label: 'Clip is in preview',
				description: 'Show if a specific clip is in preview (not program)',
				options: [
					{
						type: 'number',
						label: 'Layer',
						id: 'layer',
						min: 1,
						max: 8,
						default: 1,
						required: true
					},
					{
						type: 'number',
						label: 'Column',
						id: 'column',
						min: 1,
						max: 32,
						default: 1,
						required: true
					}
				],
				defaultStyle: {
					bgcolor: 0x888888, // Gray
					color: 0xffffff    // White
				},
				callback: (feedback) => {
					const { layer, column } = feedback.options
					// This would need to be implemented based on preview state from ShowCall
					return this.status.preview && 
						   this.status.preview.layer === layer && 
						   this.status.preview.column === column
				}
			}
		})
	}

	initVariables() {
		this.setVariableDefinitions([
			{ variableId: 'connection_status', name: 'Connection Status' },
			{ variableId: 'bpm', name: 'BPM' },
			{ variableId: 'program_clips', name: 'Program Clips Count' },
			{ variableId: 'program_clip_names', name: 'Program Clip Names' },
			{ variableId: 'composition_name', name: 'Composition Name' },
			{ variableId: 'composition_size', name: 'Composition Size (LxC)' },
			{ variableId: 'active_layers', name: 'Active Layers Count' },
			{ variableId: 'active_columns', name: 'Active Columns Count' },
			{ variableId: 'last_triggered_clip', name: 'Last Triggered Clip' },
			{ variableId: 'connection_uptime', name: 'Connection Uptime' },
			{ variableId: 'layer_1_status', name: 'Layer 1 Status' },
			{ variableId: 'layer_2_status', name: 'Layer 2 Status' },
			{ variableId: 'layer_3_status', name: 'Layer 3 Status' },
			{ variableId: 'layer_4_status', name: 'Layer 4 Status' },
			{ variableId: 'layer_5_status', name: 'Layer 5 Status' },
			{ variableId: 'layer_6_status', name: 'Layer 6 Status' },
			{ variableId: 'layer_7_status', name: 'Layer 7 Status' },
			{ variableId: 'layer_8_status', name: 'Layer 8 Status' }
		])

		this.setVariableValues({
			connection_status: 'Disconnected',
			bpm: 120,
			program_clips: 0,
			program_clip_names: '',
			composition_name: 'Unknown',
			composition_size: '8x32',
			active_layers: 0,
			active_columns: 0,
			last_triggered_clip: 'None',
			connection_uptime: '0s',
			layer_1_status: 'Inactive',
			layer_2_status: 'Inactive',
			layer_3_status: 'Inactive',
			layer_4_status: 'Inactive',
			layer_5_status: 'Inactive',
			layer_6_status: 'Inactive',
			layer_7_status: 'Inactive',
			layer_8_status: 'Inactive'
		})
	}

	updateVariables() {
		const clipNames = this.status.program.map(clip => 
			clip.clipName ? `L${clip.layer}C${clip.column}:${clip.clipName}` : `L${clip.layer}C${clip.column}`
		).join(', ')
		
		const activeLayerCount = Object.keys(this.status.layers).length
		const activeColumnCount = Object.keys(this.status.columns).length
		
		// Calculate uptime
		const uptimeMs = this.status.connected ? Date.now() - this.lastStatusUpdate : 0
		const uptimeSeconds = Math.floor(uptimeMs / 1000)
		const uptimeStr = this.formatUptime(uptimeSeconds)
		
		// Update layer status variables
		const layerVariables = {}
		for (let i = 1; i <= 8; i++) {
			const layerActive = this.status.layers[i]?.active
			const clipCount = this.status.layers[i]?.clips?.length || 0
			layerVariables[`layer_${i}_status`] = layerActive ? `Active (${clipCount})` : 'Inactive'
		}
		
		this.setVariableValues({
			connection_status: this.status.connected ? 'Connected' : 'Disconnected',
			bpm: this.status.bpm || 120,
			program_clips: this.status.program.length,
			program_clip_names: clipNames || 'None',
			composition_name: this.status.composition.name || 'Unknown',
			composition_size: `${this.status.composition.layers || 8}x${this.status.composition.columns || 32}`,
			active_layers: activeLayerCount,
			active_columns: activeColumnCount,
			connection_uptime: uptimeStr,
			...layerVariables
		})
	}

	formatUptime(seconds) {
		if (seconds < 60) return `${seconds}s`
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
		const hours = Math.floor(seconds / 3600)
		const minutes = Math.floor((seconds % 3600) / 60)
		return `${hours}h ${minutes}m`
	}

	initPresets() {
		const presets = []

		// Basic control presets with enhanced feedback
		presets.push({
			type: 'button',
			category: 'Basic Controls',
			name: 'Cut to Program',
			style: {
				text: 'CUT',
				size: '18',
				color: 0xffffff,
				bgcolor: 0x8b0000
			},
			steps: [
				{
					down: [
						{
							actionId: 'cut_to_program'
						}
					],
					up: []
				}
			],
			feedbacks: [
				{
					feedbackId: 'connection_status',
					options: {},
					style: {
						bgcolor: 0x006400, // Dark green when connected
						color: 0xffffff
					}
				}
			]
		})

		presets.push({
			type: 'button',
			category: 'Basic Controls',
			name: 'Clear All',
			style: {
				text: 'CLEAR\\nALL',
				size: '14',
				color: 0xffffff,
				bgcolor: 0x654321
			},
			steps: [
				{
					down: [
						{
							actionId: 'clear_all'
						}
					],
					up: []
				}
			],
			feedbacks: [
				{
					feedbackId: 'any_clips_active',
					options: {},
					style: {
						bgcolor: 0xff4500, // Orange when clips are active
						color: 0xffffff
					}
				}
			]
		})

		// Tap Tempo with BPM feedback
		presets.push({
			type: 'button',
			category: 'Basic Controls',
			name: 'Tap Tempo',
			style: {
				text: 'TAP\\n$(showcall:bpm)',
				size: '14',
				color: 0xffffff,
				bgcolor: 0x483d8b
			},
			steps: [
				{
					down: [
						{
							actionId: 'tap_tempo'
						}
					],
					up: []
				}
			],
			feedbacks: [
				{
					feedbackId: 'bpm_range',
					options: {
						min_bpm: 110,
						max_bpm: 130
					},
					style: {
						bgcolor: 0x32cd32, // Lime green in range
						color: 0x000000
					}
				}
			]
		})

		// Resync button
		presets.push({
			type: 'button',
			category: 'Basic Controls',
			name: 'Resync',
			style: {
				text: 'RESYNC',
				size: '14',
				color: 0xffffff,
				bgcolor: 0x2f4f4f
			},
			steps: [
				{
					down: [
						{
							actionId: 'resync_composition'
						}
					],
					up: []
				}
			],
			feedbacks: [
				{
					feedbackId: 'connection_status',
					options: {}
				}
			]
		})

		// Enhanced clip trigger presets with multiple feedback types
		for (let layer = 1; layer <= 4; layer++) {
			for (let column = 1; column <= 8; column++) {
				presets.push({
					type: 'button',
					category: `Layer ${layer}`,
					name: `Layer ${layer} Clip ${column}`,
					style: {
						text: `L${layer}C${column}`,
						size: '14',
						color: 0xffffff,
						bgcolor: 0x202020
					},
					steps: [
						{
							down: [
								{
									actionId: 'trigger_clip',
									options: {
										layer: layer,
										column: column
									}
								}
							],
							up: []
						}
					],
					feedbacks: [
						{
							feedbackId: 'clip_active',
							options: {
								layer: layer,
								column: column
							},
							style: {
								bgcolor: 0xff0000, // Red when active
								color: 0xffffff
							}
						},
						{
							feedbackId: 'clip_opacity_level',
							options: {
								layer: layer,
								column: column
							}
						}
					]
				})
			}
		}

		// Enhanced column trigger presets with column feedback
		for (let column = 1; column <= 8; column++) {
			presets.push({
				type: 'button',
				category: 'Columns',
				name: `Column ${column}`,
				style: {
					text: `COL\\n${column}`,
					size: '14',
					color: 0xffffff,
					bgcolor: 0x2c3e50
				},
				steps: [
					{
						down: [
							{
								actionId: 'trigger_column',
								options: {
									column: column
								}
							}
						],
						up: []
					}
				],
				feedbacks: [
					{
						feedbackId: 'column_active',
						options: {
							column: column
						},
						style: {
							bgcolor: 0x00aaff, // Blue when active
							color: 0xffffff
						}
					}
				]
			})
		}

		// Layer status indicators
		for (let layer = 1; layer <= 8; layer++) {
			presets.push({
				type: 'button',
				category: 'Layer Status',
				name: `Layer ${layer} Status`,
				style: {
					text: `L${layer}\\n$(showcall:layer_${layer}_status)`,
					size: '12',
					color: 0xffffff,
					bgcolor: 0x2c2c2c
				},
				steps: [
					{
						down: [
							{
								actionId: 'stop_layer',
								options: {
									layer: layer
								}
							}
						],
						up: []
					}
				],
				feedbacks: [
					{
						feedbackId: 'layer_active',
						options: {
							layer: layer
						},
						style: {
							bgcolor: 0xffaa00, // Orange when active
							color: 0x000000
						}
					}
				]
			})
		}

		// Enhanced macro presets with better styling and feedback
		const enhancedMacros = [
			{ id: 'walkin', label: 'Walk-In', color: 0x0ea5e9, textColor: 0xffffff },
			{ id: 'sermon', label: 'Sermon', color: 0x22c55e, textColor: 0x000000 },
			{ id: 'baptism', label: 'Baptism', color: 0x8b5cf6, textColor: 0xffffff },
			{ id: 'closing', label: 'Closing', color: 0xf59e0b, textColor: 0x000000 },
			{ id: 'worship', label: 'Worship', color: 0xe11d48, textColor: 0xffffff },
			{ id: 'prayer', label: 'Prayer', color: 0x7c3aed, textColor: 0xffffff },
			{ id: 'offering', label: 'Offering', color: 0x059669, textColor: 0xffffff },
			{ id: 'announce', label: 'Announce', color: 0xdc2626, textColor: 0xffffff }
		]

		enhancedMacros.forEach(macro => {
			presets.push({
				type: 'button',
				category: 'Scene Macros',
				name: macro.label,
				style: {
					text: macro.label,
					size: '12',
					color: macro.textColor,
					bgcolor: macro.color
				},
				steps: [
					{
						down: [
							{
								actionId: 'execute_macro',
								options: {
									macro_id: macro.id
								}
							}
						],
						up: []
					}
				],
				feedbacks: [
					{
						feedbackId: 'connection_status',
						options: {},
						style: {
							bgcolor: macro.color | 0x404040, // Darker when disconnected
							color: macro.textColor
						}
					},
					{
						feedbackId: 'any_clips_active',
						options: {},
						style: {
							text: `${macro.label}\\n$(showcall:program_clips)`,
							size: '10'
						}
					}
				]
			})
		})

		// System status preset
		presets.push({
			type: 'button',
			category: 'System',
			name: 'System Status',
			style: {
				text: '$(showcall:connection_status)\\n$(showcall:program_clips) clips\\n$(showcall:active_layers) layers',
				size: '10',
				color: 0xffffff,
				bgcolor: 0x2c2c2c
			},
			steps: [
				{
					down: [],
					up: []
				}
			],
			feedbacks: [
				{
					feedbackId: 'connection_status',
					options: {},
					style: {
						bgcolor: 0x008000, // Green when connected
						color: 0xffffff
					}
				},
				{
					feedbackId: 'any_clips_active',
					options: {},
					style: {
						color: 0xffff00 // Yellow text when clips active
					}
				}
			]
		})

		// BPM Control presets
		const bpmPresets = [
			{ bpm: 100, label: 'Slow' },
			{ bpm: 120, label: 'Normal' },
			{ bpm: 140, label: 'Fast' },
			{ bpm: 160, label: 'Very Fast' }
		]

		bpmPresets.forEach(bpm => {
			presets.push({
				type: 'button',
				category: 'BPM Control',
				name: `Set BPM ${bpm.bpm}`,
				style: {
					text: `${bpm.label}\\n${bpm.bpm}`,
					size: '12',
					color: 0xffffff,
					bgcolor: 0x4a5568
				},
				steps: [
					{
						down: [
							{
								actionId: 'set_bpm',
								options: {
									bpm: bpm.bpm
								}
							}
						],
						up: []
					}
				],
				feedbacks: [
					{
						feedbackId: 'bpm_range',
						options: {
							min_bpm: bpm.bpm - 5,
							max_bpm: bpm.bpm + 5
						},
						style: {
							bgcolor: 0x00ff00, // Green when in range
							color: 0x000000
						}
					}
				]
			})
		})

		this.setPresetDefinitions(presets)
	}
}

runEntrypoint(ShowCallInstance, [])