export const cards = {
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
        creditId: "resy",
        cadence: "quarterly",
        amount: 100,
        periodType: "calendar"
      },
      {
        creditId: "airline_incidental",
        cadence: "annual",
        amount: 200,
        periodType: "calendar"
      }
    ]
  },
  venture_x: {
    id: "venture_x",
    name: "Venture X",
    credits: [
      {
        creditId: "travel",
        cadence: "annual",
        amount: 300,
        periodType: "anniversary"
      }
    ]
  }
};
