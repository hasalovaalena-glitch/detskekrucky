const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.nazev, p.znacka, p.emoji, p.kategorie, p.cena,
             s.velikost, s.pocet_kusu, s.min_pocet,
             CASE WHEN s.pocet_kusu <= s.min_pocet THEN true ELSE false END as nizky_stav
      FROM produkty p
      JOIN sklad s ON p.id = s.produkt_id
      ORDER BY p.nazev, s.velikost
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ chyba: err.message });
  }
});

router.post('/naskladnit', async (req, res) => {
  const { produkt_id, velikost, pocet, poznamka } = req.body;
  try {
    await pool.query(`
      INSERT INTO sklad (produkt_id, velikost, pocet_kusu)
      VALUES ($1, $2, $3)
      ON CONFLICT (produkt_id, velikost)
      DO UPDATE SET pocet_kusu = sklad.pocet_kusu + $3
    `, [produkt_id, velikost, pocet]);
    await pool.query(`
      INSERT INTO pohyby_skladu (produkt_id, velikost, typ, pocet, poznamka)
      VALUES ($1, $2, 'naskladneni', $3, $4)
    `, [produkt_id, velikost, pocet, poznamka]);
    res.json({ zprava: 'Naskladneno uspesne' });
  } catch (err) {
    res.status(500).json({ chyba: err.message });
  }
});

router.post('/odecist', async (req, res) => {
  const { produkt_id, velikost, pocet, poznamka } = req.body;
  try {
    const check = await pool.query(`
      SELECT pocet_kusu FROM sklad
      WHERE produkt_id = $1 AND velikost = $2
    `, [produkt_id, velikost]);
    if (check.rows.length === 0 || check.rows[0].pocet_kusu < pocet) {
      return res.status(400).json({ chyba: 'Nedostatek zbozi na sklade' });
    }
    await pool.query(`
      UPDATE sklad SET pocet_kusu = pocet_kusu - $3
      WHERE produkt_id = $1 AND velikost = $2
    `, [produkt_id, velikost, pocet]);
    await pool.query(`
      INSERT INTO pohyby_skladu (produkt_id, velikost, typ, pocet, poznamka)
      VALUES ($1, $2, 'prodej', $3, $4)
    `, [produkt_id, velikost, pocet, poznamka]);
    res.json({ zprava: 'Odecteno uspesne' });
  } catch (err) {
    res.status(500).json({ chyba: err.message });
  }
});

router.get('/historie', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ph.*, p.nazev, p.znacka
      FROM pohyby_skladu ph
      JOIN produkty p ON ph.produkt_id = p.id
      ORDER BY ph.vytvoreno DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ chyba: err.message });
  }
});

router.get('/nizky-stav', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.nazev, p.znacka, s.velikost, s.pocet_kusu, s.min_pocet
      FROM sklad s
      JOIN produkty p ON s.produkt_id = p.id
      WHERE s.pocet_kusu <= s.min_pocet
      ORDER BY s.pocet_kusu ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ chyba: err.message });
  }
});

module.exports = router;
