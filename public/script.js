// script.js

// Función para agregar un producto con imagen
function agregarProducto() {
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const inventario = document.getElementById('inventario').value;
    const imagen = document.getElementById('imagen').files[0];

    if (!nombre || !precio || !inventario || !imagen) {
        alert('Por favor, completa todos los campos y selecciona una imagen.');
        return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('precio', precio);
    formData.append('inventario', inventario);
    formData.append('imagen', imagen);

    fetch('/producto', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            alert('Producto agregado con éxito');
            cargarProductos(); // Actualizar la lista de productos
            limpiarFormulario();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Función para cargar todos los productos
function cargarProductos() {
    fetch('/productos')
        .then(response => response.json())
        .then(data => {
            const lista = document.getElementById('lista-productos');
            lista.innerHTML = ''; // Limpiar la lista

            data.forEach(producto => {
                const li = document.createElement('li');

                li.innerHTML = `
                    <img src="${producto.imagen}" alt="${producto.nombre}" width="50">
                    ${producto.nombre} - Precio: $${producto.precio} - Inventario: ${producto.inventario}
                `;

                const botonEliminar = document.createElement('button');
                botonEliminar.textContent = 'Eliminar';
                botonEliminar.onclick = () => eliminarProducto(producto.id);

                li.appendChild(botonEliminar);
                lista.appendChild(li);
            });
        });
}

// Función para eliminar un producto
function eliminarProducto(id) {
    fetch(`/producto/${id}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            alert('Producto eliminado con éxito');
            cargarProductos(); // Actualizar la lista de productos
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

// Función para limpiar el formulario después de agregar un producto
function limpiarFormulario() {
    document.getElementById('nombre').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('inventario').value = '';
    document.getElementById('imagen').value = null;
}

// Cargar productos al inicio
cargarProductos();

