const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Your Neon connection string
  ssl: { rejectUnauthorized: false }
});

function rowToRegistration(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    adults: row.adults,
    kids516: row.kids516,
    kidsU5: row.kidsu5,
    attendees: row.attendees,
    totalPeople: row.total_people,
    totalAmount: parseFloat(row.total_amount),
    registeredAt: row.registered_at,
    checkedIn: row.checked_in,
    checkedInAt: row.checked_in_at
  };
}

app.get('/api/registrations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM registrations ORDER BY registered_at DESC');
    res.json(result.rows.map(rowToRegistration));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/registrations', async (req, res) => {
  const r = req.body;
  try {
    await pool.query(
      `INSERT INTO registrations (id, name, email, phone, adults, kids516, kidsu5, attendees, total_people, total_amount, registered_at, checked_in, checked_in_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [r.id, r.name, r.email, r.phone, r.adults, r.kids516, r.kidsU5, JSON.stringify(r.attendees), r.totalPeople, r.totalAmount, r.registeredAt, r.checkedIn, r.checkedInAt]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Insert failed' });
  }
});

app.patch('/api/registrations/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    await pool.query(
      `UPDATE registrations SET checked_in = $1, checked_in_at = $2 WHERE id = $3`,
      [updates.checkedIn, updates.checkedInAt, id]
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Update failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
