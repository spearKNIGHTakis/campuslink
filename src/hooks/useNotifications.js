// src/hooks/useNotifications.js
import { useEffect } from 'react'
import { useAuth } from './useAuth'
import { listenNotifications, markNotificationRead } from '@/lib/db'
import useStore from '@/store/useStore'

export function useNotifications() {
  const { user } = useAuth()
  const setNotifications = useStore(s => s.setNotifications)
  const notifications    = useStore(s => s.notifications)
  const unreadCount      = useStore(s => s.unreadCount)

  useEffect(() => {
    if (!user) return
    const unsub = listenNotifications(user.uid, setNotifications)
    return unsub
  }, [user?.uid])

  async function markRead(notifId) {
    if (!user) return
    await markNotificationRead(user.uid, notifId)
  }

  return { notifications, unreadCount, markRead }
}
