const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000; // Puerto diferente para evitar conflictos

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public2')));
app.use('/imagenes', express.static(path.join(__dirname, 'public/imagenes')));

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: '',
    password: '',
    database: 'web-dbase'
});

// Conexión con la base de datos
db.connect(err => {
    if (err) {
        console.error('Error al conectar con MySQL:', err);
        return;
    }
    console.log('Conectado a la base de datos MySQL');
});

// Endpoint para obtener todos los productos
app.get('/productos', (req, res) => {
    const query = 'SELECT id, nombre, imagen FROM productos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).json({ error: 'Error al obtener productos' });
        }
        res.json(results);
    });
});

// Endpoint para obtener un producto por ID
app.get('/productos/:id', (req, res) => {
    const { id } =  req.params;
    const query = 'SELECT id, nombre, precio, inventario, imagen FROM productos WHERE id = ?';

    db.query(query, [id], (err, results) => {
	if (err) {
	    console.error('Error al obtener el producto:', err);
	    return res.status(500).json({error: 'Error al obtener el producto'});
	}

	if (results.length === 0) {
	    return res.status(404).json({error: 'Producto no encontrado'});
	}

	res.json(results[0]);
    });
});

//Configuración OpenPay
const OPENPAY_ID = '';
const PRIVATE_KEY = '';
const BASE_URL = `https://sandbox-api.openpay.mx/v1/${OPENPAY_ID}`;

//Endpoint para el procesado de pagos

app.post('/procesar-pago', async (req, res) => {
    const { token, device_session_id, customer, amount } = req.body;
    console.log(req.body);
    try {
        const respuesta = await fetch(`${BASE_URL}/charges`, {
	    method: 'POST',
	    headers: {
	        'Content-Type': 'application/json',
	        'Authorization': 'Basic ' + Buffer.from(`${PRIVATE_KEY}:`).toString('base64')
	    },
	    body: JSON.stringify({
	        source_id: token,
	        method: 'card',
	        amount: parseFloat(amount),
	        currency: 'MXN',
	        description: 'Pago de prueba',
	        device_session_id: device_session_id,
	        customer: {
		    name: customer.name,
		    last_name: customer.last_name,
		    phone_number: customer.phone_number,
		    email: customer.email
	        }
	    })
        });
	console.log("esperando respuesta", amount);

        const datos = await respuesta.json();
        if (respuesta.ok) {
	    res.json({message: 'Pago realizado exitosamente', datos});
        } else {
	    res.status(400).json({error: datos});
        }
    } catch (error) {
	console.error(error.message);
	res.status(500).json({error: 'Error en el servidor', detalles: error.message});
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
