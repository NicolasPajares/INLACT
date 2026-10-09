
/* ============================================================
   NUEVA COTIZACIÓN / EDICIÓN DE COTIZACIÓN
============================================================ */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* ============================================================
   FIREBASE
============================================================ */

const firebaseConfig = {
    apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
    authDomain: "inlact.firebaseapp.com",
    projectId: "inlact",
    storageBucket: "inlact.firebasestorage.app",
    messagingSenderId: "143868382036",
    appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* ============================================================
   ELEMENTOS
============================================================ */

const form = document.getElementById("formNuevaCotizacion");
const selectCliente = document.getElementById("cliente");
const fechaEl = document.getElementById("fecha");
const nombreCotizacionEl = document.getElementById("nombreCotizacion");
const propuestaEl = document.getElementById("propuesta");
const dosisEl = document.getElementById("dosis");
const observacionesEl = document.getElementById("observaciones");
const listaProductosEl = document.getElementById("listaProductosCotizacion");
const btnAgregarProducto = document.getElementById("btnAgregarProductoCotizacion");
const selectListaPrecios = document.getElementById("listaPrecios");


/* ============================================================
   VARIABLES
============================================================ */

let productos = [];
let listasPrecios = [];
let listaPreciosSeleccionada = null;
let productosCotizacion = [];

const cotizacionId = new URLSearchParams(
    window.location.search
).get("id");

let cotizacionOriginal = null;


/* ============================================================
   CARGAR CLIENTES
============================================================ */

async function cargarClientes() {
    try {
        const snap = await getDocs(collection(db, "clientes"));

        snap.forEach(docu => {
            const cliente = docu.data();
            const option = document.createElement("option");

            option.value = docu.id;
            option.textContent = cliente.nombre || "Cliente sin nombre";
            option.dataset.nombre = cliente.nombre || "";

            selectCliente.appendChild(option);
        });

    } catch (error) {
        console.error("Error cargando clientes:", error);
        alert("No se pudieron cargar los clientes.");
        throw error;
    }
}


/* ============================================================
   CARGAR PRODUCTOS
============================================================ */

async function cargarProductos() {
    try {
        const snap = await getDocs(collection(db, "productos"));

        productos = [];

        snap.forEach(docu => {
            const datos = docu.data();

            if (datos.activo === false) return;

            productos.push({
                id: docu.id,
                codigo: datos.codigo || "",
                descripcion: datos.descripcion || "Producto sin nombre",
                unidad: datos.unidad || ""
            });
        });

        productos.sort((a, b) =>
            a.descripcion.localeCompare(
                b.descripcion,
                "es",
                { sensitivity: "base" }
            )
        );

        console.log("Productos cargados:", productos.length);

    } catch (error) {
        console.error("Error cargando productos:", error);
        alert("No se pudieron cargar los productos.");
        throw error;
    }
}


/* ============================================================
   CARGAR LISTAS DE PRECIOS
============================================================ */

async function cargarListasPrecios() {
    try {
        const snap = await getDocs(collection(db, "listaprecios"));

        listasPrecios = [];

        snap.forEach(docu => {
            const datos = docu.data();

            listasPrecios.push({
                id: docu.id,
                nombre: datos.nombre || "Lista sin nombre",
                fecha: datos.fecha || null,
                productos: Array.isArray(datos.productos)
                    ? datos.productos
                    : []
            });
        });

        listasPrecios.sort((a, b) => {
            const fechaA = a.fecha && typeof a.fecha.toDate === "function"
                ? a.fecha.toDate().getTime()
                : 0;

            const fechaB = b.fecha && typeof b.fecha.toDate === "function"
                ? b.fecha.toDate().getTime()
                : 0;

            return fechaB - fechaA;
        });

        selectListaPrecios.innerHTML = "";

        const opcionInicial = document.createElement("option");
        opcionInicial.value = "";
        opcionInicial.textContent = "Seleccionar lista de precios";
        selectListaPrecios.appendChild(opcionInicial);

        listasPrecios.forEach(lista => {
            const option = document.createElement("option");
            option.value = lista.id;
            option.textContent = lista.nombre;
            selectListaPrecios.appendChild(option);
        });

        console.log("Listas de precios cargadas:", listasPrecios.length);

    } catch (error) {
        console.error("Error cargando listas de precios:", error);
        alert("No se pudieron cargar las listas de precios.");
        throw error;
    }
}


/* ============================================================
   CAMBIAR LISTA DE PRECIOS
============================================================ */

selectListaPrecios.addEventListener("change", () => {
    const id = selectListaPrecios.value;

    listaPreciosSeleccionada =
        listasPrecios.find(lista => lista.id === id) || null;

    actualizarSugerenciasProductos();
});


/* ============================================================
   ACTUALIZAR PRECIOS SUGERIDOS
   No modifica los precios escritos por el usuario.
============================================================ */

function actualizarSugerenciasProductos() {
    const filas = listaProductosEl.querySelectorAll(
        ".producto-cotizacion"
    );

    filas.forEach(fila => {
        const productoId = fila.dataset.productoId;
        const sugerencia = fila.querySelector(".precio-sugerido");

        if (!sugerencia || !productoId) return;

        const precio = obtenerPrecioSugerido(productoId);

        if (precio) {
            sugerencia.textContent =
                `Precio sugerido: ${formatearPrecio(
                    precio.precio,
                    precio.moneda
                )}`;
        } else {
            sugerencia.textContent = listaPreciosSeleccionada
                ? "Producto sin precio en esta lista"
                : "Seleccioná una lista de precios";
        }
    });
}


/* ============================================================
   BUSCADOR DE PRODUCTO
============================================================ */

function crearBuscadorProducto(contenedor, productoSeleccionado) {
    const buscador = document.createElement("input");

    buscador.type = "text";
    buscador.placeholder = "Buscar producto por nombre o código...";
    buscador.autocomplete = "off";
    buscador.className = "producto-nombre";

    const resultados = document.createElement("div");
    resultados.className = "resultados-productos";
    resultados.hidden = true;

    contenedor.appendChild(buscador);
    contenedor.appendChild(resultados);

    if (productoSeleccionado) {
        buscador.value =
            productoSeleccionado.nombre ||
            productoSeleccionado.descripcion ||
            "";
    }

    buscador.addEventListener("input", () => {
        const texto = buscador.value.toLowerCase().trim();

        resultados.innerHTML = "";

        if (!texto) {
            resultados.hidden = true;
            return;
        }

        const encontrados = productos.filter(producto => {
            const nombre = (producto.descripcion || "").toLowerCase();
            const codigo = (producto.codigo || "").toLowerCase();

            return nombre.includes(texto) || codigo.includes(texto);
        }).slice(0, 15);

        if (encontrados.length === 0) {
            const sinResultados = document.createElement("div");
            sinResultados.className = "sin-resultados";
            sinResultados.textContent = "No se encontraron productos.";

            resultados.appendChild(sinResultados);
            resultados.hidden = false;
            return;
        }

        encontrados.forEach(producto => {
            const opcion = document.createElement("div");
            opcion.className = "resultado-producto";

            const nombre = document.createElement("strong");
            nombre.textContent = producto.descripcion;

            const detalle = document.createElement("small");
            detalle.textContent = [
                producto.codigo ? `Código: ${producto.codigo}` : "",
                producto.unidad ? ` · ${producto.unidad}` : ""
            ].join("");

            opcion.append(nombre, detalle);

            opcion.addEventListener("click", () => {
                seleccionarProducto(
                    producto,
                    buscador,
                    resultados,
                    contenedor
                );
            });

            resultados.appendChild(opcion);
        });

        resultados.hidden = false;
    });

    document.addEventListener("click", event => {
        if (!contenedor.contains(event.target)) {
            resultados.hidden = true;
        }
    });

    return buscador;
}


/* ============================================================
   BUSCAR PRECIO SUGERIDO
============================================================ */

function obtenerPrecioSugerido(productoId) {
    if (!listaPreciosSeleccionada) return null;

    const producto = listaPreciosSeleccionada.productos.find(
        p => p.productoId === productoId
    );

    if (!producto) return null;

    return {
        precio: Number(producto.precio || 0),
        moneda: producto.moneda || "ARS"
    };
}


/* ============================================================
   SELECCIONAR PRODUCTO
============================================================ */

function seleccionarProducto(producto, buscador, resultados, contenedor) {
    const fila = contenedor.closest(".producto-cotizacion");

    const productoActual = fila &&
        fila.dataset.productoId === producto.id;

    const yaExiste = productosCotizacion.some(
        p => p.productoId === producto.id
    );

    if (yaExiste && !productoActual) {
        alert("⚠️ Este producto ya está agregado a la cotización.");
        return;
    }

    if (!fila) return;

    fila.dataset.productoId = producto.id;
    fila.dataset.codigo = producto.codigo;
    fila.dataset.unidad = producto.unidad;
    fila.dataset.descripcion = producto.descripcion;

    const sugerido = obtenerPrecioSugerido(producto.id);
    const moneda = fila.querySelector(".producto-moneda");
    const precioSugerido = fila.querySelector(".precio-sugerido");

    if (sugerido && moneda) {
        moneda.value = sugerido.moneda;
    }

    if (sugerido && precioSugerido) {
        precioSugerido.textContent =
            `Precio sugerido: ${formatearPrecio(
                sugerido.precio,
                sugerido.moneda
            )}`;
    } else if (precioSugerido) {
        precioSugerido.textContent = listaPreciosSeleccionada
            ? "Producto sin precio en esta lista"
            : "Seleccioná una lista de precios";
    }

    // Al elegir un producto nuevo, el precio queda vacío para ingresarlo.
    // Si se está seleccionando el mismo producto, se conserva el precio.
    if (!productoActual) {
        const precioInput = fila.querySelector(".producto-precio-unitario");

        if (precioInput) {
            precioInput.value = "";
        }
    }

    const unidad = fila.querySelector(".unidad-producto");

    if (unidad) {
        unidad.textContent = producto.unidad || "Sin unidad";
    }

    buscador.value = producto.descripcion;
    resultados.innerHTML = "";
    resultados.hidden = true;

    actualizarProductosCotizacion();
}


/* ============================================================
   FORMATEAR PRECIO
============================================================ */

function formatearPrecio(precio, moneda) {
    const simbolo = moneda === "USD"
        ? "USD "
        : moneda === "EUR"
            ? "EUR "
            : "$ ";

    return simbolo + Number(precio || 0).toLocaleString(
        "es-AR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


/* ============================================================
   CREAR FILA DE PRODUCTO
============================================================ */

function agregarFilaProducto(productoInicial = null) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "producto-cotizacion";

    tarjeta.dataset.productoId = productoInicial
        ? productoInicial.productoId || ""
        : "";

    tarjeta.dataset.id = productoInicial && productoInicial.id
        ? productoInicial.id
        : Date.now().toString() +
          Math.random().toString(36).substring(2);

    if (productoInicial) {
        tarjeta.dataset.descripcion =
            productoInicial.nombre ||
            productoInicial.descripcion ||
            "";

        tarjeta.dataset.codigo = productoInicial.codigo || "";
        tarjeta.dataset.unidad = productoInicial.unidad || "";
    }

    /* CABECERA */

    const cabecera = document.createElement("div");
    cabecera.className = "producto-cotizacion-cabecera";

    const titulo = document.createElement("strong");
    titulo.textContent = "Producto";

    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.className = "btn-eliminar-producto";
    btnEliminar.textContent = "✕";
    btnEliminar.title = "Eliminar producto";
    btnEliminar.setAttribute("aria-label", "Eliminar producto");

    btnEliminar.addEventListener("click", () => {
        tarjeta.remove();
        actualizarProductosCotizacion();
    });

    cabecera.append(titulo, btnEliminar);
    tarjeta.appendChild(cabecera);

    /* BUSCADOR */

    const contenedorBuscador = document.createElement("div");
    contenedorBuscador.className = "contenedor-buscador-producto";

    tarjeta.appendChild(contenedorBuscador);

    crearBuscadorProducto(contenedorBuscador, productoInicial);

    /* UNIDAD */

    const unidad = document.createElement("span");
    unidad.className = "unidad-producto";
    unidad.textContent = productoInicial
        ? productoInicial.unidad || "Sin unidad"
        : "Sin producto";

    tarjeta.appendChild(unidad);

    /* BLOQUE DE PRECIO */

    const bloquePrecio = document.createElement("div");
    bloquePrecio.className = "producto-precio";

    /* MONEDA */

    const moneda = document.createElement("select");
    moneda.className = "producto-moneda";
    moneda.innerHTML = `
        <option value="USD">USD</option>
        <option value="ARS">ARS</option>
        <option value="EUR">EUR</option>
    `;

    /* PRECIO UNITARIO */

    const precioInput = document.createElement("input");
    precioInput.type = "number";
    precioInput.className = "producto-precio-unitario";
    precioInput.placeholder = "Precio unitario";
    precioInput.min = "0";
    precioInput.step = "0.01";

    /* PRECIO SUGERIDO */

    const precioSugerido = document.createElement("small");
    precioSugerido.className = "precio-sugerido";
    precioSugerido.style.color = "#9ca3af";
    precioSugerido.style.fontSize = "13px";
    precioSugerido.style.display = "block";
    precioSugerido.textContent = listaPreciosSeleccionada
        ? "Seleccioná el producto"
        : "Seleccioná una lista de precios";

    /* RECUPERAR DATOS EXISTENTES */

    if (productoInicial) {
        moneda.value = productoInicial.moneda || "ARS";

        if (productoInicial.precioUnitario !== undefined &&
            productoInicial.precioUnitario !== null) {
            precioInput.value = productoInicial.precioUnitario;
        }

        const sugerido = obtenerPrecioSugerido(
            productoInicial.productoId
        );

        if (sugerido) {
            precioSugerido.textContent =
                `Precio sugerido: ${formatearPrecio(
                    sugerido.precio,
                    sugerido.moneda
                )}`;
        }
    }

    moneda.addEventListener("change", actualizarProductosCotizacion);
    precioInput.addEventListener("input", actualizarProductosCotizacion);

    bloquePrecio.append(moneda, precioInput, precioSugerido);
    tarjeta.appendChild(bloquePrecio);

    listaProductosEl.appendChild(tarjeta);

    if (!productoInicial) {
        const input = tarjeta.querySelector(".producto-nombre");

        if (input) input.focus();
    }

    actualizarProductosCotizacion();
}


/* ============================================================
   ACTUALIZAR PRODUCTOS DE LA COTIZACIÓN
============================================================ */

function actualizarProductosCotizacion() {
    productosCotizacion = [];

    const filas = listaProductosEl.querySelectorAll(
        ".producto-cotizacion"
    );

    filas.forEach(fila => {
        const productoId = fila.dataset.productoId;

        if (!productoId) return;

        const moneda = fila.querySelector(".producto-moneda");
        const precio = fila.querySelector(".producto-precio-unitario");

        productosCotizacion.push({
            id: fila.dataset.id,
            productoId,
            nombre: fila.dataset.descripcion || "",
            codigo: fila.dataset.codigo || "",
            unidad: fila.dataset.unidad || "",
            moneda: moneda ? moneda.value : "ARS",
            precio: precio ? precio.value : ""
        });
    });
}


/* ============================================================
   BOTÓN AGREGAR PRODUCTO
============================================================ */

btnAgregarProducto.addEventListener("click", () => {
    agregarFilaProducto();
});


/* ============================================================
   FECHA ACTUAL
============================================================ */

function establecerFechaActual() {
    if (fechaEl.value) return;

    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    fechaEl.value = `${año}-${mes}-${dia}`;
}


/* ============================================================
   CARGAR COTIZACIÓN EXISTENTE PARA EDITAR
============================================================ */

async function cargarCotizacionExistente() {
    if (!cotizacionId) return;

    try {
        const referencia = doc(db, "cotizaciones", cotizacionId);
        const resultado = await getDoc(referencia);

        if (!resultado.exists()) {
            alert("No se encontró la cotización.");
            window.location.href = "precios.html";
            return;
        }

        cotizacionOriginal = resultado.data();
        const datos = cotizacionOriginal;

        const titulo = document.querySelector(".card-formulario h1");

        if (titulo) {
            titulo.textContent = "Editar cotización";
        }

        const botonGuardar = form.querySelector(".btn-guardar");

        if (botonGuardar) {
            botonGuardar.textContent = "💾 Guardar cambios";
        }

        // Cliente
        selectCliente.value = datos.clienteId || "";

        // Fecha
        if (datos.fecha) {
            const fecha = typeof datos.fecha.toDate === "function"
                ? datos.fecha.toDate()
                : new Date(datos.fecha);

            if (!Number.isNaN(fecha.getTime())) {
                fechaEl.value = [
                    fecha.getFullYear(),
                    String(fecha.getMonth() + 1).padStart(2, "0"),
                    String(fecha.getDate()).padStart(2, "0")
                ].join("-");
            }
        }

        // Campos de texto
        nombreCotizacionEl.value = datos.nombreCotizacion || "";
        propuestaEl.value = datos.propuesta || "";
        dosisEl.value = datos.dosis || "";
        observacionesEl.value = datos.observaciones || "";

        // Lista de precios
        selectListaPrecios.value = datos.listaPreciosId || "";

        listaPreciosSeleccionada = listasPrecios.find(
            lista => lista.id === datos.listaPreciosId
        ) || null;

        // Productos
        listaProductosEl.innerHTML = "";
        productosCotizacion = [];

        if (Array.isArray(datos.productos)) {
            datos.productos.forEach(producto => {
                agregarFilaProducto({
                    ...producto,
                    productoId: producto.productoId || "",
                    nombre: producto.nombre || "",
                    descripcion: producto.nombre || "",
                    precioUnitario: producto.precioUnitario ?? ""
                });
            });
        }

        actualizarProductosCotizacion();
        actualizarSugerenciasProductos();

    } catch (error) {
        console.error("Error cargando cotización:", error);
        alert("No se pudo cargar la cotización para editar.");
        throw error;
    }
}


/* ============================================================
   GUARDAR O ACTUALIZAR COTIZACIÓN
============================================================ */

form.addEventListener("submit", async event => {
    event.preventDefault();

    const botonGuardar = form.querySelector(".btn-guardar");

    try {
        /* CLIENTE */

        if (!selectCliente.value) {
            alert("Seleccioná un cliente.");
            selectCliente.focus();
            return;
        }

        const clienteOption =
            selectCliente.options[selectCliente.selectedIndex];

        /* FECHA */

        if (!fechaEl.value) {
            alert("Seleccioná una fecha.");
            fechaEl.focus();
            return;
        }

        /* NOMBRE */

        const nombreCotizacion = nombreCotizacionEl.value.trim();

        if (!nombreCotizacion) {
            alert("Ingresá el nombre de la cotización.");
            nombreCotizacionEl.focus();
            return;
        }

        /* PRODUCTOS */

        actualizarProductosCotizacion();

        if (productosCotizacion.length === 0) {
            alert("Agregá al menos un producto.");
            return;
        }

        for (const producto of productosCotizacion) {
            if (!producto.nombre.trim()) {
                alert("Completá el nombre de todos los productos.");
                return;
            }

            if (
                producto.precio === "" ||
                !Number.isFinite(Number(producto.precio)) ||
                Number(producto.precio) < 0
            ) {
                alert(
                    `Ingresá el precio del producto "${producto.nombre}".`
                );
                return;
            }
        }

        /* FECHA FIREBASE */

        const partes = fechaEl.value.split("-");

        const fechaCotizacion = new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2]),
            12,
            0,
            0
        );

        /* PRODUCTOS FINALES */

        const productosFinales = productosCotizacion.map(producto => ({
            productoId: producto.productoId,
            nombre: producto.nombre.trim(),
            codigo: producto.codigo,
            unidad: producto.unidad,
            moneda: producto.moneda,
            precioUnitario: Number(producto.precio)
        }));

        /* LISTA DE PRECIOS */

        const datosLista = listaPreciosSeleccionada
            ? {
                listaPreciosId: listaPreciosSeleccionada.id,
                listaPreciosNombre: listaPreciosSeleccionada.nombre
            }
            : {
                listaPreciosId: "",
                listaPreciosNombre: ""
            };

        /* OBJETO A GUARDAR */

        const datosCotizacion = {
            clienteId: selectCliente.value,
            clienteNombre:
                clienteOption.dataset.nombre ||
                clienteOption.textContent,
            nombreCotizacion,
            fecha: Timestamp.fromDate(fechaCotizacion),
            propuesta: propuestaEl.value || "",
            dosis: dosisEl.value || "",
            listaPreciosId: datosLista.listaPreciosId,
            listaPreciosNombre: datosLista.listaPreciosNombre,
            productos: productosFinales,
            observaciones: observacionesEl.value || ""
        };

        if (botonGuardar) {
            botonGuardar.disabled = true;
            botonGuardar.textContent = cotizacionId
                ? "Guardando cambios..."
                : "Guardando...";
        }

        let idGuardado;

        if (cotizacionId) {
            // EDITAR: actualiza el documento existente.
            // No crea una cotización duplicada.
            await updateDoc(
                doc(db, "cotizaciones", cotizacionId),
                {
                    ...datosCotizacion,
                    actualizadoEn: Timestamp.now()
                }
            );

            idGuardado = cotizacionId;

        } else {
            // NUEVA: crea un documento nuevo.
            const docRef = await addDoc(
                collection(db, "cotizaciones"),
                {
                    ...datosCotizacion,
                    creadoEn: Timestamp.now()
                }
            );

            idGuardado = docRef.id;
        }

        window.location.href =
            `cotizacion.html?id=${encodeURIComponent(idGuardado)}`;

    } catch (error) {
        console.error("Error guardando cotización:", error);

        alert(
            "Error al guardar la cotización.\n\n" +
            error.message
        );

        if (botonGuardar) {
            botonGuardar.disabled = false;
            botonGuardar.textContent = cotizacionId
                ? "💾 Guardar cambios"
                : "💾 Guardar cotización";
        }
    }
});


/* ============================================================
   INICIO
============================================================ */

async function iniciar() {
    establecerFechaActual();

    try {
        // Cargar primero los selectores y catálogos.
        await Promise.all([
            cargarClientes(),
            cargarProductos(),
            cargarListasPrecios()
        ]);

        // Si la URL contiene ?id=..., recuperar la cotización.
        await cargarCotizacionExistente();

    } catch (error) {
        console.error("No se pudo iniciar el formulario:", error);
    }
}

iniciar();
