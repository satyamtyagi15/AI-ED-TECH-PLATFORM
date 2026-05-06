import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LiveVideoRoom from '../../components/LiveVideoRoom';
import { Trash2 } from 'lucide-react';

const LiveSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activeRoom, setActiveRoom] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const tokenHeader = localStorage.getItem('token');

  const fetchSessions = async () => {
    try {
      const res = await axios.get('/api/live-sessions/teacher', {
        headers: { Authorization: `Bearer ${tokenHeader}` }
      });
      setSessions(res.data.sessions);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const createSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/live-sessions', { title, description }, {
        headers: { Authorization: `Bearer ${tokenHeader}` }
      });
      setSessions([res.data.session, ...sessions]);
      setShowForm(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      alert('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (sessionId, roomName) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/live-sessions/${sessionId}/token`, {
        headers: { Authorization: `Bearer ${tokenHeader}` }
      });
      setToken(res.data.token);
      setActiveRoom({ roomName, sessionId, title: res.data.sessionTitle });
    } catch (err) {
      alert('Cannot join session now');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (sessionId) => {
    try {
      await axios.put(`/api/live-sessions/${sessionId}/end`, {}, {
        headers: { Authorization: `Bearer ${tokenHeader}` }
      });
      setActiveRoom(null);
      setToken(null);
      fetchSessions();
    } catch (err) {
      alert('Failed to end session');
    }
  };

  const deleteSession = async (sessionId) => {
    if (window.confirm('Permanently delete this session? It will be removed from the list.')) {
      try {
        await axios.delete(`/api/live-sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${tokenHeader}` }
        });
        fetchSessions();
      } catch (err) {
        alert('Failed to delete session');
      }
    }
  };

  if (activeRoom && token) {
    return (
      <LiveVideoRoom
        token={token}
        roomName={activeRoom.roomName}
        onManualLeave={() => {
          endSession(activeRoom.sessionId);
        }}
        onDisconnected={() => {
          endSession(activeRoom.sessionId);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Live Classes</h2>
          <p className="text-emerald-300">Host real‑time video sessions</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold shadow-neon-emerald hover:scale-105 transition">+ New Class</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-6 w-96">
            <h3 className="text-xl font-bold text-emerald-300 mb-4">Create a Live Class</h3>
            <form onSubmit={createSession} className="space-y-4">
              <input type="text" placeholder="Class Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-900/60 border border-emerald-500/50 rounded-xl px-4 py-2 text-white" required />
              <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-900/60 border border-emerald-500/50 rounded-xl px-4 py-2 text-white" rows="3" />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-full bg-gray-700 text-white">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white">{loading ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {sessions.map(s => (
          <div key={s._id} className="bg-black/40 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-5 relative">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                <p className="text-emerald-300 text-sm">{s.description}</p>
                <p className="text-xs text-gray-400 mt-1">Status: <span className={`capitalize ${s.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>{s.status}</span></p>
              </div>
              <div className="flex gap-2">
                {s.status !== 'ended' && (
                  <button onClick={() => joinSession(s._id, s.roomName)} disabled={loading} className="px-4 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition">
                    {s.status === 'active' ? 'Join' : 'Start'}
                  </button>
                )}
                {s.status === 'ended' && (
                  <button
                    onClick={() => deleteSession(s._id)}
                    className="p-2 rounded-full bg-red-600/80 hover:bg-red-700 text-white transition"
                    title="Delete Session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {sessions.length === 0 && <div className="text-center py-10 text-gray-400">No classes scheduled yet.</div>}
      </div>
    </div>
  );
};

export default LiveSessions;