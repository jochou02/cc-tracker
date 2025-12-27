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

## 2. Core Design Principles

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

## 3. High-Level Architecture

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

## 4. Frontend Architecture

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
    timeline.js
    activeCredits.js
    cardTiles.js
    userSelector.js
    yearSelector.js
  /data
    cards.js           // card definitions
    credits.js         // credit definitions
    userCards.js       // user-specific card instances
  /state
    store.js
  /utils
    dates.js
    creditExpansion.js
  main.js
index.html
```

---

## 5. Data Model Separation (Critical Concept)

This system explicitly separates **definitions**, **instances**, and **state**.

### 5.1 Global Credit Definitions (Static, Global)
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

### 5.2 Card Definitions (Static, Global)
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
      cadence: "semi-annual",
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

### 5.3 User Configuration (Static, Per User)
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

### 5.4 User State (Dynamic, Persisted)
Tracks only what the user has done.

```js
checkedCredits: {
  "amex_gold_airline_2025-05-21_2026-05-20": true
}
```

Persisted in DynamoDB.

---

## 6. Credit Instance Model (Derived)

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

## 7. Timeline Model

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
- A vertical line indicates today’s date
- Width of each segment corresponds to its active duration
- Multiple segments in the same row indicate repeated credit availability

### Rendering Rules
- `visibleStart = max(periodStart, Jan 1)`
- `visibleEnd = min(periodEnd, Dec 31)`
- Current date indicator only shown when viewing current year

---

## 8. Active Credits Definition

A credit instance is **active** if:

```js
now >= startDate && now <= endDate
```

Active credits appear in:
- Active Credits list
- Highlighted timeline segments
- Card aggregation tiles

---

## 9. Backend Architecture

### Stack
- API Gateway (HTTP API)
- AWS Lambda (Node.js)
- DynamoDB (On-demand)

All remain within AWS Free Tier.

---

## 10. DynamoDB Schema

### Table: `credit-tracker`

**Partition Key:** `pk`  
**Sort Key:** `sk`

### User State Item

```json
{
  "pk": "USER#john",
  "sk": "STATE",
  "checkedCredits": {
    "amex_gold_airline_2025-05-21_2026-05-20": true
  },
  "updatedAt": "2025-05-22T01:02:03Z"
}
```

No cards, credits, or years are stored.

---

## 11. Backend API

### GET /state?user=john

Returns:
```json
{
  "checkedCredits": { ... }
}
```

---

### POST /check

```json
{
  "user": "john",
  "creditId": "amex_gold_airline_2025-05-21_2026-05-20",
  "checked": true
}
```

Backend validates input and persists state only.

---

## 12. Multi-User Support

- Users predefined in config
- UI selector switches active user
- Each user maps to a DynamoDB partition
- No authentication or sessions

---

## 13. Multi-Year Support

- Year is a UI filter
- Credit instances derived per year
- Checked state aligns via instance IDs
- No backend schema changes required

---

## 14. Security Model

- Hardcoded API key (header-based)
- CORS restricted to GitHub Pages domain
- IAM scoped to a single DynamoDB table
- No sensitive personal data stored

---

## 15. Summary

This design:
- Correctly separates definitions, instances, and state
- Handles anniversary-based and arbitrary credit periods
- Avoids unnecessary persistence and migrations
- Scales across users and years
- Remains zero-cost and maintainable

The system is intentionally deterministic, explicit, and boring — ideal for a long-lived personal internal tool.

