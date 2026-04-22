import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supportAPI } from '../services/api';
import { HelpCircle, Plus, Send, CheckCircle, Clock } from 'lucide-react';

export default function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await supportAPI.getMy();
      setTickets(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supportAPI.create(newTicket);
      setNewTicket({ subject: '', description: '' });
      setShowForm(false);
      fetchTickets();
    } catch (e) {
      alert('Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[900px] mx-auto px-5 min-h-[calc(100vh-72px)] py-8">
      <div className="flex justify-between items-center mb-8 animate-fade-in">
        <div>
          <h1 className="text-[1.8rem] font-[800] mb-1 text-gray-900 flex items-center gap-2">
            <HelpCircle size={28} /> Help & Support
          </h1>
          <p className="text-gray-500">Need help? Submit a ticket and our team will get back to you.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="inline-flex items-center gap-2 px-4 py-2 text-[0.85rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all"
        >
          {showForm ? 'Cancel' : <><Plus size={16} /> New Ticket</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8 animate-fade-in">
          <h3 className="font-[700] mb-4 text-gray-900">Create a New Ticket</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.85rem] font-medium text-gray-500 mb-1.5">Subject</label>
              <input 
                type="text" 
                required 
                value={newTicket.subject} 
                onChange={e => setNewTicket({...newTicket, subject: e.target.value})} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] outline-none focus:bg-white focus:border-black focus:ring-[3px] focus:ring-black/5 transition-all" 
                placeholder="What do you need help with?"
              />
            </div>
            <div>
              <label className="block text-[0.85rem] font-medium text-gray-500 mb-1.5">Description</label>
              <textarea 
                required 
                rows="4" 
                value={newTicket.description} 
                onChange={e => setNewTicket({...newTicket, description: e.target.value})} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] outline-none focus:bg-white focus:border-black focus:ring-[3px] focus:ring-black/5 transition-all resize-none" 
                placeholder="Please describe your issue in detail..."
              />
            </div>
            <button 
              type="submit" 
              disabled={submitting} 
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 mt-2 text-[0.95rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all disabled:opacity-70"
            >
              <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {tickets.length === 0 && !showForm ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm text-center py-16 px-5 flex flex-col items-center animate-fade-in">
            <HelpCircle size={48} className="text-gray-300 mb-3" />
            <p className="text-gray-500">You don't have any support tickets yet.</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <div key={ticket.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
              <div className="p-5 border-b border-gray-100 flex justify-between items-start gap-4 bg-gray-50/50">
                <div>
                  <h3 className="font-[700] text-[1.1rem] text-gray-900 mb-1">{ticket.subject}</h3>
                  <div className="text-[0.8rem] text-gray-500 flex items-center gap-2">
                    <span>Ticket #{ticket.id}</span>
                    <span>•</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-wider ${ticket.status === 'resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {ticket.status === 'resolved' ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {ticket.status}
                </span>
              </div>
              <div className="p-5">
                <p className="text-gray-700 text-[0.95rem] whitespace-pre-wrap">{ticket.description}</p>
                
                {ticket.adminReply && (
                  <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="font-[700] text-[0.85rem] text-blue-800 mb-2 uppercase tracking-wide">Support Team Reply</div>
                    <p className="text-blue-900 text-[0.95rem] whitespace-pre-wrap">{ticket.adminReply}</p>
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
