import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { BarChart3, Users, BookOpen, AlertTriangle, Download, Calendar, TrendingUp, Target } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const AnalyticsReports = () => {
  const [analytics, setAnalytics] = useState({ userActivity: [], resourceUsage: [], quizPerformance: [], systemMetrics: {} });
  const [timeRange, setTimeRange] = useState("7days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => { if (user) fetchAnalytics(); }, [user, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/director/analytics?timeRange=${timeRange}`);
      setAnalytics(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === "object" && Object.keys(data).length === 0)) { alert('No data to export'); return; }
    let csv = "";
    if (Array.isArray(data)) { csv = Object.keys(data[0]).join(",") + "\n" + data.map(row => Object.values(row).map(v => typeof v === "string" && v.includes(",") ? `"${v}"` : v).join(",")).join("\n"); }
    else { Object.keys(data).forEach(section => { csv += `\n=== ${section.toUpperCase()} ===\n`; if (Array.isArray(data[section]) && data[section].length) csv += Object.keys(data[section][0]).join(",") + "\n" + data[section].map(row => Object.values(row).join(",")).join("\n"); else if (typeof data[section] === "object") csv += Object.keys(data[section]).join(",") + "\n" + Object.values(data[section]).join(",") + "\n"; }); }
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingSpinner text="Loading analytics..." />;

  const metrics = analytics.systemMetrics || {};

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between animate-slide-in-left">
        <div><h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Analytics & Reports</h2><p className="text-cyan-300">Real-time system performance insights</p></div>
        <div className="flex space-x-3"><select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="form-input w-32"><option value="7days">Last 7 days</option><option value="30days">Last 30 days</option></select><button onClick={() => exportToCSV(analytics, 'full_report')} className="btn btn-primary flex items-center gap-2"><Download className="h-4 w-4" /> Export Full</button></div>
      </div>
      {error && <ErrorDisplay error={error} onRetry={fetchAnalytics} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[{ title: "Total Students", value: metrics.totalUsers || 0, icon: <Users className="h-5 w-5" />, color: "blue" },
          { title: "Active Students", value: metrics.activeUsers || 0, icon: <TrendingUp className="h-5 w-5" />, color: "green" },
          { title: "Resources", value: metrics.totalResources || 0, icon: <BookOpen className="h-5 w-5" />, color: "purple" },
          { title: "Avg Quiz Score", value: `${metrics.avgQuizScore || 0}%`, icon: <Target className="h-5 w-5" />, color: "orange" }].map((m, i) => (
          <div key={i} className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 hover:shadow-neon-cyan transition"><div className="flex justify-between"><div><p className="text-cyan-300 text-sm">{m.title}</p><p className="text-2xl font-bold text-white">{m.value}</p><p className="text-xs text-gray-400">current period</p></div><div className={`p-3 rounded-xl bg-${m.color}-500/20 text-${m.color}-300`}>{m.icon}</div></div></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><div className="flex justify-between"><div><p className="text-cyan-300 text-sm">Engagement Rate</p><p className="text-2xl font-bold text-white">{metrics.engagementRate || 0}%</p><p className="text-xs text-gray-400">Student participation</p></div><div className="p-3 rounded-xl bg-blue-500/20 text-blue-300"><BarChart3 className="h-5 w-5" /></div></div></div>
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><div className="flex justify-between"><div><p className="text-cyan-300 text-sm">Total Completions</p><p className="text-2xl font-bold text-white">{metrics.totalCompletions || 0}</p><p className="text-xs text-gray-400">Resources completed</p></div><div className="p-3 rounded-xl bg-green-500/20 text-green-300"><Target className="h-5 w-5" /></div></div></div>
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><div className="flex justify-between"><div><p className="text-cyan-300 text-sm">Active Alerts</p><p className="text-2xl font-bold text-white">{metrics.activeAlerts || 0}</p><p className="text-xs text-gray-400">System notifications</p></div><div className="p-3 rounded-xl bg-red-500/20 text-red-300"><AlertTriangle className="h-5 w-5" /></div></div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Student Activity ({timeRange})</h3><div className="space-y-3 max-h-80 overflow-y-auto">{analytics.userActivity?.map((day, i) => (<div key={i} className="flex justify-between p-3 border-b border-cyan-500/20"><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-cyan-400" /><span className="text-white">{day.date}</span></div><div className="text-right"><span className="text-gray-300">{day.activeUsers} active students</span>{day.newRegistrations > 0 && <div className="text-xs text-green-400">+{day.newRegistrations} new</div>}</div></div>)) || <div className="text-center text-gray-400 py-4">No data</div>}</div></div>
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5" /> Top Resources</h3><div className="space-y-3 max-h-80 overflow-y-auto">{analytics.resourceUsage?.map((r, i) => (<div key={i} className="flex justify-between p-3 border-b border-cyan-500/20"><div><p className="font-medium text-white">{r.name}</p><p className="text-sm text-gray-400">{r.views} views</p></div><div className="text-right"><span className="text-gray-300">{r.completions} completions</span><div className="text-xs text-green-400">{r.completionRate}% rate</div></div></div>)) || <div className="text-center text-gray-400">No data</div>}</div></div>
      </div>
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300 mb-4">Quiz Performance</h3><div className="space-y-4">{analytics.quizPerformance?.map((q, i) => (<div key={i} className="flex justify-between items-center p-4 border border-cyan-500/20 rounded-lg"><div><h4 className="font-semibold text-white">{q.category}</h4><p className="text-sm text-cyan-300">{q.participants} participants • {q.totalQuestions} questions</p></div><div className="text-right"><span className="text-2xl font-bold text-cyan-400">{q.averageScore}%</span><p className="text-xs text-gray-400">Avg Score</p></div></div>)) || <div className="text-center text-gray-400">No quiz data</div>}</div></div>
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300 mb-4">Export Reports</h3><div className="grid grid-cols-3 gap-4"><button onClick={() => exportToCSV(analytics.userActivity, 'student_activity')} className="btn btn-outline">Student Activity</button><button onClick={() => exportToCSV(analytics.resourceUsage, 'resource_usage')} className="btn btn-outline">Resource Usage</button><button onClick={() => exportToCSV(analytics.quizPerformance, 'quiz_performance')} className="btn btn-outline">Quiz Performance</button></div></div>
    </div>
  );
};

export default AnalyticsReports;