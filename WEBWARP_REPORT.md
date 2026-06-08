# Technical & Operational Architecture Report
## WebWarp Technology Pvt Ltd — Agency Solutions Portal

This document serves as the official blueprint and developer report outlining the design, capabilities, codebase structure, and instruction set for the **WebWarp Technology Pvt Ltd** premium solutions platform. This high-performance web system functions as a digital bridge between corporate clients and lead solutions architects.

---

## 1. Executive System Summary

The WebWarp Solutions Portal is designed to guide prospective clients from initial technological discovery to formalized agile execution. It couples a modern high-end interactive UI with a robust server-side backend powered by **Google Gemini**.

### High-Fidelity User Workflows:
1. **Interactive Scope & Pricing Estimator**: Clients specify project requirements (complexity, technology, duration) to receive real-time granular cost projections and custom micro-architectural suggestions.
2. **Dynamic AI Blueprint Generation**: By invoking the server-side Gemini AI model, the system processes client inputs to construct an automated executive architectural blueprint complete with technical stack selections, risk-assessment profiles, and custom mockups.
3. **Google Identity Sandbox & Core Authentication**: Features a customized authentication system supporting local registry, remember-me options, password state toggles, and an integrated **Google Single Sign-On (SSO) Sandbox Simulator** to enable immediate login workflows under user profiles (e.g. partner accounts) or customized mock identities.
4. **Client Active Workspace**: A portal where users track requested projects, communicate in real-time with WebWarp architects, and review automated server notifications.
5. **Operator Deck / Admin Dashboard**: A high-impact executive dashboard for administrators (specifically `rohit21oc@gmail.com`) to manage client feedback messages, project specifications, trigger automated workspace feeds, and manipulate metrics.

---

## 2. Technical Stack Configuration

The platform adheres strictly to high-contrast enterprise design rules, desktop-first precision, and modular code isolation:

### Frontend Layer:
*   **Core UI Engine**: React 19 + TypeScript (high-type safety).
*   **Styling Engine**: Tailwind CSS (utilizes custom `@import "tailwindcss";` configurations for a dark-mode slate feel, with cyan and purple laser grid hues).
*   **Vector Iconset**: `lucide-react` for responsive, high-fidelity graphics.
*   **Transitions Engine**: `motion` layout animation components.

### Backend Layer:
*   **Server Frame**: Express.js (runs on Port `3000`).
*   **Active Persistence Engine**: File-based database shadow (`agency_database.json`) utilizing asynchronous file system IO (`fs/promises`) with deep state clones to prevent read-write concurrency race conditions.
*   **AI Integration**: Formal server-side integration of the `@google/genai` TypeScript SDK client, guarded with dynamic lazy controllers to handle missing parameters without server failures.
*   **Sign-In & Encryption Cryptography**: Custom JWT (JSON Web Tokens) generated using cryptographic HMAC SHA-256 for secure session keys, persisting in client-side LocalStorage.

---

## 3. Database Schema Blueprint (`agency_database.json`)

The system stores persistent data in five distinct collection maps. On boot, the server dynamically spins up default administrative coordinates if not already populated:

```json
{
  "users": [
    {
      "id": "admin-rohit",
      "name": "Rohit Kumar (Admin)",
      "email": "rohit21oc@gmail.com",
      "password": "[PBKDF2/SHA256 Hashed Password]",
      "role": "ADMIN",
      "provider": "LOCAL",
      "createdAt": "2026-05-27T12:00:00Z"
    }
  ],
  "projects": [],
  "messages": [],
  "notifications": []
}
```

---

## 4. Key Security & Authentication Workflows

### Role-Based Access Control (RBAC):
*   **USER**: Authorized to look up personal dashboards, request software architecture reviews, post project-level architectural notes/questions, and configure profiles.
*   **ADMIN** (`rohit21oc@gmail.com`): Empowered to view all historical submissions, delete stale portfolios, view customer feedback forms, and trigger corporate administrative announcements.

### Interactive Google OAuth SSO Simulation (Sandbox):
The user can trigger single sign-on with a simple tap. The system loads a customized virtual SSO dialog displaying:
*   **Recommended Partner Profile**: Rohit Kumar (`rohit27dc@gmail.com`)
*   **Demo User**: Jane Doe (`client@company.com`)
*   **Custom Persona**: Input any mock name and email to automatically register or log in with that profile instantly.

In production, developers can configure their Google Cloud Developer Console Client ID by setting `VITE_GOOGLE_CLIENT_ID` in `.env` and rendering the official `@react-oauth/google` component logic.

---

## 5. Deployment, Setup, & Production Boot Guidelines

To host this portal in production (e.g., Google Cloud Run, AWS EC2, or a private server), complete the following configurations:

### A. Environment Setup (`.env` file)
Create a `.env` file in the main folder of the project with these parameters:
```env
# Google Gemini Key (Required for AI responses)
GEMINI_API_KEY="AIzaSyYourGeminiKeyHere"

# Server Host and Ingress Port
PORT=3000
NODE_ENV="production"
```

### B. Dependency Installation & Dev Server Execution
Run these commands to start the dev environment locally:
```bash
# 1. Install all system dependencies
npm install

# 2. Spin up the Vite + Express full-stack development instance
npm run dev
```

### C. Build for Production Compilation
To bundle the frontend assets and compile the Express backend into a high-performance single-file virtual Node server:
```bash
# Compile and build both client dist/ and backend server bundles
npm run build

# Start the optimized CJS server node
npm run start
```

---

## 6. Support Channels & Contact Details
*   **LinkedIn Profile**: [WebWarp Technology LinkedIn](https://www.linkedin.com/company/webwarptechnology)
*   **Support Hub**: Enabled instantly in the header and footer systems.
*   **WhatsApp Direct Link**: Accessible dynamically from the floating WhatsApp hover trigger in the bottom right corners.

---
**Report generated for WebWarp Technology Pvt Ltd.**  
*Solutions Engineering Lab, 2026.*
