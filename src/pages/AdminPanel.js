// src/pages/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { XIcon, PlusIcon, TrashIcon, LoaderIcon } from '../components/Icons';
import { preloadMember, getPendingInvites } from '../lib/dataService';
import { supabase } from '../lib/supabaseClient';

export default function AdminPanel({ onClose }) {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', district: '', university: '', subject: '', company: '', designation: '', department: '' });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  async function loadInvites() {
    setLoading(true);
    const data = await getPendingInvites();
    setInvites(data);
    setLoading(false);
  }

  useEffect(() => {
    loadInvites();
  }, []);

  async function handleAdd() {
    setError('');
    if (!form.name.trim() || !form.email.trim()) {
      setError('নাম ও ইমেইল আবশ্যক');
      return;
    }
    setAdding(true);
    const { error } = await preloadMember(form);
    setAdding(false);
    if (error) {
      setError(error.message.includes('duplicate') ? 'এই ইমেইল আগেই যোগ করা আছে' : error.message);
    } else {
      setForm({ name: '', email: '', district: '', university: '', subject: '', company: '', designation: '', department: '' });
      loadInvites();
    }
  }

  async function handleDelete(id) {
    await supabase.from('pending_invites').delete().eq('id', id);
    loadInvites();
  }

  const fields = [
    ['name', 'নাম *'], ['email', 'ইমেইল *'], ['district', 'জেলা'], ['university', 'বিশ্ববিদ্যালয়'],
    ['subject', 'বিষয়'], ['company', 'প্রতিষ্ঠান'], ['designation', 'পদবী'], ['department', 'বিভাগ'],
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 22, width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>👤 সদস্য Pre-load করুন</h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer' }}>
            <XIcon width={16} height={16} />
          </button>
        </div>

        <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 0 }}>
          এখানে যাদের ইমেইল যোগ করবেন, তারা সেই ইমেইল দিয়ে signup করলে স্বয়ংক্রিয়ভাবে তাদের প্রোফাইলে এই তথ্য বসে যাবে।
        </p>

        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 10 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          {fields.map(([key, label]) => (
            <input
              key={key}
              placeholder={label}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              style={{ padding: '9px 10px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none' }}
            />
          ))}
        </div>

        <button
          onClick={handleAdd}
          disabled={adding}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #1e3a5f)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginBottom: 18 }}
        >
          {adding ? <LoaderIcon width={14} height={14} /> : <PlusIcon width={14} height={14} />} যোগ করুন
        </button>

        <h4 style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
          অপেক্ষমান সদস্য ({invites.length})
        </h4>

        {loading ? (
          <LoaderIcon width={20} height={20} />
        ) : invites.length === 0 ? (
          <div style={{ fontSize: 13, color: '#94a3b8' }}>কোনো অপেক্ষমান সদস্য নেই</div>
        ) : (
          invites.map((inv) => (
            <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 10, background: '#f8fafc', marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{inv.name}</div>
                <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{inv.email}</div>
              </div>
              <button onClick={() => handleDelete(inv.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                <TrashIcon width={15} height={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
