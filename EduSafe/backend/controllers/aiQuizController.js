const axios = require('axios');
const Quiz = require('../models/Quiz');
const DailyChallenge = require('../models/DailyChallenge');
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { getSubtitles } = require('youtube-transcript-api');

let pdfParse;
try {
  pdfParse = require('pdf-parse');
  if (pdfParse.default) pdfParse = pdfParse.default;
} catch (e) {
  console.warn('pdf-parse not available, PDF extraction will fail');
  pdfParse = null;
}

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8080';

// Extract text from uploaded file or YouTube URL
const extractContent = async (source, type, filePath = null) => {
  if (type === 'text') return source;
  if (type === 'youtube') {
    try {
      let videoId = source;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = source.match(regExp);
      if (match && match[2].length === 11) videoId = match[2];
      const subtitles = await getSubtitles({ videoID: videoId, lang: 'en' });
      return subtitles.map(sub => sub.text).join(' ');
    } catch (err) {
      throw new Error('Could not fetch YouTube transcript. Make sure the video has English captions.');
    }
  }
  if (type === 'pdf' && filePath && pdfParse) {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  }
  if (type === 'docx' && filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  if (type === 'txt' && filePath) {
    return fs.readFileSync(filePath, 'utf8');
  }
  throw new Error('Unsupported content type or missing PDF parser');
};

// Generate a quiz from uploaded/pasted/YouTube content
exports.generateQuiz = async (req, res) => {
  try {
    const { grade, numQuestions, questionTypes, contentText, contentUrl } = req.body;
    const { tenantId, _id: createdBy } = req.user;
    let extractedText = '';

    // Handle file upload
    if (req.file) {
      const fileExt = path.extname(req.file.originalname).toLowerCase();
      let fileType = '';
      if (fileExt === '.pdf') fileType = 'pdf';
      else if (fileExt === '.docx') fileType = 'docx';
      else if (fileExt === '.txt') fileType = 'txt';
      else throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');

      extractedText = await extractContent(null, fileType, req.file.path);
      fs.unlinkSync(req.file.path);
    }
    // Handle YouTube link
    else if (contentUrl && (contentUrl.includes('youtube.com') || contentUrl.includes('youtu.be'))) {
      extractedText = await extractContent(contentUrl, 'youtube');
    }
    // Handle pasted text
    else if (contentText) {
      extractedText = contentText;
    }
    else {
      return res.status(400).json({ success: false, message: 'No content provided.' });
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Extracted content is too short (min 50 characters).' });
    }

    // Ensure questionTypes is an array
    let types = questionTypes;
    if (typeof questionTypes === 'string') {
      try {
        types = JSON.parse(questionTypes);
      } catch (e) {
        types = [questionTypes];
      }
    }
    if (!Array.isArray(types)) types = ['mcq', 'truefalse'];

    // Call Go AI service
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/ai/generate-quiz`, {
      content: extractedText,
      grade,
      numQuestions: parseInt(numQuestions),
      questionTypes: types
    });

    const quizData = aiResponse.data;
    if (!quizData.title || !quizData.questions) {
      throw new Error('AI response missing required fields');
    }

    // Map the AI response to your schema, preserving questionType
    const formattedQuestions = quizData.questions.map(q => ({
      question: q.text,
      questionType: q.questionType || (q.options && q.options.length ? 'mcq' : 'long'),
      options: q.options || [],
      correctAnswer: q.correctAnswerIndex || 0,
      media: { type: 'none' }
    }));

    const newQuiz = await Quiz.create({
      title: quizData.title,
      description: quizData.description || `Auto-generated from content. Grade ${grade}`,
      questions: formattedQuestions,
      tenantId,
      createdBy,
      timeLimit: quizData.timeLimit || 30,
      passingScore: quizData.passingScore || 60,
      category: quizData.category || 'general',
      xpReward: quizData.xpReward || 100
    });

    res.status(201).json({ success: true, quiz: newQuiz });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get today's daily challenge
exports.getTodaysChallenge = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const today = new Date().toISOString().split('T')[0];
    let challenge = await DailyChallenge.findOne({ tenantId, date: today });
    if (!challenge) {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/ai/generate-daily-challenge`, {
        tenantId: tenantId.toString()
      });
      const challengeData = aiResponse.data;
      challenge = await DailyChallenge.create({
        tenantId,
        date: today,
        challenge: challengeData
      });
    }
    res.json({
      success: true,
      challenge: {
        title: challenge.challenge.title,
        description: challenge.challenge.description,
        question: challenge.challenge.question,
        xpReward: challenge.challenge.xpReward
      },
      challengeId: challenge._id
    });
  } catch (error) {
    console.error('Get challenge error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit answer
exports.submitChallenge = async (req, res) => {
  try {
    const { challengeId, answer } = req.body;
    const { tenantId } = req.user;
    const challenge = await DailyChallenge.findOne({ _id: challengeId, tenantId });
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    const isCorrect = (answer.trim().toLowerCase() === challenge.challenge.answer.trim().toLowerCase());
    res.json({
      success: true,
      correct: isCorrect,
      xpEarned: isCorrect ? challenge.challenge.xpReward : 0,
      message: isCorrect ? `Great! You earned ${challenge.challenge.xpReward} XP.` : 'Not quite. Try again tomorrow!'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};