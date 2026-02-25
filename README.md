La Serenity – Enterprise Wellness Platform


A high-performance, multilingual wellness ecosystem featuring a Django/Wagtail headless CMS and a React-based SPA. This platform facilitates professional massage service management, integrated voucher-linked booking systems, and automated media pipelines.

🏗 High-Level Architecture


The system follows a modern decoupled architecture designed for low latency, high developer velocity, and type safety:


- Core: Django 5.1 / Wagtail 6.x (Headless)

- Frontend: React 19 / TanStack Router / TanStack Query (v5)

- Infrastructure: Containerized via Docker, deployed on Fly.io (Backend) and Cloudflare Pages (Frontend).

- Persistence: Serverless PostgreSQL (Neon) & Upstash Redis (Caching).


---

🚀 Recent Refactor & Improvements

1. Unified Booking & Voucher Engine

- Atomic Bookings: The bookings app is now tightly coupled with the vouchers system. Successful booking flows now trigger real-time calendar placement and voucher validation/redemption in a single transactional flow.

- Service Layer Pattern: Business logic moved from views to services.py and selectors.py for better testability and reuse.

- Availability Logic: Dedicated availability app with a calendar_gateway.py to manage complex scheduling constraints.

2. High-Performance Toolchain

- Backend: Migrated from pip to uv. Dependency resolution and environment syncing are now near-instant.

- Frontend: Swapped pnpm for bun. Leverages Bun's high-speed runtime for a leaner CI/CD pipeline and faster local development.

3. Frontend Architecture Evolution

- TanStack Router: Fully type-safe routing with routeTree.gen.ts. Replaced traditional navigation with a robust, tree-based routing system.

- TanStack Query (React-Query): Centralized all server state in src/queries/. Replaced disparate useEffect hooks with declarative queries and mutations, providing zero-boilerplate data fetching and optimized cache invalidation.

- Domain-Driven Design: Organized the frontend by features/ (Booking, Testimonials, Home) and api/ clients to mirror the backend's modularity.


---

🛠 Tech Stack

Component	Technology
Runtime (BE)	Python 3.12+, uv
Runtime (FE)	Node.js / Bun
CMS	Wagtail 6.x (Headless)
API	Django REST Framework (DRF)
Frontend	React 19, TypeScript, TanStack Router, TanStack Query
Database	Neon (PostgreSQL)
Cache	Upstash Redis
Media	Cloudinary (CDN + Optimization)

---

📁 Project Structure

Backend Layout (/apps)

	├── availability/    # Calendar gateway & scheduling logic
	├── bookings/        # Booking lifecycle & service coordination
	├── cms/             # Headless Wagtail models, Pages, & Serializers
	├── contact/         # Transactional email services
	├── core/            # Middleware, CSP, & Custom Image Handling
	├── payments/        # Stripe/Payment integration logic
	├── services/        # Service definitions & business logic
	├── testimonials/    # Moderated client reviews
	└── vouchers/        # Gift voucher generation & redemption

Frontend Layout (/src)

	├── api/             # Axios clients for all sub-services
	├── app/             # Global Providers & Router initialization
	├── components/      # UI, Modal System, & Legal components
	├── features/        # Feature-sliced modules (Booking, Home, etc.)
	├── hooks/           # Domain-specific logic hooks
	├── queries/         # TanStack Query (Queries & Mutations)
	├── routes/          # TanStack Router tree
	└── types/           # Centralized API & Form type definitions


---

🚦 Development & Testing

Installation


The project uses uv and bun for maximum performance.


	# Backend
	uv sync
	uv run manage.py migrate

	# Frontend
	bun install
	bun dev

Testing & Quality Assurance

- Unit Testing: Backend utilizes pytest across all apps (bookings, availability, cms, etc.) with comprehensive conftest.py setups.

- E2E Testing: Currently in progress for the new TanStack data flow to ensure seamless integration between React Query mutations and the Django service layer.

- Code Style: Enforced via Prettier (FE) and standard Python linting.


---

📅 Roadmap: Current Phase

-  Refactor: Migrate to uv (BE) and bun (FE).

-  Routing: Implementation of TanStack Router.

-  State: Centralize all data fetching with TanStack Query.

-  Testing: Complete E2E suite for the refined Booking-Voucher flow.

-  UI/UX Cleanup:
	- Systematic removal of legacy useEffect patterns.

	- Performance optimization for Framer Motion transitions.

	- Global UI/UX polish.



---

🔒 Security & Compliance

- GDPR: Form submissions are handled via services.py to ensure transactional data integrity without unnecessary persistence.

- Security Headers: Strict CSP and CORS configurations managed via core/middleware.py.

- Media: All assets served via Cloudinary with automated HTTPS and optimization.
