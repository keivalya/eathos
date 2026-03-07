import { useState, useRef } from 'react';
import { Upload, Camera, Check } from 'lucide-react';
import './ReceiptUpload.css';

export default function ReceiptUpload({ onUpload }) {
  const [photo, setPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    onUpload(photo);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="receipt-upload receipt-success">
        <Check size={32} />
        <h3>Receipt uploaded!</h3>
        <p>We'll update your inventory based on what you bought.</p>
      </div>
    );
  }

  return (
    <div className="receipt-upload">
      <h3>Upload Grocery Receipt</h3>
      <p className="receipt-hint">Snap a photo of your receipt and we'll update your inventory.</p>

      <div className="receipt-area" onClick={() => fileRef.current?.click()}>
        {photo ? (
          <img src={photo} alt="Receipt" className="receipt-preview" />
        ) : (
          <div className="receipt-placeholder">
            <Upload size={28} strokeWidth={1.5} />
            <span>Tap to upload receipt</span>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </div>

      {photo && (
        <button className="btn btn-primary" onClick={handleSubmit}>
          <Check size={16} /> Submit Receipt
        </button>
      )}
    </div>
  );
}
