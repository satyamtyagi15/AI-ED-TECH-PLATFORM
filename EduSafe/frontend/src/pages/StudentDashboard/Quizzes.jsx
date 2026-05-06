import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { BookOpen, Clock, Award, Play } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizzesRes, submissionsRes] = await Promise.all([api.get('/quizzes'), api.get(`/students/${user._id}/quiz-submissions`)]);
      setQuizzes(quizzesRes.data || []);
      setQuizSubmissions(submissionsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const takeQuiz = (quizId) => navigate(`/student-dashboard/quizzes/${quizId}/take`);
  const getQuizSubmission = (quizId) => quizSubmissions.find(sub => sub.quizId === quizId || sub.quizId?._id === quizId);
  const getScoreColor = (score, passing) => score >= passing ? 'text-green-400' : score >= passing-20 ? 'text-yellow-400' : 'text-red-400';

  if (loading) return <LoadingSpinner text="Loading quizzes..." />;
  const availableQuizzes = quizzes.filter(q => !getQuizSubmission(q._id));
  const completedQuizzes = quizzes.filter(q => getQuizSubmission(q._id));
  const avgScore = completedQuizzes.length ? Math.round(completedQuizzes.reduce((acc,q)=>acc+(getQuizSubmission(q._id)?.score||0),0)/completedQuizzes.length) : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between"><div><h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Quizzes & Tests</h2><p className="text-cyan-300">Test your knowledge</p></div><div className="text-right"><p className="text-cyan-300 text-sm">Average Score</p><p className="text-2xl font-bold text-white">{avgScore}%</p></div></div>
      {error && <ErrorDisplay error={error} onRetry={fetchData} />}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300 mb-4">Available Quizzes ({availableQuizzes.length})</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{availableQuizzes.map(quiz=>(<div key={quiz._id} className="border border-cyan-500/20 rounded-lg p-4 hover:shadow-neon-cyan transition"><div className="flex justify-between"><div className="p-2 bg-cyan-500/20 rounded-lg"><BookOpen className="h-5 w-5 text-cyan-300" /></div><span className="text-xs bg-blue-500/20 text-cyan-300 px-2 py-1 rounded-full">New</span></div><h4 className="font-semibold text-white mt-2">{quiz.title}</h4><p className="text-gray-400 text-sm">{quiz.description}</p><div className="flex justify-between text-sm text-gray-500 mt-3"><div className="flex items-center gap-1"><Clock className="h-4 w-4" />{quiz.timeLimit} min</div><span>{quiz.questions?.length || 0} questions</span></div><button onClick={()=>takeQuiz(quiz._id)} className="btn btn-primary w-full mt-3 flex items-center justify-center gap-2"><Play className="h-4 w-4" /> Start Quiz</button></div>))}{availableQuizzes.length===0 && <div className="col-span-full text-center py-8 text-gray-400"><Award className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No new quizzes – great job!</p></div>}</div></div>
      {completedQuizzes.length>0 && (<div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300 mb-4">Quiz Results ({completedQuizzes.length})</h3><div className="space-y-4">{completedQuizzes.map(quiz=>{const sub=getQuizSubmission(quiz._id); const passed = sub?.score >= (quiz.passingScore||60); return (<div key={quiz._id} className="border border-cyan-500/20 rounded-lg p-4"><div className="flex justify-between items-center"><h4 className="font-semibold text-white">{quiz.title}</h4><span className={`text-xs px-2 py-1 rounded-full ${passed ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>{passed ? "Passed" : "Failed"}</span></div><div className="grid grid-cols-3 gap-4 mt-2"><div><span className="text-xs text-gray-400">Your Score</span><p className={`text-lg font-bold ${getScoreColor(sub?.score, quiz.passingScore||60)}`}>{sub?.score}%</p></div><div><span className="text-xs text-gray-400">Passing</span><p className="text-lg font-bold text-white">{quiz.passingScore||60}%</p></div><div><span className="text-xs text-gray-400">Completed</span><p className="text-sm text-gray-300">{new Date(sub?.completedAt).toLocaleDateString()}</p></div></div><div className="flex gap-2 mt-3"><button className="btn btn-outline text-sm flex-1">Review</button><button onClick={()=>takeQuiz(quiz._id)} className="btn btn-primary text-sm flex-1">Retake</button></div></div>)})}</div></div>)}
      {completedQuizzes.length>0 && (<div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300 mb-4">Performance Summary</h3><div className="grid grid-cols-4 gap-4"><div className="text-center p-3 bg-blue-500/20 rounded"><div className="text-2xl font-bold text-blue-300">{completedQuizzes.length}</div><div className="text-sm">Taken</div></div><div className="text-center p-3 bg-green-500/20 rounded"><div className="text-2xl font-bold text-green-300">{completedQuizzes.filter(q=>{const s=getQuizSubmission(q._id); return s?.score>=(q.passingScore||60);}).length}</div><div className="text-sm">Passed</div></div><div className="text-center p-3 bg-purple-500/20 rounded"><div className="text-2xl font-bold text-purple-300">{avgScore}%</div><div className="text-sm">Avg Score</div></div><div className="text-center p-3 bg-orange-500/20 rounded"><div className="text-2xl font-bold text-orange-300">{Math.max(...completedQuizzes.map(q=>getQuizSubmission(q._id)?.score||0))}%</div><div className="text-sm">Best</div></div></div></div>)}
    </div>
  );
};

export default Quizzes;