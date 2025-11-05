const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// ✅ Configuration CORS complète
app.use(cors({
  origin: [
    'http://localhost:4200', // ton app Angular en local
    'https://meme-generator-frontend.vercel.app' // ton app déployée sur Vercel
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json());

// ✅ Crée le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ Configuration Multer (pour les uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ✅ Route test
app.get('/', (req, res) => res.send('🚀 Serveur backend Node.js fonctionne avec CORS activé !'));

// ✅ Upload meme
app.post('/upload', upload.single('meme'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier téléchargé' });

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(200).json({ message: 'Fichier téléchargé avec succès', url: fileUrl });
});

// ✅ Récupération de tous les memes
app.get('/memes', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });

    const memeUrls = files
      .filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f))
      .map(file => `${req.protocol}://${req.get('host')}/uploads/${file}`);

    res.json(memeUrls);
  });
});

// ✅ Servir les fichiers statiques (images)
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // autorise l’accès aux images
  }
}));

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur démarré sur le port ${PORT}`));
