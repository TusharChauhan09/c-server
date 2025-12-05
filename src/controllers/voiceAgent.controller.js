import axios from 'axios';

/**
 * Get ephemeral token for OpenAI Realtime API
 * This token is valid for 60 seconds and used by frontend to connect
 */
export const getEphemeralToken = async (req, res) => {
  try {
    console.log('📞 Creating ephemeral token for voice session...');
    console.log('🔑 API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('🔑 API Key length:', process.env.OPENAI_API_KEY?.length);
    console.log('🔑 First 20 chars:', process.env.OPENAI_API_KEY?.substring(0, 20));

    // Create ephemeral token via OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/realtime/sessions',
      {
        model: 'gpt-4o-realtime-preview',  // Use base model name
        modalities: ['text', 'audio'],
        voice: 'alloy' // Options: alloy, echo, fable, onyx, nova, shimmer
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const ephemeralKey = response.data.client_secret.value;
    const expiresAt = response.data.expires_at;

    console.log('✅ Ephemeral token created successfully');
    console.log(`⏰ Expires at: ${new Date(expiresAt * 1000).toISOString()}`);

    // Return ephemeral key to frontend
    res.status(200).json({
      success: true,
      tempApiKey: ephemeralKey,
      expiresAt: expiresAt
    });

  } catch (error) {
    console.error('❌ Error creating ephemeral token:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create ephemeral token',
      error: error.response?.data?.error?.message || error.message
    });
  }
};

/**
 * Optional: Save conversation history
 */
export const saveConversation = async (req, res) => {
  try {
    const { userId, destination, messages, duration } = req.body;

    // TODO: Save to database or use useTravelStore on frontend
    console.log('💾 Saving conversation:', { userId, destination, duration });

    res.status(200).json({
      success: true,
      message: 'Conversation saved successfully'
    });

  } catch (error) {
    console.error('❌ Error saving conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save conversation'
    });
  }
};
