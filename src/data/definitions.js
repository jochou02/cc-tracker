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
      { category: "Dining & Groceries",  multiplier: 4 },
      { category: "Flights (Amex)",      multiplier: 3 },
    ],
    benefits: [
      "No foreign transaction fees",
      "Purchase Protection",
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
    annualFee: 895,
    multipliers: [
      { category: "Flights",   multiplier: 5 },
      { category: "[Amex Travel] Flights & Hotels",    multiplier: 5 },
    ],
    benefits: [
      "Purchase Protection",
      "Centurion Lounge",
      "Priority Pass",
      "Delta Sky Club",
      "No foreign transaction fees",
      "Hilton Honors Gold Status",
      "Marriott Bonvoy Gold Elite Status",
      "Global Entry / TSA PreCheck"
    ],
    credits: [
      { creditId: CreditId.UBER,               cadence: Cadence.MONTHLY,   amount: 15,  periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.LULU,               cadence: Cadence.QUARTERLY, amount: 75,  periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.RESY,               cadence: Cadence.QUARTERLY, amount: 100, periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.SAKS,               cadence: Cadence.BIANNUAL,  amount: 50,  periodType: PeriodType.CALENDAR, description: "Does not work on Saks Off Fifth" },
      { creditId: CreditId.FHR,                cadence: Cadence.BIANNUAL,  amount: 300, periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.UBER_ONE,           cadence: Cadence.ANNUAL,    amount: 120, periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.AIRLINE_INCIDENTAL, cadence: Cadence.ANNUAL,    amount: 200, periodType: PeriodType.CALENDAR, description: "Recommended use is Southwest airfare cancel exploit" },
      { creditId: CreditId.OURA,               cadence: Cadence.ANNUAL,    amount: 200, periodType: PeriodType.CALENDAR, description: "" },
    ],
  },

  [CardId.AMEX_PLAT_BUSINESS]: {
    name: "Amex Business Platinum",
    type: CardType.TRAVEL,
    annualFee: 895,
    multipliers: [
      { category: "[Amex Travel] Flights & Hotels",    multiplier: 5 },
    ],
    benefits: [
      "Purchase Protection",
      "Centurion Lounge",
      "Priority Pass",
      "Delta Sky Club",
      "No foreign transaction fees",
      "Hilton Honors Gold Status",
      "Marriott Bonvoy Gold Elite Status"
    ],
    credits: [
      { creditId: CreditId.AIRLINE_INCIDENTAL, cadence: Cadence.ANNUAL,    amount: 200, periodType: PeriodType.CALENDAR,    description: "" },
      { creditId: CreditId.FHR,                cadence: Cadence.BIANNUAL,  amount: 300, periodType: PeriodType.CALENDAR,    description: "" },
      { creditId: CreditId.DELL,               cadence: Cadence.ANNUAL,    amount: 150, periodType: PeriodType.CALENDAR,    description: "" },
      { creditId: CreditId.HILTON_CREDIT,      cadence: Cadence.QUARTERLY, amount: 50,  periodType: PeriodType.CALENDAR,    description: "" },
    ],
  },

  [CardId.VENTURE_X]: {
    name: "Capital One Venture X",
    type: CardType.TRAVEL,
    annualFee: 395,
    multipliers: [
      { category: "[C1 Travel] Hotels & Rental Cars",   multiplier: 10 },
      { category: "[C1 Travel] Flights", multiplier: 5 },
      { category: "Everything else",     multiplier: 2 },
    ],
    benefits: [
      "10,000 miles every anniversary",
      "Capital One Lounges",
      "Priority Pass",
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
      { category: "[Citi Travel] Hotels & Car Rentals", multiplier: 12 },
      { category: "[Citi Travel] Flights",                   multiplier: 6 },
      { category: "Restaurants (Fri-Sat 6PM-6AM)",  multiplier: 6 },
      { category: "Restaurants",                      multiplier: 3 },
      { category: "Everything else",          multiplier: 1.5 },
    ],
    benefits: [
      "Priority Pass",
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.SPLURGE, cadence: Cadence.ANNUAL, amount: 200, periodType: PeriodType.CALENDAR, description: "Eligible Partners: Best Buy, Ticketmaster, AA" },
      { creditId: CreditId.HOTEL,   cadence: Cadence.ANNUAL, amount: 300, periodType: PeriodType.CALENDAR, description: "" },
    ],
  },

  [CardId.HILTON_ASPIRE]: {
    name: "Amex Hilton Aspire",
    type: CardType.HOTEL,
    annualFee: 550,
    multipliers: [
      { category: "Hilton Hotels & Resorts", multiplier: 14 },
      { category: "Flights (booked directly with airlines)", multiplier: 7 },
      { category: "Car rentals (booked directly)", multiplier: 7 },
      { category: "U.S. restaurants", multiplier: 7 },
      { category: "Everything else", multiplier: 3 },
    ],
    benefits: [
      "Hilton Honors Diamond Status",
      "Priority Pass",
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.FLIGHT,        cadence: Cadence.QUARTERLY, amount: 50,  periodType: PeriodType.CALENDAR, description: "" },
      { creditId: CreditId.HILTON_RESORT, cadence: Cadence.BIANNUAL,  amount: 200, periodType: PeriodType.CALENDAR, description: "This credit must be used IN PERSON at the time of the stay or when checking out" },
      { creditId: CreditId.FREE_NIGHT,    cadence: Cadence.ANNUAL,    amount: 0,   periodType: PeriodType.ANNIVERSARY, description: "" },
    ],
  },

  [CardId.HILTON_SURPASS]: {
    name: "Amex Hilton Surpass",
    type: CardType.HOTEL,
    annualFee: 150,
    multipliers: [
      { category: "Hilton Hotels & Resorts", multiplier: 12 },
      { category: "U.S. restaurants, supermarkets, gas stations", multiplier: 6 },
      { category: "Everything else", multiplier: 3 },
    ],
    benefits: [
      "Hilton Honors Gold Status",
      "National Car Rental Emerald Club Executive Status",
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.HILTON_CREDIT, cadence: Cadence.QUARTERLY, amount: 50, periodType: PeriodType.CALENDAR, description: "" },
    ],
  },

  [CardId.WORLD_OF_HYATT]: {
    name: "World of Hyatt",
    type: CardType.HOTEL,
    annualFee: 95,
    multipliers: [
      { category: "Hyatt Hotels & Resorts", multiplier: 4 },
      { category: "Dining", multiplier: 2 },
      { category: "Airline tickets (purchased directly)", multiplier: 2 },
      { category: "Local transit & commuting", multiplier: 2 },
      { category: "Fitness clubs & gym memberships", multiplier: 2 },
    ],
    benefits: [
      "World of Hyatt Discoverist Status",
      "5 qualifying night credits toward Hyatt status annually",
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.FREE_NIGHT, cadence: Cadence.ANNUAL, amount: 0, periodType: PeriodType.ANNIVERSARY, description: "" },
    ],
  },

  [CardId.MARRIOT_BOUNDLESS]: {
    name: "Marriot Bonvoy Boundless",
    type: CardType.HOTEL,
    annualFee: 95,
    multipliers: [
      { category: "Marriott Bonvoy Hotels & Resorts", multiplier: 6 },
      { category: "Everything else", multiplier: 2 },
    ],
    benefits: [
      "Marriott Bonvoy Silver Elite Status",
      "15 Elite Night Credits annually",
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.FREE_NIGHT, cadence: Cadence.ANNUAL, amount: 0, periodType: PeriodType.ANNIVERSARY, description: "" },
    ],
  },

  [CardId.IHG_PREMIER]: {
    name: "IHG One Rewards Premier",
    type: CardType.HOTEL,
    annualFee: 99,
    multipliers: [
      { category: "IHG Hotels & Resorts", multiplier: 10 }, 
      { category: "Travel (non-IHG), Gas stations, Dining", multiplier: 5 },
      { category: "Everything else", multiplier: 3 },
    ],
    benefits: [
      "IHG One Rewards Platinum Elite Status while cardmember",
      "Fourth Reward Night Free on points stays of 4+ nights",
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.FREE_NIGHT, cadence: Cadence.ANNUAL, amount: 0, periodType: PeriodType.ANNIVERSARY, description: "" },
    ],
  },

  [CardId.BILT_PALLADIUM]: {
    name: "Bilt Palladium",
    type: CardType.HOTEL,
    annualFee: 495,
    multipliers: [
      { category: "Everything",                 multiplier: 2 },
    ],
    benefits: [
      "$200 Bilt cash annually",
      "Priority Pass",
      "No foreign transaction fees",
    ],
    credits: [
      { creditId: CreditId.HOTEL, cadence: Cadence.BIANNUAL, amount: 200, periodType: PeriodType.CALENDAR, description: "" },
    ],
  },

  [CardId.ATMOS_ASCENT]: {
    name: "Atmos Ascent",
    type: CardType.TRAVEL,
    annualFee: 95,
    multipliers: [
      { category: "Atmos / Alaska & Hawaiian Airlines purchases", multiplier: 3 },
      { category: "Gas, EV charging, cable/streaming, transit & rideshare", multiplier: 2 },
    ],
    benefits: [
      "Annual $99 Companion Fare after $6,000 annual spend",  
      "Free checked bag for you + up to 6 guests on the same reservation",
      "20% back on Alaska/Hawaiian in-flight purchases",
      "Priority boarding on Alaska Airlines flights",
      "No foreign transaction fees",
      "10% rewards bonus with eligible Bank of America account",
      "Global Entry / TSA PreCheck"
    ],
    credits: [],
  },

  [CardId.ATMOS_SUMMIT]: {
    name: "Atmos Summit",
    type: CardType.TRAVEL,
    annualFee: 395,
    multipliers: [
      { category: "Alaska & Hawaiian purchases", multiplier: 3 },
      { category: "Dining", multiplier: 3 },
      { category: "Foreign purchases", multiplier: 3 },
    ],
    benefits: [
      "Global Companion Awards (25K annually + up to 100K with $60K spend)",
      "8 Alaska Lounge passes per year",
      "Free checked bag + preferred boarding for you + up to 6 guests",
      "Priority boarding on Alaska Airlines",
      "10,000 status points every account anniversary",
      "Earn Atmos status points (1 per $2 spent)",
      "Instant $50 travel delay credit for qualifying delays/cancellations",
      "Waived same-day flight change fees",
      "No foreign transaction fees",
      "Points sharing with up to 10 Atmos members",
    ],
    credits: [],
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
      { id: CardId.ATMOS_SUMMIT,       anniversaryDate: "" },
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
      { id: CardId.AMEX_PLAT_PERSONAL, anniversaryDate: "12-29" },
      { id: CardId.CITI_STRATA_ELITE,  anniversaryDate: "" },
      { id: CardId.HILTON_ASPIRE,      anniversaryDate: "02-12" },
      { id: CardId.HILTON_SURPASS,     anniversaryDate: "09-25" },
      { id: CardId.WORLD_OF_HYATT,     anniversaryDate: "06-01" },
      { id: CardId.MARRIOT_BOUNDLESS,  anniversaryDate: "11-01" },
      { id: CardId.IHG_PREMIER,        anniversaryDate: "06-01" },
      { id: CardId.BILT_PALLADIUM,     anniversaryDate: "02-07" },
      { id: CardId.ATMOS_SUMMIT,       anniversaryDate: "10-03" },
      { id: CardId.VENTURE_X,          anniversaryDate: "11-14" },
    ],
  },
};
