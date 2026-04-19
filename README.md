# CarScout Frontend

## 1. Product Overview

CarScout Frontend is the web client for the CarScout marketplace platform. It supports three core personas:

- Buyers: discover, compare, and shortlist vehicles.
- Sellers: submit listings and manage sale-related actions.
- Administrators: monitor platform activity and manage operational workflows.

This application is built as a modular, role-aware React single-page app (SPA) with a service-layered integration pattern.

## 2. Business Objectives

- Deliver a fast and intuitive vehicle discovery and purchase journey.
- Enable scalable seller onboarding and listing management.
- Provide administrators with centralized visibility over transactions, communications, and user activity.
- Maintain consistent UX and reusable component standards across all modules.

## 3. Technical Stack

- React 19
- Vite 7
- React Router
- Material UI (MUI)
- Tailwind CSS
- Axios
- React Hook Form
- Framer Motion

## 4. Architecture Summary

The frontend follows a component-driven architecture with clear role segmentation and a dedicated service layer.

- UI composition: reusable presentational and container components under `src/components`.
- Page routing: role-aware route declarations and guards under `src/routes`.
- Layout consistency: shared navigation and panel layouts under `src/layouts`.
- State patterns: local component state, shared context for notifications, and custom hooks for composition.
- API abstraction: endpoint interaction through service modules in `src/services`.
- Utility modules: shared helpers for auth, image handling, and templates under `src/utils`.

## 5. Repository Structure

```text
src/
	components/
		admin/
		buyer/
		customer/
		notifications/
		seller/
	constants/
	context/
	hooks/
	layouts/
	pages/
		auth/
		buyer/
		seller/
	routes/
	services/
	utils/
```

## 6. Core Functional Domains

### 6.1 Buyer Experience

- Vehicle browsing and filtering.
- Car comparison insights.
- Favorites and wishlist-like interactions.
- Purchase and booking entry points.

### 6.2 Seller Experience

- Vehicle submission flow.
- Seller-facing listing operations.

### 6.3 Admin Operations

- Dashboard views for cars, users, inquiries, messages, reviews, reports, test drives, purchases, and wishlists.
- Role-protected admin routing.

### 6.4 Notification Framework

- Notification context provider (`src/context/NotificationContext.jsx`).
- Reusable notification hook (`src/hooks/useNotifications.js`).
- Service-level notification integration (`src/services/notificationService.js`).

## 7. Local Development Setup

### 7.1 Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### 7.2 Installation

```bash
npm install
```

### 7.3 Start Development Server

```bash
npm run dev
```

### 7.4 Production Build

```bash
npm run build
```

### 7.5 Preview Build

```bash
npm run preview
```

### 7.6 Linting

```bash
npm run lint
```

## 8. NPM Scripts

- `npm run dev`: start Vite development server.
- `npm run build`: generate production-ready frontend assets.
- `npm run preview`: serve the built output for local verification.
- `npm run lint`: execute ESLint quality checks.

## 9. Environment and Configuration

- Centralize runtime configuration in `src/config/appConfig.js`.
- Update endpoint and optional integration values in that config module.
- Access API and integration logic through the service layer only, not directly from view components.

## 10. Engineering Standards

- Maintain role-based module boundaries (buyer, seller, admin) to reduce coupling.
- Prefer shared components and utilities over duplicate implementations.
- Route all server communication through `src/services` for consistency and testability.
- Keep authentication logic centralized in `src/utils/auth.js`.
- Enforce lint compliance before merging.

## 11. Delivery and Quality Expectations

- All feature work should include route verification, component-level behavior validation, and service integration checks.
- Changes that affect role-specific dashboards should include regression checks for navigation and access control.
- UI updates should preserve consistency with existing design system patterns (MUI + utility styling).

## 12. Security and Access Considerations

- Use route guards for privileged areas (admin and protected user paths).
- Avoid embedding secrets in client-side code.
- Validate auth state transitions and protected navigation flows during QA.

## 13. Current Status

CarScout Frontend is in active development with modular role-based dashboards, expanding marketplace workflows, and a reusable notifications architecture.

## 14. Contact and Ownership

For ownership mapping, release approvals, and operational escalation paths, align this frontend repository with your internal team roster and engineering governance process.
