import { CARD_DEFINITIONS, Cadence, PeriodType } from "../data/definitions.js";
import {
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
    creditConfig.periodType === PeriodType.ANNIVERSARY
      ? parseAnniversaryDate(userCard.anniversaryDate, year)
      : null;

  const periods = generatePeriodsForYear(
    anchorDate,
    creditConfig,
    year
  );

  // userCard.id is the CARD_DEFINITIONS map key and the canonical cardId used
  // in credit instance IDs and DynamoDB keys.
  return periods.map(period =>
    createCreditInstance(userCard.id, cardDef, creditConfig, period)
  );
}

function generatePeriodsForYear(anchorDate, creditConfig, year) {
  switch (creditConfig.cadence) {
    case Cadence.MONTHLY:
      return generateRollingPeriods(anchorDate, year, 1);
    case Cadence.QUARTERLY:
      return generateRollingPeriods(anchorDate, year, 3);
    case Cadence.BIANNUAL:
      return generateRollingPeriods(anchorDate, year, 6);
    case Cadence.ANNUAL:
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

/**
 * Parse an anniversaryDate string ("MM-DD") into a Date anchored to the
 * given year. The year is used only as the starting reference point —
 * the actual period generation logic in generateAnnualPeriods walks
 * backward/forward from this anchor to cover the requested year.
 */
function parseAnniversaryDate(mmdd, year) {
  const [month, day] = mmdd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
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
