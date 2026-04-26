# Orbit Design System — UI Skill

## Identity
Orbit is a premium team project management platform. It should look and feel like a $50M SaaS product — not a student project, not a template, not AI slop.

Reference products: Linear, Vercel, Raycast, Height, Supabase. Study their restraint, their density, their typography hierarchy. Orbit lives in this family.

## Anti-Patterns — DO NOT DO THESE
These are the hallmarks of AI-generated UI. Avoid all of them:
- Generic gradient backgrounds (especially purple-to-blue on white)
- Oversized hero sections with meaningless taglines
- Cards with uniform sizes in a perfect grid
- Rounded pill buttons everywhere
- Drop shadows on every element
- Inter, Roboto, Arial, or system-ui as primary fonts
- Rainbow color schemes with no hierarchy
- Placeholder lorem ipsum content
- Stock illustration style (abstract blobs, generic people)
- Borders on everything — use elevation through brightness instead
- Excessive use of icons without purpose
- Centered text blocks for everything
- Uniform spacing and sizing — everything same height, same width
- Overuse of opacity/transparency
- Decorative elements that serve no function

## Typography
- **Headings**: Bricolage Grotesque or Cabinet Grotesk — bold, geometric, tight tracking (-0.02em)
- **Body**: DM Sans — clean, readable, 13-14px base
- **Mono**: JetBrains Mono — for IDs, timestamps, technical metadata, code
- **Hierarchy**: Use weight and size to create clear levels, not color
- **Leading**: Tight. 1.2 for headings, 1.5 for body
- **NEVER use**: Inter, Roboto, Arial, Space Grotesk, Poppins, or system fonts

## Color System — Elevation Through Brightness
Premium dark is NOT just "make everything black." It's an elevation system where higher = brighter.

### Dark Theme (default)
```
--bg-app:        #0A0B0D     // Deepest background
--bg-sidebar:    #0E0F11     // Slightly brighter
--bg-card:       #111214     // Cards and surfaces
--bg-card-hover: #16181C     // Hover state
--bg-elevated:   #1C1E22     // Modals, dropdowns, popovers
--bg-input:      #111214     // Input backgrounds

--border:        rgba(255,255,255,0.06)   // Default borders
--border-hover:  rgba(255,255,255,0.12)   // Hover borders
--border-active: rgba(255,255,255,0.18)   // Active/focus borders

--text-primary:  #E6E7EA     // Headings, primary content
--text-secondary:#9CA0A8     // Labels, descriptions
--text-muted:    #5A5E66     // Timestamps, hints, disabled
--text-inverse:  #0A0B0D     // Text on accent backgrounds

--accent:        #7C5CFF     // Primary accent (violet)
--accent-hover:  #6B4FE0     // Accent hover
--accent-dim:    rgba(124,92,255,0.12)  // Accent backgrounds
--accent-border: rgba(124,92,255,0.25)  // Accent borders

--success:       #22C55E
--success-dim:   rgba(34,197,94,0.12)
--warning:       #F59E0B
--warning-dim:   rgba(245,158,11,0.12)
--danger:        #EF4444
--danger-dim:    rgba(239,68,68,0.12)
--info:          #38BDF8
--info-dim:      rgba(56,189,248,0.12)
```

### Dim Theme
Same structure, warmer base:
```
--bg-app:        #16161E
--bg-sidebar:    #1A1A24
--bg-card:       #1E1E28
--bg-card-hover: #24242E
```

### Light Theme
```
--bg-app:        #FAFAFA
--bg-sidebar:    #FFFFFF
--bg-card:       #FFFFFF
--bg-card-hover: #F5F5F5
--border:        rgba(0,0,0,0.08)
--text-primary:  #111111
--text-secondary:#666666
--text-muted:    #999999
```

## Component Design Rules

### Cards
- Background: var(--bg-card)
- Border: 1px solid var(--border) — NOT box-shadow
- Border-radius: 12px consistently
- Hover: background shifts to var(--bg-card-hover), border to var(--border-hover)
- NO drop shadows on dark theme — shadows are invisible on dark
- Padding: 16-20px

### Buttons
- Primary: solid accent background, white text, 8px radius
- Secondary/Ghost: transparent, 1px border, 8px radius
- Size: 32-36px height, 13px font
- Hover: subtle brightness shift, NOT color change
- Active: translateY(1px)
- NEVER fully rounded pill buttons — use 8px radius

### Inputs
- Background: var(--bg-input) with var(--border)
- Focus: border shifts to var(--accent-border)
- Height: 36px
- Font: 13px
- Placeholder: var(--text-muted)

### Status & Priority Badges
- NEVER use solid-color pills on dark backgrounds
- Fill: hue at 10-15% opacity
- Text: same hue at 80% lightness
- Border: same hue at 20% opacity (optional)
- Height: 22px, font: 11px, fully rounded, uppercase, letter-spacing 0.05em
- Priority colors: Critical=#A855F7, High=#EF4444, Medium=#F59E0B, Low=#22C55E

### Avatars
- Size: 24-32px, fully rounded
- Gradient backgrounds based on user's name hash
- Stack: overlap by 8px, ring-1 in card color to carve out
- Show 3 max, then +N capsule
- Unassigned: dashed border circle with faint + icon

### Sidebar
- Width: 240px (expanded), 56px (collapsed)
- Background: var(--bg-sidebar)
- Right border: 1px solid var(--border)
- Nav items: 32px height, 8px radius, 13px font
- Active item: accent-dim background, accent-border, white text
- Hover: rgba(255,255,255,0.04) background
- Section labels: 10px, uppercase, 0.12em letter-spacing, var(--text-muted)
- Project dots: 8px circles with project color
- User area at bottom: avatar + name + role, bordered card

### Tables & Lists
- NO alternating row colors
- Separator: 1px border-bottom var(--border)
- Row hover: var(--bg-card-hover)
- Header: var(--text-muted), 11px uppercase, 0.06em letter-spacing
- Cells: 13px, var(--text-primary)

### Kanban Board
- Columns: var(--bg-card) with var(--border)
- Column header: status dot (6px) + name + count badge
- Cards: var(--bg-elevated) with var(--border), 8px radius
- Card hover: lift translateY(-1px), border brightens
- Drag ghost: original at 40% opacity, floating card full opacity
- Drop indicator: 2px accent line between cards
- "+ Add task" at column bottom: dashed border, muted text

### Modals & Slide-overs
- Background: var(--bg-elevated)
- Overlay: rgba(0,0,0,0.6) with backdrop-filter: blur(4px)
- Border: 1px solid var(--border)
- Border-radius: 16px for modals, 0 for slide-overs (edge-anchored)
- Max-width: 480px for modals, 420px for slide-overs

### Toast Notifications
- Position: bottom-right
- Background: var(--bg-elevated) with var(--border)
- Border-radius: 10px
- Success: left accent bar in green
- Error: left accent bar in red
- Auto dismiss: 3.5 seconds
- Enter: slide up + fade in
- Exit: slide down + fade out

## Animation Rules
- Page transitions: 200ms ease, slide + fade
- Card hover: 150ms, translateY(-1px)
- Button hover: 100ms, brightness shift
- Progress bars: animate from 0 on mount, 1s ease
- Stat counters: count up from 0 with GSAP, 800ms
- List items: stagger 50ms per item on mount using auto-animate
- Skeleton shimmer: gradient #111214 → #1C1E22, 1.4s linear infinite
- Spring physics for drag and drop: stiffness 300, damping 30
- NEVER use bounce easing — it looks cheap
- NEVER animate everything at once — stagger and prioritize

## Layout Rules
- Dashboard: bento grid — asymmetric tile sizes, not uniform cards
- Gap: 16px between tiles
- Sidebar: fixed left, main content scrolls
- Content padding: 24-32px
- Max content width: none — full width with sidebar offset
- Responsive: sidebar collapses to icon-only on tablet, hides on mobile

## What Makes It Premium
1. **Restraint** — not every element needs a border, shadow, or animation
2. **Density** — 13px base font, 32px buttons, tight spacing — respect the user's screen
3. **Consistency** — same border radius, same spacing scale, same font sizes everywhere
4. **Speed** — every interaction under 100ms, every transition under 200ms
5. **Details** — mono font on IDs, proper date formatting, keyboard shortcuts shown
6. **Hierarchy** — one focal point per surface, clear reading order
7. **Intentionality** — every design decision has a reason, nothing is default
