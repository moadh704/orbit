<template>
  <div class="settings-page">
    <div class="settings-layout">
      <!-- Settings nav -->
      <nav class="settings-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="settings-nav-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <component :is="tab.icon" :size="15" />
          {{ tab.label }}
        </button>
      </nav>

      <!-- Settings content -->
      <div class="settings-content">

        <!-- Profile tab -->
        <div v-if="activeTab === 'profile'" class="settings-section">
          <div class="section-header">
            <h3>Profile</h3>
            <p>Update your personal information</p>
          </div>

          <form @submit.prevent="saveProfile" class="settings-form">
            <!-- Avatar preview -->
            <div class="avatar-section">
              <UserAvatar :name="profileForm.name || user?.name || ''" :size="60" />
              <div class="avatar-info">
                <p class="avatar-name">{{ profileForm.name || user?.name }}</p>
                <p class="avatar-hint">Avatar generated from your name</p>
              </div>
            </div>

            <div class="form-grid">
              <div class="field">
                <label class="label">Full name</label>
                <input v-model="profileForm.name" class="input" placeholder="Your name" />
              </div>

              <div class="field">
                <label class="label">Email</label>
                <input :value="user?.email" class="input" disabled style="opacity: 0.5; cursor: not-allowed;" />
              </div>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="savingProfile">
              <LoadingSpinner v-if="savingProfile" :size="13" />
              Save changes
            </button>
          </form>
        </div>

        <!-- Password tab -->
        <div v-if="activeTab === 'password'" class="settings-section">
          <div class="section-header">
            <h3>Change Password</h3>
            <p>Keep your account secure with a strong password</p>
          </div>

          <form @submit.prevent="savePassword" class="settings-form">
            <div class="field">
              <label class="label">Current password</label>
              <input
                v-model="passwordForm.current"
                type="password"
                class="input"
                placeholder="••••••••"
                autocomplete="current-password"
              />
            </div>

            <div class="field">
              <label class="label">New password</label>
              <input
                v-model="passwordForm.newPass"
                type="password"
                class="input"
                placeholder="Minimum 6 characters"
                autocomplete="new-password"
              />
              <div class="pw-strength">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="pw-bar"
                  :class="{ active: passwordStrength >= i }"
                  :style="{ background: passwordStrength >= i ? strengthColor : 'var(--border)' }"
                />
              </div>
            </div>

            <div class="field">
              <label class="label">Confirm new password</label>
              <input
                v-model="passwordForm.confirm"
                type="password"
                class="input"
                placeholder="Repeat new password"
                autocomplete="new-password"
              />
              <p v-if="passwordForm.confirm && passwordForm.confirm !== passwordForm.newPass" class="field-error">
                Passwords don't match
              </p>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              :disabled="savingPassword || !passwordsMatch"
            >
              <LoadingSpinner v-if="savingPassword" :size="13" />
              Update password
            </button>
          </form>
        </div>

        <!-- Appearance tab -->
        <div v-if="activeTab === 'appearance'" class="settings-section">
          <div class="section-header">
            <h3>Appearance</h3>
            <p>Customize how Orbit looks for you</p>
          </div>

          <!-- Theme picker -->
          <div class="appear-section">
            <p class="appear-label">Theme</p>
            <div class="theme-options">
              <button
                v-for="t in themes"
                :key="t.key"
                class="theme-option"
                :class="{ selected: currentTheme === t.key }"
                @click="setTheme(t.key)"
              >
                <div class="theme-preview" :class="`theme-preview-${t.key}`">
                  <div class="tp-sidebar" />
                  <div class="tp-content">
                    <div class="tp-card" />
                    <div class="tp-card tp-card-sm" />
                  </div>
                </div>
                <span class="theme-label">{{ t.label }}</span>
                <div v-if="currentTheme === t.key" class="theme-check">
                  <CheckCircle2 :size="14" />
                </div>
              </button>
            </div>
          </div>

          <!-- Accent picker -->
          <div class="appear-section">
            <p class="appear-label">Accent color</p>
            <div class="accent-options">
              <button
                v-for="a in accents"
                :key="a.key"
                class="accent-option"
                :class="{ selected: currentAccent === a.key }"
                :style="{ background: a.color }"
                :title="a.label"
                @click="setAccent(a.key)"
              >
                <CheckCircle2 v-if="currentAccent === a.key" :size="14" color="#fff" />
              </button>
            </div>
          </div>

          <!-- Font preview -->
          <div class="appear-section">
            <p class="appear-label">Typography preview</p>
            <div class="font-preview">
              <p class="fp-heading">Bricolage Grotesque — Headings</p>
              <p class="fp-body">DM Sans — Body text. Clean, readable, 13px base.</p>
              <p class="fp-mono">JetBrains Mono — IDs, timestamps #001 2024-01-15</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { User, Lock, Palette, CheckCircle2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import UserAvatar from '@/components/ui/UserAvatar.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const authStore = useAuthStore()
const uiStore = useUiStore()
const { user } = storeToRefs(authStore)
const { theme: currentTheme, accent: currentAccent } = storeToRefs(uiStore)
const { setTheme, setAccent } = uiStore

const activeTab = ref('profile')

const tabs = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'password', label: 'Password', icon: Lock },
  { key: 'appearance', label: 'Appearance', icon: Palette }
]

const themes = [
  { key: 'dark', label: 'Dark' },
  { key: 'dim', label: 'Dim' },
  { key: 'light', label: 'Light' }
]

const accents = [
  { key: 'violet', label: 'Violet', color: '#7C5CFF' },
  { key: 'blue', label: 'Blue', color: '#3B82F6' },
  { key: 'cyan', label: 'Cyan', color: '#06B6D4' },
  { key: 'green', label: 'Green', color: '#22C55E' },
  { key: 'orange', label: 'Orange', color: '#F97316' },
  { key: 'rose', label: 'Rose', color: '#F43F5E' }
]

const savingProfile = ref(false)
const savingPassword = ref(false)

const profileForm = reactive({ name: '' })
const passwordForm = reactive({ current: '', newPass: '', confirm: '' })

const passwordStrength = computed(() => {
  const p = passwordForm.newPass
  if (!p) return 0
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/[0-9!@#$%^&*]/.test(p)) s++
  return s
})

const strengthColor = computed(() => {
  return ['#EF4444', '#F59E0B', '#22C55E', '#22C55E'][passwordStrength.value - 1] || '#5A5E66'
})

const passwordsMatch = computed(() =>
  passwordForm.newPass &&
  passwordForm.confirm === passwordForm.newPass &&
  passwordForm.current
)

async function saveProfile() {
  savingProfile.value = true
  try {
    await authStore.updateProfile({ name: profileForm.name })
    uiStore.success('Profile updated')
  } catch (err) {
    uiStore.error(err.response?.data?.message || 'Failed to update profile')
  } finally {
    savingProfile.value = false
  }
}

async function savePassword() {
  if (!passwordsMatch.value) return
  savingPassword.value = true
  try {
    await authStore.changePassword(passwordForm.current, passwordForm.newPass)
    uiStore.success('Password updated successfully')
    Object.assign(passwordForm, { current: '', newPass: '', confirm: '' })
  } catch (err) {
    uiStore.error(err.response?.data?.message || 'Failed to update password')
  } finally {
    savingPassword.value = false
  }
}

onMounted(() => {
  if (user.value) {
    profileForm.name = user.value.name || ''
  }
})
</script>

<style scoped>
.settings-page { max-width: 900px; }

.settings-layout {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 32px;
}

@media (max-width: 600px) {
  .settings-layout { grid-template-columns: 1fr; }
}

/* Nav */
.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.settings-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 10px;
  border: none;
  border-radius: 8px;
  background: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: left;
  transition: background 100ms, color 100ms;
}

.settings-nav-item:hover {
  background: var(--bg-card-hover);
  color: var(--text-primary);
}

.settings-nav-item.active {
  background: var(--accent-dim);
  border: 1px solid var(--accent-border);
  color: var(--text-primary);
}

.settings-nav-item.active svg { color: var(--accent); }

/* Content */
.settings-content { }

.settings-section { display: flex; flex-direction: column; gap: 24px; }

.section-header { }

.section-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}

.section-header p { font-size: 13px; color: var(--text-muted); }

.settings-form { display: flex; flex-direction: column; gap: 16px; max-width: 480px; }

/* Avatar section */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.avatar-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.avatar-hint { font-size: 12px; color: var(--text-muted); margin-top: 3px; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 500px) { .form-grid { grid-template-columns: 1fr; } }

.field { display: flex; flex-direction: column; gap: 6px; }

.field-error {
  font-size: 12px;
  color: var(--danger);
  margin-top: 2px;
}

.pw-strength { display: flex; gap: 4px; margin-top: 6px; }
.pw-bar { flex: 1; height: 3px; border-radius: 2px; transition: background 200ms; }

/* Appearance */
.appear-section { display: flex; flex-direction: column; gap: 10px; }

.appear-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Theme options */
.theme-options { display: flex; gap: 12px; flex-wrap: wrap; }

.theme-option {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: none;
  border: 2px solid var(--border);
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  transition: border-color 150ms;
}

.theme-option:hover { border-color: var(--border-hover); }
.theme-option.selected { border-color: var(--accent); }

.theme-preview {
  width: 100px;
  height: 64px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
}

.theme-preview-dark { background: #0A0B0D; }
.theme-preview-dim { background: #16161E; }
.theme-preview-light { background: #FAFAFA; }

.tp-sidebar {
  width: 24px;
  height: 100%;
}

.theme-preview-dark .tp-sidebar { background: #0E0F11; }
.theme-preview-dim .tp-sidebar { background: #1A1A24; }
.theme-preview-light .tp-sidebar { background: #FFFFFF; border-right: 1px solid rgba(0,0,0,0.06); }

.tp-content {
  flex: 1;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tp-card {
  border-radius: 3px;
  height: 18px;
}

.tp-card-sm { height: 12px; }

.theme-preview-dark .tp-card { background: #111214; }
.theme-preview-dim .tp-card { background: #1E1E28; }
.theme-preview-light .tp-card { background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); }

.theme-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.theme-check {
  position: absolute;
  top: 6px;
  right: 6px;
  color: var(--accent);
}

/* Accent options */
.accent-options { display: flex; gap: 8px; flex-wrap: wrap; }

.accent-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 100ms, border-color 150ms;
}

.accent-option:hover { transform: scale(1.1); }

.accent-option.selected {
  border-color: var(--text-primary);
  transform: scale(1.1);
}

/* Font preview */
.font-preview {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fp-heading {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.fp-body {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.fp-mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
