import Feedback from '../models/feedback.model.js';

// Submit new feedback
export const submitFeedback = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Get userId from auth if available
    const userId = req.auth?.userId || null;

    // Create feedback
    const feedback = await Feedback.create({
      name,
      email,
      subject,
      message,
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! We will get back to you soon.',
      data: {
        id: feedback._id
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again.'
    });
  }
};

// Get all feedback (admin only - for future use)
export const getAllFeedback = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = status ? { status } : {};
    
    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.json({
      success: true,
      data: feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
};

// Update feedback status (admin only - for future use)
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback'
    });
  }
};
