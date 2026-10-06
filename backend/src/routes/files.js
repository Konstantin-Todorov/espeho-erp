const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// In production UPLOAD_DIR points at a Railway volume so files survive deploys.
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Files are always looked up by order + stored filename inside uploadDir, never by a stored absolute
// path, so moving the storage location (e.g. to a volume) keeps working and nothing can escape the folder.
const fileOnDisk = f => path.join(uploadDir, f.order_id, path.basename(f.filename));

// Validate the order before multer touches the disk (prevents path traversal and orphan files).
async function requireOrder(req, res, next) {
  if (!UUID_RE.test(req.params.orderId)) return res.status(400).json({ error: 'Невалидна поръчка' });
  const { rows } = await pool.query('SELECT id FROM orders WHERE id=$1', [req.params.orderId]);
  if (!rows[0]) return res.status(404).json({ error: 'Поръчката не е намерена' });
  next();
}

const ALLOWED = {
  '.pdf':  ['application/pdf'],
  '.jpg':  ['image/jpeg'], '.jpeg': ['image/jpeg'], '.png': ['image/png'],
  '.dwg':  null, '.dxf': null, // CAD files arrive with inconsistent MIME types
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream'],
};

// Staff uploads are capped at 20 MB; large drawings/scans are loaded by an admin (scripts/attach_files.js).
const STAFF_LIMIT = 20 * 1024 * 1024, ADMIN_LIMIT = 200 * 1024 * 1024;
const makeUpload = limit => multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(uploadDir, req.params.orderId);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
      cb(null, unique + path.extname(file.originalname).toLowerCase());
    },
  }),
  limits: { fileSize: limit },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimes = ALLOWED[ext];
    if (ext in ALLOWED && (mimes === null || mimes.includes(file.mimetype))) cb(null, true);
    else cb(new Error('Неразрешен файлов тип (PDF, JPG, PNG, DWG, DXF, XLSX, DOCX)'));
  },
});
const staffUpload = makeUpload(STAFF_LIMIT).single('file');
const adminUpload = makeUpload(ADMIN_LIMIT).single('file');
const upload = (req, res, next) => (req.user.role === 'admin' ? adminUpload : staffUpload)(req, res, next);

// POST /api/files/:orderId
router.post('/:orderId', requireOrder, upload, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файлът е задължителен' });
  // multer decodes the original name as latin1 — restore UTF-8 so Cyrillic names display correctly
  const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
  try {
    const { rows } = await pool.query(
      `INSERT INTO order_files (order_id, filename, original_name, filepath, mime_type, file_size, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.orderId, req.file.filename, originalName,
       req.file.path, req.file.mimetype, req.file.size, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    fs.rm(req.file.path, () => {});
    throw err;
  }
});

// GET /api/files/download/:fileId — authenticated download (the frontend fetches it as a blob)
router.get('/download/:fileId', async (req, res) => {
  if (!UUID_RE.test(req.params.fileId)) return res.status(400).json({ error: 'Невалиден файл' });
  const { rows } = await pool.query('SELECT * FROM order_files WHERE id=$1', [req.params.fileId]);
  if (!rows[0]) return res.status(404).json({ error: 'Файлът не е намерен' });
  const filePath = fileOnDisk(rows[0]);
  if (!fs.existsSync(filePath)) {
    return res.status(410).json({ error: 'Файлът липсва на сървъра (качен преди въвеждането на постоянното хранилище). Моля, качете го отново.' });
  }
  res.download(filePath, rows[0].original_name);
});

// GET /api/files/:orderId
router.get('/:orderId', async (req, res) => {
  if (!UUID_RE.test(req.params.orderId)) return res.status(400).json({ error: 'Невалидна поръчка' });
  const { rows } = await pool.query(
    `SELECT f.id, f.order_id, f.filename, f.original_name, f.mime_type, f.file_size, f.uploaded_by, f.created_at,
            u.name AS uploaded_by_name
     FROM order_files f JOIN users u ON u.id=f.uploaded_by
     WHERE f.order_id=$1 ORDER BY f.created_at DESC`,
    [req.params.orderId]
  );
  res.json(rows.map(({ filename, ...f }) => ({ ...f, available: fs.existsSync(fileOnDisk({ ...f, filename })) })));
});

// DELETE /api/files/:fileId
router.delete('/:fileId', async (req, res) => {
  if (!UUID_RE.test(req.params.fileId)) return res.status(400).json({ error: 'Невалиден файл' });
  const { rows } = await pool.query('SELECT * FROM order_files WHERE id=$1', [req.params.fileId]);
  if (!rows[0]) return res.status(404).json({ error: 'Файлът не е намерен' });
  // Only uploader, office or admin can delete
  if (!['admin', 'office'].includes(req.user.role) && rows[0].uploaded_by !== req.user.id) {
    return res.status(403).json({ error: 'Нямате права' });
  }
  fs.rm(fileOnDisk(rows[0]), () => {});
  await pool.query('DELETE FROM order_files WHERE id=$1', [req.params.fileId]);
  res.json({ message: 'Изтрит' });
});

module.exports = router;
