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
			bpm: 120
		}
	}

	async init(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)
		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()
		this.connectWebSocket()
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
		this.log('info', `Connecting to ShowCall at ${wsUrl}`)

		this.ws = new WebSocket(wsUrl)

		this.ws.on('open', () => {
			this.log('info', 'Connected to ShowCall')
			this.updateStatus(InstanceStatus.Ok)
			this.status.connected = true
			this.setVariableValues({ connection_status: 'Connected' })
			
			// Request initial status
			this.sendCommand('get_status')
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
			
			// Attempt to reconnect after 5 seconds
			this.reconnectTimer = setTimeout(() => {
				this.connectWebSocket()
			}, 5000)
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
		if (message.type === 'status') {
			this.status = { ...this.status, ...message.data }
			this.updateVariables()
			this.checkFeedbacks()
		} else if (message.type === 'response') {
			this.log('debug', `Command response: ${message.message}`)
		} else if (message.type === 'error') {
			this.log('error', `ShowCall error: ${message.message}`)
		}
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
					bgcolor: 16711680, // Red
					color: 16777215    // White
				},
				callback: (feedback) => {
					const { layer, column } = feedback.options
					return this.status.program.some(clip => 
						clip.layer === layer && clip.column === column
					)
				}
			},
			connection_status: {
				name: 'Connection Status',
				type: 'boolean',
				label: 'ShowCall connected',
				description: 'Show connection status to ShowCall',
				options: [],
				defaultStyle: {
					bgcolor: 65280,   // Green
					color: 16777215   // White
				},
				callback: () => {
					return this.status.connected
				}
			}
		})
	}

	initVariables() {
		this.setVariableDefinitions([
			{ variableId: 'connection_status', name: 'Connection Status' },
			{ variableId: 'bpm', name: 'BPM' },
			{ variableId: 'program_clips', name: 'Program Clips Count' },
			{ variableId: 'program_clip_names', name: 'Program Clip Names' }
		])

		this.setVariableValues({
			connection_status: 'Disconnected',
			bpm: 120,
			program_clips: 0,
			program_clip_names: ''
		})
	}

	updateVariables() {
		const clipNames = this.status.program.map(clip => clip.clipName).join(', ')
		
		this.setVariableValues({
			connection_status: this.status.connected ? 'Connected' : 'Disconnected',
			bpm: this.status.bpm || 120,
			program_clips: this.status.program.length,
			program_clip_names: clipNames
		})
	}

	initPresets() {
		const presets = []

		// Basic control presets
		presets.push({
			type: 'button',
			category: 'Basic Controls',
			name: 'Cut to Program',
			style: {
				text: 'CUT',
				size: '18',
				color: 16777215,
				bgcolor: 16711680
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
			feedbacks: []
		})

		presets.push({
			type: 'button',
			category: 'Basic Controls',
			name: 'Clear All',
			style: {
				text: 'CLEAR\\nALL',
				size: '14',
				color: 16777215,
				bgcolor: 6553600
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
			feedbacks: []
		})

		// Clip trigger presets (first 8 clips of first 4 layers)
		for (let layer = 1; layer <= 4; layer++) {
			for (let column = 1; column <= 8; column++) {
				presets.push({
					type: 'button',
					category: `Layer ${layer}`,
					name: `Layer ${layer} Clip ${column}`,
					style: {
						text: `L${layer}C${column}`,
						size: '14',
						color: 16777215,
						bgcolor: 0
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
							}
						}
					]
				})
			}
		}

		// Column trigger presets
		for (let column = 1; column <= 8; column++) {
			presets.push({
				type: 'button',
				category: 'Columns',
				name: `Column ${column}`,
				style: {
					text: `COL\\n${column}`,
					size: '14',
					color: 16777215,
					bgcolor: 3355443
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
				feedbacks: []
			})
		}

		this.setPresetDefinitions(presets)
	}
}

runEntrypoint(ShowCallInstance, [])