import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { BarChart3, BookOpen, FileText, Calendar } from 'lucide-react';
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const StudentProgress = () => {
  const [studentProgress, setStudentProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => { if (user?._id) fetchStudentProgress(); }, [user]);
  const fetchStudentProgress = async () => { try { setLoading(true); const res = await api.get(`/parents/${user._id}/student-progress`); setStudentProgress(res.data); } catch(err) { setError(err.response?.data?.message); } finally { setLoading(false); } };
  if (loading) return <LoadingSpinner text="Loading student progress..." />;
  if (error && !studentProgress) return <ErrorDisplay error={error} onRetry={fetchStudentProgress} />;
  if (!studentProgress) return (<div className="text-center py-12"><div className="bg-black/40 backdrop-blur-md rounded-2xl p-8"><BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4"/><p className="text-gray-400">No progress data yet</p></div></div>);

  const stats = [
    { label: "Overall Progress", value: studentProgress.progress?.overall || 0, color: "blue", icon: <BarChart3 className="h-5 w-5"/> },
    { label: "Quiz Progress", value: studentProgress.progress?.quizzes || 0, color: "green", icon: <FileText className="h-5 w-5"/> },
    { label: "Resource Progress", value: studentProgress.progress?.resources || 0, color: "orange", icon: <BookOpen className="h-5 w-5"/> },
    { label: "Average Score", value: studentProgress.progress?.averageScore || 0, color: "purple", icon: <BarChart3 className="h-5 w-5"/> }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div><h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Student Progress</h2><p className="text-cyan-300">Tracking {studentProgress.student?.firstName} {studentProgress.student?.lastName}</p></div>
      {error && <ErrorDisplay error={error} onRetry={fetchStudentProgress} />}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 flex items-center gap-4"><div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">{studentProgress.student?.firstName?.[0]}{studentProgress.student?.lastName?.[0]}</div><div><h3 className="text-xl font-bold text-white">{studentProgress.student?.firstName} {studentProgress.student?.lastName}</h3><p className="text-cyan-300">Grade {studentProgress.student?.grade}</p></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{stats.map((s,i)=>(<div key={i} className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><div className={`p-3 rounded-xl bg-${s.color}-500/20 text-${s.color}-300 w-fit`}>{s.icon}</div><h4 className="font-semibold text-cyan-300 mt-2">{s.label}</h4><div className="flex justify-between items-end mt-1"><span className="text-2xl font-bold text-white">{s.value}%</span><div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden"><div className={`h-full bg-${s.color}-500 rounded-full`} style={{width:`${s.value}%`}}></div></div></div></div>))}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h4 className="text-lg font-semibold text-cyan-300 mb-4">Recent Quiz Results</h4>{studentProgress.quizSubmissions?.length? studentProgress.quizSubmissions.map(sub=>{const passed = sub.score >= (sub.quizId?.passingScore||60); return (<div key={sub._id} className="border border-cyan-500/20 rounded-lg p-3 mb-2"><div className="flex justify-between"><span className="font-medium text-white">{sub.quizId?.title}</span><span className={`text-sm ${passed?"text-green-400":"text-red-400"}`}>{sub.score}%</span></div><div className="text-gray-400 text-sm flex items-center gap-1"><Calendar className="h-3 w-3"/> {new Date(sub.completedAt).toLocaleDateString()}</div></div>)}):<p className="text-gray-400 text-center">No quizzes yet</p>}</div>
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h4 className="text-lg font-semibold text-cyan-300 mb-4">Completed Resources</h4>{studentProgress.resourceCompletions?.length? studentProgress.resourceCompletions.map(comp=>(<div key={comp._id} className="border border-cyan-500/20 rounded-lg p-3 mb-2"><div className="font-medium text-white">{comp.resourceId?.title}</div><div className="text-gray-400 text-sm flex justify-between"><span>Type: {comp.resourceId?.type}</span><span>{new Date(comp.completedAt).toLocaleDateString()}</span></div></div>)):<p className="text-gray-400 text-center">No resources completed</p>}</div>
      </div>
    </div>
  );
};

export default StudentProgress;