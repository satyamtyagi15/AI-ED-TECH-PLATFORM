import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import { Menu, User, LogOut, Settings, Shield, School, GraduationCap, Users, Sparkles } from "lucide-react";

const Navbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    return `/${user.role}-dashboard`;
  };

  const getRoleConfig = () => {
    const config = {
      director: { icon: Shield, color: "from-emerald-500 to-cyan-500", bgColor: "bg-emerald-500/20" },
      teacher: { icon: School, color: "from-emerald-500 to-cyan-500", bgColor: "bg-emerald-500/20" },
      student: { icon: GraduationCap, color: "from-emerald-500 to-cyan-500", bgColor: "bg-emerald-500/20" },
      parent: { icon: Users, color: "from-emerald-500 to-cyan-500", bgColor: "bg-emerald-500/20" }
    };
    return config[user?.role] || { icon: User, color: "from-emerald-500 to-cyan-500", bgColor: "bg-emerald-500/20" };
  };

  const roleConfig = getRoleConfig();
  const RoleIcon = roleConfig.icon;

  return (
    <header className="bg-black/40 backdrop-blur-xl border-b border-emerald-500/30 px-6 py-4 sticky top-0 z-50 shadow-neon-emerald animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all group"
          >
            <Menu className="h-5 w-5 group-hover:scale-110 transition" />
          </button>
          
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate(getDashboardPath())}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-neon-emerald group-hover:scale-110 transition">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
                EduSafe
              </h1>
              <p className="text-xs text-emerald-400">⚡ Omnitrix Active ⚡</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-3 bg-black/40 rounded-2xl px-4 py-2 border border-emerald-500/30 shadow-neon-emerald group">
                <div className={`p-2 rounded-full ${roleConfig.bgColor} group-hover:scale-110 transition`}>
                  <RoleIcon className="h-4 w-4 text-emerald-300" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{user.firstName || user.email.split('@')[0]}</p>
                  <p className="text-xs text-emerald-400 capitalize">{user.role}</p>
                </div>
              </div>

              <div className="relative group">
                <button className="flex items-center justify-center h-10 w-10 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl text-white font-bold shadow-neon-emerald hover:scale-110 transition border border-emerald-300">
                  {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </button>
                
                <div className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-xl rounded-xl shadow-2xl border border-emerald-500/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 p-3 border-b border-emerald-500/30">
                    <p className="font-semibold text-white">{user.firstName || user.email}</p>
                    <p className="text-xs text-emerald-300 capitalize">{user.role}</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-500/20 flex items-center space-x-2 transition">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-500/20 flex items-center space-x-2 transition">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    <hr className="my-1 border-emerald-500/30" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 flex items-center space-x-2 transition">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={() => navigate("/login")} className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-5 py-2 rounded-xl font-semibold shadow-neon-emerald hover:scale-105 transition">
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;