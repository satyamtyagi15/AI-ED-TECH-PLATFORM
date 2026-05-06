import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../utils/api';
import { Phone, AlertTriangle, Mail, MapPin, User, Shield } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';

const EmergencyContacts = () => {
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => { if (user) fetchEmergencyContacts(); }, [user]);
  const fetchEmergencyContacts = async () => { try { setLoading(true); const res = await api.get(`/students/${user._id}/emergency-contacts`); setEmergencyContacts(res.data || []); } catch(err){ setError(err.response?.data?.message); } finally { setLoading(false); } };
  const sendEmergencyAlert = async () => { const msg = prompt('Emergency message for teachers/director:'); if(msg) try { await api.post('/alerts', { message:msg, targetRoles:['teacher','director'], emergencyLevel:'high', sender:user._id }); alert('🚨 Alert sent!'); } catch(err){ setError(err.response?.data?.message); } };
  const callContact = (phone) => phone && window.open(`tel:${phone}`, '_blank');
  const emailContact = (email) => email && window.open(`mailto:${email}`, '_blank');
  const getContactIcon = (role) => role?.toLowerCase()==='teacher' ? <User className="h-5 w-5" /> : role?.toLowerCase()==='director' ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />;

  if (loading) return <LoadingSpinner text="Loading emergency contacts..." />;
  const priority = emergencyContacts.filter(c => ['security','medical','director'].includes(c.role?.toLowerCase()));
  const others = emergencyContacts.filter(c => !['security','medical','director'].includes(c.role?.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center"><div><h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Emergency Contacts</h2><p className="text-cyan-300">Important contact numbers</p></div><button onClick={sendEmergencyAlert} className="btn btn-danger flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Emergency Alert</button></div>
      {error && <ErrorDisplay error={error} onRetry={fetchEmergencyContacts} />}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-red-500/30 p-4 bg-red-500/10"><div className="flex gap-3"><AlertTriangle className="h-5 w-5 text-red-400"/><div><h3 className="font-semibold text-red-300">Emergency Procedures</h3><ul className="text-sm text-red-200"><li>• Stay calm, call for help using numbers below</li><li>• Follow teacher instructions</li><li>• Move to safe areas</li></ul></div></div></div>
      {priority.length>0 && (<div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300 mb-4">Priority Emergency Contacts</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{priority.map(c=>(<div key={c.name} className="border border-red-500/30 rounded-xl p-4 text-center bg-red-500/5"><div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">{getContactIcon(c.role)}</div><h4 className="font-semibold text-white mt-2">{c.name}</h4><p className="text-red-300 text-sm capitalize">{c.role}</p>{c.phone && <button onClick={()=>callContact(c.phone)} className="btn btn-danger w-full mt-3 text-sm flex items-center justify-center gap-1"><Phone className="h-4 w-4" /> Call {c.phone}</button>}{c.email && <button onClick={()=>emailContact(c.email)} className="btn btn-outline w-full mt-2 text-sm"><Mail className="h-4 w-4 mr-1" /> Email</button>}</div>))}</div></div>)}
      {others.length>0 && (<div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300 mb-4">Other Contacts</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{others.map(c=>(<div key={c.name} className="border border-cyan-500/20 rounded-xl p-4 text-center"><div className="w-12 h-12 mx-auto bg-cyan-500/20 rounded-full flex items-center justify-center">{getContactIcon(c.role)}</div><h4 className="font-semibold text-white mt-2">{c.name}</h4><p className="text-cyan-300 text-sm capitalize">{c.role}</p>{c.phone && <button onClick={()=>callContact(c.phone)} className="btn btn-outline w-full mt-2 text-sm"><Phone className="h-4 w-4 mr-1" /> Call</button>}{c.email && <button onClick={()=>emailContact(c.email)} className="btn btn-outline w-full mt-2 text-sm"><Mail className="h-4 w-4 mr-1" /> Email</button>}</div>))}</div></div>)}
      {emergencyContacts.length===0 && (<div className="text-center py-12 text-gray-400"><Shield className="h-16 w-16 mx-auto mb-3 opacity-50" /><p>No emergency contacts available</p><p className="text-sm">Contact school admin</p></div>)}
      <div className="grid grid-cols-2 gap-4"><div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-4"><h3 className="font-semibold text-cyan-300">Important Numbers</h3><div className="space-y-2 mt-2"><div className="flex justify-between"><span>Police/Fire/Ambulance</span><button onClick={()=>callContact('911')} className="text-sm text-cyan-400 hover:underline">911</button></div></div></div><div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-4"><h3 className="font-semibold text-cyan-300">School Information</h3><div className="space-y-1 text-sm mt-2"><div className="flex justify-between"><span className="text-gray-400">Your Name:</span><span className="text-white">{user?.firstName} {user?.lastName}</span></div><div className="flex justify-between"><span className="text-gray-400">Grade:</span><span className="text-white">{user?.grade || 'N/A'}</span></div></div></div></div>
    </div>
  );
};

export default EmergencyContacts;