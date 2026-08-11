/************************************************************
 * NUEVA COTIZACIÓN
 ************************************************************/

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/************************************************************
 * FIREBASE
 ************************************************************/

const firebaseConfig = {

    apiKey:
        "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",

    authDomain:
        "inlact.firebaseapp.com",

    projectId:
        "inlact",

    storageBucket:
        "inlact.firebasestorage.app",

    messagingSenderId:
        "143868382036",

    appId:
        "1:143868382036:web:b5af0e4faced7e880216c1"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


/************************************************************
 * ELEMENTOS
 ************************************************************/

const form =
    document.getElementById("formNuevaCotizacion");

const selectCliente =
    document.getElementById("cliente");

const fechaEl =
    document.getElementById("fecha");

const nombreCotizacionEl =
    document.getElementById("nombreCotizacion");

const propuestaEl =
    document.getElementById("propuesta");

const dosisEl =
    document.getElementById("dosis");

const observacionesEl =
    document.getElementById("observaciones");

const listaProductosEl =
    document.getElementById("listaProductosCotizacion");

const btnAgregarProducto =
    document.getElementById(
        "btnAgregarProductoCotizacion"
    );


/************************************************************
 * PRODUCTOS
 ************************************************************/

let productosCotizacion = [];


/************************************************************
 * CARGAR CLIENTES
 ************************************************************/

async function cargarClientes() {

    try {

        const snap =
            await getDocs(
                collection(db, "clientes")
            );


        snap.forEach(docu => {

            const cliente =
                docu.data();


            const option =
                document.createElement("option");


            option.value =
                docu.id;


            option.textContent =
                cliente.nombre ||
                "Cliente sin nombre";


            option.dataset.nombre =
                cliente.nombre || "";


            selectCliente.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Error cargando clientes:",
            error
        );

        alert(
            "No se pudieron cargar los clientes."
        );

    }

}


/************************************************************
 * AGREGAR PRODUCTO
 ************************************************************/

btnAgregarProducto.addEventListener(
    "click",
    () => {

        const producto = {

            id: Date.now(),

            nombre: "",

            moneda: "USD",

            precio: ""

        };


        productosCotizacion.push(
            producto
        );


        renderProductos();

    }
);


/************************************************************
 * MOSTRAR PRODUCTOS
 ************************************************************/

function renderProductos() {

    listaProductosEl.innerHTML = "";


    productosCotizacion.forEach(
        producto => {

            const tarjeta =
                document.createElement("div");


            tarjeta.className =
                "producto-cotizacion";


            tarjeta.innerHTML = `

                <div class="producto-cotizacion-cabecera">

                    <strong>
                        Producto
                    </strong>

                    <button
                        type="button"
                        class="btn-eliminar-producto"
                        data-id="${producto.id}"
                    >
                        🗑️
                    </button>

                </div>


                <input
                    type="text"
                    class="producto-nombre"
                    placeholder="Nombre del producto"
                    value="${producto.nombre}"
                >


                <div class="producto-precio">

                    <select class="producto-moneda">

                        <option value="USD"
                            ${producto.moneda === "USD" ? "selected" : ""}>
                            USD
                        </option>

                        <option value="ARS"
                            ${producto.moneda === "ARS" ? "selected" : ""}>
                            ARS
                        </option>

                    </select>


                    <input
                        type="number"
                        class="producto-precio-unitario"
                        placeholder="Precio unitario"
                        min="0"
                        step="0.01"
                        value="${producto.precio}"
                    >

                </div>

            `;


            /************************************************
             * NOMBRE
             ************************************************/

            const nombreInput =
                tarjeta.querySelector(
                    ".producto-nombre"
                );


            nombreInput.addEventListener(
                "input",
                () => {

                    producto.nombre =
                        nombreInput.value;

                }
            );


            /************************************************
             * MONEDA
             ************************************************/

            const monedaSelect =
                tarjeta.querySelector(
                    ".producto-moneda"
                );


            monedaSelect.addEventListener(
                "change",
                () => {

                    producto.moneda =
                        monedaSelect.value;

                }
            );


            /************************************************
             * PRECIO
             ************************************************/

            const precioInput =
                tarjeta.querySelector(
                    ".producto-precio-unitario"
                );


            precioInput.addEventListener(
                "input",
                () => {

                    producto.precio =
                        precioInput.value;

                }
            );


            /************************************************
             * ELIMINAR
             ************************************************/

            const btnEliminar =
                tarjeta.querySelector(
                    ".btn-eliminar-producto"
                );


            btnEliminar.addEventListener(
                "click",
                () => {

                    productosCotizacion =
                        productosCotizacion.filter(
                            p =>
                                p.id !== producto.id
                        );


                    renderProductos();

                }
            );


            listaProductosEl.appendChild(
                tarjeta
            );

        }
    );

}


/************************************************************
 * FECHA ACTUAL
 ************************************************************/

function establecerFechaActual() {

    if (fechaEl.value) {
        return;
    }


    const hoy =
        new Date();


    const año =
        hoy.getFullYear();


    const mes =
        String(
            hoy.getMonth() + 1
        ).padStart(2, "0");


    const dia =
        String(
            hoy.getDate()
        ).padStart(2, "0");


    fechaEl.value =
        `${año}-${mes}-${dia}`;

}


/************************************************************
 * GUARDAR COTIZACIÓN
 ************************************************************/

form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        try {

            /************************************************
             * CLIENTE
             ************************************************/

            if (!selectCliente.value) {

                alert(
                    "Seleccioná un cliente."
                );

                selectCliente.focus();

                return;

            }


            const clienteOption =
                selectCliente.options[
                    selectCliente.selectedIndex
                ];


            /************************************************
             * FECHA
             ************************************************/

            if (!fechaEl.value) {

                alert(
                    "Seleccioná una fecha."
                );

                fechaEl.focus();

                return;

            }


            /************************************************
             * NOMBRE
             ************************************************/

            const nombreCotizacion =
                nombreCotizacionEl.value.trim();


            if (!nombreCotizacion) {

                alert(
                    "Ingresá el nombre de la cotización."
                );

                nombreCotizacionEl.focus();

                return;

            }


            /************************************************
             * PRODUCTOS
             ************************************************/

            if (
                productosCotizacion.length === 0
            ) {

                alert(
                    "Agregá al menos un producto."
                );

                return;

            }


            /************************************************
             * VALIDAR PRODUCTOS
             ************************************************/

            for (
                const producto
                of productosCotizacion
            ) {

                if (
                    !producto.nombre.trim()
                ) {

                    alert(
                        "Completá el nombre de todos los productos."
                    );

                    return;

                }


                if (
                    producto.precio === "" ||
                    Number(producto.precio) < 0
                ) {

                    alert(
                        `Ingresá el precio del producto "${producto.nombre}".`
                    );

                    return;

                }

            }


            /************************************************
             * FECHA FIREBASE
             ************************************************/

            const partes =
                fechaEl.value.split("-");


            const fechaCotizacion =
                new Date(
                    Number(partes[0]),
                    Number(partes[1]) - 1,
                    Number(partes[2]),
                    12,
                    0,
                    0
                );


            /************************************************
             * DATOS DE LOS PRODUCTOS
             *
             * Sacamos el id interno porque solamente
             * sirve para manejar la pantalla.
             ************************************************/

            const productos =
                productosCotizacion.map(
                    producto => ({

                        nombre:
                            producto.nombre.trim(),

                        moneda:
                            producto.moneda,

                        precioUnitario:
                            Number(
                                producto.precio
                            )

                    })
                );


            /************************************************
             * OBJETO FINAL
             ************************************************/

            const nuevaCotizacion = {

                clienteId:
                    selectCliente.value,

                clienteNombre:
                    clienteOption.dataset.nombre ||
                    clienteOption.textContent,

                nombreCotizacion:
                    nombreCotizacion,

                fecha:
                    Timestamp.fromDate(
                        fechaCotizacion
                    ),

                propuesta:
                    propuestaEl.value || "",

                dosis:
                    dosisEl.value || "",

                productos:
                    productos,

                observaciones:
                    observacionesEl.value || "",

                creadoEn:
                    Timestamp.now()

            };


            /************************************************
             * BOTÓN GUARDAR
             ************************************************/

            const botonGuardar =
                form.querySelector(
                    ".btn-guardar"
                );


            if (botonGuardar) {

                botonGuardar.disabled =
                    true;

                botonGuardar.textContent =
                    "Guardando...";

            }


            /************************************************
             * FIRESTORE
             ************************************************/

            const docRef =
                await addDoc(
                    collection(
                        db,
                        "cotizaciones"
                    ),
                    nuevaCotizacion
                );


            /************************************************
             * IR A LA COTIZACIÓN
             ************************************************/

            window.location.href =
                `cotizacion.html?id=${docRef.id}`;

        }

        catch (error) {

            console.error(
                "Error al guardar cotización:",
                error
            );


            alert(
                "Error al guardar la cotización.\n\n" +
                error.message
            );


            const botonGuardar =
                form.querySelector(
                    ".btn-guardar"
                );


            if (botonGuardar) {

                botonGuardar.disabled =
                    false;

                botonGuardar.textContent =
                    "💾 Guardar cotización";

            }

        }

    }
);


/************************************************************
 * INICIO
 ************************************************************/

async function iniciar() {

    establecerFechaActual();

    await cargarClientes();

}


iniciar();
