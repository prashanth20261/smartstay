const prisma = require("../db");

const stays = [
  { name: "Ocean Breeze Resort", city: "Goa", price: 4500, rating: 4.5, distance: 2.1, rooms: 5 },
  { name: "Palm Grove Villas", city: "Goa", price: 6200, rating: 4.8, distance: 3.4, rooms: 3 },
  { name: "Budget Beach Stay", city: "Goa", price: 1800, rating: 3.6, distance: 6.0, rooms: 8 },
  { name: "Sea Pearl Inn", city: "Goa", price: 2900, rating: 4.1, distance: 1.2, rooms: 4 },
  { name: "Himalayan Retreat", city: "Manali", price: 3200, rating: 4.6, distance: 4.5, rooms: 6 },
  { name: "Snow Peak Lodge", city: "Manali", price: 5000, rating: 4.7, distance: 2.0, rooms: 4 },
  { name: "Valley View Cottage", city: "Manali", price: 2100, rating: 3.9, distance: 7.2, rooms: 5 },
  { name: "Royal Heritage Hotel", city: "Jaipur", price: 3800, rating: 4.4, distance: 1.8, rooms: 7 },
  { name: "Pink City Palace", city: "Jaipur", price: 7200, rating: 4.9, distance: 0.9, rooms: 2 },
  { name: "Desert Rose Inn", city: "Jaipur", price: 1500, rating: 3.4, distance: 8.3, rooms: 10 },
  { name: "Lakeview Serenity", city: "Udaipur", price: 4100, rating: 4.5, distance: 1.5, rooms: 5 },
  { name: "Udai Grand Suites", city: "Udaipur", price: 6800, rating: 4.8, distance: 2.3, rooms: 3 },
  { name: "City Lights Hostel", city: "Mumbai", price: 1200, rating: 3.8, distance: 5.5, rooms: 12 },
  { name: "Marine Drive Suites", city: "Mumbai", price: 8500, rating: 4.9, distance: 0.5, rooms: 2 },
  { name: "Bandra Comfort Stay", city: "Mumbai", price: 3300, rating: 4.0, distance: 3.1, rooms: 6 },
];

async function main() {
  await prisma.booking.deleteMany();
  await prisma.stay.deleteMany();
  await prisma.stay.createMany({ data: stays });
  console.log(`Seeded ${stays.length} stays.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
