// Configuración de OpenPay
OpenPay.setId(''); 
OpenPay.setApiKey(''); 
OpenPay.setSandboxMode(true); // Activar modo sandbox para pruebas

// Generar ID de sesión de dispositivo
const idSesion = OpenPay.deviceData.setup("formulario-pago", "campo-sesion");

// Manejar el evento de envío del formulario
document.getElementById('formulario-pago').addEventListener('submit', function(e) {
    e.preventDefault(); // Evitar el comportamiento predeterminado del formulario
    document.getElementById('resultado').textContent = 'Generando token...';
    generarToken(); // Llamar a la función para generar el token
});

// Generar el token
function generarToken() {
    // Obtener los datos de la tarjeta desde los campos del formulario
    const datosTarjeta = {
        card_number: document.getElementById('numero-tarjeta').value, // Número de tarjeta
        holder_name: document.getElementById('nombre-titular').value, // Nombre del titular
        expiration_year: document.getElementById('anio-expiracion').value.slice(-2), // Últimos dos dígitos del año de expiración
        expiration_month: document.getElementById('mes-expiracion').value, // Mes de expiración
        cvv2: document.getElementById('cvv').value // Código de seguridad (CVV)
    };

    console.log(datosTarjeta);

    // Generar el token con los datos de la tarjeta
    OpenPay.token.create(datosTarjeta, tokenExitoso, tokenError);
}

// Callback para el token generado exitosamente
function tokenExitoso(respuesta) {
    const idToken = respuesta.data.id; // Obtener el ID del token generado
    document.getElementById('resultado').textContent = `Token generado: ${idToken}`;

    // Obtener los datos del cliente desde los campos del formulario
    const nombre = document.getElementById('nombre-titular').value;
    const apellido = document.getElementById('apellido-titular').value;
    const telefono = document.getElementById('telefono-titular').value;
    const email = document.getElementById('email-titular').value;

    // Crear el objeto del cliente
    const cliente = {
        name: nombre,
        last_name: apellido,
        phone_number: telefono,
        email: email
    };

    
    // Enviar el token, el ID de sesión y los datos del cliente al servidor
    fetch('/procesar-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            token: idToken, 
            device_session_id: idSesion,
            customer: cliente,
	    amount: localStorage.getItem('montoPagar')
        }) // Enviar token, ID de sesión y datos del cliente
    })
    .then(response => response.json()) // Convertir la respuesta a JSON
    .then(data => {
        if (data.message) {
            console.log("Mensaje");
            document.getElementById('resultado').textContent = `Respuesta: ${data.message}`; // Mostrar la respuesta del servidor
        } else {
            console.log("Error");
            document.getElementById('resultado').textContent = `Error: ${data.error.description}`; // Mostrar error si hay problemas en la respuesta
        }
    })
    .catch(error => console.error('Error:', error)); // Manejar errores en la petición
}

// Callback para error al generar el token
function tokenError(respuesta) {
    const descripcion = respuesta.data.description || 'Error al generar el token'; // Mensaje de error
    document.getElementById('resultado').innerHTML = `<span class="error">${descripcion}</span>`; // Mostrar el error en pantalla
}

document.addEventListener('DOMContentLoaded', () => {
    const monto = localStorage.getItem('montoPagar');
    if (monto) {
        console.log(`Monto a pagar: ${monto}`);
	document.getElementById('monto-a-pagar').textContent = `Monto a pagar: $${monto}`;
    }
});
