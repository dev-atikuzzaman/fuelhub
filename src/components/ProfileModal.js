// src/components/ProfileModal.js
import React, { useState } from 'react';
import Avatar from './Avatar';
import Badge from './Badge';
import { XIcon, MailIcon, PhoneIcon, MapPinIcon, BuildingIcon, GraduationIcon, EditIcon, CheckIcon, LoaderIcon } from './Icons';
import { updateProfile, uploadAvatar } from '../lib/dataService';

const FIELDS = [
  { key: 'phone', label: 'ফোন', icon: PhoneIcon },
  { key: 'district', label: 'জেলা', icon: MapPinIcon },
  { key: 'university', label: 'বিশ্ববিদ্যালয়', icon: GraduationIcon },
  { key: 'subject', label: 'বিষয়', icon: GraduationIcon },
  { key: 'current_company', label: 'বর্তমান প্রতিষ্ঠান', icon: BuildingIcon },
  { key: 'designation', label: 'পদবী', icon: BuildingIcon },
  { key: 'department', label: 'বিভাগ', icon: BuildingIcon },
  { key: 'address', label: 'বর্তমান ঠিকানা', icon: MapPinIcon },
];

export default function ProfileModal({ profile, isOwnProfile, onClose, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url);

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    let avatar_url = profile.avatar_url;

    if (avatarFile) {
      const { url, error } = await uploadAvatar(profile.id, avatarFile);
      if (!error && url) avatar_url = url;
    }

    const updates = { ...form, avatar_url };
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;
    delete updates.email;
    delete updates.is_admin;
    delete updates.claimed;
    delete updates.is_preloaded;

    const { error } = await updateProfile(profile.id, updates);
    setSaving(false);

    if (!error) {
      setEditing(false);
      onUpdated && onUpdated();
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16, backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 24, width: '100%', maxWidth: 440,
          maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 25px 70px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.3s ease',
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #0ea5e9, #1e3a5f)',
          padding: '28px 24px 50px', position: 'relative', borderRadius: '24px 24px 0 0',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)',
            border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff',
          }}>
            <XIcon width={18} height={18} />
          </button>
          {isOwnProfile && !editing && (
            <button onClick={() => setEditing(true)} style={{
              position: 'absolute', top: 16, left: 16, background: 'rgba(255,255,255,0.2)',
              border: 'none', borderRadius: 10, padding: '6px 12px', display: 'flex',
              alignItems: 'center', gap: 6, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600,
            }}>
              <EditIcon width={14} height={14} /> Edit
            </button>
          )}
        </div>

        <div style={{ padding: '0 24px 24px', marginTop: -42, textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Avatar name={profile.name} src={avatarPreview} size={84} />
            {editing && (
              <label style={{
                position: 'absolute', bottom: 0, right: 0, background: '#0ea5e9', borderRadius: '50%',
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '2px solid #fff',
              }}>
                <EditIcon width={13} height={13} color="#fff" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {editing ? (
            <input
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ display: 'block', margin: '12px auto 4px', textAlign: 'center', fontSize: 18, fontWeight: 700, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '6px 10px', width: '90%' }}
            />
          ) : (
            <h2 style={{ margin: '12px 0 4px', fontSize: 19, fontWeight: 800, color: '#0f172a' }}>{profile.name}</h2>
          )}

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 6, flexWrap: 'wrap' }}>
            {profile.is_admin && <Badge tone="admin">Admin</Badge>}
            <Badge tone={profile.status === 'Resigned' ? 'danger' : 'success'}>{profile.status === 'Resigned' ? 'প্রাক্তন সদস্য' : 'সক্রিয় সদস্য'}</Badge>
          </div>

          {profile.email && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, color: '#64748b', fontSize: 13 }}>
              <MailIcon width={14} height={14} /> {profile.email}
            </div>
          )}

          <div style={{ marginTop: 20, textAlign: 'left' }}>
            {FIELDS.map(({ key, label, icon: Icon }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon width={16} height={16} color="#0ea5e9" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                  {editing ? (
                    <input
                      value={form[key] || ''}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 8px', fontSize: 14, marginTop: 3, boxSizing: 'border-box' }}
                    />
                  ) : (
                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 500, marginTop: 1 }}>{profile[key] || '—'}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {editing && (
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => { setEditing(false); setForm(profile); setAvatarPreview(profile.avatar_url); setAvatarFile(null); }}
                style={{ flex: 1, padding: 12, borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}
              >
                বাতিল
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 1, padding: 12, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #1e3a5f)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                {saving ? <LoaderIcon width={16} height={16} /> : <><CheckIcon width={16} height={16} /> সংরক্ষণ করুন</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
