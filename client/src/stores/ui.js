import { defineStore } from 'pinia'
import { ref } from 'vue'

let toastId = 0

export const useUiStore = defineStore('ui', () => {
  // Theme
  const theme = ref(localStorage.getItem('orbit_theme') || 'dark')
  const accent = ref(localStorage.getItem('orbit_accent') || 'violet')

  function initTheme() {
    applyTheme(theme.value, accent.value)
  }

  function setTheme(t) {
    theme.value = t
    localStorage.setItem('orbit_theme', t)
    applyTheme(t, accent.value)
  }

  function setAccent(a) {
    accent.value = a
    localStorage.setItem('orbit_accent', a)
    applyTheme(theme.value, a)
  }

  function applyTheme(t, a) {
    document.documentElement.setAttribute('data-theme', t)
    document.documentElement.setAttribute('data-accent', a)
  }

  // Sidebar
  const sidebarCollapsed = ref(false)
  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  // Toasts
  const toasts = ref([])

  function toast(message, type = 'info', duration = 3500) {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), duration)
    return id
  }

  function removeToast(id) {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }

  // Convenience wrappers
  const success = (msg, d) => toast(msg, 'success', d)
  const error = (msg, d) => toast(msg, 'error', d)
  const warn = (msg, d) => toast(msg, 'warning', d)
  const info = (msg, d) => toast(msg, 'info', d)

  // Confirm dialog
  const confirmState = ref({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    confirmVariant: 'danger',
    resolve: null
  })

  function confirm(title, message, confirmLabel = 'Confirm', confirmVariant = 'danger') {
    return new Promise(resolve => {
      confirmState.value = {
        open: true, title, message, confirmLabel, confirmVariant, resolve
      }
    })
  }

  function resolveConfirm(result) {
    confirmState.value.open = false
    if (confirmState.value.resolve) {
      confirmState.value.resolve(result)
    }
  }

  // Command palette
  const commandPaletteOpen = ref(false)
  function toggleCommandPalette() { commandPaletteOpen.value = !commandPaletteOpen.value }
  function closeCommandPalette() { commandPaletteOpen.value = false }

  return {
    theme, accent,
    initTheme, setTheme, setAccent,
    sidebarCollapsed, toggleSidebar,
    toasts, toast, removeToast, success, error, warn, info,
    confirmState, confirm, resolveConfirm,
    commandPaletteOpen, toggleCommandPalette, closeCommandPalette
  }
})
