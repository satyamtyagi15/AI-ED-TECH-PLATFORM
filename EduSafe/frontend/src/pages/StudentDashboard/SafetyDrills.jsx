import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../../utils/api';
import { AlertTriangle, Clock, CheckCircle, Play, Calendar } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';

const SafetyDrills = () => {
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participatingDrillId, setParticipatingDrillId] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => { if (user) fetchDrills(); }, [user]);

  const fetchDrills = async () => {
    try {
      setLoading(true);
      const res = await api.get('/drills');
      setDrills(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const participateInDrill = async (drillId) => {
    setParticipatingDrillId(drillId);
    try {
      const response = await api.post(`/drills/${drillId}/participate`, { studentId: user._id });
      if (response.status === 200 || response.status === 201) {
        // Refresh drills to get updated participant list
        await fetchDrills();
        alert('✅ Participation recorded! You are now marked as participating.');
      } else {
        throw new Error('Unexpected response');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert(`❌ ${msg}`);
      setError(msg);
    } finally {
      setParticipatingDrillId(null);
    }
  };

  const getDrillStatus = (drill) => {
    const now = new Date();
    const scheduled = new Date(drill.scheduledDate);
    if (drill.status === 'COMPLETED') return 'completed';
    if (now > scheduled) return 'missed';
    const minutesDiff = (scheduled - now) / (1000 * 60);
    if (minutesDiff <= 30) return 'starting-soon';
    return 'scheduled';
  };

  const getStatusColor = (status) => ({
    completed: "bg-green-500/20 text-green-300",
    "starting-soon": "bg-orange-500/20 text-orange-300",
    missed: "bg-red-500/20 text-red-300",
    scheduled: "bg-gray-500/20 text-gray-300"
  }[status] || "bg-gray-500/20 text-gray-300");

  const getStatusText = (status) => ({
    completed: "Completed",
    "starting-soon": "Starting Soon",
    missed: "Missed",
    scheduled: "Scheduled"
  }[status] || status);

  if (loading) return <LoadingSpinner text="Loading safety drills..." />;

  const upcoming = drills.filter(d => {
    const status = getDrillStatus(d);
    return status === 'scheduled' || status === 'starting-soon';
  });
  const past = drills.filter(d => {
    const status = getDrillStatus(d);
    return status === 'completed' || status === 'missed';
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Safety Drills</h2><p className="text-cyan-300">Emergency preparedness drills</p></div>
        <div><p className="text-cyan-300 text-sm">Participation</p><p className="text-2xl font-bold text-white">{drills.filter(d => d.participants?.some(p => p._id === user._id)).length}/{drills.length}</p></div>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchDrills} />}

      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-yellow-500/30 p-4 bg-yellow-500/10">
        <div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5"/><div><h3 className="font-semibold text-yellow-300">Safety Instructions</h3><ul className="text-sm text-yellow-200 space-y-1"><li>• Follow teacher's instructions</li><li>• Stay calm, move to safe areas</li><li>• Silence devices, remain quiet</li><li>• Wait for "all clear" signal</li></ul></div></div>
      </div>

      {/* Upcoming Drills */}
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5">
        <h3 className="text-lg font-semibold text-cyan-300 mb-4">Upcoming Drills ({upcoming.length})</h3>
        <div className="space-y-4">
          {upcoming.map(drill => {
            const status = getDrillStatus(drill);
            const isParticipant = drill.participants?.some(p => p._id === user._id);
            return (
              <div key={drill._id} className="border border-cyan-500/20 rounded-lg p-4">
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-orange-500/20 rounded"><AlertTriangle className="h-5 w-5 text-orange-400" /></div>
                    <div><h4 className="font-semibold text-white">{drill.title}</h4><p className="text-gray-300 text-sm">{drill.description}</p></div>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(status)}`}>{getStatusText(status)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(drill.scheduledDate).toLocaleDateString()}</div>
                  <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(drill.scheduledDate).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-400">{drill.participants?.length || 0} participants</span>
                  {!isParticipant && (
                    <button
                      onClick={() => participateInDrill(drill._id)}
                      disabled={participatingDrillId === drill._id}
                      className="btn btn-primary text-sm flex items-center gap-1"
                    >
                      {participatingDrillId === drill._id ? 'Submitting...' : <><Play className="h-4 w-4" /> Participate</>}
                    </button>
                  )}
                  {isParticipant && <span className="text-green-400 text-sm"><CheckCircle className="h-4 w-4 inline mr-1" /> Participating</span>}
                  {status === 'starting-soon' && !isParticipant && <span className="text-orange-400 text-sm">Starting in 30 min</span>}
                </div>
              </div>
            );
          })}
          {upcoming.length === 0 && <div className="text-center py-8 text-gray-400"><CheckCircle className="h-16 w-16 mx-auto mb-3 opacity-50" /><p>No upcoming drills</p></div>}
        </div>
      </div>

      {/* Past Drills */}
      {past.length > 0 && (
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">Drill History ({past.length})</h3>
          <div className="space-y-3">
            {past.map(drill => {
              const status = getDrillStatus(drill);
              const isParticipant = drill.participants?.some(p => p._id === user._id);
              return (
                <div key={drill._id} className="flex justify-between items-center p-3 border-b border-cyan-500/20">
                  <div><h4 className="text-white">{drill.title}</h4><div className="text-sm text-gray-400">{new Date(drill.scheduledDate).toLocaleDateString()}</div></div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(status)}`}>{getStatusText(status)}</span>
                  <span className={isParticipant ? "text-green-400" : "text-red-400"}>{isParticipant ? "Participated" : "Missed"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drill Participation Stats */}
      {drills.length > 0 && (
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">Drill Participation</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-500/20 rounded"><div className="text-2xl font-bold text-blue-300">{drills.length}</div><div className="text-sm">Total Drills</div></div>
            <div className="text-center p-3 bg-green-500/20 rounded"><div className="text-2xl font-bold text-green-300">{drills.filter(d => d.participants?.some(p => p._id === user._id)).length}</div><div className="text-sm">Participated</div></div>
            <div className="text-center p-3 bg-purple-500/20 rounded"><div className="text-2xl font-bold text-purple-300">{drills.length ? Math.round((drills.filter(d => d.participants?.some(p => p._id === user._id)).length / drills.length) * 100) : 0}%</div><div className="text-sm">Rate</div></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyDrills;