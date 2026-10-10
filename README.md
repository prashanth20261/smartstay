# SmartStay — Conflict-Aware Booking Engine

A hotel search and booking prototype that ranks stays by a weighted match score (price, rating, distance), prevents double-bookings using date-overlap conflict detection, and adjusts price dynamically based on live occupancy.

## Problem

Most simple booking demos just list hotels and let you "book" with no real logic behind it. SmartStay goes further: it simulates how a real booking platform has to handle **limited room inventory**, **overlapping date ranges**, and **demand-based pricing** — the actual hard parts of building a booking system, not just a CRUD list.

## Live Demo

- **App**: https://smartstay-one.vercel.app
- **API**: https://smartstay-ejv7.onrender.com
- **Demo video**: _(add YouTube link here after recording)_

> Note: the backend is hosted on Render's free tier, which spins down after inactivity. The first request after a period of inactivity may take 30–50 seconds to respond — this is expected, not a bug.

## Features

- **Smart search & ranking** — stays are scored using a weighted formula (50% rating, 30% price fit, 20% distance fit) and sorted by best match, not just one column.
- **Date-overlap conflict detection** — booking a stay checks existing bookings for that stay and rejects the request if all rooms are already taken for the overlapping date range.
- **Dynamic pricing** — price rises as more rooms are booked for a given period, and drops back down when a booking is cancelled.
- **My Bookings** — view and cancel bookings, which immediately frees up availability and recalculates pricing.

## Tech Stack

- **Frontend**: React (Vite) — deployed on Vercel
- **Backend**: Node.js + Express — deployed on Render
- **Database**: PostgreSQL (Neon, serverless)
- **ORM**: Prisma

## Architecture

```
React (client)  --->  Express API (server)  --->  PostgreSQL (Neon)
 Vercel                   Render                      Neon
```

- `client/` — React frontend. Fetches cities and ranked stays, submits bookings, shows My Bookings.
- `server/` — Express backend with three logic modules:
  - `ranking.js` — computes the weighted match score for search results.
  - `booking.js` — date-overlap check and dynamic price calculation.
  - `index.js` — API routes tying it together, backed by Prisma/PostgreSQL.
- `server/prisma/schema.prisma` — defines the `Stay` and `Booking` tables and their relation.

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/cities` | List of cities with available stays |
| GET | `/api/stays?city=` | Ranked stays for a city |
| GET | `/api/bookings` | List all bookings |
| POST | `/api/bookings` | Create a booking (`{ stayId, checkIn, checkOut }`) — rejects with 409 if fully booked for those dates |
| DELETE | `/api/bookings/:id` | Cancel a booking |

## Setup Instructions

### Backend
```
cd server
npm install
# create a .env file with:
# DATABASE_URL="your-postgres-connection-string"
# PORT=4000
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
node index.js
```

### Frontend
```
cd client
npm install
npm run dev
```

By default the frontend calls `http://localhost:4000`. To point it at a deployed backend, set an environment variable `VITE_API_URL` to the backend's URL.

## Challenges Faced

- **Date-overlap logic**: two bookings for the same stay only conflict if their date ranges actually overlap — a booking ending on the day another starts does *not* conflict (checkout-day-is-free, like real hotels). This required careful half-open interval comparison (`start1 < end2 && start2 < end1`) rather than a naive date equality check.
- **Dynamic pricing consistency**: price had to be calculated based on occupancy *at the time of booking* (not a stale value), and correctly reverse when a booking is cancelled.
- **Windows path-length limit**: hit a Windows 260-character path limit while generating the Prisma engine binary during local development, which required moving the project to a shallower folder path to resolve.

## Future Scope

- Real user accounts instead of a single shared booking list
- Admin view to add/edit stays instead of manual seed data
- Map-based distance calculation instead of a static distance field
- Payment integration (currently bookings are free/simulated)
