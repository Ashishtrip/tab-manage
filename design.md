# Bastion: Design System & Product Design Guidelines

This document outlines the visual language, user experience (UX) flows, and design tokens for **Bastion**, aiming for an Apple-level, high-end product experience. The focus is on radical simplicity, cognitive ease, and fluid interaction.

## 1. Core Design Principles

- **Radical Simplicity:** Remove everything that is not essential to managing and navigating tabs.
- **Cognitive Design (Zero Load):** The user should never have to think about *how* to use the tool. The hierarchy and relationships of the tab tree must be instantly intuitive.
- **Fluidity & Motion:** Interactions should feel physical. Dragging, dropping, and expanding folders must have immediate, smooth visual feedback.
- **Material Honesty:** Use depth, shadows, and glassmorphism (blur) purposefully to indicate z-index and hierarchy, not just for decoration.

## 2. Design Tokens

### Color Palette
A calming, sophisticated palette designed to reduce the anxiety of information overload (too many tabs).

```json
{
  "color": {
    "brand": {
      "primary": "#6C63FF",      // Auri Purple: for primary actions, active states
      "primary-dark": "#5A52E0", // Hover states for primary actions
      "accent": "#FF6B9D",       // Auri Pink: for highlights, delightful moments
      "surface": "#F8F7FF"       // Workspace background
    },
    "neutral": {
      "900": "#111827",          // Primary text
      "600": "#4B5563",          // Secondary text, inactive tabs
      "200": "#E5E7EB",          // Borders, dividers
      "50":  "#F9FAFB"           // Subtle off-white for nested folder backgrounds
    }
  }
}
```

### Typography
Clean, highly readable sans-serif typography.

- **Family:** Inter (or SF Pro on Apple devices)
- **H1 (Workspace Title):** 28px, Semi-Bold (600), Line 1.3
- **H2 (Folder Name):** 16px, Semi-Bold (600), Line 1.5
- **Body (Tab Title):** 14px, Regular (400), Line 1.5
- **Small (URL / Metadata):** 12px, Regular (400), Line 1.5

### Spacing & Grid
A strict 4px/8px baseline grid to ensure perfect rhythm.

- **xs:** 4px (Between icon and text in a tab)
- **sm:** 8px (Between sibling tabs)
- **md:** 16px (Padding inside a tab row)
- **lg:** 24px (Indentation for child tabs in the tree)
- **xl:** 32px (Margin between tab clusters/folders)

### Elevation & Shadows
Used to communicate depth, especially when dragging tabs.

- **sm (Resting Tab):** `0 1px 3px rgba(0,0,0,0.05)`
- **md (Hovered Tab):** `0 4px 12px rgba(0,0,0,0.08)`
- **lg (Dragged Tab):** `0 20px 40px rgba(0,0,0,0.15)`

### Motion & Animation
- **Fast (Hover States):** `150ms ease-out`
- **Normal (Expand/Collapse Folder):** `250ms ease-in-out`
- **Slow (Workspace Transition):** `400ms cubic-bezier(0.34, 1.56, 0.64, 1)`

## 3. UX Flows & Interactions

### The Onboarding Flow (First 5 Minutes)
1. **The Promise:** "Regain control of your mind." Clean, minimalist landing screen.
2. **Immediate Action:** "Import current tabs into a workspace." No mandatory account creation required to see the magic happen.
3. **The Aha Moment:** The user sees their chaotic 50 tabs instantly organized into a clean, collapsible tree structure.

### Empty States
Instead of a blank white screen when a workspace has no tabs:
- Show a subtle, elegant illustration.
- Message: "A clear mind. Start a new research thread or open a tab to begin."
- CTA: "Import Tabs from Browser"

### Tree Interaction Mechanics
- **Hover:** Subtle background highlight + `150ms` shadow elevation.
- **Drag & Drop:** The dragged tab becomes translucent, casting a deep shadow (`lg`). The drop target is indicated by a glowing brand-colored line (`primary`).
- **Focus Mode:** Dim all tabs that are not part of the currently active parent-child branch.

## 4. Accessibility (A11y)
- **Keyboard Navigation:** Full support for `Up/Down` arrows to navigate the tree, `Right/Left` to expand/collapse folders, and `Shift + Arrows` to move tabs.
- **Contrast:** Ensure all tab text against the surface background meets the WCAG 2.1 AA 4.5:1 contrast ratio.
- **Screen Readers:** Use semantic HTML (`<ul>`, `<li>`) with proper `aria-expanded` and `aria-level` attributes so screen readers can accurately announce the tree depth and relationships.
