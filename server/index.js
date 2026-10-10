require("dotenv/config");
const express = require("express");
const cors = require("cors");
const prisma = require("./db");
const { rankStays } = require("./ranking");
const { datesOverlap, calculatePrice } = require("./booking");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/stays", async (req, res) => {
  try {
    const { city } = req.query;
    const stays = await prisma.stay.findMany({
      where: city ? { city: { equals: city, mode: "insensitive" } } : undefined,
    });
    res.json(rankStays(stays));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stays" });
  }
});

app.get("/api/cities", async (req, res) => {
  try {
    const stays = await prisma.stay.findMany({ select: { city: true } });
    const cities = [...new Set(stays.map((s) => s.city))].sort();
    res.json(cities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { stay: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const { stayId, checkIn, checkOut } = req.body;

    if (!stayId || !checkIn || !checkOut) {
      return res.status(400).json({ error: "stayId, checkIn, and checkOut are required" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ error: "checkOut must be after checkIn" });
    }

    const stay = await prisma.stay.findUnique({ where: { id: stayId } });
    if (!stay) {
      return res.status(404).json({ error: "Stay not found" });
    }

    const existingBookings = await prisma.booking.findMany({ where: { stayId } });
    const overlapping = existingBookings.filter((b) =>
      datesOverlap(checkInDate, checkOutDate, b.checkIn, b.checkOut)
    );

    if (overlapping.length >= stay.rooms) {
      return res.status(409).json({
        error: `Fully booked for these dates (${overlapping.length}/${stay.rooms} rooms already taken)`,
      });
    }

    const pricePaid = calculatePrice(stay.price, overlapping.length, stay.rooms);

    const booking = await prisma.booking.create({
      data: { stayId, checkIn: checkInDate, checkOut: checkOutDate, pricePaid },
      include: { stay: true },
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.booking.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
