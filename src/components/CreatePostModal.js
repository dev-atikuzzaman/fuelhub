// src/components/CreatePostModal.js
import React, { useState } from 'react';
import Avatar from './Avatar';
import { XIcon, ImageIcon, LoaderIcon } from './Icons';
import { createPost } from '../lib/dataService';

export default function CreatePostModal({ currentUser, onClose, onCreated }) {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handlePost() {
    if (!text.trim() && !imageFile) return;
    setPosting(true);
    const { error } = await createPost(currentUser.id, text.trim(), imageFile);
    setPosting(false);
    if (!error) {
      onCreated && onCreated();
      onClose();
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 22, width: '100%', maxWidth: 480, padding: 20,
          boxShadow: '0 25px 70px rgba(0,0,0,0.3)', animation: 'slideUp 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>নতুন পোস্ট</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XIcon width={16} height={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <Avatar name={currentUser.name} src={currentUser.avatar_url} size={40} />
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', alignSelf: 'center' }}>{currentUser.name}</div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="কী জানাতে চান সবাইকে?"
          rows={4}
          style={{
            width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 12,
            fontSize: 14, resize: 'none', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
          }}
        />

        {imagePreview && (
          <div style={{ position: 'relative', marginTop: 10 }}>
            <img src={imagePreview} alt="preview" style={{ width: '100%', borderRadius: 14, maxHeight: 280, objectFit: 'cover' }} />
            <button
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <XIcon width={14} height={14} color="#fff" />
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0ea5e9', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <ImageIcon width={18} height={18} /> ছবি যোগ করুন
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </label>

          <button
            onClick={handlePost}
            disabled={posting || (!text.trim() && !imageFile)}
            style={{
              padding: '10px 22px', borderRadius: 12, border: 'none',
              background: (text.trim() || imageFile) ? 'linear-gradient(135deg, #0ea5e9, #1e3a5f)' : '#e2e8f0',
              color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {posting ? <LoaderIcon width={16} height={16} /> : 'পোস্ট করুন'}
          </button>
        </div>
      </div>
    </div>
  );
}
