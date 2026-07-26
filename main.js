const { InstanceBase, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const WebSocket = require('ws')

// Real ShowCall companion protocol (ws://host:port/api/companion):
//
// Incoming message types:
//   status_update    { data: { connected, bpm, comp, host, restPort, oscPort,
//                               programClips: [{layer, column, clipName, layerName}],
//                               program: {..first clip or placeholder..},
//                               preview: {..queued clip or placeholder..} } }
//   presets_updated  { data: [{id, label, color, hotkey, macro}], bank }
//   preset_executing { data: { presetId, label } }
//   command_response { id, result: { ok, ... } }
//
// Outgoing actions (ws.send({ action, ...params, id })):
//   trigger_clip   { layer, column }
//   trigger_column { column }
//   cut_to_program
//   clear_all
//   execute_macro  { macro: [...] }  OR  { macroId }
//   get_status
//
// There is NO stop_clip/stop_layer/stop_column/set_bpm/tap_tempo/opacity control
// in ShowCall itself - those were previously faked in this module and never
// actually did anything. They have been removed.

class ShowCallInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.ws = null
		this.reconnectTimer = null
		this.commandId = 0

		this.status = {
			connected: false,
			bpm: null,
			compositionName: null,
			host: null,
			programClips: [], // [{layer, column, clipName, layerName}]
			preview: null,     // {layer, column, clipName, layerName} | null
			layers: {},        // layer -> { active, clipCount }
			columns: {},       // column -> { active, clipCount }
			clips: {},         // "layer-column" -> { active, clipName, layerName }
		}

		this.connectedSince = null
		this.connectionRetryCount = 0
		this.maxRetries = 10

		this.showcallPresets = [] // Raw preset list as broadcast by ShowCall
		this.activePresetId = null // Currently-executing preset id (for feedback)
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
			this.ws.removeAllListeners()
			this.ws.close()
		}
	}

	async configUpdated(config) {
		const gridChanged =
			config.layers !== this.config?.layers || config.columns !== this.config?.columns

		this.config = config

		if (gridChanged) {
			// Grid size affects how many clip/column buttons and variables we generate
			this.initVariables()
			this.initPresets()
		}

		this.reconnectWebSocket()
	}

	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'ShowCall Host',
				width: 8,
				default: 'localhost',
				tooltip: 'The machine running ShowCall. Use localhost if Companion runs on the same computer.'
			},
			{
				type: 'number',
				id: 'port',
				label: 'ShowCall Port',
				width: 4,
				min: 1,
				max: 65535,
				default: 3200
			},
			{
				type: 'number',
				id: 'layers',
				label: 'Layers to expose as buttons',
				width: 6,
				min: 1,
				max: 8,
				default: 4,
				tooltip: 'How many layers to generate clip-trigger buttons/variables for.'
			},
			{
				type: 'number',
				id: 'columns',
				label: 'Columns to expose as buttons',
				width: 6,
				min: 1,
				max: 32,
				default: 8,
				tooltip: 'How many columns to generate clip-trigger buttons/variables for.'
			}
		]
	}

	get numLayers() {
		return Math.max(1, Math.min(8, parseInt(this.config?.layers) || 4))
	}

	get numColumns() {
		return Math.max(1, Math.min(32, parseInt(this.config?.columns) || 8))
	}

	connectWebSocket() {
		if (this.ws) {
			this.ws.removeAllListeners()
			this.ws.close()
		}

		const host = this.config?.host || 'localhost'
		const port = this.config?.port || 3200
		const wsUrl = `ws://${host}:${port}/api/companion`

		this.log('info', `Connecting to ShowCall at ${wsUrl} (attempt ${this.connectionRetryCount + 1}/${this.maxRetries})`)

		this.ws = new WebSocket(wsUrl)

		this.ws.on('open', () => {
			this.log('info', 'Connected to ShowCall')
			this.updateStatus(InstanceStatus.Ok)
			this.status.connected = true
			this.connectedSince = Date.now()
			this.connectionRetryCount = 0

			// ShowCall pushes presets_updated and status_update on its own once
			// connected, but request an immediate status snapshot too.
			this.sendCommand('get_status')

			this.updateVariables()
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
			this.connectedSince = null
			this.clearAllClipStates()
			this.updateVariables()
			this.checkFeedbacks()

			if (this.connectionRetryCount < this.maxRetries) {
				const delay = Math.min(5000 * Math.pow(1.5, this.connectionRetryCount), 30000)
				this.connectionRetryCount++
				this.reconnectTimer = setTimeout(() => this.connectWebSocket(), delay)
			} else {
				this.log('error', 'Max reconnection attempts reached. Check ShowCall host/port and that ShowCall is running.')
				this.updateStatus(InstanceStatus.ConnectionFailure)
			}
		})

		this.ws.on('error', (error) => {
			this.log('error', `WebSocket error: ${error.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure)
		})
	}

	reconnectWebSocket() {
		this.connectionRetryCount = 0
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
		}
		this.connectWebSocket()
	}

	sendCommand(action, params = {}) {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			const message = { action, id: ++this.commandId, ...params }
			this.ws.send(JSON.stringify(message))
		} else {
			this.log('warn', `Cannot send command '${action}' - not connected to ShowCall`)
		}
	}

	handleMessage(message) {
		switch (message.type) {
			case 'status_update':
				this.applyStatus(message.data)
				break

			case 'presets_updated':
				this.showcallPresets = Array.isArray(message.data) ? message.data : []
				this.log('info', `ShowCall presets updated: ${this.showcallPresets.length} preset(s)${message.bank ? ` (bank ${message.bank})` : ''}`)
				this.updateVariables()
				this.initPresets() // Regenerate dynamic preset buttons/definitions
				this.checkFeedbacks('preset_style', 'preset_active')
				break

			case 'preset_executing':
				this.activePresetId = message.data?.presetId ?? null
				this.checkFeedbacks('preset_active')
				break

			case 'command_response':
				if (message.result && message.result.ok === false) {
					this.log('warn', `ShowCall command failed: ${message.result.error || 'unknown error'}`)
				}
				break

			default:
				this.log('debug', `Unhandled ShowCall message type: ${message.type}`)
		}
	}

	applyStatus(data) {
		if (!data) return

		this.status.connected = !!data.connected
		if (typeof data.bpm === 'number') {
			this.status.bpm = data.bpm
		}
		if (data.comp && data.comp !== '—') {
			this.status.compositionName = data.comp
		}
		if (data.host) {
			this.status.host = data.host
		}

		this.status.programClips = Array.isArray(data.programClips) ? data.programClips : []

		// preview is only meaningful once a clip is queued/selected in Resolume;
		// ShowCall sends a placeholder object otherwise.
		this.status.preview =
			data.preview && data.preview.clipName && data.preview.clipName !== '—' ? data.preview : null

		this.updateClipStates()
		this.updateVariables()
		this.checkFeedbacks()
	}

	updateClipStates() {
		this.status.layers = {}
		this.status.columns = {}
		this.status.clips = {}

		for (const clip of this.status.programClips) {
			if (!clip || typeof clip.layer === 'undefined' || typeof clip.column === 'undefined') continue

			const { layer, column } = clip
			const key = `${layer}-${column}`

			this.status.clips[key] = {
				active: true,
				clipName: clip.clipName || '',
				layerName: clip.layerName || '',
			}

			if (!this.status.layers[layer]) {
				this.status.layers[layer] = { active: true, clipCount: 0, name: clip.layerName || `Layer ${layer}` }
			}
			this.status.layers[layer].clipCount++

			if (!this.status.columns[column]) {
				this.status.columns[column] = { active: true, clipCount: 0 }
			}
			this.status.columns[column].clipCount++
		}
	}

	clearAllClipStates() {
		this.status.layers = {}
		this.status.columns = {}
		this.status.clips = {}
		this.status.programClips = []
	}

	// ------------------------------------------------------------------
	// Actions
	// ------------------------------------------------------------------

	initActions() {
		this.setActionDefinitions({
			trigger_clip: {
				name: 'Trigger Clip',
				options: [
					{ type: 'number', label: 'Layer', id: 'layer', min: 1, max: 8, default: 1, required: true },
					{ type: 'number', label: 'Column', id: 'column', min: 1, max: 32, default: 1, required: true }
				],
				callback: async (action) => {
					this.sendCommand('trigger_clip', { layer: action.options.layer, column: action.options.column })
				}
			},

			trigger_column: {
				name: 'Trigger Column',
				options: [
					{ type: 'number', label: 'Column', id: 'column', min: 1, max: 32, default: 1, required: true }
				],
				callback: async (action) => {
					this.sendCommand('trigger_column', { column: action.options.column })
				}
			},

			cut_to_program: {
				name: 'Cut to Program',
				options: [],
				callback: async () => this.sendCommand('cut_to_program')
			},

			clear_all: {
				name: 'Clear All',
				options: [],
				callback: async () => this.sendCommand('clear_all')
			},

			execute_macro: {
				name: 'Execute Macro (raw steps)',
				description: 'Send a custom macro as JSON, e.g. [{"type":"trigger","layer":1,"column":1},{"type":"cut"}]',
				options: [
					{
						type: 'textinput',
						label: 'Macro Steps (JSON array)',
						id: 'macro_json',
						default: '[]',
						required: true,
						useVariables: true
					}
				],
				callback: async (action, context) => {
					const raw = await context.parseVariablesInString(action.options.macro_json)
					try {
						const macro = JSON.parse(raw)
						if (!Array.isArray(macro)) throw new Error('Macro must be a JSON array')
						this.sendCommand('execute_macro', { macro })
					} catch (error) {
						this.log('error', `Invalid macro JSON: ${error.message}`)
					}
				}
			},

			execute_preset: {
				name: 'Execute ShowCall Preset',
				description: 'Run a preset from ShowCall\'s active bank by its ID',
				options: [
					{
						type: 'textinput',
						label: 'Preset ID',
						id: 'preset_id',
						default: '',
						tooltip: 'The preset ID as defined in ShowCall (see dynamic "ShowCall Presets" buttons for real IDs)',
						required: true
					}
				],
				callback: async (action) => {
					this.sendCommand('execute_macro', { macroId: action.options.preset_id })
				}
			},

			get_status: {
				name: 'Refresh Status',
				description: 'Request an immediate status snapshot from ShowCall',
				options: [],
				callback: async () => this.sendCommand('get_status')
			}
		})
	}

	// ------------------------------------------------------------------
	// Feedbacks
	// ------------------------------------------------------------------

	initFeedbacks() {
		this.setFeedbackDefinitions({
			connection_status: {
				name: 'Connection Status',
				type: 'boolean',
				description: 'True when connected to ShowCall',
				options: [],
				defaultStyle: { bgcolor: 0x00aa00, color: 0xffffff },
				callback: () => this.status.connected
			},

			clip_active: {
				name: 'Clip Active',
				type: 'boolean',
				description: 'True when the given layer/column clip is live in program',
				options: [
					{ type: 'number', label: 'Layer', id: 'layer', min: 1, max: 8, default: 1, required: true },
					{ type: 'number', label: 'Column', id: 'column', min: 1, max: 32, default: 1, required: true }
				],
				defaultStyle: { bgcolor: 0xff0000, color: 0xffffff },
				callback: (feedback) => {
					const key = `${feedback.options.layer}-${feedback.options.column}`
					return this.status.clips[key]?.active === true
				}
			},

			clip_preview: {
				name: 'Clip in Preview',
				type: 'boolean',
				description: 'True when the given layer/column clip is queued/selected (Resolume "Previewed") but not yet triggered',
				options: [
					{ type: 'number', label: 'Layer', id: 'layer', min: 1, max: 8, default: 1, required: true },
					{ type: 'number', label: 'Column', id: 'column', min: 1, max: 32, default: 1, required: true }
				],
				defaultStyle: { bgcolor: 0x888888, color: 0xffffff },
				callback: (feedback) => {
					const p = this.status.preview
					return !!p && p.layer === feedback.options.layer && p.column === feedback.options.column
				}
			},

			layer_active: {
				name: 'Layer Active',
				type: 'boolean',
				description: 'True when any clip is live in this layer',
				options: [
					{ type: 'number', label: 'Layer', id: 'layer', min: 1, max: 8, default: 1, required: true }
				],
				defaultStyle: { bgcolor: 0xffaa00, color: 0x000000 },
				callback: (feedback) => this.status.layers[feedback.options.layer]?.active === true
			},

			column_active: {
				name: 'Column Active',
				type: 'boolean',
				description: 'True when any clip is live in this column',
				options: [
					{ type: 'number', label: 'Column', id: 'column', min: 1, max: 32, default: 1, required: true }
				],
				defaultStyle: { bgcolor: 0x00aaff, color: 0xffffff },
				callback: (feedback) => this.status.columns[feedback.options.column]?.active === true
			},

			any_clips_active: {
				name: 'Any Clips Active',
				type: 'boolean',
				description: 'True when at least one clip is live in program',
				options: [],
				defaultStyle: { bgcolor: 0x8a2be2, color: 0xffffff },
				callback: () => this.status.programClips.length > 0
			},

			bpm_range: {
				name: 'BPM in Range',
				type: 'boolean',
				description: 'True when the current BPM is within the given range',
				options: [
					{ type: 'number', label: 'Min BPM', id: 'min_bpm', min: 20, max: 400, default: 110, required: true },
					{ type: 'number', label: 'Max BPM', id: 'max_bpm', min: 20, max: 400, default: 130, required: true }
				],
				defaultStyle: { bgcolor: 0x32cd32, color: 0x000000 },
				callback: (feedback) => {
					if (typeof this.status.bpm !== 'number') return false
					return this.status.bpm >= feedback.options.min_bpm && this.status.bpm <= feedback.options.max_bpm
				}
			},

			preset_active: {
				name: 'Preset Executing',
				type: 'boolean',
				description: 'True while the given ShowCall preset ID is actively executing',
				options: [
					{ type: 'textinput', label: 'Preset ID', id: 'preset_id', default: '', required: true }
				],
				defaultStyle: { bgcolor: 0xffaa00, color: 0x000000 },
				callback: (feedback) => this.activePresetId === feedback.options.preset_id
			},

			// This is the core of live preset sync: rather than baking a preset's
			// label/color into a button only once (at drag time), this feedback
			// looks up the CURRENT preset data by ID every time ShowCall pushes an
			// update, so already-placed buttons stay accurate even if the preset's
			// label/color changes, or the preset is removed entirely.
			preset_style: {
				name: 'ShowCall Preset Style (live)',
				type: 'advanced',
				description: 'Looks up a preset by ID from ShowCall\'s live preset list and applies its label/color. Keeps already-placed buttons accurate as presets change.',
				options: [
					{ type: 'textinput', label: 'Preset ID', id: 'preset_id', default: '', required: true }
				],
				callback: (feedback) => {
					const preset = this.showcallPresets.find((p) => p.id === feedback.options.preset_id)

					if (!preset) {
						return { text: '(removed)', bgcolor: 0x333333, color: 0x999999 }
					}

					const bgcolor = parseHexColor(preset.color) ?? 0x666666
					const color = readableTextColor(bgcolor)
					const text = preset.hotkey ? `${preset.label}\\n[${preset.hotkey}]` : preset.label

					return { text, bgcolor, color }
				}
			}
		})
	}

	// ------------------------------------------------------------------
	// Variables
	// ------------------------------------------------------------------

	initVariables() {
		const variableDefs = [
			{ variableId: 'connection_status', name: 'Connection Status' },
			{ variableId: 'connection_uptime', name: 'Connection Uptime' },
			{ variableId: 'bpm', name: 'BPM' },
			{ variableId: 'composition_name', name: 'Composition Name' },
			{ variableId: 'showcall_host', name: 'ShowCall Host' },
			{ variableId: 'program_clip_count', name: 'Active Clip Count' },
			{ variableId: 'program_clip_names', name: 'Active Clip Names' },
			{ variableId: 'preview_clip', name: 'Preview Clip' },
			{ variableId: 'active_layer_count', name: 'Active Layer Count' },
			{ variableId: 'active_column_count', name: 'Active Column Count' },
			{ variableId: 'available_presets_count', name: 'Available Presets Count' },
			{ variableId: 'active_preset_label', name: 'Active Preset Label' },
		]

		for (let i = 1; i <= this.numLayers; i++) {
			variableDefs.push({ variableId: `layer_${i}_status`, name: `Layer ${i} Status` })
			variableDefs.push({ variableId: `layer_${i}_name`, name: `Layer ${i} Name (from active clip)` })
		}

		for (let layer = 1; layer <= this.numLayers; layer++) {
			for (let column = 1; column <= this.numColumns; column++) {
				variableDefs.push({ variableId: `clip_${layer}_${column}_name`, name: `Layer ${layer} / Column ${column} Clip Name` })
			}
		}

		// One slot per currently known preset, keyed by position - lets an
		// already-placed button reference $(showcall:preset_N_name) and still
		// receive live updates without needing preset_style feedback.
		const presetSlots = Math.max(this.showcallPresets.length, 16)
		for (let i = 1; i <= presetSlots; i++) {
			variableDefs.push({ variableId: `preset_${i}_name`, name: `Preset Slot ${i} Name` })
			variableDefs.push({ variableId: `preset_${i}_id`, name: `Preset Slot ${i} ID` })
		}

		this.setVariableDefinitions(variableDefs)
		this.updateVariables()
	}

	updateVariables() {
		const values = {}

		values.connection_status = this.status.connected ? 'Connected' : 'Disconnected'
		values.connection_uptime = this.connectedSince ? formatUptime(Math.floor((Date.now() - this.connectedSince) / 1000)) : '0s'
		values.bpm = this.status.bpm ?? '—'
		values.composition_name = this.status.compositionName || 'Unknown'
		values.showcall_host = this.status.host || 'Unknown'

		values.program_clip_count = this.status.programClips.length
		values.program_clip_names = this.status.programClips
			.map((c) => (c.clipName ? `L${c.layer}C${c.column}:${c.clipName}` : `L${c.layer}C${c.column}`))
			.join(', ') || 'None'

		values.preview_clip = this.status.preview
			? `L${this.status.preview.layer}C${this.status.preview.column}: ${this.status.preview.clipName}`
			: 'None'

		values.active_layer_count = Object.keys(this.status.layers).length
		values.active_column_count = Object.keys(this.status.columns).length

		for (let i = 1; i <= this.numLayers; i++) {
			const layer = this.status.layers[i]
			values[`layer_${i}_status`] = layer?.active ? `Active (${layer.clipCount})` : 'Inactive'
			values[`layer_${i}_name`] = layer?.name || `Layer ${i}`
		}

		for (let layer = 1; layer <= this.numLayers; layer++) {
			for (let column = 1; column <= this.numColumns; column++) {
				const clip = this.status.clips[`${layer}-${column}`]
				values[`clip_${layer}_${column}_name`] = clip?.clipName || ''
			}
		}

		values.available_presets_count = this.showcallPresets.length
		const activePreset = this.showcallPresets.find((p) => p.id === this.activePresetId)
		values.active_preset_label = activePreset ? activePreset.label : 'None'

		const presetSlots = Math.max(this.showcallPresets.length, 16)
		for (let i = 1; i <= presetSlots; i++) {
			const preset = this.showcallPresets[i - 1]
			values[`preset_${i}_name`] = preset ? preset.label : ''
			values[`preset_${i}_id`] = preset ? preset.id : ''
		}

		this.setVariableValues(values)
	}

	// ------------------------------------------------------------------
	// Presets (button templates)
	// ------------------------------------------------------------------

	initPresets() {
		const presets = []

		presets.push({
			type: 'button',
			category: 'Basic Controls',
			name: 'Cut to Program',
			style: { text: 'CUT', size: '18', color: 0xffffff, bgcolor: 0x8b0000 },
			steps: [{ down: [{ actionId: 'cut_to_program' }], up: [] }],
			feedbacks: [{ feedbackId: 'connection_status', options: {}, style: { bgcolor: 0x006400, color: 0xffffff } }]
		})

		presets.push({
			type: 'button',
			category: 'Basic Controls',
			name: 'Clear All',
			style: { text: 'CLEAR\\nALL', size: '14', color: 0xffffff, bgcolor: 0x654321 },
			steps: [{ down: [{ actionId: 'clear_all' }], up: [] }],
			feedbacks: [{ feedbackId: 'any_clips_active', options: {}, style: { bgcolor: 0xff4500, color: 0xffffff } }]
		})

		presets.push({
			type: 'button',
			category: 'Basic Controls',
			name: 'BPM Display',
			style: { text: 'BPM\\n$(showcall:bpm)', size: '14', color: 0xffffff, bgcolor: 0x483d8b },
			steps: [{ down: [{ actionId: 'get_status' }], up: [] }],
			feedbacks: [{ feedbackId: 'bpm_range', options: { min_bpm: 110, max_bpm: 130 }, style: { bgcolor: 0x32cd32, color: 0x000000 } }]
		})

		// Clip trigger grid, sized from the module's configured layers/columns
		for (let layer = 1; layer <= this.numLayers; layer++) {
			for (let column = 1; column <= this.numColumns; column++) {
				presets.push({
					type: 'button',
					category: `Layer ${layer} Clips`,
					name: `L${layer}C${column}`,
					style: { text: `$(showcall:clip_${layer}_${column}_name)`, size: '14', color: 0xffffff, bgcolor: 0x202020 },
					steps: [{ down: [{ actionId: 'trigger_clip', options: { layer, column } }], up: [] }],
					feedbacks: [
						{ feedbackId: 'clip_active', options: { layer, column }, style: { bgcolor: 0xff0000, color: 0xffffff } },
						{ feedbackId: 'clip_preview', options: { layer, column } }
					]
				})
			}
		}

		// Column triggers
		for (let column = 1; column <= this.numColumns; column++) {
			presets.push({
				type: 'button',
				category: 'Columns',
				name: `Column ${column}`,
				style: { text: `COL\\n${column}`, size: '14', color: 0xffffff, bgcolor: 0x2c3e50 },
				steps: [{ down: [{ actionId: 'trigger_column', options: { column } }], up: [] }],
				feedbacks: [{ feedbackId: 'column_active', options: { column }, style: { bgcolor: 0x00aaff, color: 0xffffff } }]
			})
		}

		// Layer indicators (status only - ShowCall has no "stop layer" capability)
		for (let layer = 1; layer <= this.numLayers; layer++) {
			presets.push({
				type: 'button',
				category: 'Layer Status',
				name: `Layer ${layer} Status`,
				style: { text: `$(showcall:layer_${layer}_name)\\n$(showcall:layer_${layer}_status)`, size: '12', color: 0xffffff, bgcolor: 0x2c2c2c },
				steps: [{ down: [], up: [] }],
				feedbacks: [{ feedbackId: 'layer_active', options: { layer }, style: { bgcolor: 0xffaa00, color: 0x000000 } }]
			})
		}

		// Dynamic ShowCall presets - the buttons themselves reference stable
		// preset IDs, and preset_style feedback keeps their look live-updated.
		for (const preset of this.showcallPresets) {
			const bgcolor = parseHexColor(preset.color) ?? 0x666666
			const color = readableTextColor(bgcolor)

			presets.push({
				type: 'button',
				category: 'ShowCall Presets',
				name: preset.label || preset.id,
				style: {
					text: preset.hotkey ? `${preset.label}\\n[${preset.hotkey}]` : preset.label,
					size: '12',
					color,
					bgcolor
				},
				steps: [{ down: [{ actionId: 'execute_preset', options: { preset_id: preset.id } }], up: [] }],
				feedbacks: [
					{ feedbackId: 'preset_style', options: { preset_id: preset.id } },
					{ feedbackId: 'preset_active', options: { preset_id: preset.id }, style: { bgcolor: 0xffaa00, color: 0x000000 } },
					{ feedbackId: 'connection_status', options: {}, style: { bgcolor: 0x333333, color: 0x999999 } }
				]
			})
		}

		presets.push({
			type: 'button',
			category: 'System',
			name: 'System Status',
			style: { text: '$(showcall:connection_status)\\n$(showcall:program_clip_count) clips\\n$(showcall:bpm) BPM', size: '10', color: 0xffffff, bgcolor: 0x2c2c2c },
			steps: [{ down: [], up: [] }],
			feedbacks: [
				{ feedbackId: 'connection_status', options: {}, style: { bgcolor: 0x008000, color: 0xffffff } },
				{ feedbackId: 'any_clips_active', options: {}, style: { color: 0xffff00 } }
			]
		})

		this.setPresetDefinitions(presets)
	}
}

function formatUptime(seconds) {
	if (seconds < 60) return `${seconds}s`
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	return `${hours}h ${minutes}m`
}

// Accepts "#rrggbb", "rrggbb", or a numeric value. Returns a 24-bit int or null.
function parseHexColor(color) {
	if (typeof color === 'number') return color & 0xffffff
	if (typeof color === 'string') {
		const hex = color.replace('#', '')
		const parsed = parseInt(hex, 16)
		return Number.isNaN(parsed) ? null : parsed
	}
	return null
}

function readableTextColor(bgcolor) {
	const r = (bgcolor >> 16) & 0xff
	const g = (bgcolor >> 8) & 0xff
	const b = bgcolor & 0xff
	const brightness = (r * 299 + g * 587 + b * 114) / 1000
	return brightness > 128 ? 0x000000 : 0xffffff
}

runEntrypoint(ShowCallInstance, [])
