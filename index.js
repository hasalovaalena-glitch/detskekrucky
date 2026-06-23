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
const kategorieRoutes = require('./routes/kategorie');

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

app.use('/api/produkty', skladRoutes);
app.use('/api/kategorie', kategorieRoutes);

// Otevírací doba
let oteviracka = {};
app.get('/api/nastaveni/oteviraci-doba', (req, res) => {
  res.json(oteviracka);
});
app.post('/api/nastaveni/oteviraci-doba', (req, res) => {
  oteviracka = req.body;
  res.json({ ok: true });
});
app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log('Server bezi na http://127.0.0.1:3000');
});
// Banner
let banner = {};
app.get('/api/nastaveni/banner', (req, res) => {
  res.json(banner);
});
app.post('/api/nastaveni/banner', (req, res) => {
  banner = req.body;
  res.json({ ok: true });
});