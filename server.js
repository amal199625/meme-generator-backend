// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Crée le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Route test
app.get('/', (req, res) => res.send('🚀 Serveur backend Node.js fonctionne !'));

// Upload meme
app.post('/upload', upload.single('meme'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier téléchargé' });

  const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  res.status(200).json({ message: 'Fichier téléchargé avec succès', url: fileUrl });
});

// GET tous les memes
app.get('/memes', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });

    const memeUrls = files
      .filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f))
      .map(file => `http://localhost:3000/uploads/${file}`);
    res.json(memeUrls);
  });
});

// Servir les fichiers statiques
app.use('/uploads', express.static(uploadDir));

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Serveur démarré sur http://localhost:${PORT}`));
   