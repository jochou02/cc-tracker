export const CARD_DEFINITIONS = {
  amex_gold: {
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
  },
  amex_plat: {
    id: "amex_plat",
    name: "Amex Platinum",
    credits: [
      {
        creditId: "uber",
        cadence: "monthly",
        amount: 15,
        periodType: "calendar"
      },
      {
        creditId: "lulu",
        cadence: "quarterly",
        amount: 75,
        periodType: "calendar"
      },
      {
        creditId: "resy",
        cadence: "quarterly",
        amount: 100,
        periodType: "calendar"
      },
      {
        creditId: "fhr",
        cadence: "biannual",
        amount: 300,
        periodType: "calendar"
      },
      {
        creditId: "saks",
        cadence: "biannual",
        amount: 50,
        periodType: "calendar"
      },
      {
        creditId: "airline_incidental",
        cadence: "annual",
        amount: 200,
        periodType: "calendar"
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
        periodType: "anniversary"
      }
    ]
  },  
  citi_strata_elite: {
    id: "citi_strata_elite",
    name: "Citi Strata Elite",
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
  },
  hilton_aspire: {
    id: "hilton_aspire",
    name: "Amex Hilton Aspire",
    credits: [
      {
        creditId: "flight",
        cadence: "quarterly",
        amount: 50,
        periodType: "calendar"
      },
      {
        creditId: "hilton_resort",
        cadence: "biannual",
        amount: 200,
        periodType: "calendar"
      },
      {
        creditId: "free_night",
        cadence: "annual",
        amount: 0,
        periodType: "calendar"
      }
    ]
  },  
};
