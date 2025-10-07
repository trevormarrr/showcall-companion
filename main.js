const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')

const WebSocket = require('ws')const WebSocket = require('ws')



class ShowCallInstance extends InstanceBase {class ShowCallInstance extends InstanceBase {

	constructor(internal) {	constructor(internal) {

		super(internal)		super(internal)

		this.ws = null		this.ws = null

		this.reconnectTimer = null		this.reconnectTimer = null

		this.status = {		this.status = {

			connected: false,			connected: false,

			program: [],			program: [],

			preview: null,			preview: null,

			bpm: 120			bpm: 120

		}		}

	}	}



	async init(config) {	async init(config) {

		this.config = config		this.config = config

		this.updateStatus(InstanceStatus.Connecting)		this.updateStatus(InstanceStatus.Connecting)

		this.initActions()		this.initActions()

		this.initFeedbacks()		this.initFeedbacks()

		this.initVariables()		this.initVariables()

		this.initPresets()		this.initPresets()

		this.connectWebSocket()		this.connectWebSocket()

	}	}



	async destroy() {	async destroy() {

		if (this.reconnectTimer) {		if (this.reconnectTimer) {

			clearTimeout(this.reconnectTimer)			clearTimeout(this.reconnectTimer)

		}		}

		if (this.ws) {		if (this.ws) {

			this.ws.close()			this.ws.close()

		}		}

	}	}



	async configUpdated(config) {	async configUpdated(config) {

		this.config = config		this.config = config

		if (this.ws) {		this.reconnectWebSocket()

			this.ws.close()	}

		}

		this.connectWebSocket()	getConfigFields() {

	}		return [

			{

	connectWebSocket() {				type: 'textinput',

		const host = this.config.host || 'localhost'				id: 'host',

		const port = this.config.port || 3200				label: 'ShowCall Host',

		const wsUrl = `ws://${host}:${port}/api/companion`				width: 8,

				default: 'localhost'

		this.log('info', `Connecting to ShowCall at ${wsUrl}`)			},

			{

		try {				type: 'number',

			this.ws = new WebSocket(wsUrl)				id: 'port',

		} catch (error) {				label: 'ShowCall Port',

			this.log('error', `Failed to create WebSocket: ${error.message}`)				width: 4,

			this.updateStatus(InstanceStatus.ConnectionFailure)				min: 1,

			return				max: 65535,

		}				default: 3200

			}

		this.ws.on('open', () => {		]

			this.log('info', 'Connected to ShowCall')	}

			this.updateStatus(InstanceStatus.Ok)

			this.status.connected = true	connectWebSocket() {

			this.setVariableValues({ connection_status: 'Connected' })		if (this.ws) {

			this.checkFeedbacks()			this.ws.close()

		}

			// Request initial status

			this.sendCommand('get_status')		const wsUrl = `ws://${this.config.host || 'localhost'}:${this.config.port || 3200}/api/companion`

		})		this.log('info', `Connecting to ShowCall at ${wsUrl}`)



		this.ws.on('message', (data) => {		this.ws = new WebSocket(wsUrl)

			try {

				const message = JSON.parse(data)		this.ws.on('open', () => {

				this.handleMessage(message)			this.log('info', 'Connected to ShowCall')

			} catch (error) {			this.updateStatus(InstanceStatus.Ok)

				this.log('error', `Error parsing WebSocket message: ${error.message}`)			this.status.connected = true

			}			this.setVariableValues({ connection_status: 'Connected' })

		})			

			// Request initial status

		this.ws.on('close', () => {			this.sendCommand('get_status')

			this.log('warn', 'Disconnected from ShowCall')		})

			this.updateStatus(InstanceStatus.Disconnected)

			this.status.connected = false		this.ws.on('message', (data) => {

			this.setVariableValues({ connection_status: 'Disconnected' })			try {

			this.checkFeedbacks()				const message = JSON.parse(data)

				this.handleMessage(message)

			// Attempt to reconnect after 5 seconds			} catch (error) {

			this.reconnectTimer = setTimeout(() => {				this.log('error', `Error parsing WebSocket message: ${error.message}`)

				this.connectWebSocket()			}

			}, 5000)		})

		})

		this.ws.on('close', () => {

		this.ws.on('error', (error) => {			this.log('warn', 'Disconnected from ShowCall')

			this.log('error', `WebSocket error: ${error.message}`)			this.updateStatus(InstanceStatus.Disconnected)

			this.updateStatus(InstanceStatus.ConnectionFailure)			this.status.connected = false

		})			this.setVariableValues({ connection_status: 'Disconnected' })

	}			

			// Attempt to reconnect after 5 seconds

	sendCommand(command, data = {}) {			this.reconnectTimer = setTimeout(() => {

		if (this.ws && this.ws.readyState === WebSocket.OPEN) {				this.connectWebSocket()

			const message = { command, ...data }			}, 5000)

			this.ws.send(JSON.stringify(message))		})

		} else {

			this.log('warn', 'WebSocket not connected, cannot send command')		this.ws.on('error', (error) => {

		}			this.log('error', `WebSocket error: ${error.message}`)

	}			this.updateStatus(InstanceStatus.ConnectionFailure)

		})

	handleMessage(message) {	}

		if (message.type === 'status_update') {

			// Handle status updates from ShowCall	reconnectWebSocket() {

			this.status = { ...this.status, ...message.data, connected: true }		if (this.reconnectTimer) {

			this.updateVariables()			clearTimeout(this.reconnectTimer)

			this.checkFeedbacks()		}

		} else if (message.type === 'response') {		this.connectWebSocket()

			this.log('debug', `Command response: ${message.message}`)	}

		} else if (message.type === 'error') {

			this.log('error', `ShowCall error: ${message.message}`)	sendCommand(action, params = {}) {

		}		if (this.ws && this.ws.readyState === WebSocket.OPEN) {

	}			const message = { action, ...params }

			this.ws.send(JSON.stringify(message))

	initActions() {		} else {

		this.setActionDefinitions({			this.log('warn', 'Cannot send command - not connected to ShowCall')

			trigger_clip: {		}

				name: 'Trigger Clip',	}

				options: [

					{	handleMessage(message) {

						type: 'number',		if (message.type === 'status') {

						label: 'Layer',			this.status = { ...this.status, ...message.data }

						id: 'layer',			this.updateVariables()

						min: 1,			this.checkFeedbacks()

						max: 8,		} else if (message.type === 'response') {

						default: 1,			this.log('debug', `Command response: ${message.message}`)

						required: true		} else if (message.type === 'error') {

					},			this.log('error', `ShowCall error: ${message.message}`)

					{		}

						type: 'number',	}

						label: 'Column',

						id: 'column',	initActions() {

						min: 1,		this.setActionDefinitions({

						max: 32,			trigger_clip: {

						default: 1,				name: 'Trigger Clip',

						required: true				options: [

					}					{

				],						type: 'number',

				callback: async (action) => {						label: 'Layer',

					const { layer, column } = action.options						id: 'layer',

					this.sendCommand('trigger_clip', { layer, column })						min: 1,

				}						max: 8,

			},						default: 1,

			trigger_column: {						required: true

				name: 'Trigger Column',					},

				options: [					{

					{						type: 'number',

						type: 'number',						label: 'Column',

						label: 'Column',						id: 'column',

						id: 'column',						min: 1,

						min: 1,						max: 32,

						max: 32,						default: 1,

						default: 1,						required: true

						required: true					}

					}				],

				],				callback: async (action) => {

				callback: async (action) => {					this.sendCommand('trigger_clip', {

					const { column } = action.options						layer: action.options.layer,

					this.sendCommand('trigger_column', { column })						column: action.options.column

				}					})

			},				}

			cut_to_program: {			},

				name: 'Cut to Program',			trigger_column: {

				options: [],				name: 'Trigger Column',

				callback: async () => {				options: [

					this.sendCommand('cut_to_program')					{

				}						type: 'number',

			},						label: 'Column',

			clear_all: {						id: 'column',

				name: 'Clear All',						min: 1,

				options: [],						max: 32,

				callback: async () => {						default: 1,

					this.sendCommand('clear_all')						required: true

				}					}

			},				],

			execute_macro: {				callback: async (action) => {

				name: 'Execute Macro',					this.sendCommand('trigger_column', {

				options: [						column: action.options.column

					{					})

						type: 'textinput',				}

						label: 'Macro ID',			},

						id: 'macroId',			cut_to_program: {

						default: '',				name: 'Cut to Program',

						required: true				options: [],

					}				callback: async () => {

				],					this.sendCommand('cut_to_program')

				callback: async (action) => {				}

					const { macroId } = action.options			},

					if (macroId) {			clear_all: {

						this.sendCommand('execute_macro', { macroId })				name: 'Clear All',

					}				options: [],

				}				callback: async () => {

			}					this.sendCommand('clear_all')

		})				}

	}			},

			execute_macro: {

	initFeedbacks() {				name: 'Execute Macro',

		this.setFeedbackDefinitions({				options: [

			clip_active: {					{

				name: 'Clip Active',						type: 'textinput',

				type: 'boolean',						label: 'Macro ID',

				label: 'Clip is active in program',						id: 'macro_id',

				description: 'Shows if a specific clip is currently active',						default: '',

				options: [						required: true

					{					}

						type: 'number',				],

						label: 'Layer',				callback: async (action) => {

						id: 'layer',					this.sendCommand('execute_macro', {

						min: 1,						macro_id: action.options.macro_id

						max: 8,					})

						default: 1,				}

						required: true			}

					},		})

					{	}

						type: 'number',

						label: 'Column',	initFeedbacks() {

						id: 'column',		this.setFeedbackDefinitions({

						min: 1,			clip_active: {

						max: 32,				name: 'Clip Active',

						default: 1,				type: 'boolean',

						required: true				label: 'Clip is active in program',

					}				description: 'Show if a specific clip is currently active',

				],				options: [

				defaultStyle: {					{

					bgcolor: 16711680, // Red						type: 'number',

					color: 16777215    // White						label: 'Layer',

				},						id: 'layer',

				callback: (feedback) => {						min: 1,

					const { layer, column } = feedback.options						max: 8,

					return this.status.program.some(clip => 						default: 1,

						clip.layer === layer && clip.column === column						required: true

					)					},

				}					{

			},						type: 'number',

			connection_status: {						label: 'Column',

				name: 'Connection Status',						id: 'column',

				type: 'boolean',						min: 1,

				label: 'ShowCall connected',						max: 32,

				description: 'Show connection status to ShowCall',						default: 1,

				options: [],						required: true

				defaultStyle: {					}

					bgcolor: 65280,   // Green				],

					color: 16777215   // White				defaultStyle: {

				},					bgcolor: 16711680, // Red

				callback: () => {					color: 16777215    // White

					return this.status.connected				},

				}				callback: (feedback) => {

			},					const { layer, column } = feedback.options

			layer_has_clips: {					return this.status.program.some(clip => 

				name: 'Layer Has Active Clips',						clip.layer === layer && clip.column === column

				type: 'boolean',					)

				label: 'Layer has any active clips',				}

				description: 'Shows if a layer has any active clips',			},

				options: [			connection_status: {

					{				name: 'Connection Status',

						id: 'layer',				type: 'boolean',

						type: 'number',				label: 'ShowCall connected',

						label: 'Layer',				description: 'Show connection status to ShowCall',

						default: 1,				options: [],

						min: 1,				defaultStyle: {

						max: 8					bgcolor: 65280,   // Green

					}					color: 16777215   // White

				],				},

				defaultStyle: {				callback: () => {

					bgcolor: 16776960, // Yellow					return this.status.connected

					color: 0           // Black				}

				},			}

				callback: (feedback) => {		})

					const { layer } = feedback.options	}

					return this.status.program.some(clip => clip.layer === layer)

				}	initVariables() {

			},		this.setVariableDefinitions([

			column_has_clips: {			{ variableId: 'connection_status', name: 'Connection Status' },

				name: 'Column Has Active Clips',			{ variableId: 'bpm', name: 'BPM' },

				type: 'boolean',			{ variableId: 'program_clips', name: 'Program Clips Count' },

				label: 'Column has any active clips',			{ variableId: 'program_clip_names', name: 'Program Clip Names' }

				description: 'Shows if a column has any active clips',		])

				options: [

					{		this.setVariableValues({

						id: 'column',			connection_status: 'Disconnected',

						type: 'number',			bpm: 120,

						label: 'Column',			program_clips: 0,

						default: 1,			program_clip_names: ''

						min: 1,		})

						max: 32	}

					}

				],	updateVariables() {

				defaultStyle: {		const clipNames = this.status.program.map(clip => clip.clipName).join(', ')

					bgcolor: 16753920, // Orange		

					color: 16777215    // White		this.setVariableValues({

				},			connection_status: this.status.connected ? 'Connected' : 'Disconnected',

				callback: (feedback) => {			bpm: this.status.bpm || 120,

					const { column } = feedback.options			program_clips: this.status.program.length,

					return this.status.program.some(clip => clip.column === column)			program_clip_names: clipNames

				}		})

			},	}

			any_clips_active: {

				name: 'Any Clips Active',	initPresets() {

				type: 'boolean',		const presets = []

				label: 'Any clips are active',

				description: 'Shows if any clips are currently active',		// Basic control presets

				options: [],		presets.push({

				defaultStyle: {			type: 'button',

					bgcolor: 8388736,  // Purple			category: 'Basic Controls',

					color: 16777215    // White			name: 'Cut to Program',

				},			style: {

				callback: () => {				text: 'CUT',

					return this.status.program.length > 0				size: '18',

				}				color: 16777215,

			},				bgcolor: 16711680

			bpm_range: {			},

				name: 'BPM in Range',			steps: [

				type: 'boolean',				{

				label: 'BPM is within range',					down: [

				description: 'Shows if BPM is within specified range',						{

				options: [							actionId: 'cut_to_program'

					{						}

						id: 'min_bpm',					],

						type: 'number',					up: []

						label: 'Minimum BPM',				}

						default: 120,			],

						min: 60,			feedbacks: []

						max: 200		})

					},

					{		presets.push({

						id: 'max_bpm',			type: 'button',

						type: 'number',			category: 'Basic Controls',

						label: 'Maximum BPM',			name: 'Clear All',

						default: 130,			style: {

						min: 60,				text: 'CLEAR\\nALL',

						max: 200				size: '14',

					}				color: 16777215,

				],				bgcolor: 6553600

				defaultStyle: {			},

					bgcolor: 32768,    // Green			steps: [

					color: 16777215    // White				{

				},					down: [

				callback: (feedback) => {						{

					const { min_bpm, max_bpm } = feedback.options							actionId: 'clear_all'

					const currentBpm = this.status.bpm || 120						}

					return currentBpm >= min_bpm && currentBpm <= max_bpm					],

				}					up: []

			}				}

		})			],

	}			feedbacks: []

		})

	initVariables() {

		this.setVariableDefinitions([		// Clip trigger presets (first 8 clips of first 4 layers)

			{ variableId: 'connection_status', name: 'Connection Status' },		for (let layer = 1; layer <= 4; layer++) {

			{ variableId: 'bpm', name: 'BPM' },			for (let column = 1; column <= 8; column++) {

			{ variableId: 'program_clips', name: 'Program Clips Count' },				presets.push({

			{ variableId: 'program_clip_names', name: 'Program Clip Names' }					type: 'button',

		])					category: `Layer ${layer}`,

					name: `Layer ${layer} Clip ${column}`,

		this.setVariableValues({					style: {

			connection_status: 'Disconnected',						text: `L${layer}C${column}`,

			bpm: 120,						size: '14',

			program_clips: 0,						color: 16777215,

			program_clip_names: ''						bgcolor: 0

		})					},

	}					steps: [

						{

	updateVariables() {							down: [

		const clipNames = this.status.program.map(clip => clip.clipName || 'Unknown').join(', ')								{

									actionId: 'trigger_clip',

		this.setVariableValues({									options: {

			connection_status: this.status.connected ? 'Connected' : 'Disconnected',										layer: layer,

			bpm: this.status.bpm || 120,										column: column

			program_clips: this.status.program.length,									}

			program_clip_names: clipNames								}

		})							],

	}							up: []

						}

	initPresets() {					],

		const presets = []					feedbacks: [

						{

		// Basic control presets with feedbacks							feedbackId: 'clip_active',

		presets.push({							options: {

			type: 'button',								layer: layer,

			category: 'Basic Controls',								column: column

			name: 'Cut to Program',							}

			style: {						}

				text: 'CUT',					]

				size: '18',				})

				color: 16777215,			}

				bgcolor: 0		}

			},

			steps: [		// Column trigger presets

				{		for (let column = 1; column <= 8; column++) {

					down: [			presets.push({

						{				type: 'button',

							actionId: 'cut_to_program',				category: 'Columns',

							options: {}				name: `Column ${column}`,

						}				style: {

					],					text: `COL\\n${column}`,

					up: []					size: '14',

				}					color: 16777215,

			],					bgcolor: 3355443

			feedbacks: [				},

				{				steps: [

					feedbackId: 'connection_status',					{

					options: {}						down: [

				}							{

			]								actionId: 'trigger_column',

		})								options: {

									column: column

		presets.push({								}

			type: 'button',							}

			category: 'Basic Controls',						],

			name: 'Clear All',						up: []

			style: {					}

				text: 'CLEAR\\nALL',				],

				size: '14',				feedbacks: []

				color: 16777215,			})

				bgcolor: 6553600		}

			},

			steps: [		this.setPresetDefinitions(presets)

				{	}

					down: [}

						{

							actionId: 'clear_all',runEntrypoint(ShowCallInstance, [])
							options: {}
						}
					],
					up: []
				}
			],
			feedbacks: [
				{
					feedbackId: 'any_clips_active',
					options: {}
				}
			]
		})

		// Clip trigger presets (first 8 clips of first 4 layers) with feedbacks
		for (let layer = 1; layer <= 4; layer++) {
			for (let column = 1; column <= 8; column++) {
				presets.push({
					type: 'button',
					category: `Layer ${layer}`,
					name: `Layer ${layer} Clip ${column}`,
					style: {
						text: `L${layer}\\nC${column}`,
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

		// Column trigger presets (first 8 columns) with feedbacks
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
				feedbacks: [
					{
						feedbackId: 'column_has_clips',
						options: {
							column: column
						}
					}
				]
			})
		}

		// Layer status presets with feedbacks
		for (let layer = 1; layer <= 8; layer++) {
			presets.push({
				type: 'button',
				category: 'Layer Status',
				name: `Layer ${layer} Status`,
				style: {
					text: `LAYER\\n${layer}`,
					size: '14',
					color: 16777215,
					bgcolor: 0
				},
				steps: [
					{
						down: [],
						up: []
					}
				],
				feedbacks: [
					{
						feedbackId: 'layer_has_clips',
						options: {
							layer: layer
						}
					}
				]
			})
		}

		this.setPresetDefinitions(presets)
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 8,
				regex: this.REGEX_IP,
				default: '127.0.0.1'
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'WebSocket Port',
				width: 4,
				regex: this.REGEX_PORT,
				default: '3200'
			}
		]
	}
}

runEntrypoint(ShowCallInstance, [])