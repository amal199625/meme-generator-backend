const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// ✅ Middleware CORS global
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// 📁 Dossier d’upload
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ⚙️ Multer (pour upload d’images)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ✅ Route test
app.get('/', (req, res) => res.send('🚀 Backend Node.js Render fonctionne !'));

// ✅ Upload d’image
app.post('/upload', upload.single('meme'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier téléchargé' });
  const fileUrl = `${req.protocol}://${req.get('host')}/file/${req.file.filename}`;
  res.status(200).json({ message: 'Upload réussi', url: fileUrl });
});

// ✅ Liste des images
app.get('/memes', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    const urls = files
      .filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f))
      .map(f => `${req.protocol}://${req.get('host')}/file/${f}`);
    res.json(urls);
  });
});

// ✅ Route spéciale pour Canvas (avec tous les headers CORS corrects)
app.get('/file/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('Fichier introuvable');

  // 🔥 Headers CORS + cross-origin pour canvas
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Content-Type': 'image/png'
  });

  fs.createReadStream(filePath).pipe(res);
});

// ✅ (Optionnel) suppression d’un mème
app.delete('/delete/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return res.json({ message: 'Fichier supprimé avec succès' });
  }
  res.status(404).json({ message: 'Fichier introuvable' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur en ligne sur le port ${PORT}`));
