// src/store/useStore.js
import { create } from 'zustand'

const useStore = create((set, get) => ({
  // ── Feed ──────────────────────────────────────────────────────────────────
  posts:          [],
  feedLastDoc:    null,
  feedLoading:    false,
  setPosts:       posts     => set({ posts }),
  appendPosts:    newPosts  => set(s => ({ posts: [...s.posts, ...newPosts] })),
  setFeedLastDoc: doc       => set({ feedLastDoc: doc }),
  setFeedLoading: loading   => set({ feedLoading: loading }),

  updatePostLike: (postId, uid, liked) =>
    set(s => ({
      posts: s.posts.map(p =>
        p.id === postId
          ? {
              ...p,
              likes:     liked ? [...p.likes, uid] : p.likes.filter(id => id !== uid),
              likeCount: liked ? p.likeCount + 1 : p.likeCount - 1,
            }
          : p
      ),
    })),

  removePost: postId =>
    set(s => ({ posts: s.posts.filter(p => p.id !== postId) })),

  // ── Friend Requests ───────────────────────────────────────────────────────
  friendRequests: [],
  setFriendRequests: reqs => set({ friendRequests: reqs }),

  // ── Conversations ─────────────────────────────────────────────────────────
  conversations:      [],
  activeConvId:       null,
  messages:           [],
  setConversations:   convs => set({ conversations: convs }),
  setActiveConvId:    id    => set({ activeConvId: id, messages: [] }),
  setMessages:        msgs  => set({ messages: msgs }),

  // ── Notifications ─────────────────────────────────────────────────────────
  notifications:     [],
  unreadCount:       0,
  setNotifications:  notifs => set({
    notifications: notifs,
    unreadCount:   notifs.filter(n => !n.read).length,
  }),

  // ── Groups ────────────────────────────────────────────────────────────────
  groups:     [],
  setGroups:  groups => set({ groups }),

  // ── Events ────────────────────────────────────────────────────────────────
  events:     [],
  setEvents:  events => set({ events }),
}))

export default useStore
