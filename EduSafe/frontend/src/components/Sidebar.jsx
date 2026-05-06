import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, X, Home, BookOpen, AlertTriangle, BarChart3,
  FileText, AlarmClock, Phone, Users, GraduationCap,
  ChevronDown, ChevronRight, TrendingUp, User, Shield, School,
  MessageSquare, Sparkles
} from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  const iconMap = {
    "🏠": <Home className="h-5 w-5" />,
    "📚": <BookOpen className="h-5 w-5" />,
    "⚠️": <AlertTriangle className="h-5 w-5" />,
    "📊": <BarChart3 className="h-5 w-5" />,
    "📝": <FileText className="h-5 w-5" />,
    "🚨": <AlarmClock className="h-5 w-5" />,
    "📞": <Phone className="h-5 w-5" />,
    "👨‍🎓": <Users className="h-5 w-5" />,
    "👨‍🏫": <GraduationCap className="h-5 w-5" />,
    "📈": <TrendingUp className="h-5 w-5" />,
    "👤": <User className="h-5 w-5" />,
    "💬": <MessageSquare className="h-5 w-5" />,
    "🤖": <Sparkles className="h-5 w-5" />
  };

  const linksByRole = {
    director: [
      { path: "/director-dashboard/overview", label: "Dashboard Overview", icon: "🏠" },
      { path: "/director-dashboard/resources", label: "Resource Management", icon: "📚" },
      { path: "/director-dashboard/alerts", label: "Alert System", icon: "⚠️" },
      { path: "/director-dashboard/reports", label: "Analytics & Reports", icon: "📊" },
    ],
    teacher: [
      { path: "/teacher-dashboard/overview", label: "Dashboard Overview", icon: "🏠" },
      { path: "/teacher-dashboard/quizzes", label: "Quiz Management", icon: "📝" },
      { path: "/teacher-dashboard/drills", label: "Drill Scheduling", icon: "🚨" },
      { path: "/teacher-dashboard/students", label: "Student Management", icon: "👨‍🎓" },
      { path: "/teacher-dashboard/messages", label: "Messages", icon: "💬" },
      { path: "/teacher-dashboard/live-sessions", label: "Live Classes", icon: "🎥" },
      { path: "/teacher-dashboard/ai-quiz-generator", label: "AI Quiz Generator", icon: "🤖" },
    ],
    student: [
      { path: "/student-dashboard/overview", label: "Dashboard Overview", icon: "🏠" },
      { path: "/student-dashboard/resources", label: "Learning Resources", icon: "📚" },
      { path: "/student-dashboard/quizzes", label: "Quizzes & Tests", icon: "📝" },
      { path: "/student-dashboard/drills", label: "Safety Drills", icon: "🚨" },
      { path: "/student-dashboard/emergency", label: "Emergency Contacts", icon: "📞" },
      { path: "/student-dashboard/ai-assistant", label: "AI Assistant", icon: "🤖" },
      { path: "/student-dashboard/messages", label: "Messages", icon: "💬" },
      { path: "/student-dashboard/live-sessions", label: "Live Classes", icon: "🎥" },
    ],
    parent: [
      { path: "/parent-dashboard/overview", label: "Dashboard Overview", icon: "🏠" },
      { path: "/parent-dashboard/progress", label: "Student Progress", icon: "📊" },
      { path: "/parent-dashboard/emergency", label: "Emergency Contacts", icon: "📞" },
    ],
  };

  const links = linksByRole[user?.role] || [];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  const isActiveLink = (path) => location.pathname.startsWith(path);

  const getRoleIcon = () => {
    switch(user?.role) {
      case 'director': return <Shield className="h-6 w-6" />;
      case 'teacher': return <School className="h-6 w-6" />;
      case 'student': return <GraduationCap className="h-6 w-6" />;
      case 'parent': return <Users className="h-6 w-6" />;
      default: return <Shield className="h-6 w-6" />;
    }
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 transition-all duration-500
        ${isOpen ? "translate-x-0 lg:w-64" : "-translate-x-full lg:w-20"}
        bg-gradient-to-b from-emerald-950/95 via-slate-900/95 to-cyan-950/95 backdrop-blur-lg
        border-r border-emerald-500/30 shadow-neon-emerald`}
    >
      <div className="flex justify-between items-center px-4 py-6 border-b border-emerald-500/30">
        {isOpen ? (
          <div className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 p-3 rounded-2xl shadow-neon-emerald group-hover:scale-110 transition">
              {getRoleIcon()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
                EduSafe
              </h2>
              <p className="text-xs text-emerald-300 capitalize">{user?.role} Portal</p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 p-3 rounded-2xl shadow-neon-emerald hover:scale-110 transition">
            {getRoleIcon()}
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-emerald-300 hover:text-white transition">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && user && (
        <div className="px-4 py-4 border-b border-emerald-500/30 bg-black/20">
          <p className="text-xs text-emerald-300">Welcome back,</p>
          <p className="font-semibold truncate text-white">{user.firstName || user.email}</p>
          <p className="text-xs text-emerald-400 capitalize">{user.role}</p>
        </div>
      )}

      <nav className="mt-4 px-2 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="group relative flex items-center justify-between w-full gap-3 px-3 py-3 rounded-xl transition-all text-emerald-100 hover:bg-emerald-500/20 hover:text-white border border-transparent hover:border-emerald-500/50"
            >
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 group-hover:scale-110 transition" />
                {isOpen && <span className="font-medium">Dashboard</span>}
              </div>
              {isOpen && (dropdownOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
              {!isOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 text-sm rounded bg-black/80 text-emerald-300 opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-lg z-50">
                  Dashboard
                </span>
              )}
            </button>

            {dropdownOpen && isOpen && (
              <ul className="ml-6 mt-2 space-y-1 border-l-2 border-emerald-500/30 pl-4 animate-fade-in-up">
                {links.map((link, idx) => (
                  <li key={link.path} style={{ animationDelay: `${idx * 50}ms` }} className="animate-slide-in-left">
                    <button
                      onClick={() => handleNavigation(link.path)}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-all
                        ${isActiveLink(link.path)
                          ? "bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 text-white border border-emerald-500/50 shadow-neon-emerald"
                          : "text-emerald-100 hover:bg-emerald-500/20 hover:text-white"
                        }`}
                    >
                      <span className="transition-transform group-hover:scale-110">
                        {iconMap[link.icon] || <span>{link.icon}</span>}
                      </span>
                      <span className="text-sm">{link.label}</span>
                      {isActiveLink(link.path) && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse ml-auto"></div>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {!isOpen && links.map((link) => (
            <li key={link.path}>
              <button
                onClick={() => handleNavigation(link.path)}
                className={`group relative flex items-center justify-center w-full px-3 py-3 rounded-xl transition-all
                  ${isActiveLink(link.path)
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-600 text-white shadow-neon-emerald"
                    : "text-emerald-300 hover:bg-emerald-500/20 hover:text-white"
                  }`}
              >
                <span className="transition-transform group-hover:scale-110">
                  {iconMap[link.icon] || <span>{link.icon}</span>}
                </span>
                <span className="absolute left-full ml-2 px-2 py-1 text-sm rounded bg-black/80 text-emerald-300 opacity-0 group-hover:opacity-100 whitespace-nowrap z-50">
                  {link.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-500/30 bg-black/40">
          <p className="text-xs text-center text-emerald-400">v2.0.0 • {new Date().getFullYear()}</p>
          <p className="text-xs text-center text-emerald-500/60 mt-1">⚡ Omnitrix Active ⚡</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;