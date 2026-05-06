  import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { Plus, BookOpen, X, Save, Trash2, BarChart3, Users, Award, Clock, Image, Video, ChevronDown, ChevronUp, Check, XCircle } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSubmissions, setExpandedSubmissions] = useState({});
  const [gradingInProgress, setGradingInProgress] = useState({});

  const [newQuiz, setNewQuiz] = useState({
    title: "", description: "", questions: [{ question: "", options: ["","","",""], correctAnswer: 0, media: { type: "none", url: "" } }],
    timeLimit: 30, passingScore: 60, category: "general", xpReward: 100
  });
  const { user } = useSelector((state) => state.auth);

  useEffect(() => { if (user) fetchQuizzes(); }, [user]);

  const fetchQuizzes = async () => { try { setLoading(true); const res = await api.get(`/teachers/${user._id}/quizzes`); setQuizzes(res.data || []); } catch(err){ setError(err.response?.data?.message); } finally { setLoading(false); } };

  const viewQuizResults = async (quiz) => {
    try {
      setResultsLoading(true);
      setSelectedQuiz(quiz);
      const [subRes, leadRes] = await Promise.all([
        api.get(`/quizzes/submissions/${quiz._id}`),
        api.get(`/quizzes/leaderboard/${quiz._id}`)
      ]);
      setQuizSubmissions(subRes.data || []);
      setLeaderboard(leadRes.data || []);
      setExpandedSubmissions({});
      setShowResults(true);
    } catch(err){ setError(err.response?.data?.message); } finally { setResultsLoading(false); }
  };

  const gradeSubmission = async (submissionId, questionIndex, isCorrect) => {
    setGradingInProgress(prev => ({ ...prev, [`${submissionId}-${questionIndex}`]: true }));
    try {
      const response = await api.put(`/quizzes/submission/${submissionId}/grade`, {
        grades: [{ questionIndex, isCorrect }]
      });
      // Refresh submissions to show updated score
      const updatedSubmissions = quizSubmissions.map(sub =>
        sub._id === submissionId ? response.data.submission : sub
      );
      setQuizSubmissions(updatedSubmissions);
    } catch (err) {
      alert('Failed to grade question');
    } finally {
      setGradingInProgress(prev => ({ ...prev, [`${submissionId}-${questionIndex}`]: false }));
    }
  };

  const handleQuizSubmit = async (e) => { e.preventDefault(); try { await api.post(`/quizzes`, newQuiz); setShowQuizForm(false); setNewQuiz({ title: "", description: "", questions: [{ question: "", options: ["","","",""], correctAnswer: 0, media: { type: "none", url: "" } }], timeLimit: 30, passingScore: 60, category: "general", xpReward: 100 }); fetchQuizzes(); } catch(err){ setError(err.response?.data?.message); } };
  const addQuestion = () => setNewQuiz(prev => ({ ...prev, questions: [...prev.questions, { question: "", options: ["","","",""], correctAnswer: 0, media: { type: "none", url: "" } }] }));
  const removeQuestion = (idx) => setNewQuiz(prev => ({ ...prev, questions: prev.questions.filter((_,i)=>i!==idx) }));
  const updateQuestion = (idx, field, val) => setNewQuiz(prev => ({ ...prev, questions: prev.questions.map((q,i)=> i===idx ? { ...q, [field]: val } : q) }));
  const updateOption = (qIdx, oIdx, val) => setNewQuiz(prev => ({ ...prev, questions: prev.questions.map((q,i)=> i===qIdx ? { ...q, options: q.options.map((opt,j)=> j===oIdx ? val : opt) } : q) }));
  const updateQuestionMedia = (qIdx, mediaField, val) => setNewQuiz(prev => ({ ...prev, questions: prev.questions.map((q,i)=> i===qIdx ? { ...q, media: { ...q.media, [mediaField]: val } } : q) }));
  const deleteQuiz = async (quizId) => { if(window.confirm("Delete quiz?")) try { await api.delete(`/quizzes/${quizId}`); fetchQuizzes(); } catch(err){ setError(err.response?.data?.message); } };
  const calculateStats = () => { if(quizSubmissions.length===0) return { averageScore:0, passingRate:0, totalSubmissions:0, bestScore:0 }; const total = quizSubmissions.reduce((s,sub)=>s+sub.score,0); const passing = quizSubmissions.filter(sub=>sub.score>=(selectedQuiz?.passingScore||60)).length; return { averageScore: Math.round(total/quizSubmissions.length), passingRate: Math.round((passing/quizSubmissions.length)*100), totalSubmissions: quizSubmissions.length, bestScore: Math.max(...quizSubmissions.map(sub=>sub.score)) }; };
  const stats = calculateStats();
  const disasterCategories = [{value:"general",label:"General"},{value:"earthquake",label:"Earthquake"},{value:"flood",label:"Flood"},{value:"fire",label:"Fire"},{value:"tornado",label:"Tornado"},{value:"tsunami",label:"Tsunami"}];
  if(loading) return <LoadingSpinner text="Loading quizzes..." />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between"><div><h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Quiz Management</h2><p className="text-cyan-300">Create gamified quizzes</p></div><button onClick={()=>setShowQuizForm(true)} className="btn btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> New Quiz</button></div>
      {error && <ErrorDisplay error={error} onRetry={fetchQuizzes} />}
      {showQuizForm && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"><div className="bg-black/90 rounded-2xl border border-cyan-500/30 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"><div className="flex justify-between"><h3 className="text-xl font-semibold text-cyan-300">Create New Quiz</h3><button onClick={()=>setShowQuizForm(false)} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button></div><form onSubmit={handleQuizSubmit} className="space-y-4 mt-4"><div><label className="text-cyan-300">Title</label><input type="text" value={newQuiz.title} onChange={(e)=>setNewQuiz({...newQuiz, title:e.target.value})} className="form-input" required /></div><div><label className="text-cyan-300">Description</label><textarea value={newQuiz.description} onChange={(e)=>setNewQuiz({...newQuiz, description:e.target.value})} className="form-input" rows="2" /></div><div className="grid grid-cols-3 gap-4"><div><label className="text-cyan-300">Time (min)</label><input type="number" value={newQuiz.timeLimit} onChange={(e)=>setNewQuiz({...newQuiz, timeLimit:parseInt(e.target.value)})} className="form-input" min="1" /></div><div><label className="text-cyan-300">Passing Score</label><input type="number" value={newQuiz.passingScore} onChange={(e)=>setNewQuiz({...newQuiz, passingScore:parseInt(e.target.value)})} className="form-input" min="0" max="100" /></div><div><label className="text-cyan-300">XP Reward</label><input type="number" value={newQuiz.xpReward} onChange={(e)=>setNewQuiz({...newQuiz, xpReward:parseInt(e.target.value)})} className="form-input" min="0" /></div></div>
          <div><label className="text-cyan-300">Category</label><select value={newQuiz.category} onChange={(e)=>setNewQuiz({...newQuiz, category:e.target.value})} className="form-input">{disasterCategories.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          <div><div className="flex justify-between items-center"><label className="text-cyan-300">Questions</label><button type="button" onClick={addQuestion} className="btn btn-outline text-sm"><Plus className="h-4 w-4" /> Add Q</button></div><div className="space-y-4 max-h-96 overflow-y-auto mt-2">{newQuiz.questions.map((q,i)=>(<div key={i} className="border border-cyan-500/30 rounded-lg p-3"><div className="flex justify-between"><span className="text-cyan-300">Q{i+1}</span>{newQuiz.questions.length>1 && <button type="button" onClick={()=>removeQuestion(i)} className="text-red-400"><Trash2 className="h-4 w-4" /></button>}</div><input type="text" placeholder="Question text" value={q.question} onChange={(e)=>updateQuestion(i,"question",e.target.value)} className="form-input mt-1" required />
            <div className="mt-2"><label className="text-xs text-cyan-300">Media (GIF/Image/Video URL)</label><select value={q.media.type} onChange={(e)=>updateQuestionMedia(i,"type",e.target.value)} className="form-input text-sm"><option value="none">No Media</option><option value="gif">GIF</option><option value="image">Image</option><option value="video">Video</option></select>{q.media.type!=="none" && <input type="url" value={q.media.url} onChange={(e)=>updateQuestionMedia(i,"url",e.target.value)} className="form-input mt-1" placeholder="https://..." />}</div>
            {q.options.map((opt,j)=>(<div key={j} className="flex items-center gap-2 mt-2"><input type="text" placeholder={`Option ${j+1}`} value={opt} onChange={(e)=>updateOption(i,j,e.target.value)} className="form-input flex-1" required /><div className="w-6 h-6 flex justify-center items-center">{q.correctAnswer===j && <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>}</div></div>))}
            <label className="text-xs text-cyan-300 mt-2 block">Correct Answer</label><select value={q.correctAnswer} onChange={(e)=>updateQuestion(i,"correctAnswer",parseInt(e.target.value))} className="form-input">{q.options.map((_,j)=><option key={j} value={j}>Option {j+1}</option>)}</select>
          </div>))}</div></div>
          <div className="flex justify-end space-x-3"><button type="button" onClick={()=>setShowQuizForm(false)} className="btn btn-outline">Cancel</button><button type="submit" className="btn btn-primary"><Save className="h-4 w-4 mr-2" /> Create Quiz</button></div></form></div></div>
      )}
      {showResults && selectedQuiz && (<div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"><div className="bg-black/90 rounded-2xl border border-cyan-500/30 p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"><div className="flex justify-between"><h3 className="text-xl font-semibold text-cyan-300">Quiz Results: {selectedQuiz.title}</h3><button onClick={()=>setShowResults(false)} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button></div>{resultsLoading?<LoadingSpinner />:<div className="space-y-6 mt-4"><div className="grid grid-cols-4 gap-4"><div className="text-center p-3 bg-blue-500/20 rounded"><div className="text-2xl font-bold text-blue-300">{stats.totalSubmissions}</div><div className="text-sm">Submissions</div></div><div className="text-center p-3 bg-green-500/20 rounded"><div className="text-2xl font-bold text-green-300">{stats.averageScore}%</div><div className="text-sm">Avg Score</div></div><div className="text-center p-3 bg-yellow-500/20 rounded"><div className="text-2xl font-bold text-yellow-300">{stats.passingRate}%</div><div className="text-sm">Passing Rate</div></div><div className="text-center p-3 bg-purple-500/20 rounded"><div className="text-2xl font-bold text-purple-300">{stats.bestScore}%</div><div className="text-sm">Best Score</div></div></div>
        {leaderboard.length>0 && (<div className="bg-black/40 rounded-xl p-4"><h4 className="text-lg font-semibold text-cyan-300 flex items-center gap-2"><Award className="h-5 w-5" /> Leaderboard</h4><div className="space-y-2 mt-2">{leaderboard.slice(0,5).map((s,i)=><div key={s._id} className="flex justify-between p-2 border-b border-cyan-500/20"><div className="flex items-center gap-3"><div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold ${i===0?"bg-yellow-500":i===1?"bg-gray-400":i===2?"bg-orange-500":"bg-blue-500"}`}>{i+1}</div><span className="text-white">{s.firstName} {s.lastName}</span></div><span className="text-cyan-300 font-bold">{s.bestScore}%</span></div>)}</div></div>)}
        <div><h4 className="text-lg font-semibold text-cyan-300">Submissions ({quizSubmissions.length})</h4><div className="space-y-3 mt-2 max-h-96 overflow-y-auto">
          {quizSubmissions.map(sub => {
            const isExpanded = expandedSubmissions[sub._id];
            const quizQuestions = selectedQuiz.questions;
            return (
              <div key={sub._id} className="border border-cyan-500/20 rounded-lg p-3 bg-black/30">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedSubmissions(prev => ({ ...prev, [sub._id]: !prev[sub._id] }))}>
                  <div><span className="text-white font-semibold">{sub.studentId?.firstName} {sub.studentId?.lastName}</span><span className="text-gray-400 ml-3 text-sm">Score: {sub.score}%</span></div>
                  <div className="flex items-center gap-2"><span className="text-gray-400 text-sm">{new Date(sub.completedAt).toLocaleDateString()}</span>{isExpanded ? <ChevronUp className="h-4 w-4 text-cyan-300"/> : <ChevronDown className="h-4 w-4 text-cyan-300"/>}</div>
                </div>
                {isExpanded && (
                  <div className="mt-3 space-y-3 border-t border-cyan-500/20 pt-3">
                    {sub.answers.map((ans, idx) => {
                      const question = quizQuestions[idx];
                      const isSubjective = question?.questionType === 'short' || question?.questionType === 'long';
                      const isCurrentlyCorrect = ans.isCorrect;
                      return (
                        <div key={idx} className="border-l-2 border-cyan-500/30 pl-3 py-2">
                          <div className="text-sm text-cyan-300">Q{idx+1}: {question?.question}</div>
                          <div className="text-white text-sm mt-1">
                            <span className="text-gray-400">Student answer:</span> {isSubjective ? ans.textAnswer : `Option ${ans.selectedAnswer+1}`}
                          </div>
                          {isSubjective && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-gray-400 text-sm">Grade:</span>
                              <button
                                onClick={() => gradeSubmission(sub._id, idx, true)}
                                disabled={gradingInProgress[`${sub._id}-${idx}`]}
                                className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${isCurrentlyCorrect ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-green-700'}`}
                              >
                                <Check className="h-3 w-3"/> Correct
                              </button>
                              <button
                                onClick={() => gradeSubmission(sub._id, idx, false)}
                                disabled={gradingInProgress[`${sub._id}-${idx}`]}
                                className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${!isCurrentlyCorrect ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-red-700'}`}
                              >
                                <XCircle className="h-3 w-3"/> Incorrect
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div></div>
      </div>}</div></div>)}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300 mb-4">Your Quizzes ({quizzes.length})</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{quizzes.map(quiz=>{const mediaCount = quiz.questions?.filter(q=>q.media?.type!=="none").length||0; return (<div key={quiz._id} className="border border-cyan-500/20 rounded-lg p-4 hover:shadow-neon-cyan transition"><div className="flex justify-between"><h4 className="font-semibold text-white">{quiz.title}</h4>{quiz.category!=="general" && <span className="text-xs bg-blue-500/20 text-cyan-300 px-2 py-1 rounded-full capitalize">{quiz.category}</span>}</div><p className="text-gray-400 text-sm mt-1">{quiz.description}</p><div className="flex justify-between mt-2 text-sm text-gray-400"><div><div>{quiz.questions?.length} questions</div>{mediaCount>0 && <div className="flex items-center gap-1 text-cyan-400"><Image className="h-3 w-3" /> {mediaCount} media</div>}</div><div>{quiz.timeLimit} min • {quiz.xpReward} XP</div></div><div className="flex gap-2 mt-3"><button onClick={()=>viewQuizResults(quiz)} className="btn btn-primary text-sm flex-1"><BarChart3 className="h-3 w-3 mr-1" /> Results</button><button onClick={()=>deleteQuiz(quiz._id)} className="btn btn-danger text-sm"><Trash2 className="h-3 w-3" /></button></div></div>)} )}{quizzes.length===0 && <div className="col-span-full text-center py-8 text-gray-400"><BookOpen className="h-16 w-16 mx-auto mb-3 opacity-50" /><p>No quizzes yet</p><button onClick={()=>setShowQuizForm(true)} className="btn btn-primary mt-2">Create First Quiz</button></div>}</div></div>
    </div>
  );
};

export default QuizManagement;