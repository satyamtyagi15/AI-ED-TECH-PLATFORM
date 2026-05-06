import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../utils/api';
import { BookOpen, CheckCircle } from 'lucide-react';
import FileViewer from '../../components/FileViewer';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';

const LearningResources = () => {
  const [resources, setResources] = useState([]);
  const [completedResources, setCompletedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resourcesRes, completionsRes] = await Promise.all([api.get('/resources'), api.get('/resources/completions')]);
      setResources(resourcesRes.data?.resources || resourcesRes.data || []);
      setCompletedResources(completionsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const markResourceComplete = async (resourceId) => {
    try { await api.post(`/resources/${resourceId}/complete`, { timeSpent: 300 }); await fetchData(); } catch (err) { setError(err.response?.data?.message); }
  };

  const getResourceHref = (content) => {
    if (!content) return null;
    const c = content.trim();
    if (c.startsWith("http://") || c.startsWith("https://") || c.startsWith("//")) return c;
    return `${API_URL}${c.startsWith("/") ? c : `/${c}`}`;
  };

  const isResourceCompleted = (resourceId) => completedResources.some(cr => String(cr?.resourceId?._id || cr?.resourceId) === String(resourceId));

  if (loading) return <LoadingSpinner text="Loading learning resources..." />;
  const completedCount = resources.filter(r => isResourceCompleted(r._id)).length;
  const progressPercentage = resources.length ? Math.round((completedCount / resources.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between animate-slide-in-left">
        <div><h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Learning Resources</h2><p className="text-cyan-300">Access educational materials</p></div>
        <div className="text-right"><p className="text-cyan-300 text-sm">Progress</p><p className="text-2xl font-bold text-white">{progressPercentage}%</p><p className="text-xs text-gray-400">{completedCount}/{resources.length} completed</p></div>
      </div>
      {error && <ErrorDisplay error={error} onRetry={fetchData} />}
      {resources.length > 0 && (<div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-4"><div className="flex justify-between text-sm"><span className="text-cyan-300">Course Progress</span><span className="text-gray-400">{completedCount}/{resources.length}</span></div><div className="w-full bg-gray-700 rounded-full h-2.5 mt-1"><div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div></div></div>)}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{resources.map(res => {const isCompleted = isResourceCompleted(res._id); const resourceLink = getResourceHref(res.content); return (<div key={res._id} className="border border-cyan-500/20 rounded-lg p-4 hover:shadow-neon-cyan transition"><div className="flex justify-between items-start"><div className="p-2 bg-cyan-500/20 rounded-lg"><BookOpen className="h-5 w-5 text-cyan-300" /></div>{isCompleted && <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Completed</span>}</div><h4 className="font-semibold text-white mt-2">{res.title}</h4><p className="text-gray-400 text-sm">{res.description}</p><div className="flex justify-between text-sm text-gray-500 mt-3"><span className="capitalize">{res.type}</span><span>{res.duration || '5'} min</span></div><div className="mt-3 space-y-2">{resourceLink && (<><FileViewer fileUrl={resourceLink} title={res.title} /><div className="flex gap-2"><a href={resourceLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary text-sm flex-1 text-center">Open in New Tab</a>{!isCompleted && <button onClick={() => markResourceComplete(res._id)} className="btn btn-success text-sm flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Complete</button>}</div></>)}{!resourceLink && !isCompleted && <button onClick={() => markResourceComplete(res._id)} className="btn btn-success text-sm w-full">Mark Complete</button>}</div>{res.tags?.length > 0 && <div className="flex flex-wrap gap-1 mt-3">{res.tags.map((tag,i)=><span key={i} className="text-xs bg-gray-700 text-cyan-300 px-2 py-0.5 rounded">{tag}</span>)}</div>}</div>)})}{resources.length===0 && <div className="col-span-full text-center py-12 text-gray-400"><BookOpen className="h-16 w-16 mx-auto mb-3 opacity-50" /><p>No learning resources available</p></div>}</div>
      {resources.length>0 && (<div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300 mb-4">Your Learning Progress</h3><div className="grid grid-cols-4 gap-4"><div className="text-center p-3 bg-blue-500/20 rounded"><div className="text-2xl font-bold text-blue-300">{resources.length}</div><div className="text-sm">Total</div></div><div className="text-center p-3 bg-green-500/20 rounded"><div className="text-2xl font-bold text-green-300">{completedCount}</div><div className="text-sm">Completed</div></div><div className="text-center p-3 bg-yellow-500/20 rounded"><div className="text-2xl font-bold text-yellow-300">{resources.length-completedCount}</div><div className="text-sm">Remaining</div></div><div className="text-center p-3 bg-purple-500/20 rounded"><div className="text-2xl font-bold text-purple-300">{progressPercentage}%</div><div className="text-sm">Progress</div></div></div></div>)}
    </div>
  );
};

export default LearningResources;