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
        <div class="visual-steps">
          <p class="visual-steps-label section-label">Get started in 3 steps</p>
          <div v-for="(step, i) in steps" :key="i" class="visual-step">
            <div class="step-number">{{ i + 1 }}</div>
            <div>
              <p class="step-title">{{ step.title }}</p>
              <p class="step-desc">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Form -->
    <div class="auth-form-side">
      <div class="auth-form-container">
        <div class="auth-form-header">
          <h1>Create account</h1>
          <p>Start managing your team projects</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div v-if="error" class="auth-error">
            <AlertCircle :size="14" />
            {{ error }}
          </div>

          <div class="field">
            <label class="label">Full name</label>
            <input
              v-model="form.name"
              type="text"
              class="input"
              placeholder="Alex Johnson"
              autocomplete="name"
              required
            />
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
                placeholder="Minimum 6 characters"
                autocomplete="new-password"
                minlength="6"
                required
              />
              <button type="button" class="pw-toggle" @click="showPw = !showPw">
                <EyeOff v-if="showPw" :size="14" />
                <Eye v-else :size="14" />
              </button>
            </div>

            <!-- Confirm Password -->
            <div class="input-wrap mt-3">
              <input
                v-model="form.confirmPassword"
                :type="showConfirmPw ? 'text' : 'password'"
                class="input"
                placeholder="Confirm password"
                autocomplete="new-password"
                required
              />
              <button type="button" class="pw-toggle" @click="showConfirmPw = !showConfirmPw">
                <EyeOff v-if="showConfirmPw" :size="14" />
                <Eye v-else :size="14" />
              </button>
            </div>

            <div class="pw-strength">
              <div
                v-for="i in 4"
                :key="i"
                class="pw-bar"
                :class="{ active: passwordStrength >= i }"
                :style="{ background: strengthColor }"
              />
            </div>
          </div>

          <!-- Terms Checkbox -->
          <div class="terms-checkbox">
            <input
              type="checkbox"
              id="terms"
              v-model="acceptedTerms"
              required
            />
            <label for="terms">
              I agree to the <a href="#" class="terms-link">Terms of Service</a> and <a href="#" class="terms-link">Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            class="btn btn-primary auth-submit"
            :disabled="loading || !acceptedTerms"
          >
            <LoadingSpinner v-if="loading" :size="15" />
            <UserPlus v-else :size="15" />
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <p class="auth-switch">
          Already have an account?
          <RouterLink to="/login">Sign in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const showPw = ref(false)
const showConfirmPw = ref(false)
const acceptedTerms = ref(false)

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const steps = [
  { title: 'Create your account', desc: 'Get access to your workspace in seconds' },
  { title: 'Set up a project', desc: 'Organize tasks with kanban boards' },
  { title: 'Invite your team', desc: 'Collaborate in real-time' }
]

const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/[0-9!@#$%^&*]/.test(p)) s++
  return s
})

const strengthColor = computed(() => {
  const c = ['#EF4444', '#F59E0B', '#22C55E', '#22C55E']
  return c[passwordStrength.value - 1] || '#5A5E66'
})

async function handleRegister() {
  error.value = ''

  if (form.password.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  if (!acceptedTerms.value) {
    error.value = 'You must accept the Terms and Privacy Policy'
    return
  }

  loading.value = true
  try {
    await authStore.register(form.name, form.email, form.password)
    router.push({ name: 'Dashboard' })
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create account'
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
  gap: 36px;
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

.visual-steps { display: flex; flex-direction: column; gap: 16px; }
.visual-steps-label { margin-bottom: 8px; }

.visual-step {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.step-number {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--accent-dim);
  border: 1px solid var(--accent-border);
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'JetBrains Mono', monospace;
}

.step-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.step-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

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
  gap: 24px;
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

.input-wrap { position: relative; margin-bottom: 8px; }
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
}

.pw-strength {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  margin-bottom: 12px;
}

.pw-bar {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: var(--border);
  transition: background 200ms;
}

.pw-bar.active { opacity: 1; }
.pw-bar:not(.active) { background: var(--border) !important; }

.terms-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.terms-checkbox input {
  margin-top: 3px;
}

.terms-link {
  color: var(--accent);
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

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
