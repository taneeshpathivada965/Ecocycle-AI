# EcoCycle AI — System Architecture & Technical Specifications

## 1. System Overview

EcoCycle AI is an enterprise-grade circular-economy platform designed to automate e-waste diagnostics, secondary market valuation, NIST-compliant cryptographic data sanitization, condition-based routing, and eco-logistics matchmaking.

```text
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│        React 18 + Vite + Tailwind CSS + Lucide React        │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON / REST
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway & Server                     │
│         Node.js + Express + Zod Schema Validation           │
├──────────────────────────────┬──────────────────────────────┤
│ Core Services:               │ Security & Attestation:      │
│ • Gemini Multi-Modal Vision  │ • NIST SP 800-88 Service     │
│ • Diagnostic Scoring Engine  │ • SHA-256 Certificate Hash   │
│ • Dual-Pricing Engine        │ • Zero-Knowledge Guarantee   │
│ • Conditional Decision Engine│ • Supabase Auth + Session    │
│ • Haversine Logistics Engine │                              │
│ • Eco-Wallet Impact Ledger   │                              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│       Supabase Cloud         │ │      In-Memory & Cache       │
│  PostgreSQL 15 + RLS Engine  │ │  Fast Fallback State Machine │
└──────────────────────────────┘ └──────────────────────────────┘
```

---

## 2. Core Modules

### Module A — AI Multi-Modal Vision Scanner
- Server-side invocation of `@google/genai` (SDK 0.2.0).
- Stateless image evaluation extracting category, brand, model generation, and physical surface stress factors.
- Conservative confidence estimation with user verification overrides.
- Zero-exposure: API keys never leave server boundary.

### Module B — Automated Software Diagnostics
- Evaluates 8 critical hardware subsystems:
  - Battery capacity retention % & cycle life
  - Display panel uniformity & lamination
  - Capacitive touch digitizer grid sampling
  - NAND flash wear-level SMART indicators
  - CPU thermal throttling & frequency stability
  - USB-C / Lightning power delivery handshake
  - Stereo acoustic membrane health
  - VCM autofocus voice coil & camera sensors
- Provenance tagging: `AI_ESTIMATED`, `USER_REPORTED`, `BROWSER_TESTED`, `DEVICE_VERIFIED`, `SIMULATED`.

### Module C — Cryptographic Data Sanitization
- Compliant with **NIST Special Publication 800-88 Revision 1 Guidelines for Media Sanitization**.
- Guided flows for iOS (Secure Enclave Cryptographic Erase), Android (FBE keystore purge), and PC/Mac (BitLocker destruction, NVMe Secure Format).
- Digital certificates signed with tamper-evident **SHA-256** digests linking device ID, method, timestamp, and operator attestation.

### Module D — Dual-Pricing Valuation Engine
- **Resale Yield:** Computes brand baseline, annual decay curve ($0.78^{\text{age}}$), cosmetic condition multiplier, and functional health multiplier.
- **Scrap Yield:** Computes recoverability of elemental metals (Gold, Silver, Copper, Aluminum, Lithium) cross-referenced against live commodity spot indices.
- Locale-aware formatting in **INR (₹)** and **USD ($)**.

### Module E — Deterministic Conditional Routing Engine
- Backend application logic enforces routing decisions independent of LLM hallucinations:
  - $\text{Condition} \ge 70 \land \text{Resale} > \text{Scrap} \implies \mathbf{RESALE}$
  - $\text{Condition} \in [35, 70) \land \text{Repairability} \ge 50 \implies \mathbf{REPAIR}$
  - $\text{Condition} < 35 \lor \text{Dead} \implies \mathbf{RECYCLE}$

### Module F & G — Circular Partner & Eco-Logistics Matchmaker
- Haversine spherical distance calculation between user GPS and certified facilities.
- Provider abstractions for Marketplaces, Refurbishers, Recyclers, and Drop-Off stations.
- Certification filtering (R2v3, e-Stewards, CPCB, ISO 14001).

### Module H — Eco-Wallet & Impact Ledger
- Immutable double-entry transaction record.
- Tracks Eco-Credits earned, kilograms of greenhouse gases avoided, and diverted kilograms of toxic e-waste.
