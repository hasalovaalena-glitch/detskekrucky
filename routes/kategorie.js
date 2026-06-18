const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM kategorie ORDER BY poradi');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ chyba: err.message });
  }
});

router.post('/', async (req, res) => {
  const { nazev, slug, poradi } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO kategorie (nazev, slug, poradi) VALUES ($1,$2,$3) RETURNING *',
      [nazev, slug, poradi||0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ chyba: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM kategorie WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ chyba: err.message });
  }
});

module.exports = router;
