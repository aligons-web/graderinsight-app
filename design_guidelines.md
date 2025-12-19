# GraderInsight Design Guidelines

## Design Approach
**System-Based Design** optimized for productivity and efficiency. Drawing inspiration from tools like Linear, Notion, and Asana that prioritize clarity and usability for time-constrained professionals.

## Core Design Principles
1. **Cognitive Efficiency**: Minimize mental load through clear hierarchy and consistent patterns
2. **Speed-Optimized Workflows**: Prioritize quick task completion over visual flair
3. **Professional Authority**: Convey reliability and intelligence through restrained aesthetics
4. **Accessibility First**: Ensure legibility and usability for educators in varied environments

## Typography System
**Font Family**: Poppins (all contexts)

**Scale**:
- H1: 36px/42px (Page titles)
- H2: 28px/36px (Section headers)
- H3: 22px/28px (Card/panel titles)
- Body: 16px/24px (Primary text)
- Small: 14px/20px (Meta information, helper text)

**Weights**:
- Headings: 600 (Semibold)
- Body: 400 (Regular)
- Emphasis: 500 (Medium)

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 exclusively
- Micro spacing: p-2, gap-2 (8px)
- Standard spacing: p-4, gap-4 (16px)
- Section spacing: p-6, gap-6 (24px)
- Major spacing: p-8, gap-8 (32px)

**Container Widths**:
- App shell: max-w-7xl mx-auto
- Content panels: max-w-4xl
- Form containers: max-w-2xl

**Grid Patterns**:
- Sidebar + Main: 280px fixed sidebar + flex-1 main content area
- Two-column forms: grid-cols-1 md:grid-cols-2 gap-6
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

## Color Application

**Defined Palette**:
- Primary: #894596 (actions, CTAs, active states)
- Secondary: #828282 (muted elements, disabled states)
- Accent: #44e489 (success, confirmations, progress)
- Background: #fafafa (page background)
- Success: #44e489
- Warning: #f59e0b
- Error: #ef4444
- Muted Text: #6b7280
- Border: #e5e7eb

**Usage Rules**:
- Primary buttons and primary actions: bg-[#894596]
- Success indicators: bg-[#44e489]
- Page backgrounds: bg-[#fafafa]
- Card/panel backgrounds: bg-white
- Borders: border-[#e5e7eb]
- Secondary text: text-[#828282]

## Component Library

**Navigation**:
- Fixed left sidebar (280px) with logo, main navigation, and user profile at bottom
- Top bar with breadcrumbs, search, and quick actions
- Navigation items: px-4 py-2 rounded-lg with hover:bg-gray-100

**Cards/Panels**:
- White background with rounded-lg (8px radius)
- Subtle shadow: shadow-sm
- Padding: p-6
- Border: border border-[#e5e7eb]

**Buttons**:
- Primary: bg-[#894596] text-white px-6 py-2 rounded-lg font-medium
- Secondary: bg-white border-2 border-[#e5e7eb] px-6 py-2 rounded-lg
- Icon buttons: p-2 rounded-lg hover:bg-gray-100
- Destructive: bg-[#ef4444] text-white

**Form Inputs**:
- Height: h-12
- Padding: px-4
- Border: border-2 border-[#e5e7eb] rounded-lg
- Focus: border-[#894596] ring-2 ring-[#894596]/20
- Labels: text-sm font-medium mb-2

**Tables** (for rubric criteria lists):
- Striped rows: even:bg-gray-50
- Cell padding: px-6 py-4
- Headers: bg-gray-100 font-semibold

**Modals/Dialogs**:
- Overlay: bg-black/40 backdrop-blur-sm
- Container: bg-white rounded-xl shadow-2xl max-w-2xl mx-auto p-8
- Close button: top-right absolute positioning

## Rubric Builder/Editor Specific Layout

**Page Structure**:
- Top bar: Rubric title (editable H1), Save/Cancel buttons (right-aligned)
- Two-panel layout: Left panel (criteria list, 50%), Right panel (criteria editor, 50%)
- Bottom action bar: Add Criterion button, Import Template, Delete Rubric

**Criteria Card Design**:
- Each criterion: white card with shadow-sm, p-6, mb-4
- Drag handle icon (left edge)
- Criterion name (H3), weight/points input (right-aligned)
- Proficiency levels: horizontal tabs or segmented control
- Score input + description textarea per level
- Remove criterion button (destructive, icon-only)

**Interactive Elements**:
- Drag-and-drop reordering with visual feedback (dashed border on hover)
- Inline editing for criterion names
- Expandable/collapsible sections for proficiency level details
- Point total calculator (sticky footer showing total points)

## Visual Treatments

**Shadows**: Use sparingly - shadow-sm for cards, shadow-lg for modals only
**Rounded Corners**: rounded-lg (8px) for all major components
**Gradients**: None - use solid colors for clarity
**Animations**: Minimal - smooth transitions only (transition-all duration-200)

## Images
No large hero images for internal app pages. Landing page (page 1) will include hero section with background image showing educators at work with laptop, overlaid with blurred-background CTAs.