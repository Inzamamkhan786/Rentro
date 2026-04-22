import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Send, User } from 'lucide-react';

export default function BookingChatModal({ booking, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await chatAPI.getMessages(booking.id);
      setMessages(res.data || []);
    } catch (e) {
      console.error('Failed to fetch messages', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [booking.id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const content = newMessage;
    setNewMessage(''); // optimistic clear
    
    // Optimistic UI update
    const optimisticMsg = {
      id: Date.now(),
      content,
      senderId: user.id,
      sender: user,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await chatAPI.sendMessage(booking.id, { content });
      fetchMessages(); // refresh to get real ID and any other new messages
    } catch (e) {
      alert('Failed to send message');
      fetchMessages(); // revert optimistic update on failure
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[500px] h-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/80">
          <div>
            <h3 className="font-[800] text-gray-900 flex items-center gap-2 text-lg">
              Chat
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Booking #{booking.id} • {booking.vehicle?.title}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-white">
          {loading ? (
            <div className="flex-1 flex justify-center items-center">
              <div className="w-6 h-6 border-[3px] border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center text-gray-400">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                <User size={20} className="text-gray-300" />
              </div>
              <p className="text-[0.9rem]">No messages yet.</p>
              <p className="text-[0.8rem] text-center mt-1 max-w-[250px]">
                Start the conversation to share contact details and coordinate pickup.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderId === user.id;
              const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);
              
              return (
                <div key={msg.id} className={`flex gap-2 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                  {/* Avatar for other person */}
                  {!isMe && (
                    <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center mt-auto mb-1">
                      {showAvatar ? (
                        <span className="text-[10px] font-bold text-gray-600">{msg.sender?.name?.charAt(0).toUpperCase()}</span>
                      ) : null}
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {showAvatar && (
                      <span className="text-[0.7rem] text-gray-400 ml-1 mb-0.5">{msg.sender?.name}</span>
                    )}
                    <div 
                      className={`px-4 py-2.5 rounded-2xl text-[0.95rem] ${
                        isMe 
                          ? 'bg-black text-white rounded-br-sm' 
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm border border-gray-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[0.65rem] text-gray-400 mt-1 mx-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-[0.95rem] outline-none focus:bg-white focus:border-black focus:ring-[3px] focus:ring-black/5 transition-all"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} className="ml-[-2px] mt-[1px]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
