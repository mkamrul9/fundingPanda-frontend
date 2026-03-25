# FundingPanda Frontend

FundingPanda is an enterprise-grade crowdfunding platform that connects academic innovators with industry sponsors.

This repository contains the frontend application built with Next.js App Router, TanStack Query, BetterAuth client, real-time messaging, Stripe payment flows, and a Gemini-powered PandaBot assistant.

The frontend consumes the FundingPanda backend API from the sibling backend project in this workspace.

## Key Features

- Role-based dashboard experience for `STUDENT`, `SPONSOR`, and `ADMIN` users.
- Protected dashboard routes with session-aware rendering and auth redirects.
- Project lifecycle for students: create draft, upload pitch doc/images, submit for admin review, and complete funded projects.
- Public project discovery with filtering, searching, sorting, and pagination.
- Stripe donation flow from project detail pages with success and cancel callback pages.
- Real-time one-to-one messaging powered by Socket.IO, including image uploads and optimistic UI updates.
- Resource Hub for sponsor listings and student claims with personal claim/listing views.
- Project timelines with milestone posting and live timeline refresh.
- Review system with 5-star sponsor ratings unlocked by project completion logic.
- Admin control panel for moderation queue, category management, user moderation/verification, and global donation ledger.
- Notification center with unread counts and mark-all-read action.
- PandaBot floating AI assistant using Vercel AI SDK + Google Gemini (`gemini-2.5-flash`) via `src/app/api/chat/route.ts`.
- Marketing pages and capture flows: contact form, newsletter subscription, FAQ, policy pages.

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS 4
- UI: Shadcn UI + Radix primitives + Lucide icons
- Data Layer: TanStack Query + Axios
- Auth Client: BetterAuth (`better-auth/react`)
- Real-Time: socket.io-client
- AI: Vercel AI SDK (`ai`, `@ai-sdk/react`) + Google provider (`@ai-sdk/google`)
- Charts/Visualization: Recharts
- Forms/Validation: TanStack React Form + Zod

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- npm (or compatible package manager)
- FundingPanda backend running locally or deployed
- Google Generative AI API key for PandaBot

## Getting Started

1. Install dependencies

```bash
cd fundingpanda-frontend
npm install
```

2. Create environment file

Create `.env.local` in the frontend root with the following:

```bash
# Backend REST API base URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Backend server root URL (Socket.IO + BetterAuth base fallback)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Optional explicit BetterAuth base URL
# If set, this is preferred over NEXT_PUBLIC_BACKEND_URL by src/lib/auth-client.ts
NEXT_PUBLIC_AUTH_URL=http://localhost:5000

# Required for PandaBot API route
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key

# Optional analytics endpoint used by src/app/api/chat/route.ts
# Example: http://localhost:5000/api/v1
BACKEND_API_URL=http://localhost:5000/api/v1
```

3. Start development server

```bash
npm run dev
```

4. Open the app

Go to `http://localhost:3000`.

## Available Scripts

- `npm run dev` starts local development server
- `npm run build` creates production build
- `npm run start` starts production server
- `npm run lint` runs ESLint

## Application Areas

- Public pages: Home, About, Projects, Resources, Leaderboard, FAQ, Contact, Newsletter, Terms, Privacy
- Auth pages: Login, Register, Forgot Password, Reset Password, Verify Email
- Dashboard pages:
	- Shared: Overview, Inbox, Notifications, Settings
	- Student: My Projects, Create Project, Resource Hub, My Claimed Items
	- Sponsor: My Donated Projects, Resource Hub, My Listed Items
	- Admin: Moderation Queue, Manage Categories, Manage Users, Global Ledger
- Payment callbacks: `/payment/success`, `/payment/cancel`
- AI API route: `/api/chat`

## Project Structure

```text
src/
	app/
		(auth)/                 # Authentication routes/layout
		(dashboard)/            # Protected dashboard routes/layout
		api/chat/               # PandaBot server route (Gemini streaming)
		projects/               # Public project listing and details
		resources/              # Public resources listing
		users/[id]/             # Public user profile + reviews
	components/
		layout/                 # Global layout components (footer, chatbot, nav)
		projects/               # Timeline/review/project-specific UI blocks
		ui/                     # Reusable Shadcn primitives
	lib/
		auth-client.ts          # BetterAuth client + session hooks
		axios.ts                # API client instance (cookie-aware)
		socket.ts               # Socket.IO client instance
		cloudinary.ts           # Media URL utility helpers
	providers/
		QueryProvider.tsx       # TanStack Query provider wiring
	services/
		*.service.ts            # Domain API access layer
```

## Environment and Auth Notes

- API requests use cookie-based auth with `withCredentials: true` in `src/lib/axios.ts`.
- BetterAuth client derives base URL from:
	- `NEXT_PUBLIC_AUTH_URL` first
	- fallback `NEXT_PUBLIC_BACKEND_URL`
	- fallback `http://localhost:5000`
- PandaBot route requires `GOOGLE_GENERATIVE_AI_API_KEY` and currently pins model `gemini-2.5-flash`.

## Deployment (Vercel)

1. Push frontend code to GitHub.
2. Import the frontend project into Vercel.
3. Add all required environment variables from this README.
4. Build command: `npm run build`
5. Output handled automatically by Next.js.

## Backend Dependency

This frontend depends on FundingPanda backend endpoints for auth, projects, messaging, resources, donations, notifications, admin operations, and analytics.

If the backend base URL changes, update `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_BACKEND_URL`, and optionally `NEXT_PUBLIC_AUTH_URL`.
