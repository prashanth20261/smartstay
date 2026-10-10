// Two date ranges [start1, end1) and [start2, end2) overlap if one starts before the other ends.
function datesOverlap(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

// Price rises as more rooms for the stay are already booked for the overlapping period.
function calculatePrice(basePrice, bookedRooms, totalRooms) {
  const surge = 1 + 0.1 * (bookedRooms / totalRooms);
  return Math.round(basePrice * surge * 100) / 100;
}

module.exports = { datesOverlap, calculatePrice };
