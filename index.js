const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');
const skladRoutes = require('./routes/sklad');
const objednavkyRoutes = require('./routes/objednavky');
const authRoutes = require('./routes/auth');
const platbyRoutes = require('./routes/platby');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
  'https://ipzkriwfcghlqfaqenaj.supabase.co',
  'sb_publishable_OtUgL2vcvU17-s4FsdbrqQ_QWD98Xz8'
);
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
let textyWebu = {
  procBarefoot: [
    { ikona: '👣', nadpis: 'Přirozený vývoj', text: 'Tenká podrážka umožňuje nožičkám vnímat terén a posilovat svaly tak, jak to příroda zamýšlela. Žádné zbytečné tuhé vložky.' },
    { ikona: '🌿', nadpis: 'Přírodní materiály', text: 'Používáme pouze certifikovanou kůži, bavlnu a přírodní gumy. Žádná škodlivá barviva, žádné plasty v kontaktu s pokožkou.' },
    { ikona: '💨', nadpis: 'Dýchatelnost', text: 'Nožičky se v naší obuvi nepotí. Vzdušné materiály zajistí pohodu celý den – při hře venku i v mateřské škole.' }
  ],
  vyberteSi: [
    { nadpis: 'Papučky', text: 'Lehké a vzdušné papučky pro první krůčky. Ideální do školky. Máme značky Beda,' },
    { nadpis: 'Celoroční boty', text: 'Odolné a pohodlné boty pro aktivní dětský dobrodružný den venku i ve městě. Máme značky Froddo, Protetika,' },
    { nadpis: 'Zimní botičky', text: '' },
    { nadpis: 'Gumáky', text: '' }
  ]
};
app.post('/api/upload-obrazek', upload.single('obrazek'), async (req, res) => {
  try {
    const file = req.file;
    const nazev = `produkt_${Date.now()}_${file.originalname}`;
    const { data, error } = await supabase.storage
      .from('produkty')
      .upload(nazev, file.buffer, { contentType: file.mimetype, upsert: true });
    if (error) return res.status(500).json({ chyba: error.message });
    const url = `https://ipzkriwfcghlqfaqenaj.supabase.co/storage/v1/object/public/produkty/${nazev}`;
    res.json({ url });
  } catch(e) {
    res.status(500).json({ chyba: e.message });
  }
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