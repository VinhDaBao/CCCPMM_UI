# 🎬 Script Media Management System (SMM)

The **Script Media Management System (SMM)** is a collaborative workspace platform designed for writers, filmmakers, and digital creators. SMM provides a suite of tools for real-time collaborative script editing, narrative world mapping, media asset cataloging, text-to-speech audio synthesis, and AI-driven creative assistance.

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.2.1-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-purple.svg)](https://opensource.org/licenses/ISC)

---

## 1. Project Overview

*   **Core Purpose**: To provide a unified web platform where creative teams can write scripts collaboratively, coordinate narrative assets, map out narrative connections, and generate media assets in real time.
*   **The Problem It Solves**: Scriptwriting and pre-production workflows are often fragmented across multiple disconnected systems (e.g., Google Docs for writing, Miro for world-building mapping, local folders or Cloud drives for audio and images, and third-party AI assistants for brainstorming). SMM integrates these tools into a single collaborative environment, featuring structured formatting, version snapshots, asset libraries, and AI helpers.
*   **Primary Users**:
    *   **Content Creators & Scriptwriters**: Seeking professional script-formatting editors with collaborative real-time editing support.
    *   **Producers & Creative Directors**: Requiring project timeline organization, activity audits, role permission enforcement, and payment models.
    *   **Pre-production Teams**: Needing to visually link story elements, synthesize voiceovers (TTS), and manage production files.

---

## 2. Features

The platform is divided into front-end interactive portals and back-end services, grouped into key operational modules:

### 🔐 Authentication & Session Security
*   **User Register & Activation**: Sign-up workflow requiring full profiles, integrated with Email-delivered OTP (One-Time Password) verification.
*   **JWT Secure Session Management**: Login verification generating short-lived Access Tokens and Refresh Tokens.
*   **Token Rotation Cache**: Integrates with Redis to manage Refresh Token lists, supporting automated refresh rotations and revocation on logout.
*   **Password Self-Service**: Recovery system utilizing email OTP validation and password resets.
*   **Granular Profile Configuration**: Editing account metadata and updating user avatars.

### 👥 Workspace & Collaboration Management
*   **Multi-tenant Workspaces**: Create, update, view, and delete workspaces to partition creative projects.
*   **Flexible Access Control**: Role checks matching roles (`VIEWER`, `EDITOR`, `ADMIN`, `OWNER`) against target operations.
*   **Invitation System**: Send email invitations containing signed invite links; supports listing, accepting, and canceling pending invites.
*   **Workspace Member Controls**: List members, change user access permissions, kick members, or handle voluntary exit events.
*   **Audit Logging**: Automatic activity tracking records creation, updates, and deletions.

### ✍️ Collaborative Script Editor
*   **Structured Formatting**: Write and format script blocks (Dialogue, Scene Headings, Action description, Parentheticals, Transitions).
*   **Yjs Real-Time Synchronization**: Collaborative multi-user editing powered by a Hocuspocus synchronization server on port 1234.
*   **Snapshots & Backups**: Capture full editor state backups, browse snapshot lists, and restore files to historic version points.
*   **Workspace Snippets**: Save, retrieve, update, and delete reusable text snippets.

### 🗺️ World Mapping Graph
*   **Visual Story Board**: Graph relations between locations, characters, and entities using a node layout engine.
*   **Dynamic Data Sync**: Add, update, delete, and link story cards (nodes and edges), saving configuration coordinates back to MongoDB.

### 🎙️ Integrated Media Services
*   **Google Gemini AI Assistant**: Contextual script writing advice using `gemini-2.5-flash` with prompts constrained to content creation.
*   **Google Cloud TTS Voiceover**: Synthesize script texts to audio, support multiple language models, and retrieve voice configurations.
*   **Global Asset Library**: Media upload to Cloudinary, tag indexing, global asset searching, and preview options.
*   **Project Asset Usage Tracking**: Manage project-level assets and enforce consumption limit policies.

### 💳 Subscriptions & Payments
*   **Plan Definitions**: Define plan tiers and pricing setups.
*   **PayOS Payment Checkout**: Generate secure payment links via PayOS, process webhook callback statuses, and cancel outdated orders via cron routines.

---

## 3. Technology Stack

### 💻 Frontend
*   **Framework**: [React 19](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01/package.json#L29) (Standard Single Page Application)
*   **Build Utility**: [Vite 8](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01/package.json#L55)
*   **Styling**: [Tailwind CSS v4](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01/package.json#L54) (Sleek CSS configuration)
*   **UI Components**: [Ant Design](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01/package.json#L26) & [Ant Design Icons](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01/package.json#L14)
*   **State & Cache Managers**: [Redux Toolkit](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01/package.json#L17) (Auth profiles states) and [TanStack React Query v5](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01/package.json#L18) (API request caching)
*   **Rich Text Editor**: [TipTap Editor Suite](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01/package.json#L22)
*   **Collaboration Providers**: [Yjs](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01/package.json#L38) & [@hocuspocus/provider](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01/package.json#L16)
*   **Flow Graph Engine**: [@xyflow/react](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01/package.json#L25) (Visual character/place mapping)
*   **HTTP Client**: [Axios](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01/package.json#L27) (With authorization interceptors)
*   **Translation**: [i18next](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01/package.json#L28)

### ⚙️ Backend
*   **Framework**: [Express v5.2.1](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/package.json#L27)
*   **Runtime Environment**: Node.js v20+ with ES Module compilation support via [Babel compiler](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/package.json#L44-L46)
*   **Database Engine**: [Mongoose v9.6.2](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/package.json#L31) / MongoDB
*   **Memory Store & Token Cache**: [Redis v6](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/package.json#L37)
*   **Yjs Document Sync Server**: [@hocuspocus/server v4.2](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/package.json#L17)
*   **Real-time Server Comm**: [Socket.IO v4.8](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/package.json#L39)
*   **AI Engine API**: [@google/genai v2.10](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/package.json#L16)
*   **Text-to-Speech Engine**: [@google-cloud/text-to-speech v6.4](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/package.json#L15)
*   **Mail Dispatcher**: [Nodemailer v8](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/package.json#L36)
*   **Cloud Storage Integrator**: [Cloudinary](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/package.json#L22) & [Multer Storage Cloudinary](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/package.json#L33)
*   **Payment Checkout SDK**: [@payos/node v2](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/package.json#L18)
*   **Babel Transpiler**: `@babel/node` (transpiles ES6 to CommonJS on the fly during development)
*   **Server Process Monitor**: `nodemon` (auto-restarts during backend local runs)

---

## 4. System Architecture

The following diagram illustrates how the frontend components, backend endpoints, memory cache, database model records, and third-party systems interact:

```
                            +-----------------------------------------------+
                            |              FRONTEND CLIENT                  |
                            |  [React SPA - Vite - Tailwind v4 - AntD]      |
                            +-------+--------------------+------------+-----+
                                    |                    |            |
                               HTTP | API                | WebSockets | Yjs Sync
                                    v                    | (Port 8088)| (Port 1234)
                            +-------+--------+           |            |
                            | BACKEND SERVER |           |            |
                            |   [Express]    |<----------+            |
                            +---+---+---+----+                        v
                                |   |   |                   +---------+------+
              MongoDB Mongoose  |   |   | Redis Cache       | HOCUSPOCUS     |
         +----------------------+   |   +-----------------> | SYNC SERVER    |
         |                          |                       +----------------+
         v                          v
+--------+------+        +----------+-----------+
| MongoDB Atlas |        | EXTERNAL SERVICES    |
| [20 models]   |        | - Gemini AI API      |
+---------------+        | - Google Cloud TTS   |
                         | - PayOS Checkout     |
                         | - Nodemailer SMTP    |
                         | - Cloudinary Storage |
                         +----------------------+
```

---

## 5. Folder Structure

### 💻 Client Directory: `CCCPMM_UI/reactjs01`
For a complete list of frontend project files, refer to the [reactjs01 Directory](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01).

```text
reactjs01/
├── cypress/             # E2E test suites and specs
├── public/              # Static file assets directly accessible by compiler
├── src/                 
│   ├── assets/          # Shared visual elements and images
│   ├── components/      # Reusable views (layouts, auth routes, widgets)
│   ├── hooks/           # State triggers (notifications triggers, configs)
│   ├── pages/           # Portals (script editor, login, world maps)
│   ├── redux/           # Slice handlers and Redux store configurations
│   ├── styles/          # Global styles applying Tailwind v4
│   ├── util/            # Axios custom hooks, routing parameters, and themes
│   ├── App.jsx          # Top-level portal layout configuration
│   ├── i18n.js          # Language key definitions
│   └── main.jsx         # DOM anchor mounting point and routing paths
├── cypress.config.js    # Cypress testing parameters
├── vite.config.js       # Vite server configurations and proxy paths
└── package.json         # Libraries versions and command paths
```

### ⚙️ Server Directory: `ScriptMediaManagementProject`
For a complete list of backend project files, refer to the [ScriptMediaManagementProject Directory](file:///d:/CCNPMM/CK/ScriptMediaManagementProject).

```text
ScriptMediaManagementProject/
├── src/                 
│   ├── config/          # Configurations for Cloudinary, MongoDB, Redis, PayOS, etc.
│   ├── controller/      # API controller endpoints
│   ├── jobs/            # Scheduled tasks (invitations expiry checker)
│   ├── middlewares/     # Authentication, role permissions, rate limit checks
│   ├── models/          # Database definitions (Mongoose schemas)
│   ├── public/          # Default images and local folders
│   ├── route/           # URL mapping configuration
│   ├── services/        # Logic handlers (TTS, Socket connections, database, AI calls)
│   ├── util(s)/         # Helpers (JWT tokens, configurations)
│   └── server.js        # Main initialization file (Ports, Crons, Server start)
├── rosy-semiotics-*.json# Credentials file for Google Cloud Text-to-Speech API
├── package.json         # Development libraries and scripts
└── .sequelizerc         # Residual config file for Sequelize CLI (Legacy, not active)
```

---

## 6. Installation

### Prerequisites
*   Node.js v20 or higher.
*   An active MongoDB instance.
*   An active Redis server instance.
*   A Cloudinary account.
*   A Google Cloud Project with the Text-to-Speech API enabled, along with a service account key JSON file.
*   A Gemini API Key.
*   A PayOS Account.

### Clone and Setup
1.  Clone the repository and locate both the UI and backend folders.
2.  Install dependencies for both projects.

#### Frontend Project Setup
```bash
cd CCCPMM_UI/reactjs01
npm install
```

#### Backend Project Setup
```bash
cd ScriptMediaManagementProject
npm install
```

---

## 7. Environment Variables

Create files named `.env` in the backend root directory and `.env.development` in the frontend root directory based on the following configurations:

### Backend `.env`
To configure the backend environment variables, refer to the [Backend .env file](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/.env).

| Variable | Description | Required | Example Value |
| :--- | :--- | :---: | :--- |
| `PORT` | Local Express Server execution port. | Yes | `8088` |
| `MONGO_URI` | MongoDB Connection URL. | Yes | `mongodb+srv://...` |
| `CLIENT_URL` / `FRONTEND_URL` | URL of the frontend client (for CORS validation). | Yes | `http://localhost:5173` |
| `JWT_SECRET` | Secret key used for signing JWT Access Tokens. | Yes | `SMM_Project_Secret_Key_2026` |
| `JWT_ACCESS_EXPIRE` | Expiry limit for JWT access tokens. | Yes | `15m` |
| `JWT_REFRESH_SECRET` | Secret key used for signing JWT Refresh Tokens. | Yes | `SMM_Project_Refresh_Secret_Key_2026` |
| `JWT_REFRESH_EXPIRES` | Expiry limit for JWT refresh tokens. | Yes | `7d` |
| `REDIS_URL` | Upstash Redis connection URL. | Yes | `rediss://default:...` |
| `EMAIL_HOST` | SMTP Host for OTP and invitation delivery. | Yes | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP connection port. | Yes | `465` |
| `EMAIL_USER` | Authorized email account user. | Yes | `user@gmail.com` |
| `EMAIL_PASS` | App password for email client authentication. | Yes | `abcd efgh ijkl mnop` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name. | Yes | `dybkxb124` |
| `CLOUDINARY_API_KEY` | Cloudinary access API key. | Yes | `599976114535833` |
| `CLOUDINARY_API_SECRET` | Cloudinary API access secret key. | Yes | `nGNrz7BE3OeRkRizII1GO...` |
| `GEMINI_API_KEY` | Google Gemini API connection token. | Yes | `AIzaSy...` |
| `PAYOS_CLIENT_ID` | PayOS client ID for payment integration. | Yes | `b2925537-1021-48b4-9eea...` |
| `PAYOS_API_KEY` | PayOS configuration API Key. | Yes | `76e8d881-789c-4d07-b9f4...` |
| `PAYOS_CHECKSUM_KEY` | PayOS validation checksum secret. | Yes | `0a49383c2c981b8f917...` |

### Frontend `.env.development`
To configure the frontend environment variables, refer to the [Frontend .env.development file](file:///d:/CCNPMM/CK/CCCPMM_UI/reactjs01/.env.development).

| Variable | Description | Required | Example Value |
| :--- | :--- | :---: | :--- |
| `VITE_BACKEND_URL` | API target backend URL. | Yes | `http://localhost:8088` |

---

## 8. Running the Application

### Frontend Development Mode
To run the frontend project locally:
```bash
cd CCCPMM_UI/reactjs01
npm run dev
```
Open `http://localhost:5173` to access the application.

### Backend Development Mode
To run the backend project locally:
```bash
cd ScriptMediaManagementProject
npm start
```
This command runs `nodemon --exec babel-node src/server.js`, auto-restarting the server on file changes.

### Build and Run in Production

#### Frontend Production Build
To build the frontend project:
```bash
cd CCCPMM_UI/reactjs01
npm run build
```
This compiles assets to the `dist` folder. To preview the production build locally:
```bash
npm run preview
```

#### Backend Production Run
In a production environment, you compile the source files using Babel, then run the compiled server script directly using Node:
```bash
cd ScriptMediaManagementProject
node src/server.js
```
Ensure all environment variables are correctly set in the host server configuration.

---

## 9. API Overview

The backend exposes the following API routes:
*   **`/api/auth`**: User registration, login, profile editing, logout, password resets, and user management.
*   **`/api/workspaces`**: Workspace CRUD actions, along with nested routes for `/activity-logs` and project snapshots.
*   **`/api/workspaces/:workspaceId/projects`**: Project CRUD actions and project duplication.
*   **`/api/workspaces/:workspaceId/projects/:projectId/blocks`**: Timeline/scene blocks CRUD actions.
*   **`/api/workspaces/:workspaceId/characters`**: Character metadata profile creation, retrieval, updates, and listings.
*   **`/api/workspaces/:workspaceId/snippets`**: Reusable snippet CRUD actions.
*   **`/api/workspaces/:workspaceId/projects/:projectId/project-assets`**: Attach or detach workspace assets to specific project scripts.
*   **`/api/workspace-invites`**: Handle workspace invitations, link generation, and role checks.
*   **`/api/workspace-members`**: Workspace membership actions (listing members, updating roles, kick/leave).
*   **`/api/assets`**: Upload files to Cloudinary, search by tag, retrieve assets, update assets, and delete assets.
*   **`/api/ai`**: Generate script-writing suggestions via Gemini.
*   **`/api/tts`**: Generate audio synthesis from script texts and retrieve voice configuration lists.
*   **`/api/worlds`**: Save and retrieve world node layouts.
*   **`/api/notifications`**: List user alerts, mark as read, delete, and broadcast announcements.
*   **`/api/subscriptions`**: List active subscriptions (CRUD).
*   **`/api/plans`**: Configure subscription plans (CRUD).
*   **`/api/payments`**: Generate checkout links and handle PayOS status webhooks.
*   **`/test`**: Connectivity test route verifying database configurations.

---

## 10. Database Models

The MongoDB database contains the following Mongoose collections:

*   [activityLog.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/activityLog.js): Logs edit activity in workspaces (CREATE, UPDATE, DELETE).
*   [asset.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/asset.js): Catalog of uploaded media assets (Cloudinary URL, tags, type, workspace).
*   [block.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/block.js): Script content segments (headings, action, dialogue).
*   [character.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/character.js): Character detail configurations (name, description, avatar).
*   [notification.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/notification.js): Custom in-app notifications and statuses.
*   [payment.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/payment.js): PayOS logs tracking transaction IDs and statuses (`PENDING`, `SUCCESS`, `CANCELLED`).
*   [plan.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/plan.js): Subscription pricing models and limits.
*   [project.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/project.js): Project configurations inside workspaces.
*   [projectAsset.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/projectAsset.js): Tracks asset mappings and consumption inside project scripts.
*   [projectSnapshot.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/projectSnapshot.js): Backups saving complete project editor states.
*   [snippet.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/snippet.js): Reusable text templates.
*   [subscription.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/subscription.js): Active subscriptions details.
*   [user.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/user.js): User profiles, passwords, roles, and verification details.
*   [workspace.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/workspace.js): Collaborator workspace configuration models.
*   [workspaceinvite.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/workspaceinvite.js): Tracking invitation status and validity tokens.
*   [workspacemember.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/workspacemember.js): Map of user roles within workspaces.
*   [world.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/world.js): Plot world diagram mappings.
*   [worldNode.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/worldNode.js): Entity nodes inside world diagrams.
*   [worldEdge.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/models/worldEdge.js): Connections and relations linking world nodes.

*Note: Sequelize configurations ([.sequelizerc](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/.sequelizerc)) and SQL libraries (`mysql2`, `sequelize`) are remnants from a previous project draft and are not active in the running system.*

---

## 11. Third-party Service Integrations

*   **Cloudinary**: Handled in [cloudinary.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/config/cloudinary.js). Configures Multer to upload project media to the `CreatorSpace_Assets` folder, supporting standard formats (`jpg`, `png`, `mp3`, `wav`, `mp4`).
*   **Redis**: Handled in [redis.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/config/redis.js). Cache memory used to store Refresh Tokens (`refresh_token:<userId>`) with an expiry window of 7 days, supporting token rotation.
*   **PayOS**: Handled in [payos.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/config/payos.js). Custom checkout processing, generating transaction links, and receiving payment callbacks via webhooks.
*   **Google GenAI**: Configured in [aiService.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/services/aiService.js). Invokes the `gemini-2.5-flash` model to analyze current scripts and provide short context-aware writing advice.
*   **Google Cloud Text-to-Speech**: Configured in [ttsService.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/services/ttsService.js). Connects using the credentials key JSON file in the project root to generate MP3 speech synthesis files from text blocks.
*   **Socket.IO**: Handled in [socketService.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/services/socketService.js). Manages persistent client connections, maps users to individual sockets, and pushes real-time notifications.
*   **Hocuspocus**: Handled in [hocuspocus.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/config/hocuspocus.js). Starts a Yjs document sync server on port 1234, enabling real-time collaborative editing.
*   **Cron Jobs**:
    *   *Transaction Cleaner*: Configured in [server.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/server.js). Runs every hour to clean up pending payments older than 24 hours, changing their status to `CANCELLED`.
    *   *Invite Checker*: Configured in [inviteCron.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/jobs/inviteCron.js). Runs every hour to transition expired workspace invitations to `EXPIRED`.
*   **Email Service**: Handled in [mailer.js](file:///d:/CCNPMM/CK/ScriptMediaManagementProject/src/config/mailer.js). Utilizes Nodemailer to send OTP verification codes and workspace invitation details.

---

## 12. Running Tests

### Backend Tests
There are **no automated test suites** configured or implemented in the backend project. Run commands in `package.json` point to a placeholder error exit script.

### Frontend Tests
Frontend integration tests are implemented using **Cypress**. To open the Cypress test runner:
```bash
cd CCCPMM_UI/reactjs01
npx cypress open
```
To run tests headlessly:
```bash
npx cypress run
```

---

## 13. Deployment

Based on the current architecture:
1.  **Frontend Application**: Can be deployed to any static hosting provider (e.g., Vercel, Netlify, AWS S3) by uploading the generated `dist` build directory. Remember to configure the target server URL using `VITE_BACKEND_URL`.
2.  **Backend Application**: Can be deployed on a Cloud VM (e.g., AWS EC2, DigitalOcean, Heroku) using a process manager such as `pm2`. Ensure that port `8088` (API and Socket.IO) and port `1234` (Hocuspocus editor sync server) are open and accessible.
3.  **Database and Cache Services**: Use cloud-managed services (e.g., MongoDB Atlas, Upstash Redis) to store system data.

---
