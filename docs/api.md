# EcoCycle AI — REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication & Profiles

### `GET /auth/me`
Fetches authenticated user, profile, and linked Eco-Wallet.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ success: true, user: { id, email, profile, wallet } }`

### `POST /auth/profile`
Updates user profile settings and preferred currency.
- **Body:** `{ full_name?: string, preferred_currency?: 'INR' | 'USD', avatar_url?: string }`

### `POST /auth/demo-login`
Instant 1-click authentication token for hackathon testing.
- **Response:** `{ success: true, token, user }`

---

## 2. AI Identification & Devices

### `POST /ai/identify-device`
Stateless Gemini vision analysis of an uploaded photo or metadata hint.
- **Body:** `{ image?: string, filename?: string, hint?: string }`
- **Response:**
```json
{
  "success": true,
  "identification": {
    "category": "smartphone",
    "brand": "Apple",
    "model": "iPhone 13 Pro",
    "generation": "2021",
    "condition_grade": "A",
    "visible_damage": ["Minor edge scuffs"],
    "confidence": 0.93,
    "reasoning_summary": "Detected triple-lens module and ceramic shield.",
    "needs_user_confirmation": false
  }
}
```

### `POST /devices`
Register a scanned device assessment.
- **Body:** `DeviceCreateSchema`
- **Response:** `{ success: true, device }`

### `GET /devices`
List user's registered devices with hydrated decision and diagnostic summaries.

### `GET /devices/:id`
Fetch complete hydrated device with diagnostics, valuations, decision, and certificates.

### `DELETE /devices/:id`
Permanently remove a device record.

---

## 3. Diagnostics & Telemetry

### `POST /devices/:id/diagnostics`
Run automated hardware diagnostic assessment.
- **Body:** `{ battery_health?: number, display_status?: string, source?: string }`
- **Response:** `{ success: true, diagnostics }`

### `GET /devices/:id/diagnostics`
Fetch stored diagnostic metrics for a device.

---

## 4. Valuation Engine

### `POST /devices/:id/valuation`
Calculate dual valuations (Resale vs Scrap) and repair cost in INR or USD.
- **Body:** `{ currency?: 'INR' | 'USD' }`
- **Response:**
```json
{
  "success": true,
  "valuation": {
    "resale_value": { "amount": 62000, "currency": "INR", "confidence": 0.92 },
    "scrap_value": { "amount": 650, "currency": "INR", "confidence": 0.95 },
    "repair_cost_estimate": 0
  }
}
```

---

## 5. Decision & Routing

### `POST /devices/:id/decision`
Execute deterministic conditional routing engine and rank partner matches.
- **Body:** `{ coordinates?: { latitude: number, longitude: number } }`
- **Response:**
```json
{
  "success": true,
  "decision": {
    "recommended_route": "RESALE",
    "condition_score": 92,
    "repairability_score": 65,
    "resale_value": 62000,
    "scrap_value": 650,
    "explanation": "High functional health..."
  },
  "matches": []
}
```

---

## 6. NIST SP 800-88 Data Sanitization

### `GET /devices/:id/sanitization/guidance`
Device-specific NIST SP 800-88 protocol checklist.

### `POST /devices/:id/sanitization/confirm`
Attest completion of sanitization checklist and issue SHA-256 certificate.
- **Body:** `{ checklist_answers: Record<string, boolean>, verification_type: string }`
- **Response:** `{ success: true, sanitization, certificate, eco_reward }`

---

## 7. Certificates

### `GET /certificates/:id`
Public or authenticated lookup of a cryptographic media disposition certificate.
- **Response:** `{ success: true, certificate }`

---

## 8. Eco-Wallet & Ledger

### `GET /eco-wallet`
Fetch user's Eco-Credits balance, total CO₂ avoided, and e-waste diverted.

### `GET /eco-wallet/transactions`
Fetch immutable ledger transaction history.

---

## 9. Hackathon Demo Suite

### `GET /demo/scenarios`
Returns the 3 predefined hackathon demo scenarios.

### `POST /demo/scenario/:id`
1-Click hydration of Scenario 1 (Resale), Scenario 2 (Repair), or Scenario 3 (Recycle).
