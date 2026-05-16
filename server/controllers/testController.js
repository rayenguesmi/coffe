const Test = require('../models/Test');
const axios = require('axios');

/**
 * Initiates a new test by creating a record in MongoDB and notifying the FastAPI agent.
 */
const startTest = async (req, res) => {
  const { targetUrl, analysisType } = req.body;
  const ownerId = req.user.id;

  if (!targetUrl || !analysisType) {
    return res.status(400).json({ success: false, message: 'Target URL and analysis type are required.' });
  }

  try {
    // 1. Create test entry in MongoDB
    const test = await Test.create({
      ownerId,
      targetUrl,
      analysisType,
      status: 'pending',
    });

    // 2. Transmit request specifically to FastAPI
    // Pass the userId and testId for traceability
    try {
      // Assuming FastAPI is running and its URL is in .env
      const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
      
      // Non-blocking call or separate service would be better, 
      // but for now we'll do a simple POST
      axios.post(`${fastApiUrl}/run-test`, {
        testId: test._id,
        userId: ownerId,
        url: targetUrl,
        type: analysisType
      }).catch(err => console.error('Delayed FastAPI error:', err.message));

      test.status = 'running';
      await test.save();
    } catch (fastApiErr) {
      console.error('FastAPI immediate connection error:', fastApiErr.message);
      test.status = 'failed';
      test.logs.push({ 
        message: `Failed to connect to FastAPI engine: ${fastApiErr.message}`,
        level: 'error' 
      });
      await test.save();
    }

    return res.status(201).json({
      success: true,
      data: test,
      message: 'Test initiated successfully.'
    });
  } catch (err) {
    console.error('Start test error:', err);
    return res.status(500).json({ success: false, message: 'Server error while starting test.' });
  }
};

/**
 * Returns tests launched by the currently authenticated user.
 */
const getMyTests = async (req, res) => {
  try {
    const tests = await Test.find({ ownerId: req.user.id }).sort('-createdAt');
    return res.status(200).json({ success: true, data: tests });
  } catch (err) {
    console.error('Get my tests error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching tests.' });
  }
};

/**
 * Returns all tests for Admin view.
 */
const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find({})
      .populate('ownerId', 'name email')
      .sort('-createdAt');
    return res.status(200).json({ success: true, data: tests });
  } catch (err) {
    console.error('Get all tests error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching tests.' });
  }
};

/**
 * Returns global platform statistics.
 */
const getGlobalStats = async (req, res) => {
  try {
    const totalTests = await Test.countDocuments();
    const completedTests = await Test.countDocuments({ status: 'completed' });
    const failedTests = await Test.countDocuments({ status: 'failed' });
    const activeUsers = await Test.distinct('ownerId');

    return res.status(200).json({
      success: true,
      data: {
        totalTests,
        completedTests,
        failedTests,
        activeUsersCount: activeUsers.length
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching stats.' });
  }
};

module.exports = {
  startTest,
  getMyTests,
  getAllTests,
  getGlobalStats
};
