// src/pages/Login.jsx – Ben 10 Omnitrix Neon Theme
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rotation, setRotation] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (user?.role) navigate(`/${user.role}-dashboard`);
  }, [user, navigate]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); dispatch(login(formData)); };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-cyan-950">
      {/* Omnitrix background rings */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="omnitrix-bg-pulse"></div>
        <div className="alien-tech-grid"></div>
      </div>

      {/* Rotating outer rings */}
      <div className="absolute w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full border border-emerald-500/20 animate-spin-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] rounded-full border border-cyan-500/15 animate-spin-reverse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full border border-emerald-400/10 animate-spin-slower"></div>
      </div>

      {/* Main Omnitrix Dial Card */}
      <div className="relative z-10 w-full max-w-md mx-auto animate-omnitrix-enter">
        <div className="relative group">
          {/* Outer glowing ring */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 blur-xl opacity-60 animate-pulse-slow"></div>
          
          {/* Omnitrix Watch Body (circular) */}
          <div className="relative bg-black/60 backdrop-blur-xl rounded-full border-4 border-emerald-500/50 shadow-2xl p-6 w-full max-w-md mx-auto omnitrix-watch">
            
            {/* Animated rotating dial pointer */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-emerald-400 to-cyan-500 rounded-full -mt-3 shadow-neon-emerald animate-omnitrix-select"></div>
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/40 animate-spin-slow"></div>
            </div>

            {/* Omnitrix Core Symbol */}
            <div className="text-center mb-6 mt-2">
              <div className="flex justify-center mb-3">
                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center shadow-neon-emerald animate-spin-slow">
                  <svg className="w-12 h-12 text-white" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50,10 L60,30 L80,25 L75,45 L95,55 L75,65 L80,85 L60,80 L50,100 L40,80 L20,85 L25,65 L5,55 L25,45 L20,25 L40,30 Z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent animate-gradient-x">
                OMNITRIX
              </h2>
              <p className="text-emerald-300/80 text-sm">Access the hero inside</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-emerald-300 text-xs uppercase tracking-wider mb-1">User ID / Email</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-900/60 border border-emerald-500/50 rounded-full px-5 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all duration-300"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-emerald-300 text-xs uppercase tracking-wider mb-1">Access Code</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-gray-900/60 border border-emerald-500/50 rounded-full px-5 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-3 h-3 rounded border-emerald-500 bg-gray-800 text-emerald-500 focus:ring-emerald-500" />
                  <span className="ml-2 text-emerald-200/80">Remember hero</span>
                </label>
                <a href="#" className="text-emerald-400 hover:text-emerald-300 transition">Forgot code?</a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`relative w-full py-2 rounded-full font-bold text-white transition-all duration-300 ${
                  isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:shadow-neon-emerald hover:scale-[1.02]'
                }`}
              >
                {isLoading ? (
                  <><svg className="animate-spin inline mr-2 h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"/></svg> Activating...</>
                ) : (
                  <>⚡ Activate Omnitrix ⚡</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                No hero account?{" "}
                <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                  Create new hero
                </Link>
              </p>
            </div>

            {/* Demo credentials in Omnitrix style */}
            <div className="mt-5 p-3 rounded-2xl bg-black/40 border border-emerald-500/20 text-center">
              <p className="text-[10px] text-emerald-400/70 font-mono">
                ⚡ Demo Heroes ⚡<br/>
                Director: shivamtyagiji15@gmail.com<br/>
                Teacher: satyamtyagiji15@gmail.com<br/>
                Student: coder.st.15@gmail.com<br/>
                Parent: thebens104@gmail.com<br/>
                <span className="text-emerald-500">Password: 123456</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;