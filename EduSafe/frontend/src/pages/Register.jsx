// src/pages/Register.jsx – Ben 10 Omnitrix Neon Theme
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, registerTenant, clearError } from '../redux/authSlice.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, UserPlus, Building2, Shield } from 'lucide-react';

const Register = () => {
  const [formType, setFormType] = useState('user');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    role: 'student', tenantId: '', studentId: '', grade: '',
    tenantName: '', address: '', contactEmail: '', contactPhone: '',
    emergencyContacts: [{ name: '', phone: '', role: '' }]
  });
  const [tenants, setTenants] = useState([]);
  const [students, setStudents] = useState([]);
  const [rotation, setRotation] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role) {
      const roleToPath = {
        director: '/director-dashboard',
        teacher: '/teacher-dashboard',
        student: '/student-dashboard',
        parent: '/parent-dashboard'
      };
      navigate(roleToPath[user.role] || '/');
    }
  }, [user, navigate]);

  useEffect(() => {
    setTenants([
      { _id: '1', name: 'Springfield Elementary' },
      { _id: '2', name: 'South Park Elementary' },
      { _id: '3', name: 'Bayside High School' }
    ]);
  }, []);

  useEffect(() => {
    if (formData.role === 'parent' && formData.tenantId) {
      setStudents([
        { _id: '1', firstName: 'Bart', lastName: 'Simpson', grade: '4th' },
        { _id: '2', firstName: 'Lisa', lastName: 'Simpson', grade: '2nd' },
        { _id: '3', firstName: 'Milhouse', lastName: 'Van Houten', grade: '4th' }
      ]);
    }
  }, [formData.role, formData.tenantId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEmergencyContactChange = (index, field, value) => {
    const updated = [...formData.emergencyContacts];
    updated[index][field] = value;
    setFormData({ ...formData, emergencyContacts: updated });
  };
  const addEmergencyContact = () => setFormData({
    ...formData,
    emergencyContacts: [...formData.emergencyContacts, { name: '', phone: '', role: '' }]
  });
  const removeEmergencyContact = (index) => setFormData({
    ...formData,
    emergencyContacts: formData.emergencyContacts.filter((_, i) => i !== index)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (formType === 'tenant') {
      dispatch(registerTenant({
        name: formData.tenantName,
        address: formData.address,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        emergencyContacts: formData.emergencyContacts,
        userData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        }
      }));
    } else {
      dispatch(register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        tenantId: formData.tenantId,
        studentId: formData.role === 'parent' ? formData.studentId : null,
        grade: formData.role === 'student' ? formData.grade : null
      }));
    }
  };

  // Animate rotation for background rings
  useEffect(() => {
    const interval = setInterval(() => setRotation(prev => (prev + 1) % 360), 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-cyan-950 py-6 px-4">
      {/* Omnitrix background rings */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="omnitrix-bg-pulse"></div>
        <div className="alien-tech-grid"></div>
      </div>

      <div className="absolute w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full border border-emerald-500/20 animate-spin-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] rounded-full border border-cyan-500/15 animate-spin-reverse"></div>
      </div>

      {/* Main Omnitrix Dial Card (circular container) */}
      <div className="relative z-10 w-full max-w-3xl mx-auto animate-omnitrix-enter">
        <div className="relative group">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 blur-xl opacity-60 animate-pulse-slow"></div>
          
          <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl border-4 border-emerald-500/50 shadow-2xl p-5 omnitrix-watch-large">
            
            {/* Rotating dial indicator */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-emerald-400 rounded-full -mt-2 shadow-neon-emerald animate-omnitrix-select"></div>

            <div className="text-center mb-4 mt-2">
              <div className="flex justify-center mb-2">
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center shadow-neon-emerald animate-spin-slow">
                  <svg className="w-9 h-9 text-white" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50,10 L60,30 L80,25 L75,45 L95,55 L75,65 L80,85 L60,80 L50,100 L40,80 L20,85 L25,65 L5,55 L25,45 L20,25 L40,30 Z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">CREATE HERO</h2>
              <p className="text-emerald-300/70 text-xs">Register your omnitrix identity</p>
            </div>

            {/* Toggle Buttons (Omnitrix style) */}
            <div className="flex gap-2 mb-4 p-1 bg-gray-900/50 rounded-full border border-emerald-500/30">
              <button
                type="button"
                onClick={() => setFormType('user')}
                className={`flex-1 py-1.5 rounded-full font-medium text-xs transition-all flex items-center justify-center gap-1 ${formType === 'user' ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-neon-emerald' : 'text-gray-400 hover:text-white'}`}
              >
                <Shield size={12} /> Join School
              </button>
              <button
                type="button"
                onClick={() => setFormType('tenant')}
                className={`flex-1 py-1.5 rounded-full font-medium text-xs transition-all flex items-center justify-center gap-1 ${formType === 'tenant' ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-neon-emerald' : 'text-gray-400 hover:text-white'}`}
              >
                <Building2 size={12} /> New School
              </button>
            </div>

            {error && <div className="mb-3 p-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-xs text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><label className="block text-emerald-300 text-xs uppercase mb-0.5">First Name</label><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-full px-3 py-1.5 text-white text-sm focus:border-emerald-400" required /></div>
                <div><label className="block text-emerald-300 text-xs uppercase mb-0.5">Last Name</label><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-full px-3 py-1.5 text-white text-sm focus:border-emerald-400" required /></div>
              </div>

              <div><label className="block text-emerald-300 text-xs uppercase mb-0.5">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-full px-3 py-1.5 text-white text-sm" required /></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><label className="block text-emerald-300 text-xs uppercase mb-0.5">Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-full px-3 py-1.5 text-white text-sm" required /></div>
                <div><label className="block text-emerald-300 text-xs uppercase mb-0.5">Confirm</label><input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-full px-3 py-1.5 text-white text-sm" required /></div>
              </div>

              {formType === 'user' ? (
                <>
                  <div><label className="block text-emerald-300 text-xs uppercase mb-0.5">Role</label><select name="role" value={formData.role} onChange={handleChange} className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-full px-3 py-1.5 text-white text-sm"><option value="student">Student</option><option value="teacher">Teacher</option><option value="parent">Parent</option><option value="director">Director</option></select></div>
                  <div><label className="block text-emerald-300 text-xs uppercase mb-0.5">Select School</label><select name="tenantId" value={formData.tenantId} onChange={handleChange} className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-full px-3 py-1.5 text-white text-sm" required><option value="">-- Select School --</option>{tenants.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
                  {formData.role === 'student' && <div><label className="block text-emerald-300 text-xs uppercase mb-0.5">Grade</label><input type="text" name="grade" value={formData.grade} onChange={handleChange} className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-full px-3 py-1.5 text-white text-sm" required /></div>}
                  {formData.role === 'parent' && <div><label className="block text-emerald-300 text-xs uppercase mb-0.5">Select Student</label><select name="studentId" value={formData.studentId} onChange={handleChange} className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-full px-3 py-1.5 text-white text-sm" required><option value="">-- Select Student --</option>{students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.grade})</option>)}</select></div>}
                </>
              ) : (
                <>
                  <div><label className="block text-emerald-300 text-xs uppercase mb-0.5">School Name</label><input type="text" name="tenantName" value={formData.tenantName} onChange={handleChange} className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-full px-3 py-1.5 text-white text-sm" required /></div>
                  <div><label className="block text-emerald-300 text-xs uppercase mb-0.5">Address</label><textarea name="address" value={formData.address} onChange={handleChange} className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-xl px-3 py-1.5 text-white text-sm" rows="2" required /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-emerald-300 text-xs uppercase mb-0.5">Contact Email</label><input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-full px-3 py-1.5 text-white text-sm" required /></div>
                    <div><label className="block text-emerald-300 text-xs uppercase mb-0.5">Contact Phone</label><input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-full px-3 py-1.5 text-white text-sm" required /></div>
                  </div>
                  <div>
                    <label className="block text-emerald-300 text-xs uppercase mb-0.5">Emergency Contacts</label>
                    {formData.emergencyContacts.map((c, i) => (
                      <div key={i} className="mb-2 p-2 bg-gray-800/30 rounded-xl border border-emerald-500/30">
                        <input type="text" placeholder="Name" value={c.name} onChange={e => handleEmergencyContactChange(i, 'name', e.target.value)} className="w-full mb-1 bg-gray-900/50 border border-emerald-500/50 rounded-full px-2 py-1 text-white text-xs" required />
                        <input type="tel" placeholder="Phone" value={c.phone} onChange={e => handleEmergencyContactChange(i, 'phone', e.target.value)} className="w-full mb-1 bg-gray-900/50 border border-emerald-500/50 rounded-full px-2 py-1 text-white text-xs" required />
                        <input type="text" placeholder="Role" value={c.role} onChange={e => handleEmergencyContactChange(i, 'role', e.target.value)} className="w-full bg-gray-900/50 border border-emerald-500/50 rounded-full px-2 py-1 text-white text-xs" required />
                        {formData.emergencyContacts.length > 1 && <button type="button" onClick={() => removeEmergencyContact(i)} className="mt-1 text-red-400 text-xs">Remove</button>}
                      </div>
                    ))}
                    <button type="button" onClick={addEmergencyContact} className="text-emerald-400 text-xs mt-1">+ Add Contact</button>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`relative w-full py-1.5 rounded-full font-bold text-white transition-all duration-300 ${
                  isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:shadow-neon-emerald hover:scale-[1.02]'
                }`}
              >
                {isLoading ? 'Creating...' : <>⚡ Register Hero <Sparkles className="inline ml-1 h-3 w-3" /></>}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-400 text-xs">Already have omnitrix? <Link to="/login" className="text-emerald-400 hover:text-emerald-300">Login here</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;