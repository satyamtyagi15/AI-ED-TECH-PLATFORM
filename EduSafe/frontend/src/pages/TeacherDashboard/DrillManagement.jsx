import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { Plus, AlertTriangle, Clock, X, Save, CheckCircle, Trash2 } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const DrillManagement = () => {
  const [drills, setDrills] = useState([]);
  const [students, setStudents] = useState([]);
  const [showDrillForm, setShowDrillForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDrill, setNewDrill] = useState({ title: "", description: "", scheduledDate: "", participants: [] });
  const { user } = useSelector((state) => state.auth);

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [drillsRes, studentsRes] = await Promise.all([api.get(`/teachers/${user._id}/drills`), api.get(`/teachers/${user._id}/students`)]);
      setDrills(drillsRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDrillSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/drills`, newDrill);
      setShowDrillForm(false);
      setNewDrill({ title: "", description: "", scheduledDate: "", participants: [] });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule drill");
    }
  };

  const updateDrillStatus = async (drillId, status) => { try { await api.put(`/drills/${drillId}/status`, { status }); fetchData(); } catch (err) { setError(err.response?.data?.message || "Failed to update"); } };
  const toggleParticipant = (studentId) => { setNewDrill(prev => ({ ...prev, participants: prev.participants.includes(studentId) ? prev.participants.filter(id => id !== studentId) : [...prev.participants, studentId] })); };
  const deleteDrill = async (drillId) => { if(window.confirm("Delete this drill permanently?")) try { await api.delete(`/drills/${drillId}`); fetchData(); } catch(err) { setError(err.response?.data?.message); } };

  if (loading) return <LoadingSpinner text="Loading drills..." />;

  const pendingDrills = drills.filter(d => d.status === "PENDING");
  const completedDrills = drills.filter(d => d.status === "COMPLETED");
  const getStatusInfo = (status) => status === "PENDING" ? { class: "bg-yellow-500/20 text-yellow-300", text: "Pending" } : { class: "bg-green-500/20 text-green-300", text: "Completed" };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between animate-slide-in-left">
        <div><h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Drill Management</h2><p className="text-cyan-300">Schedule and manage safety drills</p></div>
        <button onClick={() => setShowDrillForm(true)} className="btn btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Schedule Drill</button>
      </div>
      {error && <ErrorDisplay error={error} onRetry={fetchData} />}
      {showDrillForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"><div className="bg-black/90 rounded-2xl border border-cyan-500/30 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"><div className="flex justify-between mb-4"><h3 className="text-xl font-semibold text-cyan-300">Schedule New Drill</h3><button onClick={() => setShowDrillForm(false)} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button></div><form onSubmit={handleDrillSubmit} className="space-y-4"><div><label className="text-cyan-300">Drill Title</label><input type="text" value={newDrill.title} onChange={(e) => setNewDrill({ ...newDrill, title: e.target.value })} className="form-input" required /></div><div><label className="text-cyan-300">Description</label><textarea value={newDrill.description} onChange={(e) => setNewDrill({ ...newDrill, description: e.target.value })} className="form-input" rows="3" /></div><div><label className="text-cyan-300">Scheduled Date & Time</label><input type="datetime-local" value={newDrill.scheduledDate} onChange={(e) => setNewDrill({ ...newDrill, scheduledDate: e.target.value })} className="form-input" required /></div><div><label className="text-cyan-300 mb-2 block">Participants</label><div className="border border-cyan-500/30 rounded-lg p-3 max-h-48 overflow-y-auto">{students.map(s => (<label key={s._id} className="flex items-center space-x-3 p-2 hover:bg-cyan-500/10 rounded"><input type="checkbox" checked={newDrill.participants.includes(s._id)} onChange={() => toggleParticipant(s._id)} className="rounded border-cyan-500" /><span className="text-white">{s.firstName} {s.lastName} ({s.grade})</span></label>))}{students.length===0 && <p className="text-gray-400 text-center">No students</p>}</div></div><div className="flex justify-end space-x-3"><button type="button" onClick={() => setShowDrillForm(false)} className="btn btn-outline">Cancel</button><button type="submit" className="btn btn-primary"><Save className="h-4 w-4 mr-2" /> Schedule</button></div></form></div></div>
      )}

      {/* Pending Drills */}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5">
        <h3 className="text-lg font-semibold text-cyan-300 mb-4">Pending Drills ({pendingDrills.length})</h3>
        <div className="space-y-4">
          {pendingDrills.map(drill => (
            <div key={drill._id} className="border border-cyan-500/20 rounded-lg p-4 relative">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg"><AlertTriangle className="h-5 w-5 text-orange-400" /></div>
                  <div><h4 className="font-semibold text-white">{drill.title}</h4><p className="text-gray-300">{drill.description}</p></div>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusInfo(drill.status).class}`}>{getStatusInfo(drill.status).text}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(drill.scheduledDate).toLocaleString()}</div>
                <span>{drill.participants?.length || 0} participants</span>
              </div>
              <div className="flex space-x-2 mt-3">
                <button onClick={() => updateDrillStatus(drill._id, "COMPLETED")} className="btn btn-success text-sm"><CheckCircle className="h-4 w-4 mr-1" /> Mark Complete</button>
                <button onClick={() => deleteDrill(drill._id)} className="btn btn-danger text-sm">Cancel</button>
              </div>
            </div>
          ))}
          {pendingDrills.length===0 && <div className="text-center py-8 text-gray-400"><AlertTriangle className="h-16 w-16 mx-auto mb-3 opacity-50" /><p>No pending drills</p></div>}
        </div>
      </div>

      {/* Completed Drills with Delete Button */}
      {completedDrills.length > 0 && (
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">Completed Drills ({completedDrills.length})</h3>
          <div className="space-y-3">
            {completedDrills.map(drill => (
              <div key={drill._id} className="flex justify-between items-center p-3 border border-cyan-500/20 rounded-lg">
                <div>
                  <h4 className="text-white">{drill.title}</h4>
                  <p className="text-sm text-gray-400">Completed: {new Date(drill.updatedAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusInfo(drill.status).class}`}>{getStatusInfo(drill.status).text}</span>
                <button onClick={() => deleteDrill(drill._id)} className="text-red-400 hover:text-red-300 transition" title="Delete Drill">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DrillManagement;