import { CARD_DEFINITIONS } from "../data/cards.js";
import {
  parseISODate,
  toISODate,
  addMonths,
  addYears,
  addDays,
  startOfYear,
  endOfYear,
  intersectsYear
} from "./dates.js";

export function expandCreditsForUserAndYear(userConfig, year) {
  const instances = [];

  for (const userCard of userConfig.cards) {
    const cardDef = getCardDefinition(userCard.id);

    for (const creditConfig of cardDef.credits) {
      const creditInstances = expandCreditForCardAndYear(
        userCard,
        cardDef,
        creditConfig,
        year
      );
      instances.push(...creditInstances);
    }
  }

  return instances;
}

function getCardDefinition(cardId) {
  const card = CARD_DEFINITIONS[cardId];
  if (!card) {
    throw new Error(`Unknown card definition: ${cardId}`);
  }
  return card;
}

function expandCreditForCardAndYear(userCard, cardDef, creditConfig, year) {
  const anchorDate =
    creditConfig.periodType === "anniversary"
      ? parseISODate(userCard.openedDate)
      : null;

  const periods = generatePeriodsForYear(
    anchorDate,
    creditConfig,
    year
  );

  // userCard.id is the CARD_DEFINITIONS map key (e.g. "amex_plat").
  // cardDef.id may differ (e.g. "amex_personal_plat") and must NOT be used
  // as cardId, since all lookups go through CARD_DEFINITIONS[cardId].
  return periods.map(period =>
    createCreditInstance(userCard.id, cardDef, creditConfig, period)
  );
}

function generatePeriodsForYear(anchorDate, creditConfig, year) {
  switch (creditConfig.cadence) {
    case "monthly":
      return generateRollingPeriods(anchorDate, year, 1);
    case "quarterly":
      return generateRollingPeriods(anchorDate, year, 3);
    case "biannual":
      return generateRollingPeriods(anchorDate, year, 6);
    case "annual":
      return generateAnnualPeriods(anchorDate, year);
    default:
      throw new Error(`Unsupported cadence: ${creditConfig.cadence}`);
  }
}

function generateRollingPeriods(anchorDate, year, monthStep) {
  const periods = [];

  let cursor;

  if (anchorDate) {
    // Start far enough back to catch overlaps
    cursor = anchorDate;
    while (cursor > startOfYear(year)) {
      cursor = addMonths(cursor, -monthStep);
    }
  } else {
    cursor = startOfYear(year);
  }

  const endBoundary = endOfYear(year);

  while (cursor <= endBoundary) {
    const startDate = cursor;
    const endDate = addDays(addMonths(cursor, monthStep), -1);

    if (intersectsYear(startDate, endDate, year)) {
      periods.push({ startDate, endDate });
    }

    cursor = addMonths(cursor, monthStep);
  }

  return periods;
}

function generateAnnualPeriods(anchorDate, year) {
  if (!anchorDate) {
    return [{
      startDate: startOfYear(year),
      endDate: endOfYear(year)
    }];
  }

  const periods = [];
  let cursor = anchorDate;

  while (cursor > startOfYear(year)) {
    cursor = addYears(cursor, -1);
  }

  const endBoundary = endOfYear(year);

  while (cursor <= endBoundary) {
    const startDate = cursor;
    const endDate = addDays(addYears(cursor, 1), -1);

    if (intersectsYear(startDate, endDate, year)) {
      periods.push({ startDate, endDate });
    }

    cursor = addYears(cursor, 1);
  }

  return periods;
}

function createCreditInstance(cardKey, cardDef, creditConfig, period) {
  const startISO = toISODate(period.startDate);
  const endISO = toISODate(period.endDate);

  return {
    id: `${cardKey}_${creditConfig.creditId}_${startISO}_${endISO}`,
    cardId: cardKey,
    creditId: creditConfig.creditId,
    amount: creditConfig.amount,
    description: creditConfig.description ?? "",
    periodType: creditConfig.periodType,
    startDate: period.startDate,
    endDate: period.endDate
  };
}
