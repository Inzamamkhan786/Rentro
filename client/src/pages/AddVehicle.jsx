import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI } from '../services/api';
import { ArrowLeft, Car, Plus, MapPin, Image as ImageIcon, X } from 'lucide-react';

export default function AddVehicle() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', type: 'car', brand: '', model: '', year: new Date().getFullYear(),
    pricePerHour: '', pricePerDay: '', description: '',
    fuel: '', seats: '', transmission: '',
    flatName: '', street: '', address1: '', address2: '', landmark: '', area: '', pincode: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      return setError('You can only upload up to 10 images');
    }
    
    setImages(prev => [...prev, ...files]);
    
    // Generate previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      let uploadedImageUrls = [];
      
      // Upload images first if any exist
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(img => formData.append('images', img));
        const res = await vehicleAPI.uploadImages(formData);
        uploadedImageUrls = res.data.urls;
      }

      const fullLocation = [
        form.flatName, form.street, form.address1, form.address2, form.landmark, form.area, form.pincode
      ].filter(Boolean).join(', ');

      const data = {
        title: form.title, type: form.type, brand: form.brand, model: form.model,
        year: parseInt(form.year), pricePerHour: parseFloat(form.pricePerHour),
        pricePerDay: parseFloat(form.pricePerDay), location: fullLocation,
        images: uploadedImageUrls,
        specs: {},
      };
      if (form.description) data.description = form.description;
      if (form.fuel) data.specs.fuel = form.fuel;
      if (form.seats) data.specs.seats = parseInt(form.seats);
      if (form.transmission) data.specs.transmission = form.transmission;
      
      await vehicleAPI.create(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create vehicle');
    } finally { setLoading(false); }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] transition-all outline-none focus:border-black focus:ring-[3px] focus:ring-black/5 placeholder-gray-400";
  const selectClass = `${inputClass} appearance-none bg-no-repeat cursor-pointer`;
  const labelClass = "text-[0.85rem] font-medium text-gray-500 tracking-[0.02em]";

  return (
    <div className="w-full max-w-[720px] mx-auto px-5 min-h-[calc(100vh-72px)] py-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center justify-center gap-2 px-4 py-2 mb-6 text-[0.85rem] font-semibold rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors animate-fade-in">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm animate-fade-in px-8 py-9">
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
            <Plus size={22} className="text-gray-900" />
          </div>
          <div>
            <h1 className="text-[1.4rem] font-[800] text-gray-900">List a <span className="text-black font-black">Vehicle</span></h1>
            <p className="text-[0.85rem] text-gray-500">Fill in the details to list your vehicle on Rentora</p>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-red-500 text-[0.85rem]">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Vehicle Title *</label>
            <input className={inputClass} placeholder="e.g. Toyota Camry 2024 - Premium Sedan" value={form.title} onChange={update('title')} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Type *</label>
              <select className={selectClass} style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%2394a3b8\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E")', backgroundPosition: 'right 16px center' }} value={form.type} onChange={update('type')}>
                <option value="car">🚗 Car</option>
                <option value="bike">🏍️ Bike</option>
                <option value="scooter">🛵 Scooter</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Year *</label>
              <input type="number" className={inputClass} value={form.year} onChange={update('year')} min="1990" max="2030" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Brand *</label>
              <input className={inputClass} placeholder="e.g. Toyota" value={form.brand} onChange={update('brand')} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Model *</label>
              <input className={inputClass} placeholder="e.g. Camry" value={form.model} onChange={update('model')} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Price per Hour (₹) *</label>
              <input type="number" className={inputClass} placeholder="100" value={form.pricePerHour} onChange={update('pricePerHour')} required min="1" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Price per Day (₹) *</label>
              <input type="number" className={inputClass} placeholder="1500" value={form.pricePerDay} onChange={update('pricePerDay')} required min="1" />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-5 mt-1">
            <h3 className="text-[0.95rem] font-[700] mb-4 text-gray-500 flex items-center gap-1.5"><MapPin size={16}/> Detailed Location *</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Flat / Home Name *</label>
                <input className={inputClass} placeholder="e.g. Flat 101, Galaxy Apts" value={form.flatName} onChange={update('flatName')} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Street Name *</label>
                <input className={inputClass} placeholder="e.g. MG Road" value={form.street} onChange={update('street')} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Address Line 1 *</label>
                <input className={inputClass} placeholder="e.g. Near City Center Mall" value={form.address1} onChange={update('address1')} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Address Line 2 (Optional)</label>
                <input className={inputClass} placeholder="e.g. Sector 45" value={form.address2} onChange={update('address2')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Area / City *</label>
                <input className={inputClass} placeholder="e.g. Andheri West, Mumbai" value={form.area} onChange={update('area')} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Pincode *</label>
                <input type="text" className={inputClass} placeholder="e.g. 400053" value={form.pincode} onChange={update('pincode')} required />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-4">
              <label className={labelClass}>Landmark</label>
              <input className={inputClass} placeholder="e.g. Opp. Metro Pillar 50" value={form.landmark} onChange={update('landmark')} />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-5 mt-1">
            <h3 className="text-[0.95rem] font-[700] mb-4 text-gray-500">Specifications (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Fuel</label>
                <select className={selectClass} style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%2394a3b8\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E")', backgroundPosition: 'right 16px center' }} value={form.fuel} onChange={update('fuel')}>
                  <option value="">Select</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Seats</label>
                <input type="number" className={inputClass} placeholder="5" value={form.seats} onChange={update('seats')} min="1" max="50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Transmission</label>
                <select className={selectClass} style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'%2394a3b8\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M8 11L3 6h10z\'/%3E%3C/svg%3E")', backgroundPosition: 'right 16px center' }} value={form.transmission} onChange={update('transmission')}>
                  <option value="">Select</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-5 mt-1">
            <h3 className="text-[0.95rem] font-[700] mb-4 text-gray-500 flex items-center gap-1.5"><ImageIcon size={16}/> Vehicle Images (Optional)</h3>
            <div className="flex flex-col gap-4">
              <input 
                type="file" 
                multiple 
                accept="image/jpeg,image/png,image/webp" 
                onChange={handleImageChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-[0.95rem] transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:border-gray-200 file:border file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"
              />
              <div className="text-[0.75rem] text-gray-500 -mt-2">Upload up to 10 images (JPG, PNG, WEBP). First image will be the thumbnail.</div>
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-2">
                  {imagePreviews.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(index)}
                        className="absolute top-1.5 right-1.5 bg-white text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 w-full px-9 py-4 mt-4 text-[1.05rem] font-semibold rounded-lg text-white bg-black hover:bg-gray-800 shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
            {loading ? <span className="w-5 h-5 border-[3px] border-gray-500 border-t-white rounded-full animate-spin" /> : <><Car size={18} /> List Vehicle</>}
          </button>
        </form>
      </div>
    </div>
  );
}
