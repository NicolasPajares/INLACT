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
 * CONFIG FIREBASE
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


const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);


/************************************************************
 * ELEMENTOS DOM
 ************************************************************/

const form =
    document.getElementById(
        "formNuevaCotizacion"
    );

const selectCliente =
    document.getElementById(
        "cliente"
    );

const fechaEl =
    document.getElementById(
        "fecha"
    );

const nombreCotizacionEl =
    document.getElementById(
        "nombreCotizacion"
    );

const propuestaEl =
    document.getElementById(
        "propuesta"
    );

const dosisEl =
    document.getElementById(
        "dosis"
    );

const cotizacionEl =
    document.getElementById(
        "cotizacion"
    );

const observacionesEl =
    document.getElementById(
        "observaciones"
    );


/************************************************************
 * CARGAR CLIENTES
 ************************************************************/

async function cargarClientes() {

    try {

        const snap =
            await getDocs(
                collection(
                    db,
                    "clientes"
                )
            );


        snap.forEach(
            docu => {

                const cliente =
                    docu.data();


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    docu.id;


                option.textContent =
                    cliente.nombre ||
                    "Cliente sin nombre";


                option.dataset.nombre =
                    cliente.nombre ||
                    "";


                selectCliente.appendChild(
                    option
                );

            }
        );

    }

    catch (error) {

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

            const clienteOption =
                selectCliente.options[
                    selectCliente.selectedIndex
                ];


            if (
                !selectCliente.value
            ) {

                alert(
                    "Seleccioná un cliente."
                );

                selectCliente.focus();

                return;

            }


            /************************************************
             * FECHA
             ************************************************/

            if (
                !fechaEl.value
            ) {

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
                nombreCotizacionEl.value
                    .trim();


            if (
                !nombreCotizacion
            ) {

                alert(
                    "Ingresá el nombre de la cotización."
                );

                nombreCotizacionEl.focus();

                return;

            }


            /************************************************
             * COTIZACIÓN
             ************************************************/

            const cotizacion =
                cotizacionEl.value
                    .trim();


            if (
                !cotizacion
            ) {

                alert(
                    "Ingresá los productos y precios de la cotización."
                );

                cotizacionEl.focus();

                return;

            }


            /************************************************
             * FECHA FIREBASE
             ************************************************/

            const partes =
                fechaEl.value.split("-");


            const año =
                Number(
                    partes[0]
                );


            const mes =
                Number(
                    partes[1]
                ) - 1;


            const dia =
                Number(
                    partes[2]
                );


            const fechaCotizacion =
                new Date(
                    año,
                    mes,
                    dia,
                    12,
                    0,
                    0
                );


            /************************************************
             * DATOS
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
                    propuestaEl.value ||
                    "",

                dosis:
                    dosisEl.value ||
                    "",

                cotizacion:
                    cotizacion,

                observaciones:
                    observacionesEl.value ||
                    "",

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
             * GUARDAR EN FIRESTORE
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
 * FECHA POR DEFECTO
 ************************************************************/

function establecerFechaActual() {

    if (
        fechaEl.value
    ) {

        return;

    }


    const hoy =
        new Date();


    const año =
        hoy.getFullYear();


    const mes =
        String(
            hoy.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            hoy.getDate()
        ).padStart(
            2,
            "0"
        );


    fechaEl.value =
        `${año}-${mes}-${dia}`;

}


/************************************************************
 * INICIO
 ************************************************************/

async function iniciar() {

    establecerFechaActual();

    await cargarClientes();

}


iniciar();
