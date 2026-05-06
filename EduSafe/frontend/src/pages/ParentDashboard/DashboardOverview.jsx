import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { BarChart3, Users, BookOpen, FileText, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";
import { Link } from "react-router-dom";

const DashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => { if (user?._id) fetchDashboardData(); }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/parents/${user._id}/student-progress`);
      setDashboardData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading parent dashboard..." />;
  if (error && !dashboardData) return <ErrorDisplay error={error} onRetry={fetchDashboardData} />;

  const overallProgress = dashboardData?.progress?.overall || 0;
  const averageScore = dashboardData?.progress?.averageScore || 0;
  const quizzesCompleted = dashboardData?.quizSubmissions?.length || 0;
  const resourcesCompleted = dashboardData?.resourceCompletions?.length || 0;

  const overviewStats = [
    { label: "Overall Progress", value: overallProgress, icon: <BarChart3 className="h-5 w-5" />, color: "blue" },
    { label: "Quiz Average", value: averageScore, icon: <TrendingUp className="h-5 w-5" />, color: "green" },
    { label: "Quizzes Completed", value: quizzesCompleted, icon: <FileText className="h-5 w-5" />, color: "orange" },
    { label: "Resources Completed", value: resourcesCompleted, icon: <BookOpen className="h-5 w-5" />, color: "purple" }
  ];

  const recentQuizzes = dashboardData?.quizSubmissions?.slice(0, 3) || [];
  const recentResources = dashboardData?.resourceCompletions?.slice(0, 3) || [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-start animate-slide-in-left">
        <div><h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Parent Dashboard</h2><p className="text-cyan-300 mt-1">Welcome back! Here's your child's progress.</p></div>
        <div className="text-right"><p className="text-sm text-gray-400">Last Updated</p><p className="text-sm font-medium text-cyan-300">{new Date().toLocaleDateString()}</p></div>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchDashboardData} />}

      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-neon-cyan">
            {dashboardData?.student?.firstName?.[0]}{dashboardData?.student?.lastName?.[0]}
          </div>
          <div><h3 className="text-xl font-bold text-white">{dashboardData?.student?.firstName} {dashboardData?.student?.lastName}</h3><p className="text-cyan-300">Grade {dashboardData?.student?.grade}</p><p className="text-sm text-gray-400">Student ID: {dashboardData?.student?._id?.slice(-6)}</p></div>
        </div>
        <div><span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">Active</span></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, idx) => (
          <div key={idx} className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 hover:shadow-neon-cyan transition-all group animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex justify-between mb-3"><div className={`p-3 rounded-xl bg-${stat.color}-500/20 text-${stat.color}-300 group-hover:scale-110 transition`}>{stat.icon}</div></div>
            <h4 className="font-semibold text-cyan-300 mb-1">{stat.label}</h4>
            <div className="flex justify-between items-end"><span className="text-2xl font-bold text-white">{stat.label.includes("Progress") || stat.label.includes("Average") ? `${stat.value}%` : stat.value}</span><div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden"><div className={`h-full bg-${stat.color}-500 rounded-full`} style={{ width: `${Math.min(stat.value, 100)}%` }}></div></div></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 animate-fade-in-up delay-200">
          <div className="flex justify-between items-center mb-4"><h4 className="text-lg font-semibold text-cyan-300 flex items-center gap-2"><FileText className="h-5 w-5" /> Recent Quiz Results</h4><Link to="/parent/progress" className="text-sm text-cyan-400 hover:text-cyan-300">View All</Link></div>
          <div className="space-y-3">
            {recentQuizzes.map(sub => {
              const passed = sub.score >= (sub.quizId?.passingScore || 60);
              return (
                <div key={sub._id} className="p-3 rounded-lg bg-white/5 border border-cyan-500/20">
                  <div className="flex justify-between items-start"><h5 className="font-semibold text-white truncate">{sub.quizId?.title || 'Quiz'}</h5><span className={`text-xs px-2 py-1 rounded-full ${passed ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>{passed ? "Passed" : "Needs Improvement"}</span></div>
                  <div className="flex justify-between text-sm mt-2"><span className="text-cyan-300">Score: {sub.score}%</span><span className="text-gray-400">{new Date(sub.completedAt).toLocaleDateString()}</span></div>
                </div>
              );
            })}
            {recentQuizzes.length === 0 && <p className="text-center text-gray-400 py-4">No quiz results yet</p>}
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 animate-fade-in-up delay-300">
          <div className="flex justify-between items-center mb-4"><h4 className="text-lg font-semibold text-cyan-300 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Recent Resources Completed</h4><Link to="/parent/progress" className="text-sm text-cyan-400 hover:text-cyan-300">View All</Link></div>
          <div className="space-y-3">
            {recentResources.map(res => (
              <div key={res._id} className="p-3 rounded-lg bg-white/5 border border-cyan-500/20">
                <h5 className="font-semibold text-white truncate">{res.resourceId?.title || 'Resource'}</h5>
                <div className="flex justify-between text-sm mt-2"><span className="text-cyan-300 capitalize">{res.resourceId?.type || 'unknown'}</span><span className="text-gray-400">{new Date(res.completedAt).toLocaleDateString()}</span></div>
              </div>
            ))}
            {recentResources.length === 0 && <p className="text-center text-gray-400 py-4">No resources completed yet</p>}
          </div>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 animate-fade-in-up delay-400">
        <h4 className="text-lg font-semibold text-cyan-300 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/parent/progress" className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center hover:scale-105 transition group"><BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition" /><span className="font-medium text-blue-200">View Detailed Progress</span></Link>
          <Link to="/parent/emergency" className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center hover:scale-105 transition group"><AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2 group-hover:scale-110 transition" /><span className="font-medium text-red-200">Emergency Contacts</span></Link>
          <button onClick={fetchDashboardData} className="p-4 rounded-xl bg-gray-500/10 border border-gray-500/30 text-center hover:scale-105 transition group"><RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-2 group-hover:scale-110 transition" /><span className="font-medium text-gray-200">Refresh Data</span></button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;