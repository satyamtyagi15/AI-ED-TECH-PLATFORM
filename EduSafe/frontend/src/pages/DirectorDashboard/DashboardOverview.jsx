import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { Users, BookOpen, AlertTriangle, BarChart3 } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalResources: 0,
    activeAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resourcesRes, alertsRes, statsRes] = await Promise.all([
        api.get("/resources"),
        api.get("/alerts"),
        api.get("/director/stats"),
      ]);
      const resources = resourcesRes.data?.resources || resourcesRes.data || [];
      const alerts = alertsRes.data?.alerts || alertsRes.data || [];
      setStats(statsRes.data || {
        totalStudents: 0,
        totalTeachers: 0,
        totalResources: resources.length,
        activeAlerts: alerts.filter(alert => !alert.dismissed).length,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const sendAlert = async () => {
    const message = prompt("Enter alert message for all users:");
    if (!message) return;
    try {
      await api.post("/alerts", {
        message,
        targetRoles: ["teacher", "student", "parent"],
        emergencyLevel: "high",
      });
      alert("🚨 Alert sent successfully!");
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send alert");
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard overview..." />;

  const statCards = [
    { title: "Total Students", value: stats.totalStudents, icon: <Users className="h-5 w-5" />, color: "blue" },
    { title: "Teachers", value: stats.totalTeachers, icon: <Users className="h-5 w-5" />, color: "green" },
    { title: "Resources", value: stats.totalResources, icon: <BookOpen className="h-5 w-5" />, color: "purple" },
    { title: "Active Alerts", value: stats.activeAlerts, icon: <AlertTriangle className="h-5 w-5" />, color: "red" },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between animate-slide-in-left">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Director Dashboard
          </h2>
          <p className="text-cyan-300 mt-1">Welcome back, {user?.firstName}</p>
        </div>
        <button onClick={sendAlert} className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-neon-cyan hover:scale-105 transition-all flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> Send Alert
        </button>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchDashboardData} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 hover:shadow-neon-cyan transition-all group animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cyan-300 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-500/20 text-${stat.color}-300 group-hover:scale-110 transition`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-3 h-1 w-full bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full bg-${stat.color}-500 rounded-full transition-all duration-1000`} style={{ width: `${Math.min(stat.value / 100 * 100, 100)}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 animate-fade-in-up delay-200">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => window.location.href = "/director-dashboard/resources"} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:shadow-neon-cyan transition-all flex items-center justify-center gap-2"><BookOpen className="h-4 w-4" /> Manage Resources</button>
            <button onClick={() => window.location.href = "/director-dashboard/alerts"} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-neon-purple transition-all flex items-center justify-center gap-2"><AlertTriangle className="h-4 w-4" /> View Alert System</button>
            <button onClick={() => window.location.href = "/director-dashboard/reports"} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium hover:shadow-neon-cyan transition-all flex items-center justify-center gap-2"><BarChart3 className="h-4 w-4" /> View Analytics</button>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 animate-fade-in-up delay-300">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-cyan-500/20">
              <span className="text-gray-300">Resources</span>
              <span className={`px-3 py-1 rounded-full text-xs ${stats.totalResources > 0 ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>{stats.totalResources > 0 ? 'Available' : 'None'}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-cyan-500/20">
              <span className="text-gray-300">Active Alerts</span>
              <span className={`px-3 py-1 rounded-full text-xs ${stats.activeAlerts > 0 ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>{stats.activeAlerts} active</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-cyan-500/20">
              <span className="text-gray-300">System Health</span>
              <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-300">Optimal</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 animate-fade-in-up delay-400">
        <h3 className="text-lg font-semibold text-cyan-300 mb-4">Platform Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center hover:scale-105 transition">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="font-semibold text-blue-200">User Management</p>
            <p className="text-sm text-blue-300/70">Manage all platform users</p>
          </div>
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center hover:scale-105 transition">
            <BookOpen className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="font-semibold text-green-200">Content Library</p>
            <p className="text-sm text-green-300/70">Educational resources</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center hover:scale-105 transition">
            <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <p className="font-semibold text-purple-200">Analytics</p>
            <p className="text-sm text-purple-300/70">Performance insights</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;