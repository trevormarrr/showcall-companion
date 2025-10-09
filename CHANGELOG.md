# ShowCall Companion Module - Changelog

## [2.0.0] - 2024-10-08

### 🚀 MAJOR RELEASE - Complete Feedback System Overhaul

#### ✨ **New Features**

##### **Comprehensive Feedback System**
- **Clip Active Feedback**: Red background when specific clips are active in program
- **Layer Active Feedback**: Orange background when any clips are active in a layer
- **Column Active Feedback**: Blue background when any clips are active in a column
- **Connection Status Feedback**: Green background when connected to ShowCall
- **Any Clips Active Feedback**: Purple background when any clips are running
- **BPM Range Feedback**: Green background when BPM is within specified range
- **Clip Opacity Feedback**: Button brightness reflects clip opacity levels (0-100%)
- **Clip Position Feedback**: Color gradient shows clip playback progress (green to red)
- **Preview State Feedback**: Gray background for clips in preview mode

##### **Enhanced Actions & Controls**
- **Stop Clip**: Stop individual clips by layer/column
- **Stop Layer**: Stop all clips in a specific layer
- **Stop Column**: Stop all clips in a specific column
- **Set BPM**: Direct BPM control with validation
- **Adjust Layer Opacity**: Control layer opacity (0-100%)
- **Tap Tempo**: BPM control via tap tempo
- **Resync Composition**: Force resync with ShowCall

##### **Advanced State Management**
- Real-time clip state tracking per layer/column
- Layer activity monitoring with clip counts
- Column activity monitoring with clip counts
- Enhanced connection management with retry logic
- State persistence across disconnections
- Exponential backoff for reconnection attempts

##### **Rich Variable System**
- `connection_status`: Connected/Disconnected with uptime
- `composition_name`: Current composition name
- `composition_size`: Composition dimensions (LxC format)
- `active_layers`: Number of layers with active clips
- `active_columns`: Number of columns with active clips
- `last_triggered_clip`: Most recently triggered clip
- `connection_uptime`: Connection duration in human-readable format
- `layer_1_status` through `layer_8_status`: Individual layer status with clip counts

##### **Comprehensive Preset Collection**
- **32 Individual Clip Controls** (L1-L4, C1-C8) with multi-layered feedback
- **8 Column Triggers** with active state indication
- **8 Layer Status Indicators** with real-time clip counts and stop functionality
- **Enhanced Basic Controls** with connection and state awareness
- **8 Scene Macros** (Walk-In, Sermon, Baptism, Closing, Worship, Prayer, Offering, Announce)
- **4 BPM Control Presets** (Slow, Normal, Fast, Very Fast) with range feedback
- **System Status Display** with live connection and performance metrics
- **Tap Tempo Button** with BPM display and range indication
- **Resync Button** with connection status feedback

#### 🔧 **Improvements**

##### **Connection & Reliability**
- Exponential backoff reconnection strategy (5s → 30s max)
- Connection retry limit (10 attempts) before failure
- Enhanced error handling and logging
- Real-time connection health monitoring
- Graceful state clearing on disconnection

##### **Performance & Efficiency**
- Optimized state management with differential updates
- Reduced WebSocket message processing overhead
- Smart feedback triggering to prevent unnecessary updates
- Efficient preset generation with categorization

##### **User Experience**
- Professional color schemes with accessibility considerations
- Consistent visual language across all presets
- Dynamic button text with live variable integration
- Context-aware feedback combinations
- Comprehensive documentation and examples

#### 🐛 **Bug Fixes**
- Fixed feedback system not responding to clip/column state changes
- Resolved color values using proper hex notation (0x format)
- Fixed variable updates not triggering on status changes
- Corrected preset feedback definitions and styling
- Improved WebSocket message handling and error recovery
- Fixed macro ID parameter naming inconsistency

#### 📚 **Documentation**
- Complete README overhaul with visual guides
- Comprehensive setup and configuration instructions
- Detailed feedback and variable reference
- Advanced usage examples and custom workflows
- Professional troubleshooting guide
- Feature roadmap and backlog documentation

#### ⚠️ **Breaking Changes**
- Updated from decimal to hexadecimal color values (16711680 → 0xff0000)
- Enhanced feedback callback signatures for advanced features
- Macro action parameter renamed from `macroId` to `macro_id`
- Requires ShowCall v1.5.0+ for full functionality

#### 🏗️ **Technical Improvements**
- Enhanced class constructor with comprehensive state initialization
- Improved message handling with type-specific processing
- Advanced clip state management with key-based tracking
- Professional variable formatting and uptime calculation
- Comprehensive preset generation with category organization

---

## [1.0.0] - 2024-09-15

### Initial Release
- Basic WebSocket connection to ShowCall
- Simple clip and column trigger actions
- Basic macro execution support
- Minimal feedback system (clip active, connection status)
- Initial preset collection (clip triggers, basic controls)
- Foundation variable system

---

**Note**: This changelog follows [Keep a Changelog](https://keepachangelog.com/) format for clear version tracking and user communication.