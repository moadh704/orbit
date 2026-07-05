<template>
  <div class="auth-page">
    <!-- Left: Premium visual panel -->
    <div class="auth-visual">
      <div class="visual-overlay">
        <div class="visual-logo">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="4" fill="var(--accent)"/>
            <ellipse cx="16" cy="16" rx="13" ry="5.5" stroke="var(--accent)" stroke-width="1.5" fill="none" transform="rotate(-30 16 16)" opacity="0.8"/>
            <circle cx="16" cy="3" r="2" fill="var(--accent)" opacity="0.6"/>
          </svg>
          <span class="visual-logo-text">Orbit</span>
        </div>
        <blockquote class="visual-quote">
          <p>"Clarity creates velocity. When your team knows what's next, everything accelerates."</p>
        </blockquote>
        <div class="visual-features">
          <div v-for="f in features" :key="f" class="visual-feature">
            <CheckCircle2 :size="14" />
            <span>{{ f }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Form -->
    <div class="auth-form-side">
      <div class="auth-form-container">
        <div class="auth-form-header">
          <h1>Welcome back</h1>
          <p>Sign in to your workspace</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div v-if="error" class="auth-error">
            <AlertCircle :size="14" />
            {{ error }}
          </div>

          <div class="field">
            <label class="label">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="input"
              placeholder="you@company.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="field">
            <label class="label">Password</label>
            <div class="input-wrap">
              <input
                v-model="form.password"
                :type="showPw ? 'text' : 'password'"
                class="input"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="pw-toggle"
                @click="showPw = !showPw"
                :title="showPw ? 'Hide' : 'Show'"
              >
                <EyeOff v-if="showPw" :size="14" />
                <Eye v-else :size="14" />
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary auth-submit" :disabled="loading">
            <LoadingSpinner v-if="loading" :size="15" />
            <LogIn v-else :size="15" />
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <p class="auth-switch">
          Don't have an account?
          <RouterLink to="/register">Create one</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const showPw = ref(false)

const form = reactive({ email: '', password: '' })

const features = [
  'Kanban boards with drag & drop',
  'Real-time team collaboration',
  'Activity tracking & analytics',
  'Role-based access control'
]

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(form.email, form.password)
    const redirect = router.currentRoute.value.query.redirect
    router.push(redirect || { name: 'Dashboard' })
  } catch (err) {
    error.value = err.response?.data?.message || 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  min-height: 100vh;
  background: var(--bg-app);
}

.auth-visual {
  position: relative;
  flex: 1;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(145deg, #0A0B0D 0%, #111214 100%);
}

@media (max-width: 768px) { .auth-visual { display: none; } }

.visual-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px;
  gap: 32px;
}

.visual-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.visual-logo-text {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.04em;
}

.visual-quote {
  max-width: 380px;
}

.visual-quote p {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  letter-spacing: -0.02em;
}

.visual-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.visual-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.visual-feature svg {
  color: var(--success);
  flex-shrink: 0;
}

.auth-form-side {
  width: 440px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-sidebar);
  border-left: 1px solid var(--border);
  padding: 40px;
}

@media (max-width: 768px) { .auth-form-side { width: 100%; border-left: none; } }

.auth-form-container {
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.auth-form-header h1 {
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  margin-bottom: 6px;
}

.auth-form-header p { font-size: 14px; color: var(--text-muted); }

.auth-form { display: flex; flex-direction: column; gap: 16px; }

.auth-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--danger-dim);
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px;
  font-size: 13px;
  color: var(--danger);
}

.field { display: flex; flex-direction: column; gap: 6px; }

.input-wrap { position: relative; }
.input-wrap .input { padding-right: 38px; }

.pw-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  padding: 2px;
  transition: color 100ms;
}
.pw-toggle:hover { color: var(--text-secondary); }

.auth-submit {
  width: 100%;
  height: 38px;
  justify-content: center;
  font-size: 14px;
  margin-top: 4px;
}

.auth-switch {
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}

.auth-switch a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}
</style>
