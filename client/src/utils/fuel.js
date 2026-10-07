/**
 * Calculates fuel economy (km per litre) using the full-tank method:
 * distance between two full fills divided by all litres added since the previous full fill.
 * Returns records in ascending mileage order with an `economy` field (null when unknown).
 */
export function withEconomy(records = []) {
  const sorted = [...records].sort((a, b) => Number(a.mileage) - Number(b.mileage));
  let lastFull = null;
  let litresSince = 0;
  return sorted.map((record) => {
    litresSince += Number(record.litres) || 0;
    let economy = null;
    if (record.fullTank) {
      if (lastFull) {
        const distance = Number(record.mileage) - Number(lastFull.mileage);
        if (distance > 0 && litresSince > 0) economy = distance / litresSince;
      }
      lastFull = record;
      litresSince = 0;
    }
    return { ...record, economy };
  });
}

export function fuelStats(records = []) {
  const withEco = withEconomy(records);
  const economies = withEco.filter((r) => r.economy);
  const latest = economies[economies.length - 1]?.economy ?? null;
  const average = economies.length ?
  economies.reduce((s, r) => s + r.economy, 0) / economies.length :
  null;
  const totalLitres = records.reduce((s, r) => s + (Number(r.litres) || 0), 0);
  const totalCost = records.reduce((s, r) => s + (Number(r.total) || 0), 0);
  const sortedByMileage = [...records].sort((a, b) => a.mileage - b.mileage);
  const distance =
  sortedByMileage.length > 1 ?
  sortedByMileage[sortedByMileage.length - 1].mileage - sortedByMileage[0].mileage :
  0;
  // Exclude the first fill's cost, since it fuelled driving before the tracked period.
  const costForDistance = totalCost - (Number(sortedByMileage[0]?.total) || 0);
  const costPerKm = distance > 0 ? costForDistance / distance : null;
  return { withEco, latest, average, totalLitres, totalCost, distance, costPerKm };
}