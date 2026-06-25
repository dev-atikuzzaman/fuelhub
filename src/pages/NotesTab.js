// src/pages/NotesTab.js
import React, { useState, useEffect, useCallback } from 'react';
import { getNotes, createNote, updateNote, deleteNote } from '../lib/dataService';
import { PlusIcon, EditIcon, TrashIcon, CheckIcon, LoaderIcon } from '../components/Icons';

const NOTE_COLORS = {
  green:  { bg: '#dcfce7', border: '#86efac', dot: '#16a34a', text: '#14532d' },
  blue:   { bg: '#dbeafe', border: '#93c5fd', dot: '#1d4ed8', text: '#1e3a8a' },
  red:    { bg: '#fee2e2', border: '#fca5a5', dot: '#dc2626', text: '#7f1d1d' },
  gray:   { bg: '#f1f5f9', border: '#cbd5e1', dot: '#64748b', text: '#1e293b' },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'এইমাত্র';
  if (diff < 3600) return `${Math.floor(diff / 60)} মি. আগে`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ঘ. আগে`;
  return new Date(dateStr).toLocaleDateString('bn-BD');
}

export default function NotesTab({ currentUser }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form, setForm] = useState({ title: '', body: '', color: 'green' });
  const [saving, setSaving] = useState(false);

  const loadNotes = useCallback(async () => {
    const data = await getNotes(currentUser.id);
    setNotes(data);
    setLoading(false);
  }, [currentUser.id]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  function openCreate() {
    setEditingNote(null);
    setForm({ title: '', body: '', color: 'green' });
    setShowForm(true);
  }

  function openEdit(note) {
    setEditingNote(note);
    setForm({ title: note.title, body: note.body, color: note.color });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.body.trim()) return;
    setSaving(true);
    if (editingNote) {
      await updateNote(editingNote.id, form);
    } else {
      await createNote(currentUser.id, form);
    }
    setSaving(false);
    setShowForm(false);
    loadNotes();
  }

  async function handleDelete(note) {
    if (!window.confirm('নোটটি মুছে ফেলবেন?')) return;
    await deleteNote(note.id);
    loadNotes();
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '16px 14px 90px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>আমার নোট</h2>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>শুধু আপনিই দেখতে পাবেন</div>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 12,
            border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #1e3a5f)',
            color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(14,165,233,0.25)',
          }}
        >
          <PlusIcon width={16} height={16} /> নতুন নোট
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <LoaderIcon width={24} height={24} color="#0ea5e9" />
        </div>
      ) : notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📝</div>
          <div style={{ fontSize: 14 }}>এখনো কোনো নোট নেই। প্রথম নোটটি লিখুন!</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {notes.map((note) => {
            const c = NOTE_COLORS[note.color] || NOTE_COLORS.gray;
            return (
              <div
                key={note.id}
                style={{
                  background: c.bg, border: `1.5px solid ${c.border}`, borderRadius: 16, padding: 16,
                  position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }}>
                  <button onClick={() => openEdit(note)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 3 }}>
                    <EditIcon width={14} height={14} />
                  </button>
                  <button onClick={() => handleDelete(note)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 3 }}>
                    <TrashIcon width={14} height={14} />
                  </button>
                </div>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot, marginBottom: 8 }} />
                {note.title && (
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: c.text, marginBottom: 6, paddingRight: 36 }}>
                    {note.title}
                  </div>
                )}
                <div style={{ fontSize: 13.5, color: c.text, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {note.body}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>{timeAgo(note.updated_at)}</div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 22, padding: 22, width: '100%', maxWidth: 440,
              boxShadow: '0 25px 70px rgba(0,0,0,0.3)', animation: 'slideUp 0.3s ease',
            }}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
              {editingNote ? 'নোট এডিট করুন' : 'নতুন নোট'}
            </h3>

            <input
              placeholder="শিরোনাম"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }}
            />
            <textarea
              placeholder="তোমার নোট লিখো..."
              rows={5}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit', marginBottom: 14, boxSizing: 'border-box' }}
            />

            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
              {Object.entries(NOTE_COLORS).map(([key, c]) => (
                <button
                  key={key}
                  onClick={() => setForm({ ...form, color: key })}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', border: form.color === key ? `3px solid ${c.dot}` : '2px solid transparent',
                    background: c.dot, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    outline: form.color === key ? `2px solid ${c.dot}` : 'none', outlineOffset: 2,
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: 11, borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.body.trim()}
                style={{
                  flex: 1, padding: 11, borderRadius: 12, border: 'none',
                  background: form.body.trim() ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#e2e8f0',
                  color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {saving ? <LoaderIcon width={15} height={15} /> : <><CheckIcon width={15} height={15} /> সেভ করো</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
