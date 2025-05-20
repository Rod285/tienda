const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

// Crear el servidor express
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Carpeta estática para servir archivos

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/imagenes'); // Carpeta donde se almacenarán las imágenes
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Nombre único para el archivo
    },
});
const upload = multer({ storage });

// Configurar la conexión con la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost', // Cambia esto si el contenedor MySQL está en otro host
    user: '',
    password: '',
    database: 'web-dbase',
});

// Conectar a la base de datos MySQL
db.connect((err) => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Crear la tabla productos si no existe
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        inventario INT NOT NULL,
        imagen VARCHAR(255) NOT NULL
    )
`;
db.query(createTableQuery, (err) => {
    if (err) {
        console.error('Error creando la tabla productos:', err);
    }
});

// Servicio para agregar un producto con imagen
app.post('/producto', upload.single('imagen'), (req, res) => {
    const { nombre, precio, inventario } = req.body;

    if (!nombre || !precio || !inventario || !req.file) {
        return res.status(400).json({ error: 'Faltan campos requeridos (nombre, precio, inventario, imagen).' });
    }

    const imagenPath = `/imagenes/${req.file.filename}`;
    const query = 'INSERT INTO productos (nombre, precio, inventario, imagen) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, precio, inventario, imagenPath], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: results.insertId, nombre, precio, inventario, imagen: imagenPath });
    });
});

// Servicio para consultar todos los productos
app.get('/productos', (req, res) => {
    db.query('SELECT * FROM productos', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Servicio para eliminar un producto por ID
app.delete('/producto/:id', (req, res) => {
    const { id } = req.params;

    // Primero, obtenemos la imagen del producto para eliminarla del sistema de archivos
    const selectQuery = 'SELECT imagen FROM productos WHERE id = ?';
    db.query(selectQuery, id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        const imagenPath = path.join(__dirname, 'public', results[0].imagen);
        const fs = require('fs');
        fs.unlink(imagenPath, (fsErr) => {
            if (fsErr) {
                console.error('Error eliminando la imagen:', fsErr);
            }
        });

        // Luego, eliminamos el producto de la base de datos
        const deleteQuery = 'DELETE FROM productos WHERE id = ?';
        db.query(deleteQuery, id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Producto no encontrado.' });
            }
            res.json({ message: 'Producto eliminado con éxito.' });
        });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

