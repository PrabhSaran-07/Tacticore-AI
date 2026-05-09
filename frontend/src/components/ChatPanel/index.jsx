import { useState, useRef, useEffect } from 'react';
import socket from '../../services/socket';

export default function ChatPanel({ roomId = 'room-1' }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'AI Command', message: 'Tactical analysis ready. All units report ready status.', timestamp: '14:32', type: 'ai' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
    };
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = {
        id: Date.now(),
        sender: 'You', // In a real app, this would be the logged-in user's name
        message: input,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'user',
        roomId
      };
      
      // We still update local state optimistically, or we could just rely on the server bouncing it back.
      // Let's rely on the server broadcasting to 'room-1', but in our server code io.to(roomId) broadcasts to ALL in room.
      socket.emit('message', newMessage);
      setInput('');
    }
  };

  return (
    <div className="card flex flex-col h-full">
      <div className="card-header">
        <h3 className="card-title flex items-center gap-2">
          <span>💬</span> Team Comms
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-64 pr-2" style={{ display: 'flex', flexDirection: 'column' }}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.sender === 'AI Command' ? 'flex-row' : (msg.sender === 'You' ? 'flex-row-reverse' : 'flex-row')}`} style={{ display: 'flex', gap: '0.75rem', flexDirection: msg.sender === 'You' ? 'row-reverse' : 'row' }}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.sender === 'AI Command' ? 'bg-blue-600' : 'bg-green-600'
            }`} style={{ width: '2rem', height: '2rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.sender === 'AI Command' ? 'var(--primary)' : 'var(--success)' }}>
              <span>{msg.sender === 'AI Command' ? '🤖' : '👤'}</span>
            </div>
            <div className={`flex-1 ${msg.sender === 'You' ? 'text-right' : 'text-left'}`} style={{ flex: 1, textAlign: msg.sender === 'You' ? 'right' : 'left' }}>
              <p className="text-xs text-slate-400" style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{msg.sender} - {msg.timestamp}</p>
              <div className={`inline-block px-3 py-2 rounded-lg ${
                msg.sender === 'AI Command' 
                  ? 'bg-slate-800 text-slate-100' 
                  : 'bg-blue-600 text-white'
              }`} style={{ display: 'inline-block', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', background: msg.sender === 'You' ? 'var(--primary)' : 'var(--gray-800)', color: 'white' }}>
                <p className="text-sm" style={{ fontSize: '0.875rem' }}>{msg.message}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Enter message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="input flex-1"
          style={{ flex: 1 }}
        />
        <button onClick={handleSend} className="btn btn-primary btn-sm">
          Send
        </button>
      </div>
    </div>
  );
}
