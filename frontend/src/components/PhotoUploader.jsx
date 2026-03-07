import { useState, useRef } from 'react';
import { Upload, Camera, Image as ImageIcon } from 'lucide-react';
import './PhotoUploader.css';

export default function PhotoUploader({ onUpload, isAnalyzing }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  if (isAnalyzing) {
    return (
      <div className="uploader-analyzing">
        {preview && <img src={preview} alt="Your fridge" className="analyzing-preview" />}
        <div className="analyzing-overlay">
          <div className="analyzing-dot"></div>
          <h2>Scanning your fridge...</h2>
          <p>Identifying items and estimating freshness</p>
        </div>
      </div>
    );
  }

  return (
    <div className="uploader-container">
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="file-input"
          id="fridge-photo-input"
        />

        <div className="drop-zone-content">
          <div className="drop-zone-icon">
            <ImageIcon size={48} strokeWidth={1.5} />
          </div>
          <h2 className="drop-zone-title">Snap your fridge.<br />We'll handle dinner.</h2>
          <p className="drop-zone-subtitle">
            Drop a photo of your fridge, or tap below to upload one.
          </p>

          <div className="drop-zone-buttons">
            <button
              className="btn btn-primary"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              id="upload-photo-btn"
            >
              <Upload size={18} />
              Upload Photo
            </button>
            <button
              className="btn btn-outline mobile-only"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              id="take-photo-btn"
            >
              <Camera size={18} />
              Take Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
