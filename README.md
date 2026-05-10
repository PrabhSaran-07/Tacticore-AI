# TactiCore AI

TactiCore AI is an AI-powered web-based tactical simulation platform designed to modernize the traditional SSB Group Planning Exercise (GPE) system.

## Project Overview

This system digitizes the traditional SSB Group Planning Exercise by replacing paper-based maps and manual planning with an interactive digital platform where candidates can collaborate, plan missions, and receive AI-based evaluation.

### Main Features

- Interactive tactical maps and route planning
- Real-time team collaboration and communication
- Scenario-based simulation engine
- AI evaluation of decision making, leadership, and risk assessment
- Instructor dashboard and session monitoring

### Technology Stack

| Category                 | Technology           | Purpose                                   |
| ------------------------ | -------------------- | ----------------------------------------- |
| Frontend                 | React.js             | Builds the interactive user interface     |
| Styling                  | Tailwind CSS         | Creates modern and responsive design      |
| Backend                  | Node.js              | Handles server-side operations            |
| Backend Framework        | Express.js           | Creates APIs and backend routing          |
| Database                 | MongoDB              | Stores users, sessions, maps, and results |
| Real-Time Communication  | Socket.IO            | Enables live collaboration and updates    |
| Map Integration          | Leaflet.js           | Displays tactical maps and route planning |
| AI Logic                 | Python               | Handles scoring and decision analysis     |
| Authentication           | JWT                  | Secures user login and sessions           |
| Deployment (Frontend)    | Vercel               | Hosts the frontend application            |
| Deployment (Backend)     | Render / Railway     | Hosts backend services                    |
| Database Hosting         | MongoDB Atlas        | Cloud storage for database                |
| Simulation Logic         | JavaScript           | Runs mission and event simulations        |
| Voice/Text Communication | WebSockets           | Supports live team communication          |
| Development Tools        | VS Code              | Main code editor used for development     |

## Folder Structure

- `frontend/` — React-based UI for map planning, chat, and dashboards
- `backend/` — Express API, authentication, simulation, and evaluation logic
- `ai-module/` — Python-based scoring, decision analysis, and prediction modeling
- `simulation-engine/` — JavaScript simulation utilities and mission event engine
- `maps/` — Tactical map definitions and terrain data
- `docs/` — Project deliverables and architecture resources

## Getting Started

1. Install dependencies in both `frontend/` and `backend/`.
2. Configure MongoDB connection and environment variables.
3. Start the backend API and frontend development server.
4. Use the instructor panel to create scenarios, then have candidates join simulation sessions.

## Goals

- Digitize SSB GPE and collaborative tactical planning
- Provide AI-assisted scoring and analytics
- Deliver a realistic and data-driven training platform
- Support scalable group simulations and instructor oversight
