/* =========================================================
   FIREBASE
   ========================================================= */

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    query,
    where,
    updateDoc,
    doc,
    Timestamp
} from
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* =========================================================
   CONFIG FIREBASE
   ========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyCpCO82XE8I990mWw4Fe8EVwmUOAeLZdv4",
    authDomain: "inlact.firebaseapp.com",
    projectId: "inlact",
    storageBucket: "inlact.appspot.com",
    messagingSenderId: "143868382036",
    appId: "1:143868382036:web:b5af0e4faced7e880216c1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* =========================================================
   ELEMENTOS
   ========================================================= */

const form = document.getElementById("formIngresoStock");

const productoSelect = document.getElementById("producto");
const loteInput = document.getElementById("lote");
const ubicacionSelect = document.getElementById("ubicacion");
const cantidadInput = document.getElementById("cantidad");
const unidadSelect = document.getElementById("unidad");
const fechaInput = document.getElementById("fecha");
const observacionInput = document.getElementById("observacion");


/* =========================================================
   VARIABLES
   ========================================================= */

let productos = [];
let ubicaciones = [];


/* =========================================================
   FECHA ACTUAL
   ========================================================= */

function ponerFechaActual() {

    const hoy = new Date();

    const año = hoy.getFullYear();

    const mes = String(hoy.getMonth() + 1).padStart(2, "0");

    const dia = String(hoy.getDate()).padStart(2, "0");

    fechaInput.value = `${año}-${mes}-${dia}`;
}


/* =========================================================
   CARGAR PRODUCTOS
   ========================================================= */

async function cargarProductos() {

    try {

        const snapshot = await getDocs(
            collection(db, "productos")
        );

        productos = [];

        snapshot.forEach(docSnap => {

            const datos = docSnap.data();

            productos.push({
                id: docSnap.id,
                ...datos
            });

        });

        productos.sort((a, b) => {

            const nombreA =
                a.descripcion ||
                a.nombre ||
                "";

            const nombreB =
                b.descripcion ||
                b.nombre ||
                "";

            return nombreA.localeCompare(nombreB);

        });


        productoSelect.innerHTML = `
            <option value="">
                Seleccionar producto
            </option>
        `;


        productos.forEach(producto => {

            const option =
                document.createElement("option");

            option.value = producto.id;

            option.textContent =
                producto.descripcion ||
                producto.nombre ||
                "Producto sin nombre";

            productoSelect.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Error cargando productos:",
            error
        );

        alert(
            "No se pudieron cargar los productos."
        );

    }

}


/* =========================================================
   CARGAR UBICACIONES
   ========================================================= */

async function cargarUbicaciones() {

    try {

        const snapshot = await getDocs(
            collection(db, "ubicaciones")
        );

        ubicaciones = [];

        snapshot.forEach(docSnap => {

            const datos = docSnap.data();

            if (datos.activo !== false) {

                ubicaciones.push({
                    id: docSnap.id,
                    ...datos
                });

            }

        });


        ubicaciones.sort((a, b) =>
            (a.nombre || "").localeCompare(
                b.nombre || ""
            )
        );


        ubicacionSelect.innerHTML = `
            <option value="">
                Seleccionar ubicación
            </option>
        `;


        ubicaciones.forEach(ubicacion => {

            const option =
                document.createElement("option");

            option.value = ubicacion.id;

            option.textContent =
                ubicacion.nombre ||
                "Ubicación sin nombre";

            ubicacionSelect.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Error cargando ubicaciones:",
            error
        );

        alert(
            "No se pudieron cargar las ubicaciones."
        );

    }

}


/* =========================================================
   CAMBIO DE PRODUCTO
   ========================================================= */

productoSelect.addEventListener(
    "change",
    () => {

        const productoId =
            productoSelect.value;

        if (!productoId) {
            return;
        }


        const producto =
            productos.find(
                p => p.id === productoId
            );


        if (!producto) {
            return;
        }


        /*
         Si el producto tiene una unidad
         definida, intentamos seleccionarla
         automáticamente.
        */

        if (producto.unidad) {

            const unidadProducto =
                producto.unidad.toLowerCase();

            const opciones =
                Array.from(
                    unidadSelect.options
                );

            const opcion =
                opciones.find(
                    option =>
                        option.value.toLowerCase() ===
                        unidadProducto
                );

            if (opcion) {

                unidadSelect.value =
                    opcion.value;

            }

        }

    }
);


/* =========================================================
   BUSCAR STOCK EXISTENTE
   ========================================================= */

async function buscarStockExistente(
    productoId,
    ubicacionId,
    lote
) {

    const q = query(
        collection(db, "stock"),
        where(
            "productoId",
            "==",
            productoId
        ),
        where(
            "ubicacionID",
            "==",
            ubicacionId
        ),
        where(
            "lote",
            "==",
            lote
        )
    );


    const snapshot =
        await getDocs(q);


    if (snapshot.empty) {

        return null;

    }


    return snapshot.docs[0];

}


/* =========================================================
   REGISTRAR INGRESO
   ========================================================= */

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        /* =========================
           DATOS DEL FORMULARIO
           ========================= */

        const productoId =
            productoSelect.value;

        const lote =
            loteInput.value.trim();

        const ubicacionId =
            ubicacionSelect.value;

        const cantidad =
            Number(cantidadInput.value);

        const unidad =
            unidadSelect.value;

        const fecha =
            fechaInput.value;

        const observacion =
            observacionInput.value.trim();


        /* =========================
           VALIDACIONES
           ========================= */

        if (!productoId) {

            alert(
                "Seleccioná un producto."
            );

            return;

        }


        if (!lote) {

            alert(
                "Ingresá el lote."
            );

            loteInput.focus();

            return;

        }


        if (!ubicacionId) {

            alert(
                "Seleccioná una ubicación."
            );

            return;

        }


        if (
            !cantidad ||
            cantidad <= 0
        ) {

            alert(
                "Ingresá una cantidad válida."
            );

            cantidadInput.focus();

            return;

        }


        if (!unidad) {

            alert(
                "Seleccioná la unidad."
            );

            return;

        }


        if (!fecha) {

            alert(
                "Seleccioná la fecha de ingreso."
            );

            return;

        }


        /* =========================
           BUSCAR PRODUCTO
           ========================= */

        const producto =
            productos.find(
                p => p.id === productoId
            );


        if (!producto) {

            alert(
                "No se encontró el producto seleccionado."
            );

            return;

        }


        const productoNombre =
            producto.descripcion ||
            producto.nombre ||
            "";


        /* =========================
           BUSCAR UBICACIÓN
           ========================= */

        const ubicacion =
            ubicaciones.find(
                u => u.id === ubicacionId
            );


        if (!ubicacion) {

            alert(
                "No se encontró la ubicación seleccionada."
            );

            return;

        }


        const ubicacionNombre =
            ubicacion.nombre ||
            "";


        /* =========================
           DESHABILITAR BOTÓN
           ========================= */

        const botonGuardar =
            form.querySelector(
                ".btn-guardar"
            );

        const textoOriginal =
            botonGuardar.textContent;

        botonGuardar.disabled = true;

        botonGuardar.textContent =
            "⏳ Guardando...";


        try {


            /* =================================================
               1. REGISTRAR MOVIMIENTO
               ================================================= */

            /*
             Convertimos la fecha del formulario
             a Timestamp de Firestore.

             Usamos mediodía para evitar problemas
             de cambio de día por zona horaria.
            */

            const fechaMovimiento =
                Timestamp.fromDate(
                    new Date(
                        `${fecha}T12:00:00`
                    )
                );


            await addDoc(
                collection(
                    db,
                    "movimientos_stock"
                ),
                {

                    tipo: "INGRESO",

                    productoId:
                        productoId,

                    productoNombre:
                        productoNombre,

                    lote:
                        lote,

                    ubicacionOrigenId:
                        "",

                    ubicacionOrigenNombre:
                        "",

                    ubicacionDestinoId:
                        ubicacionId,

                    ubicacionDestinoNombre:
                        ubicacionNombre,

                    cantidad:
                        cantidad,

                    unidad:
                        unidad,

                    fecha:
                        fechaMovimiento,

                    observacion:
                        observacion

                }
            );


            /* =================================================
               2. BUSCAR SI YA EXISTE EL MISMO LOTE
               ================================================= */

            const stockExistente =
                await buscarStockExistente(
                    productoId,
                    ubicacionId,
                    lote
                );


            /* =================================================
               3. ACTUALIZAR STOCK EXISTENTE
               ================================================= */

            if (stockExistente) {

                const datosStock =
                    stockExistente.data();


                const cantidadAnterior =
                    Number(
                        datosStock.cantidad || 0
                    );


                const nuevaCantidad =
                    cantidadAnterior +
                    cantidad;


                await updateDoc(
                    doc(
                        db,
                        "stock",
                        stockExistente.id
                    ),
                    {

                        cantidad:
                            nuevaCantidad,

                        /*
                         Mantenemos los datos
                         actualizados.
                        */

                        productoNombre:
                            productoNombre,

                        ubicacionID:
                            ubicacionId,

                        ubicacionNombre:
                            ubicacionNombre,

                        unidad:
                            unidad,

                        lote:
                            lote

                    }
                );


            } else {


                /* =================================================
                   4. CREAR NUEVA EXISTENCIA
                   ================================================= */

                await addDoc(
                    collection(
                        db,
                        "stock"
                    ),
                    {

                        productoId:
                            productoId,

                        productoNombre:
                            productoNombre,

                        ubicacionID:
                            ubicacionId,

                        ubicacionNombre:
                            ubicacionNombre,

                        lote:
                            lote,

                        cantidad:
                            cantidad,

                        unidad:
                            unidad

                    }
                );

            }


            /* =================================================
               5. AVISAR QUE TERMINÓ
               ================================================= */

            alert(
                "✅ Ingreso de stock registrado correctamente."
            );


            /* =================================================
               6. VOLVER A STOCK
               ================================================= */

            window.location.href =
                "stock.html";


        } catch (error) {

            console.error(
                "Error registrando ingreso:",
                error
            );


            alert(
                "❌ Ocurrió un error al registrar el ingreso.\n\n" +
                "Revisá la consola del navegador para más información."
            );


            botonGuardar.disabled =
                false;

            botonGuardar.textContent =
                textoOriginal;

        }

    }
);


/* =========================================================
   INICIAR
   ========================================================= */

async function iniciar() {

    ponerFechaActual();

    await cargarProductos();

    await cargarUbicaciones();

}


iniciar();
