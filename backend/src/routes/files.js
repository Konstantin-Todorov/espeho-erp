const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadDir, req.params.orderId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.dwg', '.dxf', '.xlsx', '.docx'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Неразрешен файлов тип'));
  },
});

// POST /api/files/:orderId
router.post('/:orderId', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файлът е задължителен' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO order_files (order_id, filename, original_name, filepath, mime_type, file_size, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.orderId, req.file.filename, req.file.originalname,
       req.file.path, req.file.mimetype, req.file.size, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Грешка при качване' });
  }
});

// GET /api/files/:orderId
router.get('/:orderId', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT f.*, u.name AS uploaded_by_name FROM order_files f
     JOIN users u ON u.id=f.uploaded_by WHERE f.order_id=$1 ORDER BY f.created_at DESC`,
    [req.params.orderId]
  );
  res.json(rows);
});

// GET /api/files/download/:fileId
router.get('/download/:fileId', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM order_files WHERE id=$1', [req.params.fileId]);
  if (!rows[0]) return res.status(404).json({ error: 'Файлът не е намерен' });
  res.download(rows[0].filepath, rows[0].original_name);
});

// DELETE /api/files/:fileId
router.delete('/:fileId', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM order_files WHERE id=$1', [req.params.fileId]);
  if (!rows[0]) return res.status(404).json({ error: 'Файлът не е намерен' });
  // Only uploader or admin can delete
  if (req.user.role !== 'admin' && rows[0].uploaded_by !== req.user.id) {
    return res.status(403).json({ error: 'Нямате права' });
  }
  try {
    fs.unlinkSync(rows[0].filepath);
  } catch { /* file already gone */ }
  await pool.query('DELETE FROM order_files WHERE id=$1', [req.params.fileId]);
  res.json({ message: 'Изтрит' });
});

module.exports = router;
