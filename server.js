// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// 📁 Dossier des uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ⚙️ Configuration de multer (upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// 🚀 Route d’upload d’image
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier trouvé' });

  const fileUrl = `https://meme-generator-backend-un0c.onrender.com/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// 🌍 Servir les fichiers statiques (accès direct possible)
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res) => {
    // Ajoute toujours ces headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  },
}));

// ✅ Route proxy spéciale anti-CORS pour les images (canvas safe)
app.get('/file/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Fichier introuvable');
  }

  // 🔒 Forcer les bons headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  res.sendFile(filePath);
});

// 🏠 Route test
app.get('/', (req, res) => {
  res.send('✅ Meme Generator backend fonctionne !');
});

// 🚀 Lancement serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
