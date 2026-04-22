import { useState, useEffect } from 'react';
import { adminAPI, documentAPI } from '../services/api';
import { FileCheck, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const DOC_TYPES = {
  'DL': 'Driving License',
  'RC': 'Registration Certificate',
  'PUC': 'Pollution Under Control',
  'Aadhar': 'Aadhar Card',
  'PAN': 'PAN Card',
  'VoterID': 'Voter ID',
  'RationCard': 'Ration Card'
};

export default function Verifications() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchVerifications = async () => {
    try {
      const res = await adminAPI.getVerifications({ limit: 50 });
      setDocuments(res.data?.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleVerify = async (id, status) => {
    let reason = '';
    if (status === 'rejected') {
      reason = window.prompt('Please enter a reason for rejection:');
      if (!reason) return; // Cancelled
    }

    setProcessingId(id);
    try {
      const payload = { status };
      if (reason) payload.reason = reason;
      await documentAPI.verify(id, payload);
      // Remove from list
      setDocuments(documents.filter(d => d.id !== id));
    } catch (e) {
      alert(e.message || 'Failed to update document status');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[1000px] mx-auto px-5 min-h-[calc(100vh-72px)] py-8">
      <div className="animate-fade-in mb-8">
        <h1 className="text-[1.8rem] font-[800] mb-1">
          <span className="text-black font-black">Pending Verifications</span>
        </h1>
        <p className="text-gray-500">
          Review and approve documents submitted by users.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm animate-fade-in p-6">
        {documents.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500 opacity-50" />
            <h3 className="text-[1.2rem] font-[700] mb-2 text-gray-900">All Caught Up!</h3>
            <p>There are no pending documents to verify at this time.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-5 border border-gray-200 rounded-lg bg-gray-50 gap-4 flex-wrap">
                
                {/* User Info */}
                <div className="flex-1 min-w-[200px]">
                  <div className="text-[0.8rem] text-gray-500 mb-0.5">Submitted By</div>
                  <div className="font-[600] text-gray-900">{doc.user?.name || 'Unknown User'}</div>
                  <div className="text-[0.8rem] text-gray-500">{doc.user?.email}</div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider mt-2 ${doc.user?.role === 'provider' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                    {doc.user?.role}
                  </span>
                </div>

                {/* Doc Info */}
                <div className="flex-1 min-w-[200px]">
                  <div className="text-[0.8rem] text-gray-500 mb-0.5">Document Type</div>
                  <div className="font-[600] flex items-center gap-1.5 text-gray-900">
                    <FileCheck size={16} className="text-gray-400" />
                    {DOC_TYPES[doc.type] || doc.type}
                  </div>
                  <div className="text-[0.8rem] text-gray-500 mt-1">
                    Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <a 
                    href={`http://localhost:5000${doc.fileUrl}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-[0.85rem] font-semibold rounded-lg text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-500 shadow-sm transition-all"
                  >
                    View Document
                  </a>
                  <button 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-[0.85rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all disabled:opacity-50" 
                    onClick={() => handleVerify(doc.id, 'verified')}
                    disabled={processingId === doc.id}
                  >
                    {processingId === doc.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button 
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-[0.85rem] font-semibold rounded-lg text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50" 
                    onClick={() => handleVerify(doc.id, 'rejected')}
                    disabled={processingId === doc.id}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
