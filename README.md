La Serenity – Enterprise Wellness Platform











A high-performance, multilingual wellness ecosystem featuring a Django/Wagtail headless CMS and a React-based SPA. This platform facilitates professional massage service management, integrated voucher-linked booking systems, and automated media pipelines.

🏗 High-Level Architecture


The system follows a modern decoupled architecture designed for low latency, high developer velocity, and type safety:


- Core: Django 5.1 / Wagtail 6.x (Headless)

- Frontend: React 19 / TanStack Router / TanStack Query (v5)

- Infrastructure: Containerized via Docker, deployed on Fly.io (Backend) and Cloudflare Pages (Frontend)

- Persistence: Serverless PostgreSQL (Neon) & Upstash Redis (Caching)


---

🚀 Recent Refactor & Improvements

1. Unified Voucher & Booking Engine

- Atomic Logic: The legacy bookings app has been merged into apps/vouchers/. Successful transactions now trigger real-time calendar placement and voucher validation in a single flow.

- Service Layer Pattern: Business logic resides in services.py and selectors.py for maximum testability.

- Availability Logic: Dedicated availability app with calendar_gateway.py to manage complex Google Calendar scheduling.

2. High-Performance Toolchain

- Backend: Migrated from pip to uv. Dependency resolution and environment syncing are now near-instant.

- Frontend: Swapped pnpm for bun. Leverages Bun's high-speed runtime for leaner CI/CD and local development.

3. Frontend Architecture Evolution

- TanStack Router: Fully type-safe routing with routeTree.gen.ts.

- TanStack Query: Centralized all server state in src/queries/, providing declarative mutations and optimized cache invalidation.

- Corporate Rename: Audited and renamed all corporate booking symbols to CorporateInquiry to align with the contact-based data flow.


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

	├── availability/    # Google Calendar gateway & scheduling
	├── cms/             # Headless Wagtail models & Serializers
	├── contact/         # Email services (Contact & Corporate Inquiry)
	├── core/            # Middleware, CSP, & Custom Image handling
	├── payments/        # Stripe integration placeholder
	├── services/        # Service definitions (via CMS)
	├── testimonials/    # Moderated client reviews & replies
	└── vouchers/        # Gift voucher creation & booking redemption

Frontend Layout (/src)

	├── api/             # Fetch wrappers per backend app
	├── app/             # Providers & Router initialization
	├── components/      # UI, Modal System (Registry), & Forms
	├── features/        # Feature-sliced sections (Testimonials, Home)
	├── hooks/           # Domain-specific React hooks
	├── queries/         # TanStack Query (Queries & Mutations)
	├── routes/          # TanStack Router tree
	└── types/           # API Responses & Zod Form Schemas


---

🚦 Development & Testing

Installation

	# Backend
	uv sync
	uv run manage.py migrate

	# Frontend
	bun install
	bun dev

Testing & Quality Assurance

- Unit Testing: Backend utilizes pytest with 70+ tests covering CMS, Availability, and Vouchers.

- E2E Testing: Integrated schemathesis for API contract validation and TanStack-based flow testing.


---

📊 Test Suite Results


Current Backend Coverage: 66%


	========================= test session starts =========================
	collected 73 items

	apps/availability/  .... (100%)
	apps/cms/           ........................ (100%)
	apps/contact/       .... (75%)
	apps/testimonials/  .... (52%)
	apps/vouchers/      .... (57%)

	================ 73 passed, 5 warnings in 17.51s =================


---

📅 Roadmap: Current Phase

-  Refactor: Migrate to uv (BE) and bun (FE).

-  Routing: Implementation of TanStack Router.

-  State: Centralize data fetching with TanStack Query.

-  Audit: Finalize E2E data flow audit for the merged Voucher-Booking flow.

-  UI/UX: Performance optimization for Framer Motion transitions.


---

🔒 Security & Compliance

- GDPR: Form submissions handled via services.py for transactional integrity without unnecessary PII persistence.

- Security Headers: Strict CSP and CORS configurations managed via core/middleware.py.

- Media: Assets served via Cloudinary with automated HTTPS.
