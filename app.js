// app.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Necesario para leer JSON de fetch
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Configuración subida de imagen
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'oLMER2003*',
  database: 'proyectos_db',
});

// Ruta para subir proyectos
app.post('/upload-project', upload.single('imagen'), (req, res) => {
  const { titulo, descripcion, github, deploy } = req.body;
  const imagen = req.file.filename;

  const sql = 'INSERT INTO proyectos (titulo, descripcion, github, deploy, imagen, likes) VALUES (?, ?, ?, ?, ?, 0)';
  db.query(sql, [titulo, descripcion, github, deploy, imagen], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Ruta para dar like
app.post('/like/:id', (req, res) => {
  const id = req.params.id;

  // Incrementa el contador de likes
  db.query('UPDATE proyectos SET likes = likes + 1 WHERE id = ?', [id], (err) => {
    if (err) return res.json({ success: false });

    // Consulta los nuevos likes
    db.query('SELECT likes FROM proyectos WHERE id = ?', [id], (err, result) => {
      if (err) return res.json({ success: false });
      const likes = result[0].likes;
      res.json({ success: true, likes });
    });
  });
});

// Ruta de inicio
app.get('/', (req, res) => {
  db.query('SELECT * FROM proyectos ORDER BY id DESC', (err, results) => {
    if (err) throw err;
    res.render('index', { proyectos: results });
  });
});

app.listen(3000, () => console.log('Servidor activo en http://localhost:3000'));
