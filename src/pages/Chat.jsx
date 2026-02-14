import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const Chat = () => {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  const fetchChat = async () => {
    try {
      const res = await api.get('/chat');
      setMsgs(res.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 3000); // Auto refresh tiap 3 detik
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = async (e) => {
    e.preventDefault();
    if(!text.trim()) return;
    await api.post('/chat', { message: text });
    setText('');
    fetchChat();
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded shadow">
      <div className="p-4 border-b bg-blue-600 text-white font-bold flex items-center">
        <MessageSquare className="mr-2" /> Group Chat
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {msgs.map((m) => (
          <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs p-3 rounded-lg ${m.sender_id === user.id ? 'bg-blue-500 text-white' : 'bg-white border text-gray-800'}`}>
              <div className="text-xs opacity-75 mb-1">{m.sender_name}</div>
              <div>{m.message}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="p-4 border-t flex gap-2">
        <input className="flex-1 border rounded p-2" value={text} onChange={e=>setText(e.target.value)} placeholder="Tulis pesan..." />
        <button className="bg-blue-600 text-white p-2 rounded"><Send /></button>
      </form>
    </div>
  );
};
export default Chat;
