import { User } from '../models/user.model.js';
import axios from 'axios';

/**
 * Get ephemeral token for OpenAI Realtime API
 * This token is valid for 60 seconds and used by frontend to connect
 */
export const getEphemeralToken = async (req, res) => {
  try {
    const { model = 'gpt-4o-mini-realtime-preview', userId } = req.query;

    console.log('📞 Creating ephemeral token for voice session...');
    console.log('🤖 Using model:', model);
    console.log('👤 User ID:', userId);
    console.log('🔑 API Key Loaded:', !!process.env.OPENAI_API_KEY, process.env.OPENAI_API_KEY ? `(Length: ${process.env.OPENAI_API_KEY.length})` : '(Missing)');

    // Check credits for Standard Model
    if (model !== 'gpt-4o-mini-realtime-preview') {
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User ID required for premium models' });
      }

      const user = await User.findOne({ clerkId: userId });
      
      if (!user) {
         return res.status(404).json({ success: false, message: 'User not found in database' });
      }

      console.log(`💳 User Credits: ${user.standardCredits}, Tier: ${user.subscriptionTier}`);

      // Check if user has sufficient credits
      if (user.standardCredits <= 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'Insufficient credits for GPT-4o Standard. Please upgrade or use Mini.',
          forbidden: true // Flag for frontend to show upgrade modal
        });
      }

      // Deduct 1 credit (Approx 1 session)
      user.standardCredits -= 1;
      await user.save();
      console.log(`✅ Deducted 1 credit. Remaining: ${user.standardCredits}`);
    }

    // Create ephemeral token via OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/realtime/sessions',
      {
        model: model,
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
