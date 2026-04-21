# ShowCall Companion Module - Data Diagnostic Guide

## 🔍 **Issue Analysis**

You're absolutely right! The variables appear to be preset/static instead of pulling real data from ShowCall. Let's diagnose what's happening.

## 🛠️ **Debug Version Installed**

I've updated the module with extensive debug logging to understand exactly what data ShowCall is sending. The debug version will now log:

1. **All incoming WebSocket messages** from ShowCall
2. **Status updates** before and after processing
3. **Variable updates** with actual values
4. **Connection details** and command sending
5. **Data structure validation** for clips/layers/columns

## 📋 **Testing Checklist**

### **Step 1: Verify ShowCall is Running**
```bash
# Check if ShowCall is running and listening on port 3200
curl http://localhost:3200/api/companion
# OR
telnet localhost 3200
```

### **Step 2: Install Debug Module**
1. **Copy the updated files** from `dist/` folder to your Companion setup
2. **Restart Companion** to load the debug version
3. **Add/reconfigure** the ShowCall connection

### **Step 3: Monitor Logs**
1. **Open Companion logs** (Settings → Logs)
2. **Look for debug messages** starting with "ShowCall Message Received:"
3. **Check variable updates** to see actual values being set

### **Step 4: Test Commands**
1. **Use the new "Refresh Status (Debug)" action** - this will manually request data and log current status
2. **Trigger clips** in ShowCall directly and watch for real-time updates
3. **Check connection status** in the logs

## 📊 **Expected Data Format from ShowCall**

Based on the code, ShowCall should send WebSocket messages like:

```json
{
  "type": "status",
  "data": {
    "program": [
      {
        "layer": 1,
        "column": 1,
        "clipName": "My Clip",
        "opacity": 0.8,
        "volume": 1.0,
        "position": 0.5,
        "duration": 30000
      }
    ],
    "bpm": 120,
    "connected": true
  }
}
```

```json
{
  "type": "composition",
  "data": {
    "name": "My Composition",
    "layers": 8,
    "columns": 32
  }
}
```

## 🔧 **Possible Issues & Solutions**

### **Issue 1: ShowCall Not Sending Data**
- **Symptoms**: No "ShowCall Message Received" logs
- **Solutions**: 
  - Verify ShowCall companion API is enabled
  - Check port 3200 is accessible
  - Ensure ShowCall version supports companion API

### **Issue 2: Wrong Data Format**
- **Symptoms**: Messages received but "Invalid or missing program data" warnings
- **Solutions**: 
  - Check ShowCall documentation for correct API format
  - Update parsing logic to match actual format

### **Issue 3: Different WebSocket Endpoint**
- **Symptoms**: Connection errors or 404 responses
- **Solutions**: 
  - Try different endpoints: `/ws`, `/websocket`, `/api/ws`
  - Check ShowCall settings for correct port/path

### **Issue 4: Authentication Required**
- **Symptoms**: Connection refused or unauthorized errors
- **Solutions**: 
  - Add authentication headers if needed
  - Check ShowCall security settings

## 🧪 **Manual Testing Commands**

The debug version includes these test commands:
- `get_status` - Request current status
- `get_composition` - Request composition info
- `status` - Alternative status request
- `get_state` - Alternative state request  
- `get_clips` - Request clip information

## 📝 **What to Look For in Logs**

### **Successful Connection:**
```
[INFO] Connected to ShowCall WebSocket at ws://localhost:3200/api/companion
[INFO] Sending command to ShowCall: {"action":"get_status"}
[INFO] ShowCall Message Received: { "type": "status", "data": {...} }
```

### **Data Processing:**
```
[INFO] updateClipStates - Processing program: [{"layer":1,"column":1,"clipName":"Test"}]
[INFO] Updating variables: {"bpm":120,"program_clips":1,"program_clip_names":"L1C1:Test"}
```

### **Failed Connection:**
```
[WARN] Cannot send command 'get_status' - not connected to ShowCall. WebSocket state: 3
[ERROR] WebSocket error: ECONNREFUSED
```

## 🎯 **Next Steps**

1. **Run the debug version** and capture logs
2. **Share the log output** showing:
   - Connection attempts
   - Incoming messages (if any)
   - Variable updates
3. **Test ShowCall API directly** using curl/browser
4. **Check ShowCall documentation** for companion API specifics

## 🔍 **Quick Diagnosis Commands**

```bash
# Test ShowCall API endpoint
curl -v http://localhost:3200/api/companion

# Check if ShowCall is listening
netstat -an | grep 3200

# Test WebSocket connection manually
wscat -c ws://localhost:3200/api/companion
```

## 📞 **Debugging Support**

If ShowCall API format is different than expected, we can easily adapt the module once we know:

1. **Actual WebSocket endpoint URL**
2. **Real message format** ShowCall sends
3. **Required authentication** (if any)
4. **Available commands/actions** ShowCall supports

The debug version will reveal exactly what's happening! 🔍

---

**Run the debug version and let's see what ShowCall is actually sending!** 🚀