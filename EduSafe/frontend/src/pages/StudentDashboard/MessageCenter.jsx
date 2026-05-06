import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../utils/api";
import { Send, Mail, MailOpen, User, ArrowLeft, Clock, Trash2 } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorDisplay from "../../components/ErrorDisplay";

const MessageCenter = () => {
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("inbox");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState({ receiverId: "", subject: "", message: "" });
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch teachers from the same tenant
      const teachersRes = await api.get('/users?role=teacher');
      // Ensure we have an array
      const teachersList = teachersRes.data || [];
      setTeachers(teachersList);
      console.log("Teachers loaded:", teachersList.length);
      
      const [receivedRes, sentRes] = await Promise.all([
        api.get('/messages?type=received'),
        api.get('/messages?type=sent')
      ]);
      setReceivedMessages(receivedRes.data || []);
      setSentMessages(sentRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (teacherId) => {
    try {
      const response = await api.get(`/messages/conversation/${teacherId}`);
      setConversation(response.data || []);
    } catch (err) {
      console.error("Conversation fetch error:", err);
      setError("Failed to load conversation");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.receiverId) {
      setError("Please select a teacher");
      return;
    }
    try {
      await api.post('/messages', newMessage);
      setNewMessage({ receiverId: "", subject: "", message: "" });
      await fetchData();
      setActiveView("sent");
    } catch (err) {
      console.error("Send error:", err);
      setError(err.response?.data?.message || "Failed to send message");
    }
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      fetchData();
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const deleteMessage = async (messageId, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this message?")) {
      try {
        await api.delete(`/messages/${messageId}`);
        await fetchData();
        if (selectedTeacher) await fetchConversation(selectedTeacher._id);
      } catch (err) {
        setError("Failed to delete message");
      }
    }
  };

  const viewConversation = async (teacher) => {
    setSelectedTeacher(teacher);
    await fetchConversation(teacher._id);
    setActiveView("conversation");
  };

  const getUnreadCount = () => receivedMessages.filter(m => !m.isRead).length;

  if (loading) return <LoadingSpinner text="Loading messages..." />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Message Center</h2>
          <p className="text-cyan-300">Communicate with your teachers</p>
        </div>
        <button onClick={() => setActiveView("compose")} className="btn btn-primary neon-button flex items-center gap-2">
          <Send className="h-4 w-4" /> New Message
        </button>
      </div>

      {error && <ErrorDisplay error={error} onRetry={fetchData} />}

      <div className="border-b border-cyan-500/30">
        <nav className="flex space-x-8">
          {[
            { id: "inbox", label: "Inbox", count: getUnreadCount() },
            { id: "sent", label: "Sent", count: sentMessages.length },
            { id: "compose", label: "Compose", count: 0 }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all ${
                activeView === tab.id ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}>
              <span>{tab.label}</span>
              {tab.count > 0 && <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-300">{tab.count}</span>}
            </button>
          ))}
        </nav>
      </div>

      {activeView === "inbox" && (
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">Messages from Teachers</h3>
          <div className="space-y-3">
            {receivedMessages.map((msg) => (
              <div key={msg._id} className={`border rounded-lg p-4 transition-all cursor-pointer relative ${!msg.isRead ? 'bg-cyan-500/10 border-cyan-500/30' : 'border-cyan-500/20'}`}
                onClick={() => { viewConversation(msg.sender); if (!msg.isRead) markMessageAsRead(msg._id); }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {!msg.isRead && <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>}
                    <User className="h-5 w-5 text-cyan-400" />
                    <div>
                      <h4 className="font-semibold text-white">{msg.sender?.firstName} {msg.sender?.lastName}</h4>
                      <p className="text-cyan-300 text-sm">{msg.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500 flex items-center"><Clock className="h-3 w-3 mr-1" />{msg.isRead ? 'Read' : 'Unread'}</div>
                  </div>
                </div>
                <p className="mt-2 text-gray-300 line-clamp-2">{msg.message}</p>
                <button onClick={(e) => deleteMessage(msg._id, e)} className="absolute top-2 right-2 text-red-400 hover:text-red-300 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {receivedMessages.length === 0 && <div className="text-center py-8 text-gray-400"><Mail className="h-16 w-16 mx-auto mb-3 opacity-50" /><p>No messages from teachers yet</p></div>}
          </div>
        </div>
      )}

      {activeView === "sent" && (
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">Sent Messages</h3>
          <div className="space-y-3">
            {sentMessages.map((msg) => (
              <div key={msg._id} className="border border-cyan-500/20 rounded-lg p-4 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3"><User className="h-5 w-5 text-cyan-400" /><div><h4 className="font-semibold text-white">To: {msg.receiver?.firstName} {msg.receiver?.lastName}</h4><p className="text-cyan-300 text-sm">{msg.subject}</p></div></div>
                  <div className="text-sm text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</div>
                </div>
                <p className="mt-2 text-gray-300">{msg.message}</p>
                <button onClick={(e) => deleteMessage(msg._id, e)} className="absolute top-2 right-2 text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {sentMessages.length === 0 && <div className="text-center py-8 text-gray-400"><Send className="h-16 w-16 mx-auto mb-3 opacity-50" /><p>No sent messages yet</p></div>}
          </div>
        </div>
      )}

      {activeView === "compose" && (
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">Message a Teacher</h3>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="form-label text-cyan-300">To (Teacher)</label>
              <select value={newMessage.receiverId} onChange={(e) => setNewMessage({ ...newMessage, receiverId: e.target.value })} className="form-input" required>
                <option value="">Select a teacher</option>
                {teachers.length === 0 && <option disabled>Loading teachers...</option>}
                {teachers.map(t => (<option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>))}
              </select>
              {teachers.length === 0 && <p className="text-xs text-yellow-400 mt-1">No teachers found. Contact admin.</p>}
            </div>
            <div><label className="form-label text-cyan-300">Subject</label><input type="text" value={newMessage.subject} onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })} className="form-input" placeholder="Enter subject" required /></div>
            <div><label className="form-label text-cyan-300">Message</label><textarea value={newMessage.message} onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })} className="form-input" rows="6" placeholder="Type message" required /></div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setActiveView("inbox")} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary neon-button flex items-center gap-2"><Send className="h-4 w-4" /> Send Message</button>
            </div>
          </form>
        </div>
      )}

      {activeView === "conversation" && selectedTeacher && (
        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-5">
          <div className="flex items-center space-x-3 mb-4">
            <button onClick={() => setActiveView("inbox")} className="btn btn-outline"><ArrowLeft className="h-4 w-4 mr-2" />Back</button>
            <h3 className="text-lg font-semibold text-white">Chat with {selectedTeacher.firstName} {selectedTeacher.lastName}</h3>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto p-2">
            {conversation.map((msg) => (
              <div key={msg._id} className={`p-4 rounded-lg relative ${msg.sender?._id === user._id ? 'bg-cyan-500/20 ml-8' : 'bg-gray-800/50 mr-8'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-white">{msg.sender?._id === user._id ? 'You' : `${msg.sender?.firstName} ${msg.sender?.lastName}`}</span>
                  <span className="text-sm text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-gray-200">{msg.message}</p>
                <button onClick={(e) => deleteMessage(msg._id, e)} className="absolute top-2 right-2 text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            {conversation.length === 0 && <div className="text-center py-8 text-gray-400"><p>No messages in this conversation</p></div>}
          </div>
          <form onSubmit={async (e) => { e.preventDefault(); const formData = new FormData(e.target); const message = formData.get('quickReply'); if (message.trim()) { await api.post('/messages', { receiverId: selectedTeacher._id, subject: `Re: Conversation`, message: message.trim() }); e.target.reset(); await fetchConversation(selectedTeacher._id); await fetchData(); } }} className="mt-4 flex space-x-2">
            <input name="quickReply" type="text" placeholder="Quick reply..." className="form-input flex-1" required />
            <button type="submit" className="btn btn-primary"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MessageCenter;