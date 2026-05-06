import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { Phone, Mail, MapPin, Shield, Users, Building } from 'lucide-react';
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => { if (user?._id) fetchEmergencyContacts(); }, [user]);
  const fetchEmergencyContacts = async () => { try { setLoading(true); const res = await api.get(`/parents/${user._id}/emergency-contacts`); setContacts(res.data); } catch(err){ setError(err.response?.data?.message); } finally { setLoading(false); } };
  if (loading) return <LoadingSpinner text="Loading emergency contacts..." />;
  if (error) return <ErrorDisplay error={error} onRetry={fetchEmergencyContacts} />;

  const govt = [{name:"Police",phone:"100",type:"emergency"},{name:"Ambulance",phone:"108",type:"emergency"},{name:"Fire",phone:"101",type:"emergency"},{name:"Child Helpline",phone:"1098",type:"support"}];
  const ContactCard = ({c, icon:Icon, bg, border}) => (<div className={`bg-black/40 backdrop-blur-md rounded-2xl border ${border} p-4`}><div className="flex justify-between"><h3 className="font-bold text-white">{c.name}</h3><div className={`p-2 rounded-full ${bg}`}><Icon className="h-5 w-5 text-white"/></div></div>{c.role && <p className="text-sm text-cyan-300 capitalize">{c.role}</p>}{c.phone && <div className="mt-2"><a href={`tel:${c.phone}`} className="text-cyan-400 hover:underline">{c.phone}</a></div>}{c.email && <div><a href={`mailto:${c.email}`} className="text-cyan-400 text-sm">{c.email}</a></div>}</div>);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div><h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Emergency Contacts</h2><p className="text-cyan-300">Important contacts for emergencies</p></div>
      {error && <ErrorDisplay error={error} onRetry={fetchEmergencyContacts} />}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-yellow-500/30 p-4"><div className="flex gap-3"><Shield className="h-5 w-5 text-yellow-400"/><div><h3 className="font-semibold text-yellow-300">Safety Tips</h3><ul className="text-sm text-yellow-200"><li>• Save these numbers in your phone</li><li>• Teach your child how to contact</li><li>• Keep your contact info updated</li></ul></div></div></div>
      {contacts?.schoolInfo && (<div className="bg-black/40 rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2"><Building className="h-5 w-5"/> School Contacts</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3"><div className="p-3 border border-cyan-500/20 rounded"><div className="font-bold text-white">{contacts.schoolInfo.name}</div>{contacts.schoolInfo.contactPhone && <div><Phone className="h-3 w-3 inline mr-1"/> {contacts.schoolInfo.contactPhone}</div>}{contacts.schoolInfo.contactEmail && <div><Mail className="h-3 w-3 inline mr-1"/> {contacts.schoolInfo.contactEmail}</div>}</div>{contacts.teacher && <ContactCard c={{name:`${contacts.teacher.firstName} ${contacts.teacher.lastName}`, role:"Class Teacher", phone:contacts.teacher.phone, email:contacts.teacher.email}} icon={Users} bg="bg-green-500" border="border-green-500/30"/>}{contacts.director && <ContactCard c={{name:`${contacts.director.firstName} ${contacts.director.lastName}`, role:"Director", phone:contacts.director.phone, email:contacts.director.email}} icon={Shield} bg="bg-purple-500" border="border-purple-500/30"/>}</div></div>)}
      {contacts?.emergencyContacts?.length>0 && (<div className="bg-black/40 rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300">School Emergency Contacts</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">{contacts.emergencyContacts.map((c,i)=><ContactCard key={i} c={c} icon={Users} bg="bg-orange-500" border="border-orange-500/30"/>)}</div></div>)}
      <div className="bg-black/40 rounded-2xl border border-cyan-500/30 p-5"><h3 className="text-lg font-semibold text-cyan-300">Government Helplines</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">{govt.map(g=><ContactCard c={g} icon={Shield} bg="bg-red-500" border="border-red-500/30"/>)}</div></div>
    </div>
  );
};

export default EmergencyContacts;