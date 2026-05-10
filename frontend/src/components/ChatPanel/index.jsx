import { useState, useRef, useEffect } from 'react';
import socket from '../../services/socket';

export default function ChatPanel({ roomId = '', user }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'System', message: 'Group channel is active. Discuss your plan here.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'system', chestNo: null },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const chestNo = user?.chestNo || null;
  const senderName = chestNo ? `${chestNo} - ${user?.name || ''}` : (user?.name || 'Instructor');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on('message', handleMessage);
    return () => { socket.off('message', handleMessage); };
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = {
        id: Date.now(),
        sender: senderName,
        chestNo,
        userId: user?._id,
        message: input,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: user?.role === 'accessor' ? 'instructor' : 'user',
        roomId
      };

      socket.emit('message', newMessage);
      setInput('');
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ borderBottom: '1px solid var(--gray-800)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--gray-100)' }}>
          💬 Group Discussion
        </h3>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '200px', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.25rem' }}>
        {messages.map(msg => {
          const isMe = msg.userId === user?._id;
          const isSystem = msg.type === 'system';
          const isInstructor = msg.type === 'instructor';

          return (
            <div key={msg.id} style={{ display: 'flex', gap: '0.5rem', flexDirection: isMe ? 'row-reverse' : 'row' }}>
              {/* Avatar */}
              <div style={{
                width: '1.75rem', height: '1.75rem', borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem',
                background: isSystem ? 'var(--gray-700)' : isInstructor ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, var(--primary), #1d4ed8)',
                color: 'white', fontWeight: 'bold'
              }}>
                {isSystem ? '📋' : isInstructor ? '👨‍✈' : (msg.chestNo || '?')}
              </div>
              {/* Message */}
              <div style={{ flex: 1, textAlign: isMe ? 'right' : 'left' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--gray-500)', marginBottom: '0.15rem' }}>
                  {msg.sender} · {msg.timestamp}
                </p>
                <div style={{
                  display: 'inline-block', padding: '0.4rem 0.65rem', borderRadius: '0.4rem', maxWidth: '85%',
                  background: isSystem ? 'var(--gray-800)' : isInstructor ? 'rgba(245,158,11,0.15)' : isMe ? 'var(--primary)' : 'var(--gray-800)',
                  color: isInstructor ? 'var(--warning)' : 'white', textAlign: 'left',
                  border: isInstructor ? '1px solid rgba(245,158,11,0.3)' : 'none'
                }}>
                  <p style={{ fontSize: '0.825rem' }}>{msg.message}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="input"
          style={{ flex: 1 }}
        />
        <button onClick={handleSend} className="btn btn-primary btn-sm">Send</button>
      </div>
    </div>
  );
}
