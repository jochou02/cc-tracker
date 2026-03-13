export const CARD_DEFINITIONS = {
  amex_gold: {
    id: "amex_gold",
    name: "Amex Gold",
    credits: [
      {
        creditId: "uber",
        cadence: "monthly",
        amount: 10,
        periodType: "calendar",
        description: ""
      },
      {
        creditId: "dining",
        cadence: "monthly",
        amount: 10,
        periodType: "calendar",
        description: ""
      },
      {
        creditId: "dunking",
        cadence: "monthly",
        amount: 7,
        periodType: "calendar",
        description: ""
      },
      {
        creditId: "resy",
        cadence: "biannual",
        amount: 50,
        periodType: "calendar",
        description: ""
      }
    ]
  },
  amex_plat: {
    id: "amex_personal_plat",
    name: "Amex Personal Platinum",
    credits: [
      {
        creditId: "uber",
        cadence: "monthly",
        amount: 15,
        periodType: "calendar",
        description: ""
      },
      {
        creditId: "lulu",
        cadence: "quarterly",
        amount: 75,
        periodType: "calendar",
        description: ""
      },
      {
        creditId: "resy",
        cadence: "quarterly",
        amount: 100,
        periodType: "calendar",
        description: ""
      },
      {
        creditId: "saks",
        cadence: "biannual",
        amount: 50,
        periodType: "calendar",
        description: "Does not work on Saks Off Fifth"
      },
      {
        creditId: "fhr",
        cadence: "biannual",
        amount: 300,
        periodType: "calendar",
        description: "FHR must be booked through Amex Travel Portal"
      },
      {
        creditId: "uber_one",
        cadence: "annual",
        amount: 120,
        periodType: "calendar",
        description: ""
      },
      {
        creditId: "airline_incidental",
        cadence: "annual",
        amount: 200,
        periodType: "calendar",
        description: "Recommended use is Southwest airfare cancel exploit"
      },
      {
        creditId: "oura",
        cadence: "annual",
        amount: 200,
        periodType: "calendar",
        description: ""
      },
      {
        creditId: "tsa",
        cadence: "annual",
        amount: 209,
        periodType: "calendar",
        description: ""
      },
    ]
  },
  amex_plat_business: {
    id: "amex_plat_business",
    name: "Amex Business Platinum",
    credits: [
      {
        creditId: "airline_incidental",
        cadence: "annual",
        amount: 200,
        periodType: "anniversary",
        description: ""
      },
      {
        creditId: "fhr",
        cadence: "biannual",
        amount: 300,
        periodType: "calendar",
        description: "FHR must be booked through Amex Travel Portal"
      },
      {
        creditId: "dell",
        cadence: "annual",
        amount: 150,
        periodType: "calendar",
        description: ""
      },
      {
        creditId: "hilton_credit",
        cadence: "quarterly",
        amount: 50,
        periodType: "calendar",
        description: ""
      },
    ]
  },
  venture_x: {
    id: "venture_x",
    name: "Capital One Venture X",
    credits: [
      {
        creditId: "travel",
        cadence: "annual",
        amount: 300,
        periodType: "anniversary",
        description: "Bookings must be made through Capital One Travel Portal"
      }
    ]
  },
  citi_strata_elite: {
    id: "citi_strata_elite",
    name: "Citi Strata Elite",
    credits: [
      {
        creditId: "splurge",
        cadence: "annual",
        amount: 200,
        periodType: "calendar",
        description: ""
      },
      {
        creditId: "hotel",
        cadence: "annual",
        amount: 300,
        periodType: "calendar",
        description: ""
      }
    ]
  },
  hilton_aspire: {
    id: "hilton_aspire",
    name: "Amex Hilton Aspire",
    credits: [
      {
        creditId: "flight",
        cadence: "quarterly",
        amount: 50,
        periodType: "calendar",
        description: ""
      },
      {
        creditId: "hilton_resort",
        cadence: "biannual",
        amount: 200,
        periodType: "calendar",
        description: "This credit must be used IN PERSON at the time of the stay or when checking out"
      },
      {
        creditId: "free_night",
        cadence: "annual",
        amount: 0,
        periodType: "calendar",
        description: ""
      }
    ]
  },
  hilton_surpass: {
    id: "hilton_surpass",
    name: "Amex Hilton Surpass",
    credits: [
      {
        creditId: "hilton_credit",
        cadence: "quarterly",
        amount: 50,
        periodType: "calendar",
        description: ""
      },
      {
        creditId: "free_night",
        cadence: "annual",
        amount: 0,
        periodType: "calendar",
        description: "If spend >$1500"
      }
    ]
  },
  world_of_hyatt: {
    id: "world_of_hyatt",
    name: "World of Hyatt",
    credits: [
      {
        creditId: "free_night",
        cadence: "annual",
        amount: 0,
        periodType: "calendar",
        description: ""
      }
    ]
  },
  marriot_boundless: {
    id: "marriot_boundless",
    name: "Marriot Bonvoy Boundless",
    credits: [
      {
        creditId: "free_night",
        cadence: "annual",
        amount: 0,
        periodType: "calendar",
        description: ""
      }
    ]
  },
  ihg_premier: {
    id: "ihg_premier",
    name: "IHG Premier",
    credits: [
      {
        creditId: "free_night",
        cadence: "annual",
        amount: 0,
        periodType: "calendar",
        description: ""
      }
    ]
  },
  bilt_palladium: {
    id: "bilt_palladium",
    name: "Bilt Palladium",
    credits: [
      {
        creditId: "hotel",
        cadence: "biannual",
        amount: 200,
        periodType: "calendar",
        description: ""
      },
    ]
  },
  atmos_ascent: {
    id: "atmos_ascent",
    name: "Atmos Ascent",
    credits: [
      {
        creditId: "companion",
        cadence: "annual",
        amount: 109,
        periodType: "calendar",
        description: ""
      },
    ]
  },
};
