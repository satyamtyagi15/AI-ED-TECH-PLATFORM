import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { BookOpen, Award, Clock, AlertTriangle, MessageCircle, TrendingUp } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";
import DailyChallengeWidget from './DailyChallengeWidget';

const DashboardOverview = () => {
  const [progress, setProgress] = useState({ progress: {}, quizSubmissions: [], resourceCompletions: [] });
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => { if (user) fetchDashboardData(); }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [progressRes, messagesRes, alertsRes] = await Promise.all([
        api.get(`/progress/student/${user._id}`),
        api.get("/messages/unread-count"),
        api.get("/alerts")
      ]);
      setProgress(progressRes.data || { progress: { overall: 0, quizzes: 0, resources: 0, averageScore: 0 }, quizSubmissions: [], resourceCompletions: [] });
      setUnreadMessages(messagesRes.data?.unreadCount || 0);
      const alertsData = alertsRes.data?.alerts || alertsRes.data || [];
      setAlerts(alertsData.filter(alert => !alert.dismissed));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading student dashboard..." />;

  const statCards = [
    { title: "Overall Progress", value: `${progress.progress.overall || 0}%`, icon: <TrendingUp className="h-5 w-5" />, color: "blue" },
    { title: "Average Score", value: `${progress.progress.averageScore || 0}%`, icon: <Award className="h-5 w-5" />, color: "green" },
    { title: "Quizzes Completed", value: progress.quizSubmissions?.length || 0, icon: <BookOpen className="h-5 w-5" />, color: "purple" },
    { title: "Resources Completed", value: progress.resourceCompletions?.length || 0, icon: <BookOpen className="h-5 w-5" />, color: "orange" }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center animate-slide-in-left">
        <div><h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Student Dashboard</h2><p className="text-cyan-300 mt-1">Welcome back, {user?.firstName}! Ready to learn?</p></div>
        {unreadMessages > 0 && (
          <button onClick={() => window.location.href = "/student-dashboard/messages"} className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-neon-cyan hover:scale-105 transition flex items-center gap-2">
            <MessageCircle className="h-4 w-4" /> Messages <span className="ml-1 px-2 py-0.5 bg-red-500 rounded-full text-xs">{unreadMessages}</span>
          </button>
        )}
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchDashboardData} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 hover:shadow-neon-cyan transition-all group animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex justify-between items-start">
              <div><p className="text-cyan-300 text-sm">{stat.title}</p><p className="text-3xl font-bold text-white mt-1">{stat.value}</p></div>
              <div className={`p-3 rounded-xl bg-${stat.color}-500/20 text-${stat.color}-300 group-hover:scale-110 transition`}>{stat.icon}</div>
            </div>
            <div className="mt-3 h-1 w-full bg-gray-700 rounded-full overflow-hidden"><div className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-1000`} style={{ width: `${Math.min(parseInt(stat.value), 100)}%` }}></div></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 animate-fade-in-up delay-200">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Learning Center</h3>
          <div className="space-y-3">
            <button onClick={() => window.location.href = "/student-dashboard/resources"} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:shadow-neon-cyan transition flex items-center justify-center gap-2"><BookOpen className="h-4 w-4" /> Study Resources</button>
            <button onClick={() => window.location.href = "/student-dashboard/quizzes"} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium hover:shadow-neon-cyan transition flex items-center justify-center gap-2"><Award className="h-4 w-4" /> Take Quizzes</button>
            <button onClick={() => window.location.href = "/student-dashboard/drills"} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-neon-purple transition flex items-center justify-center gap-2"><Clock className="h-4 w-4" /> Safety Drills</button>
            <button onClick={() => window.location.href = "/student-dashboard/messages"} className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium hover:shadow-neon-cyan transition flex items-center justify-center gap-2"><MessageCircle className="h-4 w-4" /> Messages {unreadMessages > 0 && `(${unreadMessages})`}</button>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 animate-fade-in-up delay-300">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Progress Summary</h3>
          <div className="space-y-4">
            {["Overall Progress", "Quiz Progress", "Resource Progress"].map((label, i) => {
              let key = i === 0 ? "overall" : i === 1 ? "quizzes" : "resources";
              let value = progress.progress[key] || 0;
              let color = i === 0 ? "blue" : i === 1 ? "green" : "purple";
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-300">{label}</span><span className="text-cyan-300">{value}%</span></div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className={`h-full bg-${color}-500 rounded-full transition-all duration-1000`} style={{ width: `${value}%` }}></div></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 animate-fade-in-up delay-400">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2"><Award className="h-5 w-5" /> Recent Quiz Results</h3>
          <div className="space-y-3">
            {progress.quizSubmissions?.slice(0,3).map(sub => (
              <div key={sub._id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-cyan-500/20">
                <div><h4 className="font-medium text-white">{sub.quizId?.title || "Quiz"}</h4><p className="text-sm text-cyan-300">{new Date(sub.completedAt).toLocaleDateString()}</p></div>
                <span className={`text-lg font-bold ${sub.score >=80 ? "text-green-400" : sub.score >=60 ? "text-yellow-400" : "text-red-400"}`}>{sub.score}%</span>
              </div>
            ))}
            {(!progress.quizSubmissions || progress.quizSubmissions.length === 0) && <p className="text-center text-gray-400 py-4">No quiz results yet</p>}
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 animate-fade-in-up delay-500">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Recently Completed</h3>
          <div className="space-y-3">
            {progress.resourceCompletions?.slice(0,3).map(res => (
              <div key={res._id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-cyan-500/20">
                <div><h4 className="font-medium text-white">{res.resourceId?.title || "Resource"}</h4><p className="text-sm text-cyan-300">{new Date(res.completedAt).toLocaleDateString()}</p></div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">Completed</span>
              </div>
            ))}
            {(!progress.resourceCompletions || progress.resourceCompletions.length === 0) && <p className="text-center text-gray-400 py-4">No resources completed yet</p>}
          </div>
        </div>
      </div>

      {/* Daily Challenge Widget – Added as a separate row (full width) */}
      <DailyChallengeWidget />

      {alerts.length > 0 && (
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-red-500/30 p-5 animate-fade-in-up delay-600">
          <h3 className="text-lg font-semibold text-red-300 mb-2 flex items-center gap-2"><AlertTriangle className="h-5 w-5 animate-pulse" /> Important Alerts ({alerts.length})</h3>
          {alerts.slice(0,2).map(alert => (
            <div key={alert._id} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 mt-2"><p className="text-red-200">{alert.message}</p><p className="text-xs text-red-300/70 mt-1">{new Date(alert.createdAt).toLocaleString()}</p></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;