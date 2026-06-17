const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');
const skladRoutes = require('./routes/sklad');
const objednavkyRoutes = require('./routes/objednavky');
const authRoutes = require('./routes/auth');
const platbyRoutes = require('./routes/platby');

const app = express();
app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.json({ zprava: 'DÄ›tskĂ© krĹŻÄŤky API funguje!' });
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 as ok');
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, chyba: err.message });
  }
});

app.use('/api/sklad', skladRoutes);
app.use('/api/objednavky', objednavkyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/platby', platbyRoutes);
app.use('/api/kategorie', skladRoutes);
app.use('/api/produkty', skladRoutes);
app.listen> {
  console.log('Server bezi na http://127.0.0.1:3000');
});

