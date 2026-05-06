import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, HelpCircle } from 'lucide-react';

const DailyChallengeWidget = () => {
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchChallenge();
  }, []);

  const fetchChallenge = async () => {
    try {
      const res = await axios.get('/api/ai/daily-challenge', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChallenge(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/ai/daily-challenge/submit', {
        challengeId: challenge.challengeId,
        answer
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit');
    }
  };

  if (loading) return <div className="animate-pulse">Loading daily challenge...</div>;
  if (!challenge?.challenge) return null;

  return (
    <div className="bg-gradient-to-r from-purple-900/40 to-cyan-900/40 backdrop-blur-md rounded-2xl border border-purple-500/30 p-5 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <Award className="h-6 w-6 text-yellow-400" />
        <h3 className="text-xl font-bold text-white">Daily Challenge</h3>
      </div>
      <h4 className="text-lg font-semibold text-purple-300">{challenge.challenge.title}</h4>
      <p className="text-gray-300 text-sm mb-2">{challenge.challenge.description}</p>
      <p className="text-white mt-2"><HelpCircle className="inline h-4 w-4 mr-1" /> {challenge.challenge.question}</p>
      {!submitted ? (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer..."
            className="flex-1 bg-black/50 border border-purple-500/30 rounded-full px-4 py-1 text-sm text-white"
            required
          />
          <button type="submit" className="px-4 py-1 rounded-full bg-purple-600 text-white text-sm hover:bg-purple-700 transition">Submit</button>
        </form>
      ) : (
        <div className={`mt-3 p-2 rounded-lg ${result.correct ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
          {result.message}
          {result.correct && <p className="text-sm">+{result.xpEarned} XP earned!</p>}
        </div>
      )}
    </div>
  );
};

export default DailyChallengeWidget;