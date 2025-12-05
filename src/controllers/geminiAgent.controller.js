import WebSocket from 'ws';

export const setupGeminiSocket = (wss) => {
  wss.on('connection', (ws) => {
    console.log('🔌 Client connected to Gemini Proxy');

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY is missing');
      ws.close(1008, 'API Key missing');
      return;
    }

    // Connect to Google Gemini Multimodal Live API
    const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${geminiApiKey}`;
    
    let geminiWs;
    try {
      geminiWs = new WebSocket(geminiUrl);
    } catch (error) {
      console.error('❌ Failed to create Gemini WebSocket:', error);
      ws.close(1011, 'Failed to connect to Gemini');
      return;
    }

    geminiWs.on('open', () => {
      console.log('✅ Connected to Gemini Live API');
      
      // Send initial setup message
      const setupMessage = {
        setup: {
          model: "models/gemini-2.0-flash-exp",
          generationConfig: {
            responseModalities: ["AUDIO"]
          }
        }
      };
      geminiWs.send(JSON.stringify(setupMessage));
    });

    geminiWs.on('message', (data) => {
      // Forward messages from Gemini to Client
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    geminiWs.on('close', (code, reason) => {
      console.log(`❌ Gemini connection closed. Code: ${code}, Reason: ${reason.toString()}`);
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    geminiWs.on('error', (error) => {
      console.error('❌ Gemini WebSocket error:', error);
    });

    // Forward messages from Client to Gemini
    ws.on('message', (data) => {
      if (geminiWs.readyState === WebSocket.OPEN) {
        geminiWs.send(data);
      }
    });

    ws.on('close', () => {
      console.log('🔌 Client disconnected');
      if (geminiWs.readyState === WebSocket.OPEN) {
        geminiWs.close();
      }
    });
  });
};
