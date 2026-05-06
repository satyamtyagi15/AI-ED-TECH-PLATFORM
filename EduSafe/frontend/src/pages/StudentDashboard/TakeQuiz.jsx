import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../../utils/api';
import { Clock, CheckCircle, XCircle, ArrowLeft, Award, Play, Pause } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGifPlaying, setIsGifPlaying] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => { if (quizId) fetchQuiz(); }, [quizId]);
  useEffect(() => { let timer; if (quizStarted && timeLeft > 0 && !submissionResult) { timer = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(timer); handleSubmitQuiz(); return 0; } return t-1; }), 1000); } return () => clearInterval(timer); }, [quizStarted, timeLeft, submissionResult]);

  const fetchQuiz = async () => { try { setLoading(true); const res = await api.get(`/quizzes/${quizId}`); setQuiz(res.data); } catch(err){ setError(err.response?.data?.message); } finally { setLoading(false); } };
  const handleStartQuiz = () => { setQuizStarted(true); setTimeLeft(quiz.timeLimit * 60); };
  const handleAnswerSelect = (qIdx, ans) => { setAnswers(prev => { const newAnswers = [...prev]; newAnswers[qIdx] = { selectedAnswer: ans }; return newAnswers; }); };
  const handleTextAnswer = (qIdx, text) => { setAnswers(prev => { const newAnswers = [...prev]; newAnswers[qIdx] = { textAnswer: text }; return newAnswers; }); };
  const handleNext = () => { if(currentQuestion < quiz.questions.length-1) setCurrentQuestion(c=>c+1); };
  const handlePrev = () => { if(currentQuestion > 0) setCurrentQuestion(c=>c-1); };
  const handleSubmitQuiz = async () => { try { setIsSubmitting(true); const resp = await api.post(`/quizzes/${quizId}/submit`, { answers, timeTaken: quiz.timeLimit*60 - timeLeft }); setSubmissionResult(resp.data); } catch(err) { setError(err.response?.data?.message); } finally { setIsSubmitting(false); } };
  const formatTime = (secs) => secs===null ? '0:00' : `${Math.floor(secs/60)}:${(secs%60).toString().padStart(2,'0')}`;
  const getCurrentMedia = () => { const q = quiz?.questions[currentQuestion]; return q?.media?.type !== 'none' ? { type: q.media.type, url: q.media.url } : null; };

  if(loading) return <LoadingSpinner text="Loading quiz..." />;
  if(error && !quizStarted) return (<div className="max-w-2xl mx-auto p-6 text-center"><div className="bg-black/40 backdrop-blur-md rounded-2xl border border-red-500/30 p-6"><XCircle className="h-16 w-16 text-red-400 mx-auto mb-4"/><h2 className="text-2xl font-bold text-white">Error</h2><p className="text-gray-400 mb-6">{error}</p><button onClick={()=>navigate('/student-dashboard/quizzes')} className="btn btn-primary">Back to Quizzes</button></div></div>);
  if(!quiz) return null;

  if(!quizStarted) return (<div className="max-w-2xl mx-auto p-6"><div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-8 text-center"><div className="w-20 h-20 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center mb-4"><Award className="h-10 w-10 text-cyan-400"/></div><h1 className="text-3xl font-bold text-white">{quiz.title}</h1><p className="text-gray-400 mt-2">{quiz.description}</p><div className="grid grid-cols-2 gap-4 mt-6"><div className="p-3 bg-gray-800/50 rounded"><Clock className="h-6 w-6 mx-auto text-cyan-400"/><div className="font-semibold text-white">{quiz.timeLimit} min</div><div className="text-sm text-gray-400">Time Limit</div></div><div className="p-3 bg-gray-800/50 rounded"><CheckCircle className="h-6 w-6 mx-auto text-green-400"/><div className="font-semibold text-white">{quiz.passingScore||60}%</div><div className="text-sm text-gray-400">Passing Score</div></div><div className="p-3 bg-gray-800/50 rounded"><div className="h-6 w-6 mx-auto text-purple-400 font-bold">?</div><div className="font-semibold text-white">{quiz.questions.length}</div><div className="text-sm text-gray-400">Questions</div></div><div className="p-3 bg-gray-800/50 rounded"><div className="h-6 w-6 mx-auto text-yellow-400">⚡</div><div className="font-semibold text-white">Interactive</div><div className="text-sm text-gray-400">Media</div></div></div><button onClick={handleStartQuiz} className="btn btn-primary w-full mt-6 py-3 text-lg">Start Quiz</button><button onClick={()=>navigate('/student-dashboard/quizzes')} className="btn btn-outline w-full mt-3">Back</button></div></div>);
  if(submissionResult) { const passed = submissionResult.score >= (quiz.passingScore||60); const correct = submissionResult.answers.filter(a=>a.isCorrect).length; return (<div className="max-w-2xl mx-auto p-6"><div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-8 text-center"><div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${passed ? "bg-green-500/20" : "bg-red-500/20"}`}>{passed ? <CheckCircle className="h-10 w-10 text-green-400"/> : <XCircle className="h-10 w-10 text-red-400"/>}</div><h2 className="text-2xl font-bold text-white mt-4">Quiz Submitted!</h2><p className="text-gray-300">{passed ? "Congratulations! You passed." : "Keep practicing!"}</p><div className="grid grid-cols-3 gap-4 mt-6"><div className="p-3 bg-blue-500/20 rounded"><div className="text-2xl font-bold text-blue-300">{submissionResult.score}%</div><div className="text-sm">Your Score</div></div><div className="p-3 bg-green-500/20 rounded"><div className="text-2xl font-bold text-green-300">{correct}/{quiz.questions.filter(q=>q.questionType!=='short' && q.questionType!=='long').length}</div><div className="text-sm">Correct (auto)</div></div><div className="p-3 bg-purple-500/20 rounded"><div className="text-2xl font-bold text-purple-300">{Math.floor(submissionResult.timeTaken/60)}:{(submissionResult.timeTaken%60).toString().padStart(2,'0')}</div><div className="text-sm">Time Taken</div></div></div><div className="flex gap-4 mt-6"><button onClick={()=>navigate('/student-dashboard/quizzes')} className="btn btn-primary flex-1">Back to Quizzes</button>{!passed && <button onClick={()=>{setQuizStarted(false); setCurrentQuestion(0); setAnswers([]); setTimeLeft(null); setSubmissionResult(null); setError(null);}} className="btn btn-outline flex-1">Try Again</button>}</div></div></div>);}

  const currentQ = quiz.questions[currentQuestion];
  const currentMedia = getCurrentMedia();
  const isAnswered = answers[currentQuestion] !== undefined && (
    (currentQ.questionType === 'short' || currentQ.questionType === 'long')
      ? answers[currentQuestion]?.textAnswer?.trim()
      : answers[currentQuestion]?.selectedAnswer !== undefined
  );

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <button onClick={()=>setQuizStarted(false)} className="btn btn-outline flex items-center gap-2"><ArrowLeft className="h-4 w-4"/> Exit</button>
        <div className="flex items-center gap-4"><div className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full flex items-center gap-1"><Clock className="h-4 w-4"/> {formatTime(timeLeft)}</div><div className="text-cyan-300">Q{currentQuestion+1}/{quiz.questions.length}</div></div>
      </div>
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h1 className="text-2xl font-bold text-white">{quiz.title}</h1><div className="flex gap-4 text-sm text-gray-400 mt-1"><span>Time: {quiz.timeLimit} min</span><span>Passing: {quiz.passingScore||60}%</span><span>Questions: {quiz.questions.length}</span></div></div>
      {currentMedia && (<div className="mt-4 bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-4"><div className="flex justify-between items-center"><h3 className="font-semibold text-cyan-300">Interactive Content</h3><button onClick={()=>setIsGifPlaying(!isGifPlaying)} className="btn btn-outline text-sm"><Play className="h-3 w-3 mr-1"/> {isGifPlaying?"Pause":"Play"}</button></div><div className="flex justify-center mt-2"><img src={currentMedia.url} alt="Visual aid" className="max-h-64 rounded-lg"/></div></div>)}
      <div className="mt-4"><div className="flex justify-between text-sm text-gray-400 mb-1"><span>Progress</span><span>{Math.round(((currentQuestion+1)/quiz.questions.length)*100)}%</span></div><div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all" style={{width:`${((currentQuestion+1)/quiz.questions.length)*100}%`}}></div></div></div>
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 mt-4">
        <h3 className="text-xl font-semibold text-white mb-4">{currentQ.question}</h3>
        <div className="space-y-3">
          {(currentQ.questionType === 'short' || currentQ.questionType === 'long') ? (
            <textarea
              value={answers[currentQuestion]?.textAnswer || ''}
              onChange={(e) => handleTextAnswer(currentQuestion, e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-800/50 border border-cyan-500/30 text-white focus:outline-none focus:border-cyan-500"
              rows={currentQ.questionType === 'long' ? 6 : 3}
              placeholder={currentQ.questionType === 'long' ? 'Write your detailed answer here...' : 'Type your short answer here...'}
            />
          ) : (
            currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(currentQuestion, idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  answers[currentQuestion]?.selectedAnswer === idx
                    ? "border-cyan-400 bg-cyan-500/20 text-white"
                    : "border-gray-600 hover:border-cyan-500 text-gray-200 hover:bg-cyan-500/10"
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                    answers[currentQuestion]?.selectedAnswer === idx
                      ? "border-cyan-400 bg-cyan-400"
                      : "border-gray-400"
                  }`}>
                    {answers[currentQuestion]?.selectedAnswer === idx && <div className="w-2 h-2 bg-black rounded-full"></div>}
                  </div>
                  {opt}
                </div>
              </button>
            ))
          )}
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={handlePrev} disabled={currentQuestion===0} className="btn btn-outline disabled:opacity-50">Previous</button>
          {currentQuestion===quiz.questions.length-1 ? (
            <button onClick={handleSubmitQuiz} disabled={!isAnswered || isSubmitting} className="btn btn-primary disabled:opacity-50">{isSubmitting?"Submitting...":"Submit Quiz"}</button>
          ) : (
            <button onClick={handleNext} disabled={!isAnswered} className="btn btn-primary">Next Question</button>
          )}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {quiz.questions.map((_,i)=>(
          <button key={i} onClick={()=>{setCurrentQuestion(i);}} className={`w-3 h-3 rounded-full transition-all ${i===currentQuestion ? "bg-cyan-400 scale-125" : answers[i] ? "bg-green-500" : "bg-gray-600"}`} title={`Q${i+1}`}/>
        ))}
      </div>
    </div>
  );
};

export default TakeQuiz;