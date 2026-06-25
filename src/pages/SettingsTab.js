// src/pages/SettingsTab.js 
import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import { THEMES, THEME_ORDER } from '../lib/themes';
import { EyeIcon, EyeOffIcon, CheckIcon, LoaderIcon, LockIcon } from '../components/Icons';

function Section({ title, icon, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', marginBottom: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{title}</span>
      </div>
      <div style={{ padding: 18 }}>
        {children}
      </div>
    </div>
  );
}

export default function SettingsTab({ currentUser }) {
  const { updatePassword, signOut } = useAuth();
  const { themeKey, setTheme } = useTheme();

  // Password change state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  async function handlePasswordChange() {
    setPwdMsg({ type: '', text: '' });
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdMsg({ type: 'error', text: 'সব ঘর পূরণ করুন' });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড দুটো মিলছে না' });
      return;
    }
    if (newPwd === currentPwd) {
      setPwdMsg({ type: 'error', text: 'নতুন পাসওয়ার্ড আগেরটার মতো হলে চলবে না' });
      return;
    }
    setPwdLoading(true);
    const { error } = await updatePassword(currentPwd, newPwd);
    setPwdLoading(false);
    if (error) {
      setPwdMsg({ type: 'error', text: error.message });
    } else {
      setPwdMsg({ type: 'success', text: '✅ পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 42px 11px 12px', borderRadius: 12, border: '1.5px solid #e2e8f0',
    fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '16px 14px 90px' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>সেটিংস</h2>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>{currentUser.email}</div>
      </div>

      {/* ১. পাসওয়ার্ড পরিবর্তন */}
      <Section title="পাসওয়ার্ড পরিবর্তন" icon="🔐">
        {pwdMsg.text && (
          <div style={{
            padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 14,
            background: pwdMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: pwdMsg.type === 'success' ? '#16a34a' : '#dc2626',
          }}>
            {pwdMsg.text}
          </div>
        )}

        {[
          ['বর্তমান পাসওয়ার্ড', currentPwd, setCurrentPwd, 'current-password'],
          ['নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)', newPwd, setNewPwd, 'new-password'],
          ['নতুন পাসওয়ার্ড আবার লিখুন', confirmPwd, setConfirmPwd, 'new-password'],
        ].map(([placeholder, value, setter, autoComplete], i) => (
          <div key={i} style={{ position: 'relative', marginBottom: 10 }}>
            <input
              type={showPwd ? 'text' : 'password'}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setter(e.target.value)}
              autoComplete={autoComplete}
              style={inputStyle}
            />
            {i === 2 && (
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}
                tabIndex={-1}
              >
                {showPwd ? <EyeOffIcon width={16} height={16} /> : <EyeIcon width={16} height={16} />}
              </button>
            )}
          </div>
        ))}

        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>
          💡 টিপস: বড় হাতের ও ছোট হাতের অক্ষর, সংখ্যা ও চিহ্ন মিলিয়ে শক্তিশালী পাসওয়ার্ড ব্যবহার করুন
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={pwdLoading}
          style={{
            width: '100%', padding: 12, borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #0ea5e9, #1e3a5f)', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {pwdLoading ? <LoaderIcon width={16} height={16} /> : <><LockIcon width={16} height={16} /> পাসওয়ার্ড বদলান</>}
        </button>
      </Section>

      {/* ২. থিম */}
      <Section title="থিম ও রং" icon="🎨">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {THEME_ORDER.map((key) => {
            const t = THEMES[key];
            const isActive = key === themeKey;
            return (
              <button
                key={key}
                onClick={() => setTheme(key)}
                style={{
                  padding: '12px 14px', borderRadius: 14, border: `2px solid ${isActive ? t.colors.accent : '#e2e8f0'}`,
                  background: isActive ? `${t.colors.accent}12` : '#f8fafc',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 20 }}>{t.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{t.label}</div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    {[t.colors.accent, t.colors.bgBase, t.colors.bgSurface].map((c, i) => (
                      <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c, border: '1px solid rgba(0,0,0,0.1)' }} />
                    ))}
                  </div>
                </div>
                {isActive && <CheckIcon width={14} height={14} color={t.colors.accent} />}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ৩. অ্যাকাউন্ট তথ্য */}
      <Section title="অ্যাকাউন্ট তথ্য" icon="👤">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['নাম', currentUser.name],
            ['ইমেইল', currentUser.email],
            ['ব্যাচ', currentUser.batch || 'BIM Special Foundation Training 2025'],
            ['প্রতিষ্ঠান', currentUser.current_company || '—'],
            ['পদবী', currentUser.designation || '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
              <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>
          প্রোফাইলের বিস্তারিত তথ্য পরিবর্তন করতে উপরের হেডারে নিজের ছবিতে ক্লিক করুন → Edit
        </div>
      </Section>

      {/* ৪. নিরাপত্তা */}
      <Section title="নিরাপত্তা" icon="🛡️">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #86efac' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#14532d' }}>Session সক্রিয়</div>
              <div style={{ fontSize: 12, color: '#16a34a' }}>আপনি লগইন আছেন</div>
            </div>
            <span style={{ fontSize: 18 }}>✅</span>
          </div>

          <div style={{ padding: '10px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>সর্বশেষ পরিবর্তন</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>
              {new Date(currentUser.updated_at || currentUser.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </Section>

      {/* ৫. লগআউট */}
      <Section title="অ্যাকাউন্ট" icon="🚪">
        <button
          onClick={() => { if (window.confirm('লগআউট করবেন?')) signOut(); }}
          style={{
            width: '100%', padding: 12, borderRadius: 12, border: '1.5px solid #fca5a5',
            background: '#fff', color: '#dc2626', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}
        >
          লগআউট করুন
        </button>
      </Section>
    </div>
  );
}
