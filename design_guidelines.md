# Patient Expense Form - Design Guidelines

## Design Approach
**Utility-Focused Design System Approach** - Using Material Design principles for healthcare applications, prioritizing efficiency, clarity, and accessibility for medical data entry workflows.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 200 80% 35% (Medical Blue)
- Background: 0 0% 98% (Clean White)
- Surface: 0 0% 95% (Light Gray)
- Success: 142 70% 45% (Validation Green)
- Warning: 38 90% 50% (Attention Orange)

**Dark Mode:**
- Primary: 200 70% 60% (Lighter Medical Blue)
- Background: 215 25% 8% (Dark Navy)
- Surface: 215 20% 12% (Card Gray)
- Success: 142 60% 55% (Muted Green)
- Warning: 38 80% 60% (Softer Orange)

### B. Typography
- **Primary Font:** Inter (Google Fonts)
- **Headers:** 600 weight, sizes 24px, 20px, 18px
- **Body:** 400 weight, 16px for forms, 14px for labels
- **Captions:** 400 weight, 12px for helper text

### C. Layout System
**Tailwind Spacing Primitives:** 2, 4, 6, 8, 12, 16 units
- Form sections: p-6, gap-4
- Input groups: space-y-4
- Cards: p-6, rounded-lg
- Buttons: px-6, py-3

### D. Component Library

**Core Components:**
- **Smart Form Container:** Single-page layout with sticky mandatory section at top
- **Collapsible Section Cards:** Material Design elevated cards with expand/collapse functionality
- **Input Fields:** Floating labels, consistent sizing (h-12), focus states with primary color
- **Progress Indicators:** Linear progress bar showing completion status
- **Action Buttons:** Primary (filled), secondary (outlined), with appropriate sizing
- **Status Badges:** Small indicators for completed/optional sections

**Navigation:**
- **Section Navigation:** Left sidebar with section status indicators
- **Quick Actions:** Floating action buttons for common tasks like "Add Receipt"
- **Form Controls:** Sticky bottom bar with Save/Submit actions

**Data Display:**
- **Receipt Preview Cards:** Compact preview of uploaded documents
- **Summary Tables:** Clean, scannable layout for expense totals
- **Validation Messages:** Inline error states with clear messaging

**Overlays:**
- **Upload Modals:** Clean file upload interface with drag-drop
- **Confirmation Dialogs:** Simple, focused decision points
- **Auto-save Notifications:** Subtle toast messages

### E. Key UX Patterns

**Smart Workflow:**
- Mandatory fields (Patient, Study, Visit, Date) always visible at top
- Optional sections collapsed by default with clear "Add [Section]" buttons
- Visual hierarchy emphasizing required vs. optional content
- Auto-validation that doesn't block progression through optional sections

**Efficiency Features:**
- Quick-add buttons for common scenarios
- Keyboard navigation support
- Auto-save with visual feedback
- One-click section completion for empty optionals

**Visual Hierarchy:**
- Mandatory section: Elevated card with primary color accent
- Optional sections: Standard elevation with muted borders when collapsed
- Completed sections: Success color accent with checkmark
- Active section: Highlighted border and shadow

The design prioritizes speed and clarity for medical operators while maintaining professional healthcare application standards.