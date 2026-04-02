# FundingPanda Frontend - Full Feature List

## Public Website Features

- Home page with platform overview and featured ideas/projects section.
- Public project discovery page with search, filters, sorting, and pagination.
- Public project details page with funding progress and donation call-to-action.
- Public project media presentation (images and pitch assets display).
- Public researcher profile pages with identity and contribution context.
- Public leaderboard page showing top sponsors/impact rankings.
- Public resources page for browsing available hardware/software resources.
- About page with platform mission and background.
- FAQ page with common product and workflow questions.
- Contact page for direct user communication.
- Newsletter subscription page.
- Terms and Conditions page.
- Privacy Policy page.
- Custom 404 page for unknown routes.
- Route-level error fallback page for runtime errors.
- Global error boundary for unrecoverable app errors.

## Authentication and Account Features

- User registration flow.
- User login flow.
- Forgot password flow.
- Reset password flow.
- Email verification flow.
- Session-aware rendering using BetterAuth client.
- Role-aware navigation and dashboard experience.
- Account settings page in dashboard.

## Student Features

- Dashboard overview with student metrics.
- Create project form for new research ideas.
- My Projects page with project status tracking.
- Project status progression visibility (draft, pending, approved, funded, completed).
- Project editing and management actions.
- Timeline/milestone viewing for projects.
- Ability to post/track project updates through timeline integrations.
- Resource discovery from dashboard resource center.
- Resource claim workflow.
- My Items page to track claimed resources.
- Incoming notifications visibility.
- Real-time messaging with sponsors/admin/users.

## Sponsor Features

- Dashboard overview with donation and impact metrics.
- Donation history page.
- Ability to fund projects through Stripe checkout initiation.
- Return handling via payment success page.
- Return handling via payment cancel page.
- Resource listing and management through dashboard resources.
- My Items page for sponsor-side resource management context.
- Notifications center for donation/project updates.
- Real-time chat with project owners.

## Admin Features

- Admin dashboard overview with platform analytics.
- Admin user management page.
- User moderation workflows (including verification/ban-related controls where exposed).
- Admin categories management page.
- Admin donations/ledger visibility page.
- Admin moderation visibility over projects and platform activity.

## Messaging and Notification Features

- Conversation list UI.
- Chat history loading per selected contact.
- Direct-entry messaging via contact query parameter.
- First-time contact messaging support (works even without prior conversation thread).
- Optimistic text message rendering.
- Real-time inbound message updates over Socket.IO.
- Outbound message send fallback behavior when socket persistence path is unavailable.
- Chat attachment upload support for images.
- New message indicator in active conversation.
- Notifications page with unread/read handling.
- Mark-all-notifications-as-read behavior.
- App-wide toast notifications for success/error/info feedback.
- Shared API error message extraction for consistent toast content.

## Funding, Project, and Resource Experience Features

- Project funding progress visualization.
- Donation CTA from project details.
- Project review/rating display support.
- Timeline event integration for project progress context.
- Resource catalog browsing.
- Resource claim state handling in dashboard flows.
- Category-aware browsing and moderation support.

## AI and Assistant Features

- Floating PandaBot assistant UI rendered globally.
- AI chat backend route integration via app API route.
- Gemini-powered response generation through Vercel AI SDK integration.

## UX, UI, and Frontend Platform Features

- Responsive layouts across public and dashboard pages.
- Mobile-friendly messaging layout and controls.
- Reusable component library with Shadcn/Radix patterns.
- Icon-driven UI feedback with Lucide icons.
- Query caching and invalidation with TanStack Query.
- Axios service layer abstraction per business domain.
- Root-level global providers for query and app-wide utilities.
- Root-level footer rendered across app shell.
- Route-group architecture for auth and dashboard segmentation.
- Build-time TypeScript safety checks.
- ESLint-based code quality enforcement.

## Integration Features

- Backend REST API integration for all domain modules.
- BetterAuth integration for authentication/session management.
- Socket.IO integration for real-time messaging.
- Stripe integration for payment flow callbacks.
- Cloud media URL display support from backend-uploaded assets.
- Marketing endpoint integrations (contact/newsletter workflows).
- Notification and analytics endpoint integration surfaces.
