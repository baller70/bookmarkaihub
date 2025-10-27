# DNA Profile Implementation Plan

## Files to Create/Update:

### 1. Main Page
- app/dna-profile/page.tsx (complete rewrite)

### 2. Sub-pages/Routes
- app/favorites/page.tsx
- app/playbooks/page.tsx  
- app/search/page.tsx
- app/analytics/page.tsx
- app/time-capsule/page.tsx

### 3. Components
- components/dna-profile/about-you.tsx
- components/dna-profile/favorites-view.tsx
- components/dna-profile/playbooks-view.tsx
- components/dna-profile/search-view.tsx
- components/dna-profile/analytics-view.tsx
- components/dna-profile/time-capsule-view.tsx
- components/dna-profile/dna-sidebar.tsx

### 4. Modals/Dialogs
- components/dna-profile/search-history-modal.tsx
- components/dna-profile/ai-assistant-modal.tsx
- components/dna-profile/generate-playbook-modal.tsx

### 5. API Routes
- app/api/dna-profile/route.ts
- app/api/dna-profile/favorites/route.ts
- app/api/dna-profile/playbooks/route.ts
- app/api/dna-profile/search-history/route.ts
- app/api/dna-profile/time-capsules/route.ts

### 6. Types
- Update lib/types.ts with DNA Profile types

## Implementation Strategy:
1. Create types first
2. Create API routes
3. Create reusable components
4. Create main pages
5. Test and iterate
