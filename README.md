# 🏗️ FOZ AI Solutions

FOZ AI Solutions is a modern, AI-native B2B2C CRM and orchestration platform. The system is designed to provide businesses with autonomous AI employees that handle everything from customer service and appointment booking to marketing generation and triage.

## 💻 1. Frontend & Backend Core
The application utilizes a unified, full-stack framework approach to ensure type safety, rapid iteration, and seamless server-to-client data flow.

* **Framework:** **Next.js 16 (App Router)** – Powers both the server-side API routes and the client-side UI, allowing for optimized Server-Side Rendering (SSR) and seamless API integration.
* **Language:** **TypeScript** – Enforces strict typing across the entire codebase to prevent runtime errors and ensure robust data modeling.
* **UI & Styling:** **Tailwind CSS** combined with **Shadcn UI (Radix UI primitives)** for accessible, minimalist, and highly customizable interface components. 
* **Animations:** **Framer Motion** and `tailwindcss-animate` for fluid, native-feeling user interactions.
* **State Management:** **SWR** for real-time, client-side data fetching and mutation caching.

## ☁️ 2. Hosting & Deployment
* **Platform:** **Vercel** – The application is deployed on Vercel's Edge Network, utilizing serverless functions for backend operations, Edge caching for high-performance delivery, and built-in cron jobs (`vercel.json`) for automated background tasks like daily executive summaries.

## 🗄️ 3. Database & ORM
* **Database:** **MongoDB** – A highly flexible NoSQL database perfectly suited for storing dynamic JSON structures, chat histories, and varied CRM data.
* **ORM / Driver:** **Mongoose** – Provides rigorous, schema-based data modeling, validation, and lifecycle hooks over MongoDB.

## 🔐 4. Authentication & Security
The platform employs a dual-authentication strategy to securely handle both business owners and end-consumers.

* **Business Auth (B2B):** **NextAuth.js** – Secures the administrative dashboard. It utilizes secure session strategies, bcrypt password hashing, and role-based access control (RBAC) to ensure owners only access their respective environments.
* **Consumer Auth (B2C):** **Custom JWT (JSON Web Tokens)** – End-users interacting with the AI on a business's portal receive heavily restricted, stateless consumer tokens. This zero-trust approach ensures the AI acts on behalf of the verified user without exposing administrative routes.
* **Edge Security:** Server-side evaluation of prompts to thwart AI injection and jailbreak attempts before they reach the LLM.

## 🧠 5. AI Integration & Orchestration
FOZ AI isn't just an interface; it's a team of autonomous agents operating on a centralized intelligence architecture.

* **Core Engine:** **Google Gemini (gemini-2.5-flash)** – Chosen for its lightning-fast inference and massive context window.
* **SDK:** **Vercel AI SDK (`@ai-sdk/google`)** – Handles LLM streaming, function calling, and structured JSON generation.
* **The AI Agents:**
  * **Golda (Management & Marketing):** The internal executive assistant. Golda analyzes daily chat logs, generates triage alerts, and creates visual marketing campaigns via internal cron loops.
  * **Daniela (Operations & Booking):** The customer-facing receptionist. Deployed on the business's client portal, Daniela verifies users, books appointments, and checks availability by executing native schema tools.
  * **Paz / FOZ (Sales & Lead Gen):** The platform's public-facing sales agent, designed to onboard new businesses and answer questions about the FOZ ecosystem itself.

## 🔌 6. External APIs & Integrations
* **Meta Graph API:** Direct OAuth integration with Facebook and Instagram for one-click publishing of AI-generated marketing posts.
* **Pollinations / AI Imaging:** Generates on-the-fly marketing imagery based on Golda's visual prompts.
* **Cloudinary:** Cloud-based image hosting and delivery for dynamically generated assets and business logos.
* **Web-Push:** Native browser push notifications enabling real-time alerts for the business dashboard.

## 🏢 7. Multi-Tenancy & Data Isolation (Architecture)
FOZ AI Solutions is a strict multi-tenant environment. The system guarantees absolute data isolation between Business A and Business B through the following architectural guardrails:

1. **The `business_id` Anchor:** Every single document in the database (`ChatExternal`, `Customer`, `ActionCard`, `Appointment`, `AgentInsight`) requires a strict Mongoose `ObjectId` mapping to the parent `Business`.
2. **Zero-Trust Queries:** API routes and Server Actions never trust client-provided IDs. The backend intercepts the authenticated NextAuth session, extracts the user's `businessId`, and injects it into every database query (e.g., `Model.findOne({ _id: documentId, business_id: session.user.businessId })`).
3. **Cross-Tenant IDOR Protection:** Attempting to fetch, mutate, or publish data (like marketing insights) without matching the session's tenant ID results in an immediate 404/403 rejection.
4. **Dynamic Subdomains:** End-consumers interact with businesses via isolated subdomains (e.g., `clinic.foz.ai`). The Next.js middleware captures the subdomain and securely funnels only that specific business's context to the AI, ensuring the AI never hallucinates data from another tenant.
