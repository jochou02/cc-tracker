# Credit Card Perks Tracker — Design Document

## 1. Overview

### Purpose
Credit cards provide statement credits ("perks") with varying cadences (monthly, quarterly, annual, semi-annual, anniversary-based). When holding multiple cards, it becomes difficult to remember:
- Which perks exist
- Which are currently active
- Which have been used
- Which are expiring soon

This project provides a **lightweight, single-page web application** that visualizes credit card perks, tracks usage, and persists state across devices — without authentication, cost, or unnecessary complexity.

---

### Goals
- Clearly show **active perks** at any point in time
- Provide a **timeline visualization** per calendar year
- Support **multiple users** (e.g., household members)
- Support **multiple years** (past and future)
- Correctly handle **non-calendar-aligned credits** (anniversary-based, arbitrary ranges)
- Persist usage state across devices
- Remain **zero-cost** (AWS + GitHub Pages free tier)
- Be **clean, maintainable, and production-ready**

---

### Non-Goals
- No transaction syncing
- No authentication or accounts
- No dynamic card discovery
- No notifications or alerts
- No spend optimization
- No public multi-tenant SaaS features

This is an **internal personal tool**, not a commercial product.

---

## 2. MVP Scope

The MVP launches with a single focused view: the **timeline**.

### What's included in the MVP

- **Year selector** — navigate between calendar years
- **User selector** — switch between configured household users (hidden when only one user)
- **Timeline** — per-card, per-credit-type rows spanning the full calendar year, with:
  - Color-coded segments (active, used, inactive)
  - A "today" indicator line for the current year
  - Click-to-toggle credit usage directly on timeline segments
  - **Credit detail modal** — clicking any credit segment opens a centered modal dialog (page-blocking) with a checkbox for used/not used, a multi-line notes field, and Save / Cancel buttons; changes are committed only on Save

The goal of the MVP is to get the core visualization working end-to-end with real data before adding more UI surface area.

### What's NOT in the MVP (planned for later)

See [Section 3 — Future Development](#3-future-development) below.

---

## 3. Future Development

The following features are designed and ready to build, but intentionally excluded from the MVP to keep the initial release focused and shippable.

### Active Credits List (`#active-credits`)

A dedicated panel showing only the credits that are active right now (i.e., `now >= startDate && now <= endDate`), grouped by card. Each credit shows:
- Credit name and dollar amount
- Start and end dates
- A checkbox to mark it as used

This duplicates the "active" information visible on the timeline but in a more scannable list format — useful once the number of cards/credits grows.

### Card Summary Tiles (`#card-tiles`)

A responsive grid of per-card summary tiles, each showing:
- Card name
- How many active credits have been used vs. total (e.g., "2 / 4 active credits used")
- Remaining dollar value for the current period

Useful as a quick at-a-glance dashboard before drilling into the timeline.

### Backend Persistence

The API layer (`src/utils/api.js`) is currently a no-op stub. Future work includes wiring it to:
- **API Gateway (HTTP API)**
- **AWS Lambda (Node.js)**
- **DynamoDB (single-table)**

This will persist checked credit state across devices and sessions.

---

## 4. Core Design Principles

1. **Progressive Enhancement**
   - Base HTML renders meaningful content
   - JavaScript enhances interactivity and visualization

2. **Persist Only User State**
   - Static data (cards, perks, ownership) is hardcoded
   - DynamoDB stores only user actions

3. **Periods, Not Calendar Years**
   - Credits exist over arbitrary start/end windows
   - Calendar years are views, not data entities

4. **Derived Data Over Stored Data**
   - Credit instances are computed at runtime
   - No derived data stored in DynamoDB

5. **Flat, Opaque Persistence**
   - Backend stores opaque IDs
   - Frontend owns business logic

---

## 5. High-Level Architecture

```
Browser (SPA, enhanced HTML)
  |
  | HTTPS (JSON)
  v
API Gateway (HTTP API)
  |
  v
AWS Lambda (Stateless)
  |
  v
DynamoDB (Single Table)
```

---

## 6. Frontend Architecture

### Stack
- **Hosting:** GitHub Pages
- **CSS:** Tailwind CSS
- **JavaScript:** Vanilla JS (ES modules)
- **Optional:** Alpine.js for light interactivity

No React or heavy frameworks.

---

### Frontend Responsibilities
- Credit definition expansion
- Period calculation (calendar + anniversary)
- Timeline rendering
- Active credit detection
- Checked-state overlay
- User & year switching
- Backend API communication

---

### Frontend Structure

```
/src
  /components
    timeline.js        ← MVP
    userSelector.js    ← MVP
    yearSelector.js    ← MVP
    activeCredits.js   ← Future
    cardTiles.js       ← Future
  /data
    cards.js           // card definitions
    credits.js         // credit definitions
    userCards.js       // user-specific card instances
  /state
    store.js
  /utils
    dates.js
    creditExpansion.js
    api.js
  main.js
index.html
```

---

## 7. Data Model Separation (Critical Concept)

This system explicitly separates **definitions**, **instances**, and **state**.

### 7.1 Global Credit Definitions (Static, Global)
Defines **what a credit is conceptually**, independent of any card.

```js
CreditDefinition {
  id: "uber",
  name: "Uber Credit"
}
```
- No cadence
- No amount
- No dates
- No card-specific logic
- Each credit ID is globally unique.

---

### 7.2 Card Definitions (Static, Global)
Defines a card and how it configures each credit.

```js
CardDefinition {
  id: "amex_gold",
  name: "Amex Gold",
  credits: [
    {
      creditId: "uber",
      cadence: "monthly",
      amount: 10,
      periodType: "calendar"
    },
    {
      creditId: "resy",
      cadence: "biannual",
      amount: 50,
      periodType: "calendar"
    }
  ]
}
```

Key properties:

- A card cannot contain the same creditId twice
- Cadence and amount are card-specific
- The same creditId may appear on multiple cards with different rules

---

### 7.3 User Configuration (Static, Per User)
Defines which cards a user owns and when each card was opened.

```js
UserConfig {
  userId: "john",
  cards: [
    {
      id: "amex_gold",
      openedDate: "2021-05-21"
    },
    {
      id: "amex_plat",
      openedDate: "2023-02-10"
    }
  ]
}

```

Key properties:
- Users are predefined in static config
- Card ownership is static
- openedDate provides the anniversary anchor
- No user or card data is persisted in DynamoDB

This configuration is used at runtime to:

- Resolve anniversary-based credit periods
- Expand credit definitions into concrete credit instances

---

### 7.4 User State (Dynamic, Persisted)
Tracks only what the user has done.

All per-instance state is nested under a single `creditState` map, keyed by the opaque credit instance ID:

```js
creditState: {
  "amex_plat_uber_2026-02-01_2026-02-28": {
    checked: true,
    note: "Used for Uber Eats order on Feb 14th."
  },
  "amex_gold_airline_2025-05-21_2026-05-20": {
    checked: false,
    note: ""
  }
}
```

- Each key is the opaque credit instance ID (`{cardId}_{creditId}_{startISO}_{endISO}`), which uniquely identifies the card, credit type, and billing period
- `checked` — whether the credit has been used
- `note` — free-text paragraph; an empty or whitespace-only string is treated as no note
- Nesting both fields under one key avoids two parallel maps that must stay in sync, and makes it easy to add future per-instance fields (e.g. `usedAt` timestamp)

Persisted in DynamoDB (future — currently a no-op stub).

---

## 8. Credit Instance Model (Derived)

A **credit instance** represents a single usable occurrence of a credit.

### Properties
- `startDate`
- `endDate`
- `amount`
- `cardId`
- `creditId`

### Instance ID Format

```
{cardId}_{creditId}_{startISO}_{endISO}
```

Example:
```
amex_gold_airline_2025-05-21_2026-05-20
```

These IDs are opaque and persisted as-is.

---

## 9. Timeline Model

- Timeline is rendered **per calendar year**
- Credit instances appear if their period intersects the year
- Non-calendar-aligned credits may appear partially

```
Timeline (Grouped by Card)

                  Jan      Feb      Mar      Apr      May      Jun      Jul      Aug      Sep      Oct      Nov      Dec
              |--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|

Amex Platinum
  Uber (Monthly)
               [======] [======] [======] [======] [======] [======] [======] [======] [======] [======] [======] [======]

  Airline Fee (Annual)
               [=========================================================================================================]

Amex Gold
  Dining (Quarterly)
               [========================] [========================] [========================] [========================] 

              ^ Current Date Indicator (vertical line)
```
### Details
- Rows are grouped by credit card
- Each credit type (Uber, Airline, Dining) gets its own row
- Rectangles represent individual credit periods
- Monthly → many short segments
- Quarterly → fewer medium segments
- Annual → one long continuous segment
- The horizontal axis is calendar year (Jan → Dec)
- Credit periods may start or end mid-year (anniversary-based cards)
- A vertical line indicates today's date
- Width of each segment corresponds to its active duration
- Multiple segments in the same row indicate repeated credit availability

### Rendering Rules
- `visibleStart = max(periodStart, Jan 1)`
- `visibleEnd = min(periodEnd, Dec 31)`
- Current date indicator only shown when viewing current year

---

## 10. Active Credits Definition

A credit instance is **active** if:

```js
now >= startDate && now <= endDate
```

Active credits appear in:
- Highlighted timeline segments (MVP)
- Active Credits list (future)
- Card aggregation tiles (future)

---

## 11. Backend Architecture

### Stack
- API Gateway (HTTP API)
- AWS Lambda (Node.js)
- DynamoDB (On-demand)

All remain within AWS Free Tier.

---

## 12. DynamoDB Schema

### Table: `credit-tracker`

**Partition Key:** `pk`  
**Sort Key:** `sk`

### User State Item

```json
{
  "pk": "USER#john",
  "sk": "STATE",
  "creditState": {
    "amex_plat_uber_2026-02-01_2026-02-28": {
      "checked": true,
      "note": "Used for Uber Eats order on Feb 14th."
    }
  },
  "updatedAt": "2026-02-15T10:00:00Z"
}
```

No cards, credits, or years are stored.

---

## 13. Backend API

### GET /state?user=john

Returns:
```json
{
  "creditState": {
    "amex_plat_uber_2026-02-01_2026-02-28": {
      "checked": true,
      "note": "Used for Uber Eats order on Feb 14th."
    }
  }
}
```

---

### POST /state

```json
{
  "user": "john",
  "creditId": "amex_plat_uber_2026-02-01_2026-02-28",
  "checked": true,
  "note": "Used for Uber Eats order on Feb 14th."
}
```

Updates the `checked` and/or `note` fields for a single credit instance. `creditId` is the opaque instance ID — the same key used in `creditState`. Backend performs a partial update on that instance's entry in DynamoDB; sending an empty `note` string deletes the note field.

---

## 14. Multi-User Support

- Users predefined in config
- UI selector switches active user
- Each user maps to a DynamoDB partition
- No authentication or sessions

---

## 15. Multi-Year Support

- Year is a UI filter
- Credit instances derived per year
- Checked state aligns via instance IDs
- No backend schema changes required

---

## 16. Security Model

- Hardcoded API key (header-based)
- CORS restricted to GitHub Pages domain
- IAM scoped to a single DynamoDB table
- No sensitive personal data stored

---

## 17. Summary

This design:
- Correctly separates definitions, instances, and state
- Handles anniversary-based and arbitrary credit periods
- Avoids unnecessary persistence and migrations
- Scales across users and years
- Remains zero-cost and maintainable

The system is intentionally deterministic, explicit, and boring — ideal for a long-lived personal internal tool.