import { useState, useEffect, useRef } from 'react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('token');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const url = conversationId 
        ? `http://localhost:8080/api/ai/chat?conversationId=${conversationId}`
        : 'http://localhost:8080/api/ai/chat';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: currentMessage }),
      });

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ ${error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 rounded-lg shadow-lg">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold">🤖 EduSafe AI Assistant</h2>
        <p className="text-sm opacity-90">Ask me anything about safety, quizzes, or emergencies!</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>👋 Hi! I'm your EduSafe AI Assistant.</p>
            <p className="text-sm mt-2">Ask me about:</p>
            <ul className="text-sm mt-1 space-y-1">
              <li>• Emergency procedures during a fire drill</li>
              <li>• How to stay safe online</li>
              <li>• Quiz questions about safety rules</li>
              <li>• What to do in an earthquake</li>
            </ul>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="2"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;