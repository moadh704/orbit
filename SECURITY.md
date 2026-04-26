# Security Policy

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in Orbit, we ask that you report it responsibly through private disclosure. This gives us time to investigate and release a fix before the issue is made public, protecting users in the meantime.

**Contact:** open a [GitHub Security Advisory](https://github.com/moadh704/orbit/security/advisories/new) (private, only visible to maintainers).

We will acknowledge your report within **48 hours** and aim to resolve confirmed vulnerabilities within **14 days**, depending on severity and complexity.

---

## Supported Versions

Only the latest version on the `main` branch is actively maintained and receives security fixes.

| Branch | Supported |
|--------|:---------:|
| `main` | ✅ |
| Feature branches | ❌ |
| Older tags | ❌ |

---

## Scope

### In Scope

The following are valid targets for security research:

- **Authentication & session management** — login, registration, JWT handling, token expiry, password change
- **Authorization & access control** — RBAC enforcement, project membership checks, cross-user data access
- **API endpoints** — all routes under `/api/*`, including edge cases and unexpected input
- **Input handling** — SQL injection, XSS via stored content, command injection, mass assignment
- **Invitation token security** — token entropy, expiry enforcement, reuse prevention
- **Rate limiting bypass** — circumventing brute-force protections on auth endpoints
- **CORS & header misconfiguration** — unexpected origins accepted, missing security headers
- **Real-time channel security** — Socket.io room isolation, unauthorized event subscription

### Out of Scope

The following will **not** be accepted as valid vulnerability reports:

- Vulnerabilities requiring physical access to a victim's device
- Self-XSS (where the attacker and victim are the same user)
- Social engineering attacks against maintainers or users
- Denial-of-service attacks (volumetric, resource exhaustion)
- Security issues in third-party dependencies not directly exploitable in this application — please report those upstream
- Missing `Secure` / `HttpOnly` flags on cookies (Orbit uses `Authorization` headers, not cookies)
- Rate limiting on non-auth endpoints (informational only)
- Theoretical vulnerabilities without a proof of concept
- Issues only exploitable on end-of-life browsers or non-standard configurations
- `npm audit` findings that are not exploitable in the context of this application

---

## What to Include in Your Report

A good report helps us reproduce and fix the issue faster. Please include:

1. **Description** — a clear explanation of the vulnerability and its impact
2. **Affected component** — endpoint, route, function, or file
3. **Steps to reproduce** — a minimal, reliable reproduction path
4. **Proof of concept** — a request/response pair, script, or screenshot demonstrating the issue
5. **Impact assessment** — what an attacker could achieve by exploiting this
6. **Suggested fix** — optional, but appreciated

The more detail you provide, the faster we can act.

---

## Severity Classification

We use the following severity levels, loosely aligned with CVSS:

| Severity | Description | Example |
|----------|-------------|---------|
| 🔴 **Critical** | Immediate risk of data breach or full account/system compromise | Authentication bypass, privilege escalation to owner, mass data exposure |
| 🟠 **High** | Significant impact, exploitation likely straightforward | IDOR allowing cross-project data access, stored XSS in task content |
| 🟡 **Medium** | Meaningful impact but with limiting factors | CSRF on state-changing action, rate limit bypass requiring specific conditions |
| 🔵 **Low** | Minimal impact or requires significant preconditions | Verbose error messages leaking stack traces, minor information disclosure |
| ⚪ **Informational** | No direct security impact but worth noting | Missing best-practice headers, non-exploitable misconfiguration |

---

## Response Timeline

| Milestone | Target |
|-----------|--------|
| Acknowledgement of report | 48 hours |
| Initial severity assessment | 5 business days |
| Patch development begins | Based on severity — Critical: immediately, High: within 7 days |
| Fix released | Within 14 days for Critical/High, 30 days for Medium/Low |
| Public disclosure | After fix is available, coordinated with reporter |

If a fix requires more time than the above targets (e.g. complex architectural change), we will communicate this to the reporter and agree on an extended timeline.

---

## Disclosure Policy

We follow a **coordinated disclosure** model:

1. Reporter submits vulnerability privately
2. Maintainers acknowledge and investigate
3. A fix is developed and tested
4. The fix is released
5. A public security advisory is published simultaneously, crediting the reporter (unless they request anonymity)

We ask reporters to **not disclose the vulnerability publicly** until a fix has been released. In return, we commit to acting promptly and keeping the reporter informed throughout the process.

We will **never** take legal action against researchers who follow this policy in good faith.

---

## Safe Harbor

We consider security research conducted under this policy to be:

- **Authorized** — we will not pursue civil or criminal action against researchers who act in good faith
- **Helpful** — we welcome responsible disclosure and treat reporters as partners, not adversaries
- **Confidential** — we will not share your identity without your permission

Good-faith research means: no accessing or modifying data belonging to other users, no disrupting production services, and no using vulnerabilities beyond what is necessary to demonstrate impact.

---

## Known Limitations

The following are known security trade-offs that are **intentional design decisions** and are not considered vulnerabilities:

| Limitation | Rationale |
|------------|-----------|
| JWT tokens are not revocable before expiry | Stateless auth — would require a token blacklist (Redis), increasing infrastructure complexity |
| Invite tokens are stored in plaintext | Tokens are high-entropy random values; hashing adds complexity without meaningful security gain for this threat model |
| Activity logs are append-only at the app layer | Deletion would require DB-level access; this is by design for audit integrity |
| No HTTPS enforcement at the application layer | TLS termination is expected to occur at the reverse proxy / load balancer level in production |

---

## Security-Related Dependencies

| Package | Purpose | Notes |
|---------|---------|-------|
| `bcryptjs` | Password hashing | Cost factor 10 (~100ms per hash) |
| `jsonwebtoken` | JWT signing & verification | HS256, 7-day expiry |
| `helmet` | HTTP security headers | Default preset + manual CSP tuning recommended in production |
| `express-rate-limit` | Brute-force protection | 10 req/15min on auth, 100 req/15min globally |
| `express-validator` | Input validation & sanitization | Applied on all auth routes |
| `cors` | Origin allowlist | Explicit allowlist, no wildcard |
| `crypto` (Node built-in) | Invitation token generation | `randomBytes(32)` — 256-bit entropy |

---

## Hardening Checklist for Production Deployment

Before deploying Orbit in a production environment, ensure the following:

- [ ] `JWT_SECRET` is a randomly generated string of at least 64 characters
- [ ] `CLIENT_URL` is set to your exact production origin (no trailing slash)
- [ ] Database credentials use a least-privilege MySQL user (SELECT, INSERT, UPDATE, DELETE only — no DROP, no GRANT)
- [ ] HTTPS is enforced at the reverse proxy level (Nginx / Caddy / AWS ALB)
- [ ] SMTP credentials use an app-specific password, not your primary account password
- [ ] `NODE_ENV=production` is set to suppress verbose error messages
- [ ] A log aggregation solution is in place to monitor activity logs and error rates
- [ ] Dependabot or `npm audit` runs on a schedule to catch new CVEs in dependencies
- [ ] Helmet's Content-Security-Policy is tightened beyond defaults for your specific asset origins
