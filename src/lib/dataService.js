// src/lib/dataService.js
import { supabase } from './supabaseClient';

// ============================================================
// PROFILES
// ============================================================
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('❌ getAllProfiles error:', error.message);
    return [];
  }
  return data;
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) console.error('❌ updateProfile error:', error.message);
  return { data, error };
}

export async function uploadAvatar(userId, file) {
  const ext = file.name.split('.').pop();
  // টাইমস্ট্যাম্প যোগ করা হলো যাতে প্রতিবার নতুন ছবি আপলোডে URL বদলায়
  // (নাহলে browser/CDN পুরনো ছবি cache করে রাখে এবং নতুন ছবি দেখায় না)
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });

  if (uploadError) {
    console.error('❌ uploadAvatar error:', uploadError.message);
    return { url: null, error: uploadError };
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

// admin: ৮০ জনের জন্য placeholder profile pre-load করা (claim করা হয়নি এমন)
export async function preloadMember(memberData) {
  // placeholder profile তৈরি করতে আমরা একটা স্পেশাল টেবিল-ফ্রি approach নিচ্ছি:
  // admin শুধু email pending_members টেবিলে রাখবে, signup এর সময় match করবে।
  // সহজ approach: সরাসরি pending_invites টেবিল ব্যবহার (নিচে দ্রষ্টব্য)
  const { data, error } = await supabase
    .from('pending_invites')
    .insert(memberData)
    .select()
    .single();
  if (error) console.error('❌ preloadMember error:', error.message);
  return { data, error };
}

export async function getPendingInvites() {
  const { data, error } = await supabase
    .from('pending_invites')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('❌ getPendingInvites error:', error.message);
    return [];
  }
  return data;
}

// ============================================================
// POSTS
// ============================================================
export async function getPostsWithDetails() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_user_id_fkey ( id, name, avatar_url, designation, company, current_company ),
      comments ( id, text, created_at, parent_id, user_id, author:profiles!comments_user_id_fkey ( id, name, avatar_url ) ),
      reactions ( id, emoji, user_id )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ getPostsWithDetails error:', error.message);
    return [];
  }
  return data;
}

export async function createPost(userId, text, imageFile, privacy = 'public') {
  let image_url = null;

  if (imageFile) {
    const ext = imageFile.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(path, imageFile);

    if (uploadError) {
      console.error('❌ Post image upload error:', uploadError.message);
    } else {
      const { data } = supabase.storage.from('post-images').getPublicUrl(path);
      image_url = data.publicUrl;
    }
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id: userId, text, image_url, privacy })
    .select()
    .single();

  if (error) console.error('❌ createPost error:', error.message);
  return { data, error };
}

export async function deletePost(postId) {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) console.error('❌ deletePost error:', error.message);
  return { error };
}

export async function updatePost(postId, updates) {
  // updates এ { text, privacy } থাকতে পারে — text বদলালে edited_at সেট করা হয়
  const payload = { ...updates };
  if (updates.text !== undefined) {
    payload.edited_at = new Date().toISOString();
  }
  const { data, error } = await supabase
    .from('posts')
    .update(payload)
    .eq('id', postId)
    .select()
    .single();
  if (error) console.error('❌ updatePost error:', error.message);
  return { data, error };
}

// ============================================================
// COMMENTS
// ============================================================
export async function createComment(postId, userId, text, parentId = null) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: userId, text, parent_id: parentId })
    .select()
    .single();
  if (error) console.error('❌ createComment error:', error.message);
  return { data, error };
}

export async function deleteComment(commentId) {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) console.error('❌ deleteComment error:', error.message);
  return { error };
}

// ============================================================
// REACTIONS
// ============================================================
export async function toggleReaction(postId, userId, emoji) {
  // ইউজারের আগের reaction আছে কিনা চেক
  const { data: existing } = await supabase
    .from('reactions')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    if (existing.emoji === emoji) {
      // একই emoji আবার চাপলে remove (un-react)
      const { error } = await supabase.from('reactions').delete().eq('id', existing.id);
      return { action: 'removed', error };
    } else {
      // ভিন্ন emoji হলে update
      const { data, error } = await supabase
        .from('reactions')
        .update({ emoji })
        .eq('id', existing.id)
        .select()
        .single();
      return { action: 'updated', data, error };
    }
  } else {
    const { data, error } = await supabase
      .from('reactions')
      .insert({ post_id: postId, user_id: userId, emoji })
      .select()
      .single();
    return { action: 'added', data, error };
  }
}

// ============================================================
// REALTIME SUBSCRIPTIONS
// ============================================================
export function subscribeToPosts(onChange) {
  const channel = supabase
    .channel('public:posts-feed')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, onChange)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime posts channel connected');
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToProfiles(onChange) {
  const channel = supabase
    .channel('public:profiles-directory')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, onChange)
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime profiles channel connected');
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
