import { useState, useRef, useEffect } from 'react';

export default function ChatPanel() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'AI Command', message: 'Tactical analysis ready. All units report ready status.', timestamp: '14:32', type: 'ai' },
    { id: 2, sender: 'Lieutenant Adams', message: 'Alpha Squad in position', timestamp: '14:33', type: 'user' },
    { id: 3, sender: 'AI Command', message: 'Optimal approach vector calculated. Engage at signal.', timestamp: '14:34', type: 'ai' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        sender: 'You',
        message: input,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'user'
      }]);
      
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          sender: 'AI Command',
          message: 'Response simulated. Standing by for next command.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'ai'
        }]);
      }, 500);

      setInput('');
    }
  };

  return (
    <div className="card flex flex-col h-full">
      <div className="card-header">
        <h3 className="card-title flex items-center gap-2">
          <span>💬</span> AI Command Channel
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-64 pr-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.type === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.type === 'ai' ? 'bg-blue-600' : 'bg-green-600'
            }`}>
              <span>{msg.type === 'ai' ? '🤖' : '👤'}</span>
            </div>
            <div className={`flex-1 ${msg.type === 'ai' ? 'text-left' : 'text-right'}`}>
              <p className="text-xs text-slate-400">{msg.sender} - {msg.timestamp}</p>
              <div className={`inline-block px-3 py-2 rounded-lg ${
                msg.type === 'ai' 
                  ? 'bg-slate-800 text-slate-100' 
                  : 'bg-blue-600 text-white'
              }`}>
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter command..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="input flex-1"
        />
        <button onClick={handleSend} className="btn btn-primary btn-sm">
          Send
        </button>
      </div>
    </div>
  );
}
