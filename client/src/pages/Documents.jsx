import { useState, useEffect } from 'react';
import { documentAPI } from '../services/api';
import { FileCheck, FileText, Upload, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

const DOC_TYPES = {
  'DL': 'Driving License',
  'RC': 'Registration Certificate',
  'PUC': 'Pollution Under Control',
  'Aadhar': 'Aadhar Card',
  'PAN': 'PAN Card',
  'VoterID': 'Voter ID',
  'RationCard': 'Ration Card'
};

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({});
  const [form, setForm] = useState({ type: 'DL', document: null });

  const fetchDocuments = async () => {
    try {
      const res = await documentAPI.getMy();
      setDocuments(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const hasDL = documents.some(d => d.type === 'DL');
  const hasCitizenship = documents.some(d => ['Aadhar', 'PAN', 'VoterID', 'RationCard'].includes(d.type));

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.document) {
      return setMsg({ type: 'error', text: 'Please select a file to upload.' });
    }
    
    setUploading(true);
    setMsg({});
    
    try {
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('document', form.document);
      
      await documentAPI.upload(formData);
      setMsg({ type: 'success', text: 'Document uploaded successfully!' });
      setForm({ type: 'DL', document: null });
      // Reset file input UI
      const fileInput = document.getElementById('docUpload');
      if (fileInput) fileInput.value = '';
      fetchDocuments();
    } catch (err) {
      const errMsg = err.errors ? err.errors.map(e => e.message).join(', ') : err.message;
      setMsg({ type: 'error', text: errMsg || 'Failed to upload document.' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-[3px] border-gray-200 border-t-black rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[800px] mx-auto px-5 min-h-[calc(100vh-72px)] py-8">
      <div className="animate-fade-in mb-8">
        <h1 className="text-[1.8rem] font-[800] mb-1">
          <span className="text-black font-black">Document Verification</span>
        </h1>
        <p className="text-gray-500">
          Upload your identity and vehicle documents for verification.
        </p>
      </div>

      {/* Requirement Tracker */}
      <div className="bg-white border-y border-r border-l-4 border-l-black border-y-gray-200 border-r-gray-200 rounded-r-xl shadow-sm animate-fade-in p-5 mb-6">
        <h3 className="font-[700] mb-3 flex items-center gap-2 text-gray-900">
          <ShieldAlert size={18} className="text-black" /> Mandatory Requirements
        </h3>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            {hasDL ? <CheckCircle size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-amber-500" />}
            <span className={`font-[600] ${hasDL ? 'text-emerald-500' : 'text-amber-500'}`}>
              1. Driving License
            </span>
          </div>
          <div className="flex items-center gap-3">
            {hasCitizenship ? <CheckCircle size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-amber-500" />}
            <span className={`font-[600] ${hasCitizenship ? 'text-emerald-500' : 'text-amber-500'}`}>
              2. Citizenship Proof (Aadhar, PAN, Voter ID, or Ration Card)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Upload Form */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm animate-fade-in">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="font-[700] flex items-center gap-2 text-gray-900">
              <Upload size={18} /> Upload New Document
            </h3>
          </div>
          <form onSubmit={handleUpload} className="p-6">
            {msg.text && (
              <div className={`border rounded-lg px-4 py-3 mb-5 text-[0.9rem] ${msg.type === 'error' ? 'bg-red-50 border-red-200 text-red-500' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                {msg.text}
              </div>
            )}
            
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[0.85rem] font-medium text-gray-500 tracking-[0.02em]">Document Type</label>
              <select 
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] transition-all outline-none focus:border-black focus:ring-[3px] focus:ring-black/5 appearance-none cursor-pointer" 
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%2394a3b8\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                value={form.type} 
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
              >
                {Object.entries(DOC_TYPES).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5 mb-6">
              <label className="text-[0.85rem] font-medium text-gray-500 tracking-[0.02em]">Upload File</label>
              <input 
                id="docUpload"
                type="file" 
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] transition-all outline-none focus:border-black focus:ring-[3px] focus:ring-black/5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100" 
                onChange={(e) => setForm({ ...form, document: e.target.files[0] })}
                accept="image/jpeg,image/png,image/webp,application/pdf"
                required 
              />
              <div className="text-[0.75rem] text-gray-500 mt-1.5">
                Supported formats: JPG, PNG, WEBP, PDF (Max 5MB)
              </div>
            </div>
            
            <button type="submit" className="inline-flex items-center justify-center gap-2 w-full px-9 py-4 text-[1.05rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </div>

        {/* Document List */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm animate-fade-in stagger-1">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="font-[700] flex items-center gap-2 text-gray-900">
              <FileCheck size={18} /> My Documents
            </h3>
          </div>
          
          <div className="p-6">
            {documents.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <FileText size={32} className="mx-auto mb-3 opacity-50" />
                <p>No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-[10px] bg-white border border-gray-200 flex items-center justify-center">
                        <FileText size={20} className="text-gray-900" />
                      </div>
                      <div>
                        <div className="font-[600] text-[0.95rem] mb-0.5 text-gray-900">{DOC_TYPES[doc.type] || doc.type}</div>
                        <div className="text-[0.75rem] text-gray-500">
                          Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {doc.status === 'pending' && <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-wider"><AlertCircle size={12}/> Pending</span>}
                      {doc.status === 'verified' && <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-wider"><CheckCircle size={12}/> Verified</span>}
                      {doc.status === 'rejected' && <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-wider">Rejected</span>}
                      
                      <a href={`http://localhost:5000${doc.fileUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-[0.75rem] font-semibold rounded-lg text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-500 shadow-sm transition-all hover:-translate-y-[1px]">
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
