import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LiveVideoRoom from '../../components/LiveVideoRoom';

const JoinLiveSession = () => {
  const [sessions, setSessions] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const tokenHeader = localStorage.getItem('token');

  useEffect(() => {
    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveSessions = async () => {
    try {
      const res = await axios.get('/api/live-sessions/active', {
        headers: { Authorization: `Bearer ${tokenHeader}` }
      });
      setSessions(res.data.sessions);
    } catch (err) {
      console.error(err);
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
      alert('Cannot join session');
    } finally {
      setLoading(false);
    }
  };

  if (activeRoom && token) {
    return (
      <LiveVideoRoom
        token={token}
        roomName={activeRoom.roomName}
        onLeave={() => { setActiveRoom(null); setToken(null); fetchActiveSessions(); }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Live Classes</h2>
      {loading && <div className="text-center text-emerald-300">Connecting...</div>}
      {!loading && sessions.length === 0 && (
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-8 text-center">
          <p className="text-gray-400">No live classes at the moment.</p>
          <p className="text-sm text-emerald-300 mt-1">Check back later.</p>
        </div>
      )}
      <div className="grid gap-4">
        {sessions.map(s => (
          <div key={s._id} className="bg-black/40 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                <p className="text-emerald-300 text-sm">{s.description}</p>
                <p className="text-xs text-gray-400 mt-1">Host: {s.teacherId?.firstName} {s.teacherId?.lastName}</p>
              </div>
              <button onClick={() => joinSession(s._id, s.roomName)} className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold hover:scale-105 transition">Join</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JoinLiveSession;