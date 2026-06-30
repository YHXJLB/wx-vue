import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messageUnreadCount: 0,
    totalUnreadCount: 0,
    systemUnread: 0
  }),

  actions: {
    setUnreadFromServer(count) {
      // Update unread counts based on server data
      this.messageUnreadCount = count
      this.totalUnreadCount = count // Simplified example
    },
    setSystemUnreadFromServer(count) {
      this.systemUnread = count
    }
  }
})