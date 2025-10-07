// Test script to verify WebSocket connection to ShowCall
const WebSocket = require('ws');

const wsUrl = 'ws://localhost:3200/api/companion';
console.log(`Connecting to ShowCall at ${wsUrl}...`);

const ws = new WebSocket(wsUrl);

ws.on('open', () => {
    console.log('✅ Connected to ShowCall!');
    
    // Request status
    console.log('📡 Requesting status...');
    ws.send(JSON.stringify({ action: 'get_status' }));
    
    // Test a clip trigger after 2 seconds
    setTimeout(() => {
        console.log('🎬 Testing clip trigger L1C1...');
        ws.send(JSON.stringify({ 
            action: 'trigger_clip', 
            layer: 1, 
            column: 1 
        }));
    }, 2000);
    
    // Close after 5 seconds
    setTimeout(() => {
        console.log('👋 Closing connection');
        ws.close();
    }, 5000);
});

ws.on('message', (data) => {
    try {
        const message = JSON.parse(data);
        console.log('📨 Received:', JSON.stringify(message, null, 2));
    } catch (error) {
        console.log('📨 Received (raw):', data.toString());
    }
});

ws.on('close', () => {
    console.log('❌ Disconnected from ShowCall');
    process.exit(0);
});

ws.on('error', (error) => {
    console.error('💥 WebSocket error:', error.message);
    process.exit(1);
});