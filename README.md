# EcoCycle AI — Circular Economy E-Waste Diagnostic & Intelligent Routing Platform

> **Primary Value Proposition:**
> *"Turn your old electronics into value — safely, intelligently, and sustainably."*

EcoCycle AI is an AI-powered circular-economy platform that bridges **device computer vision + dual-pricing valuation + NIST SP 800-88 cryptographic data sanitization + physical recycling logistics**.

---

## 🌟 Key Features

1. **AI Multi-Modal Vision Scanner:** Uses Google Gemini vision to identify category, brand, model generation, and physical damage from device photos or live camera feeds.
2. **Automated Software Diagnostics:** Evaluates battery cycles, touch digitizer, display glass, and storage health with transparent provenance (`AI Estimated`, `User Reported`, `Browser Tested`).
3. **Dual-Pricing Valuation Engine:** Simultaneously calculates **Secondary Resale Market Value** against **Recoverable Precious Metal Scrap Value** (Gold, Silver, Copper, Lithium) in INR (₹) and USD ($).
4. **Intelligent Condition-Based Routing Engine:** Deterministic backend rules evaluate condition and economic viability to route devices to:
   - `RESALE` (Working devices)
   - `REPAIR` (Repairable defects where servicing unlocks margin)
   - `RECYCLE` (Dead / hazardous scrap routed to certified R2v3 refiners)
5. **NIST SP 800-88 Cryptographic Data Sanitization:** Guided reset workflows and immutable **SHA-256 digital disposition certificates** with QR verification.
6. **Eco-Logistics Matchmaker:** Haversine distance-ranked certified recyclers, doorstep pickup scheduling, and interactive regional map interface.
7. **Eco-Wallet Impact Ledger:** Real-time tracking of Eco-Credits, kilograms of CO₂ avoided, and e-waste diverted from landfills.
8. **3-Scenario Hackathon Demo Mode:** Instant 1-click hydration of:
   - Scenario 1: Premium Working Smartphone ➔ `RESALE`
   - Scenario 2: Damaged but Repairable Laptop ➔ `REPAIR`
   - Scenario 3: Dead / Swollen Battery Smartphone ➔ `RECYCLE`

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Environment Configuration
Credentials are automatically configured in `.env`, `server/.env`, and `client/.env`.
Reference template: `.env.example`.

### 3. Run Application
Run backend and frontend simultaneously:
```bash
npm run dev
```
Or run individually:
```bash
# Terminal 1: Backend Express Server (Port 5000)
npm run dev:server

# Terminal 2: Frontend Vite Client (Port 5173)
npm run dev:client
```

Open your browser at:
`http://localhost:5173`

---

## 🧪 Testing & Verification

Run server unit & integration test suite:
```bash
npm test
```
Tests cover:
- Deterministic decision routing for Resale, Repair, and Recycle
- Dual-pricing scrap and resale calculations
- NIST SP 800-88 SHA-256 certificate generation
- Haversine distance calculations

Build verification:
```bash
npm run build
```

---

## 📑 Project Structure

```text
ecocycle-ai/
├── client/
│   ├── src/
│   │   ├── components/layout/   # Navbar, Footer, AppShell
│   │   ├── pages/               # All 18 application routes
│   │   ├── services/api.ts      # Unified REST API client
│   │   ├── types/               # TypeScript interfaces
│   │   └── index.css            # Circular-economy dark styling
│   └── package.json
├── server/
│   ├── src/
│   │   ├── controllers/         # Express endpoint controllers
│   │   ├── routes/              # Modular REST routes
│   │   ├── services/            # AI, Diagnostics, Valuation, Routing, Sanitization, Wallet
│   │   ├── db/storage.ts        # Supabase + In-memory hybrid store
│   │   └── index.ts             # Express server entry point
│   ├── tests/                   # Vitest unit test suite
│   └── package.json
├── docs/
│   ├── architecture.md          # Technical specifications
│   ├── api.md                   # REST API documentation
│   └── hackathon-pitch.md       # 3-minute pitch deck script
├── supabase/
│   └── migrations/              # PostgreSQL 001 schema with RLS
└── package.json
```
