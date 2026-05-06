import { useState, useEffect, useRef } from 'react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    try {
      const url = conversationId ? `http://localhost:8080/api/ai/chat?conversationId=${conversationId}` : 'http://localhost:8080/api/ai/chat';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: currentMessage }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div className="flex flex-col h-[600px] bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/30 overflow-hidden shadow-neon-cyan">
      <div className="bg-gradient-to-r from-cyan-600 to-purple-600 p-4">
        <h2 className="text-xl font-bold text-white">🤖 EduSafe AI Assistant</h2>
        <p className="text-sm text-cyan-100">Ask me about safety, quizzes, or emergencies!</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p>👋 Hi! I'm your EduSafe AI Assistant.</p>
            <p className="text-sm mt-2">Ask me about:</p>
            <ul className="text-sm mt-1 space-y-1"><li>• Fire drill procedures</li><li>• Online safety tips</li><li>• Quiz questions</li><li>• Earthquake response</li></ul>
          </div>
        )}
        {messages.map((msg,i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none' : 'bg-gray-800 border border-cyan-500/30 text-gray-100 rounded-bl-none'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && <div className="flex justify-start"><div className="bg-gray-800 border border-cyan-500/30 p-3 rounded-lg"><div className="flex space-x-1"><div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150"></div></div></div></div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-cyan-500/30 p-4 bg-black/60">
        <div className="flex space-x-2">
          <textarea value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your message..." className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white resize-none" rows="2" />
          <button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()} className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg hover:shadow-neon-cyan transition-all disabled:opacity-50">{isLoading ? 'Thinking...' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;