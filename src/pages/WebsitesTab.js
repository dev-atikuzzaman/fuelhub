// src/pages/WebsitesTab.js
import React, { useState } from 'react';
import { XIcon } from '../components/Icons';

const COMPANIES = [
  { id: 1, name: 'Petrobangla', shortName: 'PB', fullName: 'Bangladesh Oil, Gas and Mineral Corporation', url: 'https://www.petrobangla.org.bd', color: '#1e3a5f', accent: '#0ea5e9', category: 'Corporation' },
  { id: 2, name: 'BGFCL', shortName: 'BG', fullName: 'Bangladesh Gas Fields Company Limited', url: 'https://www.bgfcl.org.bd', color: '#166534', accent: '#22c55e', category: 'Gas Production' },
  { id: 3, name: 'BAPEX', shortName: 'BX', fullName: 'Bangladesh Oil, Gas & Mineral Corporation (Exploration)', url: 'https://www.bapex.com.bd', color: '#7c2d12', accent: '#f97316', category: 'Exploration' },
  { id: 4, name: 'GTCL', shortName: 'GT', fullName: 'Gas Transmission Company Limited', url: 'https://www.gtcl.org.bd', color: '#1e3a5f', accent: '#38bdf8', category: 'Transmission' },
  { id: 5, name: 'TGTDCL', shortName: 'TG', fullName: 'Titas Gas Transmission & Distribution Co. Ltd.', url: 'https://www.titasgas.org.bd', color: '#164e63', accent: '#06b6d4', category: 'Distribution' },
  { id: 6, name: 'BGSL', shortName: 'BS', fullName: 'Bakhrabad Gas Systems Limited', url: 'https://www.bgsl.com.bd', color: '#14532d', accent: '#4ade80', category: 'Distribution' },
  { id: 7, name: 'JGTDSL', shortName: 'JG', fullName: 'Jalalabad Gas Transmission & Distribution System Ltd.', url: 'https://www.jalalabadgas.org.bd', color: '#3b0764', accent: '#a855f7', category: 'Distribution' },
  { id: 8, name: 'PGCL', shortName: 'PG', fullName: 'Pashchimanchal Gas Company Limited', url: 'https://www.pgcl.org.bd', color: '#7c3aed', accent: '#c4b5fd', category: 'Distribution' },
  { id: 9, name: 'KGDCL', shortName: 'KG', fullName: 'Karnaphuli Gas Distribution Company Limited', url: 'https://www.kgdcl.gov.bd', color: '#9f1239', accent: '#fb7185', category: 'Distribution' },
  { id: 10, name: 'SGFL', shortName: 'SF', fullName: 'Sylhet Gas Fields Limited', url: 'https://www.sylhetgasfields.com.bd', color: '#065f46', accent: '#34d399', category: 'Gas Production' },
  { id: 11, name: 'RPGCL', shortName: 'RP', fullName: 'Rupantarita Prakritik Gas Company Limited', url: 'https://www.rpgcl.org.bd', color: '#0c4a6e', accent: '#7dd3fc', category: 'LNG/CNG' },
  { id: 12, name: 'BCMCL', shortName: 'BC', fullName: 'Bangladesh Coal Management Company Limited', url: 'https://www.bcmcl.org.bd', color: '#27272a', accent: '#a1a1aa', category: 'Coal' },
  { id: 13, name: 'BIFPCL', shortName: 'BF', fullName: 'Bangladesh India Friendship Power Company Limited', url: 'https://www.bifpcl.com.bd', color: '#1e3a5f', accent: '#f59e0b', category: 'Power' },
  { id: 14, name: 'BADC', shortName: 'BD', fullName: 'Bangladesh Agricultural Development Corporation', url: 'https://www.badc.gov.bd', color: '#854d0e', accent: '#fcd34d', category: 'Special' },
];

const CATEGORIES = ['সব', ...new Set(COMPANIES.map((c) => c.category))];

export default function WebsitesTab() {
  const [activeCategory, setActiveCategory] = useState('সব');
  const [selected, setSelected] = useState(null);

  const filtered = activeCategory === 'সব' ? COMPANIES : COMPANIES.filter((c) => c.category === activeCategory);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 14px 90px' }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>পেট্রোবাংলা পরিবার</h2>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Petrobangla ও সহযোগী কোম্পানিসমূহ</div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            background: activeCategory === cat ? 'linear-gradient(135deg, #0ea5e9, #1e3a5f)' : 'var(--bg-surface-alt)',
            color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
          }}>
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
        {filtered.map((company) => (
          <button key={company.id} onClick={() => setSelected(company)} style={{
            background: 'var(--bg-surface)', borderRadius: 18, padding: '18px 14px', textAlign: 'center',
            border: '1.5px solid var(--border)', cursor: 'pointer',
            boxShadow: 'var(--shadow)', transition: 'transform 0.15s, box-shadow 0.15s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.14)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: `linear-gradient(135deg, ${company.color}, ${company.color}dd)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: 15,
              boxShadow: `0 4px 12px ${company.accent}44`,
            }}>
              {company.shortName}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>{company.name}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>{company.category}</div>
            </div>
            <div style={{ fontSize: 10.5, padding: '3px 10px', borderRadius: 20, background: `${company.accent}22`, color: company.color, fontWeight: 600 }}>
              ওয়েবসাইট দেখুন →
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(6px)',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--bg-surface)', borderRadius: 24, width: '100%', maxWidth: 420,
            boxShadow: '0 25px 70px rgba(0,0,0,0.4)', animation: 'slideUp 0.3s ease', overflow: 'hidden',
          }}>
            <div style={{ background: `linear-gradient(135deg, ${selected.color}, ${selected.color}cc)`, padding: '28px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XIcon width={16} height={16} color="#fff" />
                </button>
              </div>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 22, margin: '0 auto 14px' }}>
                {selected.shortName}
              </div>
              <div style={{ textAlign: 'center', color: '#fff' }}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{selected.name}</div>
                <div style={{ fontSize: 12.5, opacity: 0.8, marginTop: 4 }}>{selected.fullName}</div>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ background: 'var(--bg-surface-alt)', borderRadius: 12, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                🔗 {selected.url}
              </div>
              <a href={selected.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px', borderRadius: 14, textDecoration: 'none', fontWeight: 700, fontSize: 15,
                background: `linear-gradient(135deg, ${selected.color}, ${selected.color}cc)`,
                color: '#fff', boxShadow: `0 6px 16px ${selected.accent}44`,
              }}>
                🌐 ওয়েবসাইট খুলুন
              </a>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
                নিরাপত্তার কারণে সরকারি ওয়েবসাইট নতুন ট্যাবে খুলবে
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
