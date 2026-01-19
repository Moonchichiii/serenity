# La Serenity – Modern Wellness Website

A fully featured, multilingual wellness website developed for a professional massage practitioner. This robust system integrates a Cloudinary-powered media pipeline, Wagtail CMS for comprehensive content editing, and a high-performance frontend built with Vite and TypeScript, globally deployed on Cloudflare Pages.

The backend operates on Fly.io, utilizing a Neon PostgreSQL database and Upstash Redis for advanced caching. The entire Django/Wagtail stack is fully containerized with Docker, ensuring fast, secure, and extremely cost-efficient operation.

----------

## Key Technologies

- **Backend:** Django 5.x, Wagtail CMS, Docker, Fly.io
- **Frontend:** React 19, TypeScript 5+, Vite, Cloudflare Pages
- **Database:** Neon PostgreSQL
- **Caching:** Upstash Redis
- **Media Management:** Cloudinary

----------

## Features

### Professional Content Management (Wagtail)

- **Comprehensive Control:** Full administrative control over images, videos, hero banners, rich text content, and service listings.
- **Multilingual Support:** Seamless content management in both English and French.
- **Integrated Media Library:** Cloudinary integration provides an efficient, scalable media library with automatic optimization.
- **Secure Access:** Discreet CMS access path for administrative staff, separate from the public site.

### Booking & Contact System

- **Corporate Booking Form:** Dedicated form for corporate inquiries, capturing event details, availability, and budget information.
- **General Contact Form:** Standard contact form for general inquiries.
- **GDPR-Compliant:** Form submissions are emailed directly without data persistence, ensuring GDPR friendliness.
- **Technical Foundation:** Implemented using Django REST Framework for the API and React for the frontend interface.

### Modern Frontend Experience

- **Cutting-Edge Stack:** Built with **Vite, TypeScript, and React 19** for superior performance and developer experience.
- **Design System:** Leverages Tailwind CSS for a consistent, utility-first design approach.
- **Dynamic Interactions:** Framer Motion delivers fluid and engaging UI animations.
- **Internationalization (i18n):** Full i18n support with robust fallback content for a global audience.
- **Responsive Design:** Mobile-first layout ensures optimal viewing and interaction across all devices.

### Cloud-Based Architecture

- **Backend Hosting:** Django + Wagtail application containerized with Docker and deployed on Fly.io.
- **Database:** Serverless Neon PostgreSQL provides a scalable and reliable data store.
- **Caching Layer:** Upstash Redis is utilized for both API and page-level caching, significantly enhancing performance.
- **Frontend Deployment:** Cloudflare Pages ensures rapid, globally distributed content delivery with integrated CDN and caching.
- **Media Delivery:** Cloudinary CDN optimizes and serves all image and video assets, reducing load times.

### Hidden Features (Client Handover)

- A complete booking system is developed and integrated, currently feature-toggled off, awaiting client activation.

----------

## Tech Stack

### Backend Technologies

- Django 5
- Wagtail CMS
- Django REST Framework
- PostgreSQL (Neon)
- Upstash Redis (via django-redis)
- Cloudinary Storage
- Security Headers: CSP & CORS implemented via django-csp and django-cors-headers
- **Dockerized backend for consistent local development and production deployment.**

### Frontend Technologies

- Vite + React + TypeScript
- Tailwind CSS
- Framer Motion
- i18next multilingual system
- Axios API client

### Infrastructure Services

- Fly.io (Django backend, Docker-based)
- Neon PostgreSQL (serverless database)
- Cloudflare Pages (frontend hosting, global CDN)
- Upstash Redis (managed Redis instance over HTTP)
- Cloudinary (media asset management and CDN)
- Automated HTTPS & CDN-level caching

----------

## Architecture Overview

```text
+---------------------------------------------------------------+
|                        Cloudflare Pages                       |
|               (Vite + React + TypeScript Frontend)            |
|                                                               |
|     - Public site delivery and static asset serving           |
|     - i18n support (English/French)                           |
|     - API traffic routed to Fly.io (CORS + CSRF configured)   |
+-------------------------↑-------------------------------------+
              |
              | HTTPS / API Requests
              |
+-------------------------↓-------------------------------------+
|                        Fly.io Backend VM                      |
|               Django + Wagtail + DRF + CSP/CORS               |
|            (Dockerized application container)                 |
|                                                               |
|  - Wagtail CMS Admin interface                                |
|  - CMS API for homepage and service content                   |
|  - Contact and corporate booking endpoints                    |
|  - CSRF + session handling with secure cookies                |
|  - Cloudinary file upload integration                         |
|  - Caching layer utilizing Upstash Redis                      |
+------------------↑----------------------↑---------------------+
           |                      |
           | PostgreSQL           | Redis (HTTP API)
           |                      |
+--------------------↓----------------------+-------------------+
|                         Neon DB                              |
|                     Serverless PostgreSQL                    |
+--------------------------------------------------------------+

+---------------------------------------------------------------+
|                           Upstash Redis                       |
|                     (Managed Redis for caching)               |
|   - Integrated as Django cache backend via django-redis       |
|   - Utilized for page/API caching and transient key-value data|
+---------------------------------------------------------------+

+---------------------------------------------------------------+
|                           Cloudinary                          |
|                  (Images + Video Optimization)                |
+---------------------------------------------------------------+
```

----------

## Deployment Overview

### Frontend (Cloudflare Pages)

- **Zero-Config Deployment:** Automatic build and deployment triggered via Git pushes.
- **Global CDN Caching:** Content delivered rapidly from edge locations worldwide.
- **API Configuration:** `VITE_API_URL` environment variable defines the backend API endpoint.

### Backend (Fly.io + Docker)

- **Deployment Method:** Deployed using flyctl from a Docker image.
- **HTTPS:** Automated HTTPS certificate management.
- **Resource Efficiency:** Runs on optimized VM sizes (256–512 MB), scalable based on traffic and media usage.
- **CORS + CSRF:** Securely configured for the Cloudflare Pages domain and the custom domain (larserenity.fr).
- **Caching Integration:** Leverages Upstash Redis as the cache backend via a `REDIS_URL`.

### Database (Neon)

- **Serverless PostgreSQL:** Managed serverless database for high availability and scalability.
- **Connection Pooling:** Optimized connection management.
- **Automatic Backups:** Ensures data integrity and recovery.

### Media (Cloudinary)

- **Optimization & Distribution:** Automatic image resizing, format conversion, and global CDN distribution.
- **Wagtail Integration:** Seamlessly integrated with Wagtail’s media picker.
- **Video Support:** Comprehensive support for video uploads and streaming.

### Caching (Upstash Redis)

- **Managed Service:** Upstash provides a managed Redis instance, connected via a standard URL.
- **Django Integration:** Configured as Django's cache backend using django-redis.
- **Usage:** Employed by Django's cache middleware (UpdateCacheMiddleware / FetchFromCacheMiddleware) and includes a custom `test_cache` endpoint for health checks.

----------

## Security Measures

- **CSRF Protection:** CSRF-protected login and API routes.
- **Discreet CMS Access:** Staff-only CMS access point, not publicly advertised.
- **Secure Cookies:** Secure and SameSite attributes configured for secure cross-site API calls.
- **TLS Termination:** Cloudflare and Fly.io provide robust TLS termination for encrypted communication.
- **Content Security Policy (CSP):** CSP headers enabled via Django-CSP.
- **Cache Data Security:** Upstash Redis is used exclusively as a cache, storing no sensitive data long-term.

----------

## Contact Forms

### Corporate Booking

- **Endpoint:** `POST /api/corporate/`
- **Data Handling:** Sends an email directly; no data is persisted in the database.
- **Information Captured:** Event date(s), type, number of attendees, requested services, optional budget, and additional notes.

### General Contact

- **Endpoint:** `POST /api/contact/`
- **GDPR Safe:** Ensures GDPR compliance with no logs or database entries, relying solely on email for message transport.

----------

## Project Structure

### Backend Layout

```text
apps/
 ├── cms/              # Wagtail models and API for homepage, services, and specialties
 ├── core/             # Authentication endpoints, CSRF, custom backend logic, cache test
 ├── contact/          # APIs for general contact and corporate requests
 ├── services/         # Service definitions and business logic
 ├── availability/     # Scheduling and availability logic (currently hidden)
 └── bookings/         # Full booking system (implemented, feature-toggled)
```

### Frontend Layout

```text
src/
 ├── api/              # Axios client (configured with CSRF and credentials)
 ├── components/       # Reusable UI components
 ├── sections/         # Main page sections (e.g., hero, about, services)
 ├── shared/           # Common utilities, hooks, context (e.g., useModal, i18n setup)
 ├── i18n/             # Internationalization configuration and translation resources
 └── pages/            # Application-level routing and layout components
```

----------

## Local Development

### Backend (Non-Docker)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Run the Django development server
python manage.py runserver
```

### Frontend (Vite)

```bash
# Install Node.js dependencies
npm install

# Run the Vite development server
npm run dev
```

### Docker Usage (Backend)

The backend is configured for Docker-based development and deployment.

```bash
# Build the backend Docker image
docker build -t la-serenity-backend .

# Run the backend container, exposing port 8000 and loading environment variables
docker run --rm \
  -p 8000:8000 \
  --env-file .env \
  la-serenity-backend
```

For a multi-service setup:

```bash
# Start all services defined in docker-compose.yml in the background
docker compose up --build -d

# View service logs
docker compose logs -f

# Stop all running services
docker compose down
```

----------

## CMS Access

The Wagtail admin interface is secured behind staff authentication. Authenticated staff users can access the CMS via:

`/cms-admin/`

This maintains a clean public-facing website while providing the client with full editorial control.

----------

## License

This project is proprietary and developed for a private client. Portions of the technology and UI patterns may be reused with explicit permission.
