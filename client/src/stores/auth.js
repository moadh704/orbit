import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/axios'
import { connectSocket, disconnectSocket } from '@/lib/socket'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('orbit_token') || null)
  const user = ref(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  async function login(email, password) {
    loading.value = true
    try {
      const { data } = await api.post('/auth/login', { email, password })
      token.value = data.token
      user.value = data.user
      localStorage.setItem('orbit_token', data.token)
      connectSocket(data.token)
      return data
    } finally {
      loading.value = false
    }
  }

  async function register(name, email, password) {
    loading.value = true
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      token.value = data.token
      user.value = data.user
      localStorage.setItem('orbit_token', data.token)
      connectSocket(data.token)
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    const { data } = await api.get('/auth/me')
    user.value = data
    return data
  }

  async function updateProfile(payload) {
    const { data } = await api.put('/auth/profile', payload)
    if (user.value) {
      user.value = { ...user.value, ...payload }
    }
    return data
  }

  async function changePassword(currentPassword, newPassword) {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword })
    return data
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('orbit_token')
    disconnectSocket()
  }

  return {
    token, user, loading, isLoggedIn,
    login, register, fetchMe, updateProfile, changePassword, logout
  }
})
