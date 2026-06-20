// src/components/PostCard.js
import React, { useState } from 'react';
import Avatar from './Avatar';
import { HeartIcon, CommentIcon, SendIcon, TrashIcon, MoreIcon } from './Icons';
import { toggleReaction, createComment, deletePost, deleteComment } from '../lib/dataService';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'এইমাত্র';
  if (diff < 3600) return `${Math.floor(diff / 60)} মিনিট আগে`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ঘণ্টা আগে`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} দিন আগে`;
  return new Date(dateStr).toLocaleDateString('bn-BD');
}

function groupReactions(reactions = []) {
  const counts = {};
  reactions.forEach((r) => { counts[r.emoji] = (counts[r.emoji] || 0) + 1; });
  return counts;
}

export default function PostCard({ post, currentUser, onUpdate, onOpenProfile }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const myReaction = post.reactions?.find((r) => r.user_id === currentUser.id);
  const reactionCounts = groupReactions(post.reactions);
  const totalReactions = post.reactions?.length || 0;
  const isOwn = post.user_id === currentUser.id;

  const topLevelComments = (post.comments || [])
    .filter((c) => !c.parent_id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  function repliesFor(commentId) {
    return (post.comments || [])
      .filter((c) => c.parent_id === commentId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  async function handleReact(emoji) {
    setShowEmojiPicker(false);
    await toggleReaction(post.id, currentUser.id, emoji);
    onUpdate && onUpdate();
  }

  async function handleSubmitComment() {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await createComment(post.id, currentUser.id, commentText.trim(), replyTo);
    setCommentText('');
    setReplyTo(null);
    setSubmitting(false);
    onUpdate && onUpdate();
  }

  async function handleDeletePost() {
    if (!window.confirm('পোস্টটি মুছে ফেলতে চান?')) return;
    await deletePost(post.id);
    onUpdate && onUpdate();
  }

  async function handleDeleteComment(commentId) {
    await deleteComment(commentId);
    onUpdate && onUpdate();
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 18, padding: 18, marginBottom: 14,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar
            name={post.author?.name}
            src={post.author?.avatar_url}
            size={42}
            onClick={() => onOpenProfile && onOpenProfile(post.author)}
          />
          <div>
            <div
              style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', cursor: 'pointer' }}
              onClick={() => onOpenProfile && onOpenProfile(post.author)}
            >
              {post.author?.name || 'অজানা সদস্য'}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              {post.author?.designation ? `${post.author.designation} · ` : ''}
              {timeAgo(post.created_at)}
            </div>
          </div>
        </div>

        {isOwn && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
              <MoreIcon width={18} height={18} />
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: 28, background: '#fff', borderRadius: 10,
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)', zIndex: 10, overflow: 'hidden',
              }}>
                <button
                  onClick={() => { setShowMenu(false); handleDeletePost(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: 'none',
                    background: 'none', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%',
                  }}
                >
                  <TrashIcon width={14} height={14} /> মুছে ফেলুন
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p style={{ fontSize: 14.5, color: '#1e293b', lineHeight: 1.6, marginTop: 12, whiteSpace: 'pre-wrap' }}>
        {post.text}
      </p>

      {post.image_url && (
        <img
          src={post.image_url}
          alt="post"
          style={{ width: '100%', borderRadius: 14, marginTop: 10, maxHeight: 400, objectFit: 'cover' }}
        />
      )}

      {totalReactions > 0 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 12, fontSize: 13, color: '#64748b' }}>
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <span key={emoji}>{emoji} {count}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9', position: 'relative' }}>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px', borderRadius: 10, border: 'none',
            background: myReaction ? '#fef2f2' : '#f8fafc',
            color: myReaction ? '#ef4444' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {myReaction ? <span>{myReaction.emoji}</span> : <HeartIcon width={16} height={16} />}
          রিয়্যাক্ট
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px', borderRadius: 10, border: 'none', background: '#f8fafc',
            color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <CommentIcon width={16} height={16} /> মন্তব্য {post.comments?.length > 0 && `(${post.comments.length})`}
        </button>

        {showEmojiPicker && (
          <div style={{
            position: 'absolute', bottom: 44, left: 0, background: '#fff', borderRadius: 16,
            padding: '8px 10px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)', display: 'flex', gap: 6, zIndex: 10,
          }}>
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => handleReact(e)}
                style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', transition: 'transform 0.15s' }}
                onMouseEnter={(ev) => (ev.target.style.transform = 'scale(1.3)')}
                onMouseLeave={(ev) => (ev.target.style.transform = 'scale(1)')}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {showComments && (
        <div style={{ marginTop: 14 }}>
          {topLevelComments.map((c) => (
            <div key={c.id} style={{ marginTop: 12 }}>
              <CommentRow
                comment={c}
                currentUser={currentUser}
                onReply={() => setReplyTo(c.id)}
                onDelete={() => handleDeleteComment(c.id)}
                onOpenProfile={onOpenProfile}
              />
              {repliesFor(c.id).map((r) => (
                <div key={r.id} style={{ marginLeft: 36, marginTop: 8 }}>
                  <CommentRow
                    comment={r}
                    currentUser={currentUser}
                    onDelete={() => handleDeleteComment(r.id)}
                    onOpenProfile={onOpenProfile}
                  />
                </div>
              ))}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
            <Avatar name={currentUser.name} src={currentUser.avatar_url} size={32} />
            <div style={{ flex: 1, position: 'relative' }}>
              {replyTo && (
                <div style={{ fontSize: 11, color: '#0ea5e9', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <span>রিপ্লাই করছেন</span>
                  <span onClick={() => setReplyTo(null)} style={{ cursor: 'pointer', color: '#94a3b8' }}>বাতিল</span>
                </div>
              )}
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                placeholder="মন্তব্য লিখুন..."
                style={{
                  width: '100%', padding: '9px 36px 9px 12px', borderRadius: 20, border: '1.5px solid #e2e8f0',
                  fontSize: 13, outline: 'none', boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleSubmitComment}
                disabled={submitting || !commentText.trim()}
                style={{
                  position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#0ea5e9', padding: 6,
                }}
              >
                <SendIcon width={16} height={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentRow({ comment, currentUser, onReply, onDelete, onOpenProfile }) {
  const isOwn = comment.user_id === currentUser.id;
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <Avatar
        name={comment.author?.name}
        src={comment.author?.avatar_url}
        size={30}
        onClick={() => onOpenProfile && onOpenProfile(comment.author)}
      />
      <div style={{ flex: 1 }}>
        <div style={{ background: '#f8fafc', borderRadius: 14, padding: '8px 12px', display: 'inline-block', maxWidth: '100%' }}>
          <div style={{ fontWeight: 700, fontSize: 12.5, color: '#0f172a' }}>{comment.author?.name}</div>
          <div style={{ fontSize: 13, color: '#334155', marginTop: 1, wordBreak: 'break-word' }}>{comment.text}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 4, paddingLeft: 4 }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{timeAgo(comment.created_at)}</span>
          {onReply && (
            <span onClick={onReply} style={{ fontSize: 11, color: '#0ea5e9', fontWeight: 600, cursor: 'pointer' }}>
              রিপ্লাই
            </span>
          )}
          {isOwn && (
            <span onClick={onDelete} style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>
              মুছুন
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
