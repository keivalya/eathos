import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, X, ArrowRight, Image as ImageIcon } from 'lucide-react';
import EathosLogo from './EathosLogo';
import './FridgeCapture.css';

export default function FridgeCapture({ onPhotosReady }) {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const newPhotos = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({ file: f, url: URL.createObjectURL(f), label: 'Fridge' }));
    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onPhotosReady(photos);
    navigate('/grocery-prefs');
  };

  return (
    <div className="capture-screen">
      <div className="capture-header">
        <EathosLogo size={32} color="var(--color-primary)" />
        <span className="capture-step-label">Scan Your Kitchen</span>
      </div>

      <div className="capture-body">
        <div className="capture-content">
          <h2>Show us what you're working with</h2>
          <p className="capture-hint">
            Take photos of your fridge, pantry, or upload a recent grocery receipt.
            The more we see, the better we can plan.
          </p>

          <div className="capture-grid">
            {photos.map((photo, i) => (
              <div key={i} className="capture-thumb">
                <img src={photo.url} alt={`Capture ${i + 1}`} />
                <button className="thumb-remove" onClick={() => removePhoto(i)} aria-label="Remove photo">
                  <X size={14} />
                </button>
              </div>
            ))}

            <button className="capture-add" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon size={28} strokeWidth={1.5} />
              <span>Add Photo</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={e => handleFiles(e.target.files)}
            style={{ display: 'none' }}
          />

          <div className="capture-actions">
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={18} /> Upload Photos
            </button>
            <button className="btn btn-outline mobile-only" onClick={() => fileInputRef.current?.click()}>
              <Camera size={18} /> Take Photo
            </button>
          </div>
        </div>
      </div>

      <div className="capture-footer">
        <button className="btn btn-secondary" onClick={() => navigate('/onboarding')}>Back</button>
        <div style={{ flex: 1 }} />
        {photos.length > 0 ? (
          <button className="btn btn-primary" onClick={handleContinue}>
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={() => { onPhotosReady([]); navigate('/grocery-prefs'); }}>
            Skip for now <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
