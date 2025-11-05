const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// ✅ CORS complet — autorise toutes les origines et types de requêtes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// ✅ Forcer HTTPS (important sur Render pour éviter la redirection 301)
app.enable('trust proxy');
app.use((req, res, next) => {
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
});

// ✅ Crée le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ✅ Route test
app.get('/', (req, res) => res.send('🚀 Serveur backend Node.js fonctionne !'));

// ✅ Upload meme
app.post('/upload', upload.single('meme'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Aucun fichier téléchargé' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(200).json({ message: 'Fichier téléchargé avec succès', url: fileUrl });
});

// ✅ GET tous les memes
app.get('/memes', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    const memeUrls = files
      .filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f))
      .map(file => `${req.protocol}://${req.get('host')}/uploads/${file}`);
    res.json(memeUrls);
  });
});

// ✅ Servir les fichiers directement sans redirection
app.get('/file/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('Fichier non trouvé');

  // ✅ Ajout explicite des headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  res.sendFile(filePath);
});

// ✅ Servir les fichiers statiques
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur démarré sur port ${PORT}`));
