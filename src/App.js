// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ThemeProvider, useTheme } from './lib/ThemeContext';
import AuthScreen from './components/AuthScreen';
import Avatar from './components/Avatar';
import ProfileModal from './components/ProfileModal';
import ThemeSwitcher from './components/ThemeSwitcher';
import Marquee from './components/Marquee';
import FeedTab from './pages/FeedTab';
import MembersTab from './pages/MembersTab';
import StatsTab from './pages/StatsTab';
import AdminPanel from './pages/AdminPanel';
import { getAllProfiles, getPostsWithDetails, subscribeToPosts, subscribeToProfiles } from './lib/dataService';
import { HomeIcon, UsersIcon, ChartIcon, LogOutIcon, ShieldIcon, WifiOffIcon, LoaderIcon } from './components/Icons';

function AppShell() {
  const { profile, user, signOut, isAdmin, loading: authLoading } = useAuth();
  const { colors } = useTheme();
  const [tab, setTab] = useState('feed');
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const loadData = useCallback(async () => {
    try {
      console.log('🔄 loadData called');
      const [profilesData, postsData] = await Promise.all([getAllProfiles(), getPostsWithDetails()]);
      console.log('✅ loadData fetched:', postsData.length, 'posts,', profilesData.length, 'profiles');
      setMembers(profilesData);
      setPosts(postsData);
    } catch (err) {
      console.error('❌ loadData failed:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubPosts = subscribeToPosts(() => loadData());
    const unsubProfiles = subscribeToProfiles(() => loadData());

    // Safety-net: realtime মাঝে মাঝে miss করতে পারে (tab background এ থাকলে,
    // বা connection blip হলে) — তাই প্রতি ৪৫ সেকেন্ডে একবার lightweight refresh
    const fallbackInterval = setInterval(() => {
      if (document.visibilityState === 'visible') loadData();
    }, 45000);

    // Tab আবার visible হলে সাথে সাথে একবার refresh করা (background থেকে ফেরার পর)
    function handleVisibility() {
      if (document.visibilityState === 'visible') loadData();
    }
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsubPosts();
      unsubProfiles();
      clearInterval(fallbackInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadData]);

  useEffect(() => {
    function goOnline() { setIsOnline(true); }
    function goOffline() { setIsOnline(false); }
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <LoaderIcon width={32} height={32} color={colors.accent} />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <LoaderIcon width={28} height={28} color={colors.accent} />
        <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>প্রোফাইল লোড হচ্ছে...</div>
      </div>
    );
  }

  const tabs = [
    { key: 'feed', label: 'ফিড', icon: HomeIcon },
    { key: 'members', label: 'সদস্য', icon: UsersIcon },
    { key: 'stats', label: 'পরিসংখ্যান', icon: ChartIcon },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'inherit', transition: 'background 0.2s ease' }}>
      <style>{`
        @keyframes fadeIn { from {opacity:0;} to {opacity:1;} }
        @keyframes slideUp { from { opacity:0; transform: translateY(20px);} to {opacity:1; transform:translateY(0);} }
        @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
      `}</style>

      {!isOnline && (
        <div style={{ background: 'var(--warning-soft)', color: 'var(--warning)', padding: '8px 16px', textAlign: 'center', fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <WifiOffIcon width={14} height={14} /> অফলাইনে আছেন — নতুন তথ্য পেতে ইন্টারনেট সংযোগ দিন
        </div>
      )}

      <header style={{
        position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-header)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)', padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎓</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--text-primary)', lineHeight: 1.1 }}>BIM Knowledge Hub</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{members.length} জন সদস্য</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ThemeSwitcher />
          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              title="Admin Panel"
              style={{ background: 'var(--admin-soft)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}
            >
              <ShieldIcon width={17} height={17} color={colors.adminColor} />
            </button>
          )}
          <Avatar name={profile.name} src={profile.avatar_url} size={36} onClick={() => setViewingProfile(profile)} />
          <button
            onClick={signOut}
            title="লগআউট"
            style={{ background: 'var(--bg-surface-alt)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}
          >
            <LogOutIcon width={16} height={16} />
          </button>
        </div>
      </header>

      <Marquee />

      <main>
        {dataLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <LoaderIcon width={28} height={28} color={colors.accent} />
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 10 }}>ডেটা লোড হচ্ছে...</div>
          </div>
        ) : tab === 'feed' ? (
          <FeedTab posts={posts} currentUser={profile} onUpdate={loadData} onOpenProfile={(p) => p && setViewingProfile(members.find((m) => m.id === p.id) || p)} />
        ) : tab === 'members' ? (
          <MembersTab members={members} onOpenProfile={setViewingProfile} />
        ) : (
          <StatsTab members={members} posts={posts} />
        )}
      </main>

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg-header)',
        backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border)', display: 'flex',
        padding: '8px 12px calc(8px + env(safe-area-inset-bottom))', zIndex: 50,
      }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
              color: tab === key ? colors.accent : 'var(--text-muted)',
            }}
          >
            <Icon width={21} height={21} />
            <span style={{ fontSize: 10.5, fontWeight: 700 }}>{label}</span>
          </button>
        ))}
      </nav>

      {viewingProfile && (
        <ProfileModal
          profile={members.find((m) => m.id === viewingProfile.id) || viewingProfile}
          isOwnProfile={viewingProfile.id === profile.id}
          onClose={() => setViewingProfile(null)}
          onUpdated={() => { loadData(); }}
        />
      )}

      {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
