// src/pages/MembersTab.js
import React, { useState, useMemo } from 'react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import MultiSelect from '../components/MultiSelect';
import { SearchIcon, DownloadIcon } from '../components/Icons';

function uniqueValues(members, key) {
  return [...new Set(members.map((m) => m[key]).filter(Boolean))].sort();
}

function exportCSV(members) {
  const headers = ['নাম', 'ইমেইল', 'ফোন', 'জেলা', 'বিশ্ববিদ্যালয়', 'বিষয়', 'বর্তমান প্রতিষ্ঠান', 'পদবী', 'বিভাগ', 'স্ট্যাটাস'];
  const rows = members.map((m) => [
    m.name, m.email, m.phone, m.district, m.university, m.subject, m.current_company, m.designation, m.department, m.status,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bim-hub-members.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function MembersTab({ members, onOpenProfile }) {
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState([]);
  const [universityFilter, setUniversityFilter] = useState([]);
  const [companyFilter, setCompanyFilter] = useState([]);

  const districts = useMemo(() => uniqueValues(members, 'district'), [members]);
  const universities = useMemo(() => uniqueValues(members, 'university'), [members]);
  const companies = useMemo(() => uniqueValues(members, 'current_company'), [members]);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch = !search || [m.name, m.district, m.university, m.subject, m.current_company]
        .some((v) => (v || '').toLowerCase().includes(search.toLowerCase()));
      const matchesDistrict = districtFilter.length === 0 || districtFilter.includes(m.district);
      const matchesUniversity = universityFilter.length === 0 || universityFilter.includes(m.university);
      const matchesCompany = companyFilter.length === 0 || companyFilter.includes(m.current_company);
      return matchesSearch && matchesDistrict && matchesUniversity && matchesCompany;
    });
  }, [members, search, districtFilter, universityFilter, companyFilter]);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '16px 14px 90px' }}>
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <SearchIcon width={18} height={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="নাম, জেলা, বিশ্ববিদ্যালয় দিয়ে খুঁজুন..."
          style={{
            width: '100%', padding: '12px 14px 12px 40px', borderRadius: 14, border: '1.5px solid #e2e8f0',
            fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <MultiSelect label="জেলা" options={districts} selected={districtFilter} onChange={setDistrictFilter} />
        <MultiSelect label="বিশ্ববিদ্যালয়" options={universities} selected={universityFilter} onChange={setUniversityFilter} />
        <MultiSelect label="প্রতিষ্ঠান" options={companies} selected={companyFilter} onChange={setCompanyFilter} />
        <button
          onClick={() => exportCSV(filtered)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
            border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          <DownloadIcon width={14} height={14} /> CSV
        </button>
      </div>

      <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>{filtered.length} জন সদস্য পাওয়া গেছে</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {filtered.map((m) => (
          <div
            key={m.id}
            onClick={() => onOpenProfile(m)}
            style={{
              background: '#fff', borderRadius: 16, padding: 16, textAlign: 'center', cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Avatar name={m.name} src={m.avatar_url} size={56} />
            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a', marginTop: 8 }}>{m.name}</div>
            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{m.district || '—'}</div>
            <div style={{ marginTop: 6 }}>
              <Badge tone={m.status === 'Resigned' ? 'danger' : 'success'}>
                {m.status === 'Resigned' ? 'প্রাক্তন' : 'সক্রিয়'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
