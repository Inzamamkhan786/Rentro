import { useState, useEffect } from 'react';
import { supportAPI } from '../services/api';
import { AlertCircle, CheckCircle, Clock, Send } from 'lucide-react';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await supportAPI.getAll();
      setTickets(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return alert('Please enter a reply');
    setSubmitting(true);
    try {
      await supportAPI.reply(id, { adminReply: replyText, status: 'resolved' });
      setReplyingId(null);
      setReplyText('');
      fetchTickets();
    } catch (e) {
      alert('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[1000px] mx-auto px-5 min-h-[calc(100vh-72px)] py-8">
      <div className="animate-fade-in mb-8">
        <h1 className="text-[1.8rem] font-[800] mb-1">
          <span className="text-black font-black">Support Tickets</span>
        </h1>
        <p className="text-gray-500">
          Review and respond to user help requests.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {tickets.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm text-center py-16 px-5 flex flex-col items-center animate-fade-in">
            <CheckCircle size={48} className="text-emerald-300 mb-3" />
            <h3 className="text-[1.2rem] font-[700] mb-2 text-gray-900">All Caught Up!</h3>
            <p className="text-gray-500">There are no pending support tickets.</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <div key={ticket.id} className={`bg-white border ${ticket.status === 'open' ? 'border-amber-200 shadow-md' : 'border-gray-200 shadow-sm'} rounded-xl overflow-hidden animate-fade-in`}>
              <div className={`p-5 border-b ${ticket.status === 'open' ? 'border-amber-100 bg-amber-50/30' : 'border-gray-100 bg-gray-50/50'} flex justify-between items-start gap-4`}>
                <div>
                  <h3 className="font-[700] text-[1.1rem] text-gray-900 mb-1">{ticket.subject}</h3>
                  <div className="text-[0.8rem] text-gray-500 flex items-center gap-2 flex-wrap">
                    <span>Ticket #{ticket.id}</span>
                    <span>•</span>
                    <span className="font-semibold">{ticket.user?.name} ({ticket.user?.email})</span>
                    <span>•</span>
                    <span className="capitalize">{ticket.user?.role}</span>
                    <span>•</span>
                    <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-wider ${ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-100 text-amber-700'}`}>
                  {ticket.status === 'resolved' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {ticket.status}
                </span>
              </div>
              <div className="p-5">
                <p className="text-gray-700 text-[0.95rem] whitespace-pre-wrap">{ticket.description}</p>
                
                {ticket.adminReply ? (
                  <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="font-[700] text-[0.85rem] text-blue-800 mb-2 uppercase tracking-wide">Your Reply</div>
                    <p className="text-blue-900 text-[0.95rem] whitespace-pre-wrap">{ticket.adminReply}</p>
                  </div>
                ) : (
                  <div className="mt-5">
                    {replyingId === ticket.id ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-fade-in">
                        <textarea 
                          rows="4" 
                          value={replyText} 
                          onChange={e => setReplyText(e.target.value)} 
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] outline-none focus:border-black focus:ring-[3px] focus:ring-black/5 transition-all resize-none mb-3" 
                          placeholder="Type your response here..."
                        />
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => { setReplyingId(null); setReplyText(''); }} 
                            className="px-4 py-2 text-[0.85rem] font-semibold rounded-lg text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleReply(ticket.id)} 
                            disabled={submitting} 
                            className="inline-flex items-center gap-2 px-4 py-2 text-[0.85rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 transition-all disabled:opacity-70"
                          >
                            <Send size={14} /> {submitting ? 'Sending...' : 'Send & Resolve'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setReplyingId(ticket.id); setReplyText(''); }} 
                        className="inline-flex items-center gap-2 px-4 py-2 text-[0.85rem] font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                      >
                        <Send size={14} /> Reply to User
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
