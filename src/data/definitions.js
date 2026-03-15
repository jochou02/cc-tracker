/**
 * src/data/definitions.js
 *
 * All static configuration lives here:
 *   - CreditId  — canonical string enum for every credit type
 *   - CardId    — canonical string enum for every card
 *   - CREDIT_DEFINITIONS — display metadata keyed by CreditId
 *   - CARD_DEFINITIONS   — card configs referencing CreditId
 *   - USERS              — per-user card ownership referencing CardId
 *
 * IMPORTANT: CreditId and CardId values are persisted in DynamoDB as part of
 * credit instance IDs (e.g. "amex_gold_uber_2026-01-01_2026-01-31").
 * They must NEVER be renamed without a data migration.
 * Add new entries freely; only rename/delete requires care.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const CreditId = Object.freeze({
  // Dining
  RESY:               "resy",
  DUNKIN:             "dunkin",
  DINING:             "dining",

  // Shopping
  SAKS:               "saks",
  LULU:               "lulu",
  SPLURGE:            "splurge",
  OURA:               "oura",
  DELL:               "dell",

  // Flights
  COMPANION:          "companion",
  AIRLINE_INCIDENTAL: "airline_incidental",
  FLIGHT:             "flight",

  // Hotels
  HILTON_RESORT:      "hilton_resort",
  HILTON_CREDIT:      "hilton_credit",
  FREE_NIGHT:         "free_night",
  HOTEL:              "hotel",
  FHR:                "fhr",
  TRAVEL:             "travel",

  // Misc
  UBER:               "uber",
  UBER_ONE:           "uber_one",
  TSA:                "tsa",
  ENTERTAINMENT:      "entertainment",
});

export const CardId = Object.freeze({
  AMEX_GOLD_PERSONAL:  "amex_gold_personal",
  AMEX_GOLD_BUSINESS:  "amex_gold_business",
  AMEX_PLAT_PERSONAL:  "amex_plat_personal",
  AMEX_PLAT_BUSINESS:  "amex_plat_business",

  VENTURE_X:           "venture_x",

  CITI_STRATA_ELITE:   "citi_strata_elite",

  HILTON_ASPIRE:       "hilton_aspire",
  HILTON_SURPASS:      "hilton_surpass",

  WORLD_OF_HYATT:      "world_of_hyatt",

  MARRIOT_BOUNDLESS:   "marriot_boundless",

  IHG_PREMIER:         "ihg_premier",

  BILT_PALLADIUM:      "bilt_palladium",

  ATMOS_ASCENT:        "atmos_ascent",
  ATMOS_SUMMIT:        "atmos_summit",
});

export const Cadence = Object.freeze({
  MONTHLY:   "monthly",
  QUARTERLY: "quarterly",
  BIANNUAL:  "biannual",
  ANNUAL:    "annual",
});

export const PeriodType = Object.freeze({
  CALENDAR:    "calendar",
  ANNIVERSARY: "anniversary",
});

export const CardType = Object.freeze({
  HOTEL:   "hotel",
  TRAVEL:  "travel",
  GENERAL: "general",
});

// ---------------------------------------------------------------------------
// Credit definitions
// Display name for each credit type. Keyed by CreditId value.
// ---------------------------------------------------------------------------

export const CREDIT_DEFINITIONS = {
  // Dining
  [CreditId.RESY]:               { name: "Resy Credit" },
  [CreditId.DUNKIN]:             { name: "Dunkin Credit" },
  [CreditId.DINING]:             { name: "Dining Credit" },

  // Shopping
  [CreditId.SAKS]:               { name: "Saks Credit" },
  [CreditId.LULU]:               { name: "Lululemon Credit" },
  [CreditId.SPLURGE]:            { name: "Splurge Credit" },
  [CreditId.OURA]:               { name: "Oura Ring Credit" },
  [CreditId.DELL]:               { name: "Dell Credit" },

  // Flights
  [CreditId.COMPANION]:          { name: "Companion Fare Award" },
  [CreditId.AIRLINE_INCIDENTAL]: { name: "Airline Incidental Credit" },
  [CreditId.FLIGHT]:             { name: "Flight Credit" },

  // Hotels
  [CreditId.HILTON_RESORT]:      { name: "Hilton Resort Credit" },
  [CreditId.HILTON_CREDIT]:      { name: "Hilton Credit" },
  [CreditId.FREE_NIGHT]:         { name: "Free Night Award" },
  [CreditId.HOTEL]:              { name: "Hotel Credit" },
  [CreditId.FHR]:                { name: "FHR Credit" },
  [CreditId.TRAVEL]:             { name: "Travel Credit" },

  // Misc
  [CreditId.UBER]:               { name: "Uber Credit" },
  [CreditId.UBER_ONE]:           { name: "Uber One Credit" },
  [CreditId.TSA]:                { name: "TSA Precheck/Global Entry Credit" },
  [CreditId.ENTERTAINMENT]:      { name: "Digital Entertainment Credit" },
};

// ---------------------------------------------------------------------------
// Card definitions
// Each card lists the credits it offers, with cadence/amount/periodType.
// Keyed by CardId value.
// ---------------------------------------------------------------------------

export const CARD_DEFINITIONS = {
  [CardId.AMEX_GOLD_PERSONAL]: {
    name: "Amex Gold",
    type: CardType.GENERAL,
    annualFee: 325,
    multipliers: [
      { category: "Dining",           multiplier: 4 },
      { category: "Groceries",        multiplier: 4 },
      { category: "Flights (Amex)",   multiplier: 3 },
      { category: "Everything else",  multiplier: 1 },
    ],
    benefits: [
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.UBER,   cadence: Cadence.MONTHLY,  amount: 10, periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.DINING, cadence: Cadence.MONTHLY,  amount: 10, periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.DUNKIN, cadence: Cadence.MONTHLY,  amount: 7,  periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.RESY,   cadence: Cadence.BIANNUAL, amount: 50, periodType: PeriodType.CALENDAR, description: "" },
    ],
  },

  [CardId.AMEX_PLAT_PERSONAL]: {
    name: "Amex Personal Platinum",
    type: CardType.TRAVEL,
    annualFee: 695,
    multipliers: [
      { category: "Flights (Amex)",   multiplier: 5 },
      { category: "Hotels (Amex)",    multiplier: 5 },
      { category: "Everything else",  multiplier: 1 },
    ],
    benefits: [
      "Purchase Protection (up to $10,000 per claim)",
      "Extended Warranty",
      "Trip Cancellation & Interruption Insurance",
      "Trip Delay Insurance",
      "Baggage Insurance",
      "Car Rental Loss & Damage Insurance",
      "Global Lounge Collection access",
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.UBER,               cadence: Cadence.MONTHLY,   amount: 15,  periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.LULU,               cadence: Cadence.QUARTERLY, amount: 75,  periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.RESY,               cadence: Cadence.QUARTERLY, amount: 100, periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.SAKS,               cadence: Cadence.BIANNUAL,  amount: 50,  periodType: PeriodType.CALENDAR, description: "Does not work on Saks Off Fifth" },
      { creditId: CreditId.FHR,                cadence: Cadence.BIANNUAL,  amount: 300, periodType: PeriodType.CALENDAR, description: "FHR must be booked through Amex Travel Portal" },
      { creditId: CreditId.UBER_ONE,           cadence: Cadence.ANNUAL,    amount: 120, periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.AIRLINE_INCIDENTAL, cadence: Cadence.ANNUAL,    amount: 200, periodType: PeriodType.CALENDAR, description: "Recommended use is Southwest airfare cancel exploit" },
      { creditId: CreditId.OURA,               cadence: Cadence.ANNUAL,    amount: 200, periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.TSA,                cadence: Cadence.ANNUAL,    amount: 209, periodType: PeriodType.CALENDAR, description: "" },
    ],
  },

  [CardId.AMEX_PLAT_BUSINESS]: {
    name: "Amex Business Platinum",
    type: CardType.TRAVEL,
    annualFee: 695,
    multipliers: [
      { category: "Flights (Amex)",   multiplier: 5 },
      { category: "Hotels (Amex)",    multiplier: 5 },
      { category: "Everything else",  multiplier: 1 },
    ],
    benefits: [
      "Purchase Protection (up to $10,000 per claim)",
      "Extended Warranty",
      "Trip Cancellation & Interruption Insurance",
      "Trip Delay Insurance",
      "Global Lounge Collection access",
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.AIRLINE_INCIDENTAL, cadence: Cadence.ANNUAL,    amount: 200, periodType: PeriodType.ANNIVERSARY, description: "" },
      { creditId: CreditId.FHR,                cadence: Cadence.BIANNUAL,  amount: 300, periodType: PeriodType.CALENDAR,    description: "FHR must be booked through Amex Travel Portal" },
      { creditId: CreditId.DELL,               cadence: Cadence.ANNUAL,    amount: 150, periodType: PeriodType.CALENDAR,    description: "" },
      { creditId: CreditId.HILTON_CREDIT,      cadence: Cadence.QUARTERLY, amount: 50,  periodType: PeriodType.CALENDAR,    description: "" },
    ],
  },

  [CardId.VENTURE_X]: {
    name: "Capital One Venture X",
    type: CardType.TRAVEL,
    annualFee: 395,
    multipliers: [
      { category: "Hotels (C1 Travel)",   multiplier: 10 },
      { category: "Rental Cars (C1 Travel)", multiplier: 10 },
      { category: "Flights (C1 Travel)", multiplier: 5 },
      { category: "Everything else",     multiplier: 2 },
    ],
    benefits: [
      "Trip Cancellation & Interruption Insurance",
      "Trip Delay Reimbursement",
      "Lost Luggage Reimbursement",
      "Primary Car Rental Insurance",
      "Capital One Lounge access",
      "Priority Pass access",
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.TRAVEL, cadence: Cadence.ANNUAL, amount: 300, periodType: PeriodType.ANNIVERSARY, description: "Bookings must be made through Capital One Travel Portal" },
    ],
  },

  [CardId.CITI_STRATA_ELITE]: {
    name: "Citi Strata Elite",
    type: CardType.TRAVEL,
    annualFee: 595,
    multipliers: [
      { category: "Air, Hotels, Car Rentals", multiplier: 10 },
      { category: "Dining",                   multiplier: 10 },
      { category: "Groceries",                multiplier: 3 },
      { category: "Gas",                      multiplier: 3 },
      { category: "Everything else",          multiplier: 1 },
    ],
    benefits: [
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.SPLURGE, cadence: Cadence.ANNUAL, amount: 200, periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.HOTEL,   cadence: Cadence.ANNUAL, amount: 300, periodType: PeriodType.CALENDAR, description: "" },
    ],
  },

  [CardId.HILTON_ASPIRE]: {
    name: "Amex Hilton Aspire",
    type: CardType.HOTEL,
    annualFee: 550,
    multipliers: [
      { category: "Hilton purchases",  multiplier: 14 },
      { category: "Flights & Dining",  multiplier: 7 },
      { category: "Everything else",   multiplier: 3 },
    ],
    benefits: [
      "Hilton Diamond status",
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.FLIGHT,        cadence: Cadence.QUARTERLY, amount: 50,  periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.HILTON_RESORT, cadence: Cadence.BIANNUAL,  amount: 200, periodType: PeriodType.CALENDAR, description: "This credit must be used IN PERSON at the time of the stay or when checking out" },
      { creditId: CreditId.FREE_NIGHT,    cadence: Cadence.ANNUAL,    amount: 0,   periodType: PeriodType.CALENDAR, description: "" },
    ],
  },

  [CardId.HILTON_SURPASS]: {
    name: "Amex Hilton Surpass",
    type: CardType.HOTEL,
    annualFee: 150,
    multipliers: [
      { category: "Hilton purchases",  multiplier: 12 },
      { category: "Dining, Groceries, Gas", multiplier: 6 },
      { category: "Everything else",   multiplier: 3 },
    ],
    benefits: [
      "Hilton Gold status (Diamond if spend >$40k/year)",
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.HILTON_CREDIT, cadence: Cadence.QUARTERLY, amount: 50, periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.FREE_NIGHT,    cadence: Cadence.ANNUAL,    amount: 0,  periodType: PeriodType.CALENDAR, description: "If spend >$1500" },
    ],
  },

  [CardId.WORLD_OF_HYATT]: {
    name: "World of Hyatt",
    type: CardType.HOTEL,
    annualFee: 95,
    multipliers: [
      { category: "Hyatt purchases",   multiplier: 9 },
      { category: "Dining, Flights, Gyms", multiplier: 2 },
      { category: "Everything else",   multiplier: 1 },
    ],
    benefits: [
      "World of Hyatt Discoverist status",
    ],
    credits: [
      { creditId: CreditId.FREE_NIGHT, cadence: Cadence.ANNUAL, amount: 0, periodType: PeriodType.CALENDAR, description: "" },
    ],
  },

  [CardId.MARRIOT_BOUNDLESS]: {
    name: "Marriot Bonvoy Boundless",
    type: CardType.HOTEL,
    annualFee: 95,
    multipliers: [
      { category: "Marriot purchases", multiplier: 6 },
      { category: "Everything else",   multiplier: 2 },
    ],
    benefits: [
      "Marriot Silver Elite status",
    ],
    credits: [
      { creditId: CreditId.FREE_NIGHT, cadence: Cadence.ANNUAL, amount: 0, periodType: PeriodType.CALENDAR, description: "" },
    ],
  },

  [CardId.IHG_PREMIER]: {
    name: "IHG Premier",
    type: CardType.HOTEL,
    annualFee: 99,
    multipliers: [
      { category: "IHG purchases",     multiplier: 26 },
      { category: "Dining & Gas",      multiplier: 5 },
      { category: "Everything else",   multiplier: 3 },
    ],
    benefits: [
      "IHG Platinum Elite status",
    ],
    credits: [
      { creditId: CreditId.FREE_NIGHT, cadence: Cadence.ANNUAL, amount: 0, periodType: PeriodType.CALENDAR, description: "" },
    ],
  },

  [CardId.BILT_PALLADIUM]: {
    name: "Bilt Palladium",
    type: CardType.HOTEL,
    annualFee: 95,
    multipliers: [
      { category: "Rent",              multiplier: 1 },
      { category: "Travel",            multiplier: 3 },
      { category: "Dining",            multiplier: 2 },
      { category: "Everything else",   multiplier: 1 },
    ],
    benefits: [
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.HOTEL, cadence: Cadence.BIANNUAL, amount: 200, periodType: PeriodType.CALENDAR, description: "" },
    ],
  },

  [CardId.ATMOS_ASCENT]: {
    name: "Atmos Ascent",
    type: CardType.TRAVEL,
    annualFee: 0,
    multipliers: [],
    benefits: [],
    credits: [
      { creditId: CreditId.COMPANION, cadence: Cadence.ANNUAL, amount: 109, periodType: PeriodType.CALENDAR, description: "" },
    ],
  },
};

// ---------------------------------------------------------------------------
// Users
// Per-user card ownership. userId is the display name; the map key is the
// login used as the DynamoDB partition (pk = "USER#<key>").
// ---------------------------------------------------------------------------

export const USERS = {
  ue: {
    userId: "Peng Lee",
    cards: [
      { id: CardId.AMEX_PLAT_BUSINESS, anniversaryDate: "10-25" },
      { id: CardId.AMEX_PLAT_PERSONAL, anniversaryDate: "11-26" },
      { id: CardId.CITI_STRATA_ELITE,  anniversaryDate: "08-26" },
      { id: CardId.HILTON_ASPIRE,      anniversaryDate: "06-26" },
      { id: CardId.HILTON_SURPASS,     anniversaryDate: "09-25" },
      { id: CardId.WORLD_OF_HYATT,     anniversaryDate: "06-25" },
      { id: CardId.MARRIOT_BOUNDLESS,  anniversaryDate: "11-25" },
      { id: CardId.IHG_PREMIER,        anniversaryDate: "09-25" },
      { id: CardId.BILT_PALLADIUM,     anniversaryDate: "02-07" },
    ],
  },
  john: {
    userId: "John",
    cards: [
      { id: CardId.AMEX_PLAT_PERSONAL, anniversaryDate: "02-10" },
      { id: CardId.HILTON_ASPIRE,      anniversaryDate: "11-14" },
      { id: CardId.VENTURE_X,          anniversaryDate: "11-14" },
      { id: CardId.CITI_STRATA_ELITE,  anniversaryDate: "11-14" },
    ],
  },
  amy: {
    userId: "Amy",
    cards: [
      { id: CardId.AMEX_PLAT_PERSONAL, anniversaryDate: "02-10" },
      { id: CardId.VENTURE_X,          anniversaryDate: "03-22" },
      { id: CardId.AMEX_GOLD_PERSONAL, anniversaryDate: "05-21" },
    ],
  },
};
