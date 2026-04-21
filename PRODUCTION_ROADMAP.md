# ShowCall Companion Production Roadmap

## 🎯 Executive Summary

This document outlines critical improvements needed to make the ShowCall Companion module production-ready for professional live event environments using Bitfocus Companion and Stream Deck. Based on comprehensive codebase analysis, we've identified key areas for enhancement across reliability, feedback systems, user experience, and enterprise features.

**Current Version:** 2.0.0  
**Target Production Version:** 2.5.0  
**Timeline:** 6-8 weeks for Phase 1 critical items

---

## 🚨 Critical Production Issues (Phase 1 - Weeks 1-3)

### 1. Connection Reliability & Recovery ⚡ CRITICAL

**Current Issues:**
- WebSocket reconnection can fail after 10 attempts
- No connection state persistence
- Companion clients can get stale state after reconnection
- Missing heartbeat/ping mechanism

**Required Improvements:**
```javascript
// main.js enhancements needed:
class ShowCallInstance extends InstanceBase {
  constructor(internal) {
    super(internal)
    this.connectionRetryCount = 0
    this.maxRetries = 10 // Should be infinite with backoff
    this.heartbeatInterval = null
    this.reconnectTimer = null
    this.lastHeartbeat = null
  }

  // Add heartbeat monitoring
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (Date.now() - this.lastHeartbeat > 10000) {
        this.log('warn', 'Heartbeat timeout - reconnecting')
        this.reconnectWebSocket()
      }
    }, 5000)
  }

  // Improve reconnection strategy
  reconnectWebSocket() {
    // Remove retry limit for production
    // Implement exponential backoff with jitter
    const baseDelay = 1000
    const maxDelay = 60000
    const jitter = Math.random() * 1000
    const delay = Math.min(
      baseDelay * Math.pow(2, this.connectionRetryCount) + jitter,
      maxDelay
    )
    // ... reconnect logic
  }
}
```

**Acceptance Criteria:**
- [ ] Infinite reconnection attempts with exponential backoff
- [ ] Heartbeat monitoring detects stale connections
- [ ] State synchronization after reconnection
- [ ] No memory leaks from failed connections

### 2. State Synchronization & Accuracy 📊 CRITICAL

**Current Issues:**
- Clip states can become out of sync
- Layer/column states not always accurate
- Race conditions in status updates
- Missing clip state edge cases

**Debug Issues Found:**
```javascript
// In handleMessage - Need better state validation
handleMessage(message) {
  // Add schema validation
  if (message.type === 'status_update' && message.data) {
    // Validate data structure
    if (!Array.isArray(message.data.programClips)) {
      this.log('error', 'Invalid programClips data')
      return
    }
    
    // Add checksum/version to detect stale updates
    if (message.version && message.version < this.lastUpdateVersion) {
      this.log('warn', 'Ignoring stale update')
      return
    }
  }
}

// Better state management
updateClipStates() {
  // Add state transition logging
  const oldState = { ...this.status }
  // ... update logic
  const changes = this.diffStates(oldState, this.status)
  this.log('debug', `State changes: ${JSON.stringify(changes)}`)
}
```

**Acceptance Criteria:**
- [ ] 100% state accuracy with ShowCall
- [ ] No phantom active states
- [ ] Proper handling of multi-layer columns
- [ ] State diff logging for debugging

### 3. Feedback System Optimization 🎨 HIGH PRIORITY

**Current Issues:**
- Feedback callbacks can be slow with many buttons
- No feedback update batching
- Opacity/position feedbacks not working correctly
- Preview state not implemented

**Performance Improvements:**
```javascript
// Batch feedback updates
class ShowCallInstance extends InstanceBase {
  constructor(internal) {
    super(internal)
    this.pendingFeedbackUpdates = new Set()
    this.feedbackUpdateTimer = null
  }

  // Queue feedback updates instead of immediate execution
  queueFeedbackUpdate(feedbackId) {
    this.pendingFeedbackUpdates.add(feedbackId)
    
    if (!this.feedbackUpdateTimer) {
      this.feedbackUpdateTimer = setTimeout(() => {
        this.checkFeedbacks(...this.pendingFeedbackUpdates)
        this.pendingFeedbackUpdates.clear()
        this.feedbackUpdateTimer = null
      }, 50) // Batch within 50ms window
    }
  }

  // Optimize clip state lookup
  isClipActive(layer, column) {
    const clipKey = `${layer}-${column}`
    // Use Map for O(1) lookup instead of object property access
    return this.clipStateMap.has(clipKey)
  }
}
```

**Acceptance Criteria:**
- [ ] Feedback updates <16ms (60fps) for up to 32 buttons
- [ ] Batched updates reduce CPU usage by 50%
- [ ] All feedback types working correctly
- [ ] No visual glitches during updates

### 4. Enhanced Error Handling & Diagnostics 🔍 HIGH PRIORITY

**Current Issues:**
- Generic error messages don't help troubleshooting
- No diagnostic tools for users
- Missing error recovery mechanisms
- Console logging insufficient for production

**Improvements Needed:**
```javascript
// Add diagnostic commands
initActions() {
  this.setActionDefinitions({
    // ... existing actions ...
    
    run_diagnostics: {
      name: 'Run Diagnostics',
      options: [],
      callback: async () => {
        const diagnostics = await this.runDiagnostics()
        this.log('info', JSON.stringify(diagnostics, null, 2))
        
        // Send diagnostic report to button display
        this.setVariableValues({
          diagnostic_status: diagnostics.overall,
          diagnostic_details: diagnostics.summary
        })
      }
    }
  })
}

async runDiagnostics() {
  return {
    overall: 'healthy',
    connection: {
      websocket: this.ws ? this.ws.readyState : 'disconnected',
      showCallHost: this.config.host,
      lastHeartbeat: this.lastHeartbeat,
      reconnectCount: this.connectionRetryCount
    },
    state: {
      activeClips: Object.keys(this.status.clips).length,
      activeLayers: Object.keys(this.status.layers).length,
      activeColumns: Object.keys(this.status.columns).length,
      lastUpdate: Date.now() - this.lastStatusUpdate
    },
    performance: {
      updateLatency: this.averageUpdateLatency,
      feedbackCallbacks: this.feedbackCallbackCount,
      memoryUsage: process.memoryUsage()
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Diagnostic action available to users
- [ ] Error messages include troubleshooting steps
- [ ] Automatic recovery from common issues
- [ ] Health check every 30 seconds

---

## 🎨 User Experience Enhancements (Phase 2 - Weeks 4-5)

### 5. Advanced Feedback Features

**Planned Enhancements:**

#### Dynamic Button Text Updates
```javascript
// Add dynamic text generation based on state
clip_active_with_name: {
  type: 'advanced',
  callback: (feedback) => {
    const { layer, column } = feedback.options
    const clipKey = `${layer}-${column}`
    const clip = this.status.clips[clipKey]
    
    if (!clip || !clip.active) {
      return {
        text: `L${layer}C${column}`,
        color: 0xffffff,
        bgcolor: 0x202020
      }
    }
    
    return {
      text: `${clip.clipName}\\n${this.formatPosition(clip.position, clip.duration)}`,
      color: 0xffffff,
      bgcolor: 0xff0000
    }
  }
}
```

#### Progress Bar Feedback
```javascript
// Add progress bar visualization
clip_progress_bar: {
  type: 'advanced',
  callback: (feedback) => {
    const { layer, column } = feedback.options
    const clip = this.status.clips[`${layer}-${column}`]
    
    if (!clip || !clip.active || !clip.duration) return {}
    
    const progress = Math.min(clip.position / clip.duration, 1.0)
    const barWidth = Math.floor(progress * 72) // 72px button width
    
    return {
      png64: this.generateProgressBar(progress, barWidth)
    }
  }
}
```

#### Audio Level Meters
```javascript
// Show audio levels on buttons
clip_audio_level: {
  type: 'advanced',
  callback: (feedback) => {
    const { layer, column } = feedback.options
    const clip = this.status.clips[`${layer}-${column}`]
    
    if (!clip || !clip.active) return {}
    
    const volume = clip.volume || 0
    const level = clip.audioLevel || 0 // Needs ShowCall integration
    
    return {
      png64: this.generateAudioMeter(level, volume)
    }
  }
}
```

### 6. Enhanced Preset Library

**Current State:** Good foundation with 32+ presets

**Improvements:**
```javascript
// Add preset categories and better organization
initPresets() {
  const presets = []

  // Category: Emergency Controls (always visible)
  const emergencyPresets = [
    {
      type: 'button',
      category: 'Emergency',
      name: 'EMERGENCY BLACKOUT',
      style: {
        text: '⚠️\\nBLACKOUT',
        size: '14',
        color: 0xffffff,
        bgcolor: 0xff0000
      },
      steps: [{
        down: [{
          actionId: 'clear_all'
        }, {
          actionId: 'stop_all_layers'
        }],
        up: []
      }],
      feedbacks: [{
        feedbackId: 'any_clips_active',
        options: {},
        style: {
          bgcolor: 0x8b0000 // Darker when nothing active
        }
      }]
    }
  ]

  // Category: Scene Workflows (contextual presets)
  const workflowPresets = this.generateWorkflowPresets()

  // Category: Advanced Controls (for power users)
  const advancedPresets = this.generateAdvancedPresets()

  presets.push(...emergencyPresets, ...workflowPresets, ...advancedPresets)
  this.setPresetDefinitions(presets)
}

generateWorkflowPresets() {
  // Workflow: Walk-In -> Worship -> Sermon -> Offering -> Closing
  return [
    {
      category: 'Workflows',
      name: 'Full Service Sequence',
      // Multi-step macro with timing
    }
  ]
}
```

### 7. Custom Button Graphics

**Feature:** Allow users to upload custom button icons

**Implementation:**
```javascript
// Add image upload action
upload_button_image: {
  name: 'Upload Button Image',
  options: [
    {
      type: 'textinput',
      label: 'Button ID',
      id: 'button_id',
      required: true
    },
    {
      type: 'file',
      label: 'Image File (72x72 PNG)',
      id: 'image_file'
    }
  ],
  callback: async (action) => {
    const { button_id, image_file } = action.options
    // Store and convert to png64
    this.customImages[button_id] = await this.processImage(image_file)
    this.checkFeedbacks() // Refresh buttons
  }
}
```

---

## 🏢 Enterprise Features (Phase 3 - Weeks 6-7)

### 8. Multi-Instance Support

**Current Gap:** Single ShowCall instance only

**Enterprise Need:**
```javascript
// Support multiple Resolume instances
class ShowCallInstance extends InstanceBase {
  constructor(internal) {
    super(internal)
    this.instances = new Map() // Multiple ShowCall connections
    this.primaryInstance = null
    this.backupInstance = null
  }

  getConfigFields() {
    return [
      // ... existing fields ...
      {
        type: 'checkbox',
        label: 'Enable Backup Instance',
        id: 'enable_backup',
        default: false
      },
      {
        type: 'textinput',
        label: 'Backup Host',
        id: 'backup_host',
        isVisible: (options) => options.enable_backup
      },
      {
        type: 'dropdown',
        label: 'Failover Mode',
        id: 'failover_mode',
        choices: [
          { id: 'manual', label: 'Manual Switch' },
          { id: 'automatic', label: 'Automatic Failover' },
          { id: 'simultaneous', label: 'Control Both' }
        ],
        default: 'automatic'
      }
    ]
  }
}
```

### 9. Advanced Show Control

**Professional Features:**
```javascript
// Timecode sync integration
initActions() {
  this.setActionDefinitions({
    // ... existing actions ...
    
    sync_to_timecode: {
      name: 'Sync to Timecode',
      options: [
        {
          type: 'textinput',
          label: 'SMPTE Timecode (HH:MM:SS:FF)',
          id: 'timecode',
          regex: '/^\\d{2}:\\d{2}:\\d{2}:\\d{2}$/'
        }
      ],
      callback: async (action) => {
        const { timecode } = action.options
        this.sendCommand('sync_timecode', { timecode })
      }
    },
    
    trigger_on_timecode: {
      name: 'Trigger at Timecode',
      options: [
        {
          type: 'textinput',
          label: 'Trigger Time (HH:MM:SS:FF)',
          id: 'trigger_time'
        },
        {
          type: 'number',
          label: 'Layer',
          id: 'layer',
          min: 1,
          max: 8
        },
        {
          type: 'number',
          label: 'Column',
          id: 'column',
          min: 1,
          max: 32
        }
      ],
      callback: async (action) => {
        // Schedule trigger for specific timecode
        this.scheduleTimecodeAction(action.options)
      }
    }
  })
}
```

### 10. Preset Sharing & Cloud Sync

**Community Features:**
```javascript
// Preset import/export
export_presets: {
  name: 'Export Preset Configuration',
  options: [],
  callback: async () => {
    const presets = this.getPresetDefinitions()
    const exportData = {
      version: '2.5.0',
      presets: presets,
      metadata: {
        author: this.config.author_name,
        created: Date.now(),
        description: 'My custom preset pack'
      }
    }
    
    // Save to file or upload to cloud
    this.savePresetPack(exportData)
  }
}

// Cloud sync (optional feature)
sync_presets_to_cloud: {
  name: 'Sync Presets to Cloud',
  options: [
    {
      type: 'textinput',
      label: 'Cloud API Key',
      id: 'api_key'
    }
  ],
  callback: async (action) => {
    const presets = this.getPresetDefinitions()
    await this.cloudSync.upload(presets, action.options.api_key)
  }
}
```

---

## 🔧 Developer Experience (Phase 4 - Week 8)

### 11. Testing Infrastructure

**Current State:** No automated tests

**Critical Tests Needed:**
```javascript
// tests/unit/connection.test.js
describe('WebSocket Connection', () => {
  test('should reconnect on connection loss', async () => {
    // Test reconnection logic
  })
  
  test('should sync state after reconnection', async () => {
    // Test state synchronization
  })
  
  test('should handle malformed messages', async () => {
    // Test error handling
  })
})

// tests/unit/feedbacks.test.js
describe('Feedback System', () => {
  test('should update clip active feedback', async () => {
    // Test feedback accuracy
  })
  
  test('should batch feedback updates', async () => {
    // Test performance optimization
  })
})

// tests/integration/showCall.test.js
describe('ShowCall Integration', () => {
  test('should trigger clips successfully', async () => {
    // Test end-to-end clip triggering
  })
  
  test('should receive accurate status updates', async () => {
    // Test status stream
  })
})
```

### 12. Debug Tools

**Developer Features:**
```javascript
// Add debug mode configuration
getConfigFields() {
  return [
    // ... existing fields ...
    {
      type: 'checkbox',
      label: 'Enable Debug Mode',
      id: 'debug_mode',
      default: false
    },
    {
      type: 'checkbox',
      label: 'Log All Messages',
      id: 'log_messages',
      default: false,
      isVisible: (options) => options.debug_mode
    },
    {
      type: 'checkbox',
      label: 'Performance Monitoring',
      id: 'perf_monitoring',
      default: false,
      isVisible: (options) => options.debug_mode
    }
  ]
}

// Debug action
debug_dump_state: {
  name: 'Dump Current State (Debug)',
  options: [],
  callback: async () => {
    const state = {
      connection: {
        connected: this.status.connected,
        wsState: this.ws ? this.ws.readyState : null,
        lastUpdate: this.lastStatusUpdate
      },
      clips: this.status.clips,
      layers: this.status.layers,
      columns: this.status.columns,
      variables: this.getVariableDefinitions()
    }
    
    this.log('info', '=== STATE DUMP ===')
    this.log('info', JSON.stringify(state, null, 2))
    this.log('info', '=== END STATE DUMP ===')
  }
}
```

---

## 📊 Monitoring & Analytics

### 13. Performance Monitoring

**Metrics to Track:**
```javascript
class ShowCallInstance extends InstanceBase {
  constructor(internal) {
    super(internal)
    this.metrics = {
      messagesReceived: 0,
      messagesSent: 0,
      feedbackUpdates: 0,
      averageLatency: 0,
      errorCount: 0,
      reconnectCount: 0
    }
  }

  // Track performance metrics
  trackMetric(name, value) {
    this.metrics[name] = value
    
    if (this.config.perf_monitoring) {
      this.log('debug', `Metric: ${name} = ${value}`)
    }
  }

  // Expose metrics via variables
  initVariables() {
    this.setVariableDefinitions([
      // ... existing variables ...
      { variableId: 'metrics_messages_received', name: 'Messages Received' },
      { variableId: 'metrics_messages_sent', name: 'Messages Sent' },
      { variableId: 'metrics_avg_latency', name: 'Average Latency (ms)' },
      { variableId: 'metrics_error_count', name: 'Error Count' }
    ])
    
    // Update metrics every 10 seconds
    setInterval(() => {
      this.setVariableValues({
        metrics_messages_received: this.metrics.messagesReceived,
        metrics_messages_sent: this.metrics.messagesSent,
        metrics_avg_latency: Math.round(this.metrics.averageLatency),
        metrics_error_count: this.metrics.errorCount
      })
    }, 10000)
  }
}
```

---

## 🚀 Quick Wins (Immediate Actions)

### 1. Fix Reconnection Logic (1 hour)
```javascript
// Remove retry limit, add infinite reconnection
connectWebSocket() {
  // ... existing code ...
  
  this.ws.on('close', () => {
    // Remove: if (this.connectionRetryCount < this.maxRetries)
    // Just always reconnect with backoff
    const delay = Math.min(5000 * Math.pow(1.5, this.connectionRetryCount), 60000)
    this.reconnectTimer = setTimeout(() => {
      this.connectWebSocket()
    }, delay)
  })
}
```

### 2. Add State Validation (2 hours)
```javascript
// Validate incoming status messages
handleMessage(message) {
  if (message.type === 'status_update') {
    if (!this.validateStatusData(message.data)) {
      this.log('error', 'Invalid status data received')
      return
    }
    // ... process message
  }
}

validateStatusData(data) {
  return (
    data &&
    typeof data.connected === 'boolean' &&
    Array.isArray(data.programClips) &&
    typeof data.bpm === 'number'
  )
}
```

### 3. Optimize Feedback Performance (3 hours)
```javascript
// Implement feedback batching
checkFeedbacks(...feedbackIds) {
  if (feedbackIds.length === 0) {
    // Batch all feedbacks
    super.checkFeedbacks()
  } else {
    // Batch specific feedbacks
    super.checkFeedbacks(...feedbackIds)
  }
}
```

### 4. Add Heartbeat Monitoring (2 hours)
```javascript
// Implement keepalive
connectWebSocket() {
  // ... existing code ...
  
  this.ws.on('open', () => {
    this.startHeartbeat()
  })
}

startHeartbeat() {
  this.heartbeatInterval = setInterval(() => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'ping' }))
    }
  }, 30000) // Ping every 30 seconds
}
```

### 5. Improve Error Messages (1 hour)
```javascript
// Add context to error messages
this.ws.on('error', (error) => {
  const troubleshooting = this.getTroubleshootingSteps(error)
  this.log('error', `WebSocket error: ${error.message}\\n${troubleshooting}`)
})

getTroubleshootingSteps(error) {
  if (error.code === 'ECONNREFUSED') {
    return 'ShowCall is not running. Please start ShowCall and try again.'
  }
  if (error.code === 'ETIMEDOUT') {
    return 'Connection timed out. Check network and firewall settings.'
  }
  return 'Check that ShowCall is running and accessible.'
}
```

---

## 📋 Implementation Priority Matrix

| Feature | Impact | Effort | Priority | Phase |
|---------|--------|--------|----------|-------|
| Connection Reliability | HIGH | MEDIUM | P0 | 1 |
| State Synchronization | HIGH | HIGH | P0 | 1 |
| Feedback Optimization | HIGH | MEDIUM | P0 | 1 |
| Error Handling | HIGH | LOW | P0 | 1 |
| Advanced Feedback | MEDIUM | MEDIUM | P1 | 2 |
| Enhanced Presets | MEDIUM | LOW | P1 | 2 |
| Custom Graphics | LOW | HIGH | P2 | 2 |
| Multi-Instance | HIGH | HIGH | P1 | 3 |
| Show Control | HIGH | HIGH | P1 | 3 |
| Preset Sharing | MEDIUM | MEDIUM | P2 | 3 |
| Testing | HIGH | HIGH | P1 | 4 |
| Debug Tools | MEDIUM | LOW | P2 | 4 |
| Performance Monitoring | MEDIUM | LOW | P2 | 4 |

---

## 🎯 Success Metrics

### Key Performance Indicators (KPIs)

**Reliability:**
- 99.9% connection uptime
- 100% state accuracy with ShowCall
- <1 second reconnection time
- Zero state desync incidents

**Performance:**
- <16ms feedback update latency
- <50ms command execution time
- <50MB memory usage
- No UI lag with 32+ buttons

**User Satisfaction:**
- <2 minutes setup time
- 95%+ user satisfaction score
- <2 support tickets per 100 users
- <15 minute training time

---

## 📚 Documentation Needs

### User Documentation
- [ ] Quick start guide
- [ ] Feedback reference guide
- [ ] Troubleshooting playbook
- [ ] Video tutorials
- [ ] Preset library catalog

### Developer Documentation
- [ ] API documentation
- [ ] Architecture overview
- [ ] Contributing guide
- [ ] Testing guide
- [ ] Release process

---

## 🎉 Conclusion

The ShowCall Companion module has a strong foundation (v2.0.0) but requires focused improvements for professional production environments. The codebase is well-structured and the feedback system is comprehensive, but needs optimization and enhanced reliability.

**Strengths:**
- Comprehensive feedback system (9 feedback types)
- Rich preset library (32+ presets)
- Good variable system
- Solid base architecture

**Gaps:**
- Connection reliability needs improvement
- State sync accuracy issues
- Performance optimization needed
- Missing enterprise features

**Next Steps:**
1. Implement Quick Wins (immediate impact, low effort)
2. Focus on Phase 1 critical items (reliability)
3. Gather user feedback on preset library
4. Plan Phase 2 UX enhancements
5. Prepare for Phase 3 enterprise features

**Timeline Summary:**
- Phase 1 (Critical): 3 weeks
- Phase 2 (UX): 2 weeks
- Phase 3 (Enterprise): 2 weeks
- Phase 4 (Dev): 1 week
- **Total:** 8 weeks to production-ready v2.5.0

---

*Document Version: 1.0*  
*Last Updated: October 15, 2025*  
*Author: AI Development Assistant*
