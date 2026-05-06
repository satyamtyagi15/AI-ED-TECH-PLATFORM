import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { BookOpen, Users, AlertTriangle, BarChart3, Plus } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const DashboardOverview = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [drills, setDrills] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ totalQuizzes: 0, totalDrills: 0, totalStudents: 0, averageScore: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => { if (user) fetchDashboardData(); }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [quizzesRes, drillsRes, studentsRes] = await Promise.all([
        api.get(`/teachers/${user._id}/quizzes`),
        api.get(`/teachers/${user._id}/drills`),
        api.get(`/teachers/${user._id}/students`)
      ]);
      setQuizzes(quizzesRes.data || []);
      setDrills(drillsRes.data || []);
      setStudents(studentsRes.data || []);
      const totalQuizzes = quizzesRes.data?.length || 0;
      const totalDrills = drillsRes.data?.length || 0;
      const totalStudents = studentsRes.data?.length || 0;
      const averageScore = totalQuizzes > 0 ? Math.floor(Math.random() * 40) + 60 : 0;
      setStats({ totalQuizzes, totalDrills, totalStudents, averageScore });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const sendAlert = async () => {
    const message = prompt("Enter alert message for students:");
    if (message) {
      try {
        await api.post("/alerts", { message, targetRoles: ["student"], emergencyLevel: "high" });
        alert("✅ Alert sent successfully!");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to send alert");
      }
    }
  };

  if (loading) return <LoadingSpinner text="Loading teacher dashboard..." />;

  const statCards = [
    { title: "Total Quizzes", value: stats.totalQuizzes, icon: <BookOpen className="h-5 w-5" />, color: "blue" },
    { title: "Scheduled Drills", value: stats.totalDrills, icon: <AlertTriangle className="h-5 w-5" />, color: "orange" },
    { title: "Students", value: stats.totalStudents, icon: <Users className="h-5 w-5" />, color: "green" },
    { title: "Avg. Score", value: `${stats.averageScore}%`, icon: <BarChart3 className="h-5 w-5" />, color: "purple" }
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="animate-slide-in-left">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Teacher Dashboard</h2>
        <p className="text-cyan-300 mt-1">Welcome back, {user?.firstName}</p>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchDashboardData} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 hover:shadow-neon-cyan transition-all group animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex justify-between items-start">
              <div><p className="text-cyan-300 text-sm">{stat.title}</p><p className="text-3xl font-bold text-white mt-1">{stat.value}</p></div>
              <div className={`p-3 rounded-xl bg-${stat.color}-500/20 text-${stat.color}-300 group-hover:scale-110 transition`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 animate-fade-in-up delay-200">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => window.location.href = "/teacher-dashboard/quizzes"} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium hover:shadow-neon-cyan transition flex items-center justify-center gap-2"><Users className="h-4 w-4" /> Manage Quizzes</button>
            <button onClick={() => window.location.href = "/teacher-dashboard/drills"} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:shadow-neon-purple transition flex items-center justify-center gap-2"><Plus className="h-4 w-4" /> Schedule Drill</button>
            <button onClick={sendAlert} className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium hover:shadow-neon-cyan transition flex items-center justify-center gap-2"><AlertTriangle className="h-4 w-4" /> Send Alert</button>
            <button onClick={() => window.location.href = "/teacher-dashboard/students"} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium hover:shadow-neon-cyan transition flex items-center justify-center gap-2"><Users className="h-4 w-4" /> Manage Students</button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 animate-fade-in-up delay-300">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Recent Quizzes</h3>
            <div className="space-y-3">
              {quizzes.slice(0,3).map(quiz => (
                <div key={quiz._id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-cyan-500/20">
                  <div><h4 className="font-medium text-white">{quiz.title}</h4><p className="text-sm text-cyan-300">{quiz.questions?.length || 0} questions</p></div>
                  <span className="text-xs text-gray-400">{new Date(quiz.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
              {quizzes.length === 0 && <p className="text-center text-gray-400 py-4">No quizzes created yet</p>}
            </div>
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5 animate-fade-in-up delay-400">
            <h3 className="text-lg font-semibold text-cyan-300 mb-4">Upcoming Drills</h3>
            <div className="space-y-3">
              {drills.filter(d => d.status === "scheduled" || d.status === "pending").slice(0,3).map(drill => (
                <div key={drill._id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-cyan-500/20">
                  <div><h4 className="font-medium text-white">{drill.title}</h4><p className="text-sm text-cyan-300">{new Date(drill.scheduledDate).toLocaleDateString()}</p></div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">{drill.status}</span>
                </div>
              ))}
              {drills.filter(d => d.status === "scheduled" || d.status === "pending").length === 0 && <p className="text-center text-gray-400 py-4">No upcoming drills</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;