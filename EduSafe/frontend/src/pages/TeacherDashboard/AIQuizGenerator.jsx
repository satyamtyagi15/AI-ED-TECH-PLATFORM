import React, { useState } from 'react';
import axios from 'axios';

const AIQuizGenerator = () => {
  const [contentText, setContentText] = useState('');
  const [grade, setGrade] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionTypes, setQuestionTypes] = useState(['mcq', 'truefalse', 'short', 'long']);
  const [loading, setLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const token = localStorage.getItem('token');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!grade) {
      alert('Please provide grade level');
      return;
    }
    if (!contentText.trim()) {
      alert('Please paste some content');
      return;
    }

    setLoading(true);
    try {
      let formData = new FormData();
      formData.append('grade', grade);
      formData.append('numQuestions', numQuestions);
      for (let qt of questionTypes) {
        formData.append('questionTypes', qt);
      }
      formData.append('contentText', contentText);

      const res = await axios.post('/api/ai/generate-quiz', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });

      setGeneratedQuiz(res.data.quiz);
      alert('Quiz generated and saved successfully!');
      setContentText('');
      setGrade('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          AI Question Paper Generator
        </h2>
        <p className="text-emerald-300">Paste any text → AI creates a custom question paper with MCQ, True/False, Short Answer & Long Answer questions.</p>
      </div>

      <form onSubmit={handleGenerate} className="bg-black/40 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-6 space-y-4">
        <div>
          <label className="block text-emerald-300 mb-1">Content (text, article, transcript)</label>
          <textarea
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            className="w-full bg-gray-900/60 border border-emerald-500/50 rounded-xl px-4 py-2 text-white"
            rows="8"
            placeholder="Paste your lesson content, article, or transcript here..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-emerald-300 mb-1">Grade Level</label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-gray-900/60 border border-emerald-500/50 rounded-xl px-4 py-2 text-white"
              placeholder="e.g., 5, 6th grade, High School"
              required
            />
          </div>
          <div>
            <label className="block text-emerald-300 mb-1">Number of Questions</label>
            <input
              type="number"
              min="1"
              max="50"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full bg-gray-900/60 border border-emerald-500/50 rounded-xl px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-emerald-300 mb-1">Question Types</label>
            <div className="flex flex-wrap gap-2">
              {['mcq', 'truefalse', 'short', 'long'].map(type => (
                <label key={type} className="flex items-center gap-1 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    value={type}
                    checked={questionTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) setQuestionTypes([...questionTypes, type]);
                      else setQuestionTypes(questionTypes.filter(t => t !== type));
                    }}
                    className="rounded border-emerald-500"
                  />
                  {type === 'mcq' ? 'MCQ' : type === 'truefalse' ? 'True/False' : type === 'short' ? 'Short Answer' : 'Long Answer'}
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold shadow-neon-emerald hover:scale-105 transition"
        >
          {loading ? 'Generating...' : '✨ Generate Question Paper'}
        </button>
      </form>

      {generatedQuiz && (
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-6">
          <h3 className="text-xl font-bold text-white">{generatedQuiz.title}</h3>
          <p className="text-emerald-300 mb-4">{generatedQuiz.description}</p>
          <p className="text-sm text-gray-400">Category: {generatedQuiz.category} | XP Reward: {generatedQuiz.xpReward}</p>
          <a href="/teacher-dashboard/quizzes" className="inline-block mt-4 px-4 py-2 rounded-full bg-emerald-600 text-white">Go to Quizzes</a>
        </div>
      )}
    </div>
  );
};

export default AIQuizGenerator;