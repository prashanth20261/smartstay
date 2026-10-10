import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function App() {
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [stays, setStays] = useState([])
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState([])
  const [dates, setDates] = useState({}) // { [stayId]: { checkIn, checkOut } }
  const [message, setMessage] = useState('')

  const loadCities = () => {
    fetch(`${API_URL}/api/cities`)
      .then((res) => res.json())
      .then((data) => {
        setCities(data)
        if (data.length > 0) setSelectedCity((prev) => prev || data[0])
      })
  }

  const loadStays = (city) => {
    if (!city) return
    setLoading(true)
    fetch(`${API_URL}/api/stays?city=${encodeURIComponent(city)}`)
      .then((res) => res.json())
      .then((data) => setStays(data))
      .finally(() => setLoading(false))
  }

  const loadBookings = () => {
    fetch(`${API_URL}/api/bookings`)
      .then((res) => res.json())
      .then((data) => setBookings(data))
  }

  useEffect(() => {
    loadCities()
    loadBookings()
  }, [])

  useEffect(() => {
    loadStays(selectedCity)
  }, [selectedCity])

  const handleDateChange = (stayId, field, value) => {
    setDates((prev) => ({
      ...prev,
      [stayId]: { ...prev[stayId], [field]: value },
    }))
  }

  const handleBook = async (stayId) => {
    const d = dates[stayId]
    if (!d?.checkIn || !d?.checkOut) {
      setMessage('Please pick both check-in and check-out dates.')
      return
    }
    const res = await fetch(`${API_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stayId, checkIn: d.checkIn, checkOut: d.checkOut }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(`Booking failed: ${data.error}`)
    } else {
      setMessage(`Booked! You paid ₹${data.pricePaid}.`)
      loadBookings()
      loadStays(selectedCity)
    }
  }

  const handleCancel = async (bookingId) => {
    await fetch(`${API_URL}/api/bookings/${bookingId}`, { method: 'DELETE' })
    loadBookings()
    loadStays(selectedCity)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <h1>SmartStay</h1>

      <label>
        City:{' '}
        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </label>

      {message && (
        <p style={{ background: '#eef', padding: '0.5rem 1rem', borderRadius: 6, marginTop: '1rem' }}>
          {message}
        </p>
      )}

      {loading && <p>Loading...</p>}

      <h2 style={{ marginTop: '2rem' }}>Search Results</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {stays.map((stay) => (
          <div key={stay.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: '1rem' }}>
            <h3 style={{ margin: 0 }}>{stay.name}</h3>
            <p style={{ margin: '0.25rem 0' }}>
              ₹{stay.price} / night · ⭐ {stay.rating} · {stay.distance} km from center
            </p>
            <p style={{ margin: 0, color: '#555' }}>
              {stay.rooms} rooms total · match score: {stay.score}
            </p>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="date"
                onChange={(e) => handleDateChange(stay.id, 'checkIn', e.target.value)}
              />
              <input
                type="date"
                onChange={(e) => handleDateChange(stay.id, 'checkOut', e.target.value)}
              />
              <button onClick={() => handleBook(stay.id)}>Book</button>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: '2rem' }}>My Bookings</h2>
      {bookings.length === 0 && <p>No bookings yet.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {bookings.map((b) => (
          <div key={b.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <strong>{b.stay.name}</strong> · {b.checkIn.slice(0, 10)} → {b.checkOut.slice(0, 10)} · ₹{b.pricePaid}
            </span>
            <button onClick={() => handleCancel(b.id)}>Cancel</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
