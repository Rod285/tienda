function cargarProductos() {
    fetch('/productos')
        .then(response => response.json())
        .then(data => {
            const grid = document.getElementById('productos-grid');
            grid.innerHTML = ''; // Limpiar el grid

            data.forEach(producto => {
                const card = document.createElement('div');
                card.className = 'product-card';

                const img = document.createElement('img');
                img.src = producto.imagen; // Ruta de la imagen
                img.alt = producto.nombre;

                const title = document.createElement('h2');
                title.textContent = producto.nombre;

		const btnInfo = document.createElement('button');
		btnInfo.textContent = 'Mas Información';
		btnInfo.id = producto.id;
		btnInfo.onclick = () => mostrarPopup(btnInfo.id);

                card.appendChild(img);
                card.appendChild(title);
		card.appendChild(btnInfo);

                grid.appendChild(card);
            });
        })
        .catch(error => console.error('Error al cargar productos:', error));
}

function mostrarPopup(id) {
    console.log("id: ", id);
    solicitaPorID(id).then(data => {
	if (data) {
	    despliegaPopup(data);
	}
    });
}

function solicitaPorID(id) {
    console.log("id a solicitar: ", id);
    return fetch(`/productos/${id}`)
	.then(response => {
	    if (!response.ok) throw new Error('Error al obtener el producto');
	    return response.json();
	})
	.catch(error => console.error('Error al solicitar producto: ', error));
}

function despliegaPopup(data) {
    console.log("Info: ", data);
    const popup = document.createElement('div');
    popup.className = 'popup';

    const contenidoPopup = document.createElement('div');
    contenidoPopup.className ='contenido-popup';

    const imagen = document.createElement('img');
    imagen.src = data.imagen;
    imagen.alt = data. nombre;

    const titulo = document.createElement('h2');
    titulo.textContent = data.nombre;

    const precio = document.createElement('p');
    precio.textContent = `Precio: ${data.precio}`;

    const existencias = document.createElement('p');
    existencias.textContent = `Existencias: ${data.inventario}`;

    const btnCarrito = document.createElement('button');
    btnCarrito.textContent = 'Agregar al carrito';
    btnCarrito.class = 'btnCarrito';
    btnCarrito.onclick = () => agregarAlCarrito(data.id, data.precio);

    const btnCerrar = document.createElement('button');
    btnCerrar.textContent = 'Cerrar';
    btnCerrar.onclick = () => document.body.removeChild(popup);

    contenidoPopup.appendChild(imagen);
    contenidoPopup.appendChild(titulo);
    contenidoPopup.appendChild(precio);
    contenidoPopup.appendChild(existencias);
    contenidoPopup.appendChild(btnCarrito);
    contenidoPopup.appendChild(btnCerrar);

    popup.appendChild(contenidoPopup);

    document.body.appendChild(popup); 
}

let carrito = []; // Array para almacenar los artículos en el carrito
let montoPagar = 0;

// Función para agregar un artículo al carrito
function agregarAlCarrito(id, precio) {
    let monto = 0;
    let articulo = {'id': id,
		    'precio': precio}; 
    carrito.push(articulo); // Agrega el precio del artículo al carrito
    console.log("articulos: ", carrito);
    carrito.forEach(articulo => {
	monto = monto + parseFloat(articulo.precio);
	console.log(monto);
    });
    document.getElementById('monto').textContent = monto;
    montoPagar = monto;
    alert('Producto agregado correctamente');
}

function pagarMonto(){
    console.log('Entrando al pago', montoPagar);
    
   //Guardar el monto a pagar en localStorage
   localStorage.setItem('montoPagar', montoPagar);

   //Abrir el archivo html para los pagos
   window.open('pagos.html', '_blank'); 
}

// Cargar productos al iniciar
cargarProductos();
