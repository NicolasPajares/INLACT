import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    orderBy,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", async () => {

    const clienteId =
        new URLSearchParams(window.location.search).get("id");


    const nombreEl =
        document.getElementById("clienteNombre");


    const contactoTxt =
        document.getElementById("contactoTxt");

    const posicionTxt =
        document.getElementById("posicionTxt");

    const telefonoTxt =
        document.getElementById("telefonoTxt");

    const emailTxt =
        document.getElementById("emailTxt");

    const observacionesTxt =
        document.getElementById("observacionesTxt");


    const contactoInput =
        document.getElementById("contactoInput");

    const posicionInput =
        document.getElementById("posicionInput");

    const telefonoInput =
        document.getElementById("telefonoInput");

    const emailInput =
        document.getElementById("emailInput");

    const observacionesInput =
        document.getElementById("observacionesInput");


    const editarBtn =
        document.getElementById("editarBtn");

    const guardarBtn =
        document.getElementById("guardarBtn");


    const wspLink =
        document.getElementById("wspLink");

    const mailLink =
        document.getElementById("mailLink");


    const visitasEl =
        document.getElementById("listaVisitasCliente");


    let clienteRef;


    /*
     * ============================================================
     * CARGA INICIAL
     * ============================================================
     */

    await cargarCliente();

    await cargarVisitas();


    /*
     * ============================================================
     * DATOS CLIENTE
     * ============================================================
     */

    async function cargarCliente() {

        clienteRef =
            doc(
                db,
                "clientes",
                clienteId
            );


        const snap =
            await getDoc(clienteRef);


        const c =
            snap.data();


        nombreEl.textContent =
            c.nombre || "";


        contactoTxt.textContent =
            c.contacto || "-";

        posicionTxt.textContent =
            c.posicion || "-";

        telefonoTxt.textContent =
            c.telefono || "-";

        emailTxt.textContent =
            c.email || "-";

        observacionesTxt.textContent =
            c.observaciones || "-";


        contactoInput.value =
            c.contacto || "";

        posicionInput.value =
            c.posicion || "";

        telefonoInput.value =
            c.telefono || "";

        emailInput.value =
            c.email || "";

        observacionesInput.value =
            c.observaciones || "";


        actualizarLinks();

        modoLectura();

    }


    /*
     * ============================================================
     * MODO LECTURA
     * ============================================================
     */

    function modoLectura() {

        toggleInputs(false);

        editarBtn.hidden = false;

        guardarBtn.hidden = true;

    }


    /*
     * ============================================================
     * MODO EDICIÓN
     * ============================================================
     */

    function modoEdicion() {

        toggleInputs(true);

        editarBtn.hidden = true;

        guardarBtn.hidden = false;

    }


    /*
     * ============================================================
     * MOSTRAR / OCULTAR INPUTS
     * ============================================================
     */

    function toggleInputs(editable) {

        [
            contactoInput,
            posicionInput,
            telefonoInput,
            emailInput,
            observacionesInput

        ].forEach(i => {

            i.hidden = !editable;

        });


        [
            contactoTxt,
            posicionTxt,
            telefonoTxt,
            emailTxt,
            observacionesTxt

        ].forEach(t => {

            t.hidden = editable;

        });

    }


    editarBtn.onclick =
        modoEdicion;


    /*
     * ============================================================
     * GUARDAR CAMBIOS CLIENTE
     * ============================================================
     */

    guardarBtn.onclick =
        async () => {

            await updateDoc(
                clienteRef,
                {

                    contacto:
                        contactoInput.value,

                    posicion:
                        posicionInput.value,

                    telefono:
                        telefonoInput.value,

                    email:
                        emailInput.value,

                    observaciones:
                        observacionesInput.value

                }
            );


            await cargarCliente();


            alert(
                "Cambios guardados ✔"
            );

        };


    /*
     * ============================================================
     * LINKS WHATSAPP / EMAIL
     * ============================================================
     */

    function actualizarLinks() {

        const tel =
            telefonoInput.value
                .replace(/\D/g, "");


        wspLink.textContent =
            tel
                ? "WhatsApp"
                : "";


        wspLink.href =
            tel
                ? `https://wa.me/54${tel}`
                : "";


        mailLink.textContent =
            emailInput.value
                ? "Email"
                : "";


        mailLink.href =
            emailInput.value
                ? `mailto:${emailInput.value}`
                : "";

    }


    /*
     * ============================================================
     * HISTORIAL CLIENTE
     *
     * AHORA CARGA:
     *
     * 1. VISITAS COMERCIALES
     * 2. VENTAS DESDE EGRESOS
     *
     * Más adelante agregaremos:
     * 3. ENSAYOS
     * 4. COTIZACIONES
     * ============================================================
     */

    async function cargarVisitas() {

        visitasEl.innerHTML =
            "Cargando historial...";


        try {

            /*
             * ==================================================
             * 1. CARGAR VISITAS
             * ==================================================
             */

            const qVisitas =
                query(
                    collection(
                        db,
                        "visitas"
                    ),
                    where(
                        "clienteId",
                        "==",
                        clienteId
                    )
                );


            const snapVisitas =
                await getDocs(
                    qVisitas
                );


            /*
             * ==================================================
             * 2. CARGAR EGRESOS / VENTAS
             * ==================================================
             */

            const qEgresos =
                query(
                    collection(
                        db,
                        "egresos"
                    ),
                    where(
                        "clienteId",
                        "==",
                        clienteId
                    )
                );


            const snapEgresos =
                await getDocs(
                    qEgresos
                );


            /*
             * ==================================================
             * 3. CREAR HISTORIAL UNIFICADO
             * ==================================================
             */

            const historial = [];


            /*
             * ==================================================
             * VISITAS
             * ==================================================
             */

            snapVisitas.forEach(
                docSnap => {

                    const v =
                        docSnap.data();


                    /*
                     * Fecha
                     */

                    let fechaOrden =
                        0;


                    if (
                        v.fecha &&
                        typeof v.fecha.toDate ===
                        "function"
                    ) {

                        fechaOrden =
                            v.fecha.toDate()
                                .getTime();

                    }


                    /*
                     * Compatibilidad con
                     * fecha en texto
                     */

                    else if (
                        v.fecha
                    ) {

                        const fechaTexto =
                            new Date(
                                v.fecha
                            );


                        if (
                            !isNaN(
                                fechaTexto.getTime()
                            )
                        ) {

                            fechaOrden =
                                fechaTexto.getTime();

                        }

                    }


                    historial.push({

                        tipo:
                            "visita",

                        fechaOrden:
                            fechaOrden,

                        datos:
                            v

                    });

                }
            );


            /*
             * ==================================================
             * VENTAS
             * ==================================================
             */

            snapEgresos.forEach(
                docSnap => {

                    const e =
                        docSnap.data();


                    /*
                     * Solo los egresos que
                     * realmente sean ventas.
                     */

                    if (
                        e.tipoEgreso !==
                        "venta"
                    ) {

                        return;

                    }


                    /*
                     * La fecha del egreso
                     * se guarda como texto:
                     *
                     * YYYY-MM-DD
                     */

                    let fechaOrden =
                        0;


                    if (
                        e.fecha
                    ) {

                        const fechaTexto =
                            new Date(
                                e.fecha +
                                "T00:00:00"
                            );


                        if (
                            !isNaN(
                                fechaTexto.getTime()
                            )
                        ) {

                            fechaOrden =
                                fechaTexto.getTime();

                        }

                    }


                    /*
                     * Si existe creadoEn,
                     * lo usamos como respaldo.
                     */

                    if (
                        !fechaOrden &&
                        e.creadoEn &&
                        typeof e.creadoEn.toDate ===
                        "function"
                    ) {

                        fechaOrden =
                            e.creadoEn
                                .toDate()
                                .getTime();

                    }


                    historial.push({

                        tipo:
                            "venta",

                        fechaOrden:
                            fechaOrden,

                        datos:
                            e

                    });

                }
            );


            /*
             * ==================================================
             * ORDENAR TODO POR FECHA
             * ==================================================
             *
             * Lo más nuevo primero.
             */

            historial.sort(
                (a, b) =>
                    b.fechaOrden -
                    a.fechaOrden
            );


            /*
             * ==================================================
             * LIMPIAR HISTORIAL
             * ==================================================
             */

            visitasEl.innerHTML =
                "";


            /*
             * ==================================================
             * SIN HISTORIAL
             * ==================================================
             */

            if (
                historial.length === 0
            ) {

                visitasEl.innerHTML =
                    "<p>No hay registros en el historial.</p>";

                return;

            }


            /*
             * ==================================================
             * MOSTRAR HISTORIAL
             * ==================================================
             */

            historial.forEach(
                registro => {

                    /*
                     * ==========================================
                     * VISITA COMERCIAL
                     * ==========================================
                     */

                    if (
                        registro.tipo ===
                        "visita"
                    ) {

                        const v =
                            registro.datos;


                        let fecha =
                            "Sin fecha";


                        if (
                            v.fecha &&
                            typeof v.fecha.toDate ===
                            "function"
                        ) {

                            fecha =
                                v.fecha
                                    .toDate()
                                    .toLocaleString(
                                        "es-AR"
                                    );

                        }

                        else if (
                            v.fecha
                        ) {

                            fecha =
                                v.fecha;

                        }


                        const tipo =
                            v.tipoVisita ||
                            "Visita comercial";


                        let clase =
                            "";


                        if (
                            tipo ===
                            "Visita comercial"
                        ) {

                            clase =
                                "comercial";

                        }


                        if (
                            tipo ===
                            "Ensayo"
                        ) {

                            clase =
                                "ensayo";

                        }


                        if (
                            tipo ===
                            "Entrega de productos"
                        ) {

                            clase =
                                "entrega";

                        }


                        let productosHTML =
                            "";


                        if (
                            tipo ===
                            "Entrega de productos" &&
                            Array.isArray(
                                v.productos
                            )
                        ) {

                            productosHTML =
                                v.productos
                                    .map(
                                        p =>
                                            `<div class="producto">📦 ${p.nombre} ${p.cantidad ? `(${p.cantidad})` : ""}</div>`
                                    )
                                    .join("");

                        }


                        const div =
                            document.createElement(
                                "div"
                            );


                        div.className =
                            "visita";


                        div.innerHTML = `

                            <div class="fecha">
                                ${fecha}
                            </div>

                            <span class="badge ${clase}">
                                ${tipo}
                            </span>

                            ${productosHTML}

                        `;


                        visitasEl.appendChild(
                            div
                        );

                    }


                    /*
                     * ==========================================
                     * VENTA
                     * ==========================================
                     */

                    if (
                        registro.tipo ===
                        "venta"
                    ) {

                        const e =
                            registro.datos;


                        /*
                         * Formatear fecha
                         */

                        let fecha =
                            "Sin fecha";


                        if (
                            e.fecha
                        ) {

                            const fechaTexto =
                                new Date(
                                    e.fecha +
                                    "T00:00:00"
                                );


                            if (
                                !isNaN(
                                    fechaTexto.getTime()
                                )
                            ) {

                                fecha =
                                    fechaTexto
                                        .toLocaleDateString(
                                            "es-AR"
                                        );

                            }

                            else {

                                fecha =
                                    e.fecha;

                            }

                        }


                        /*
                         * Crear elemento
                         */

                        const div =
                            document.createElement(
                                "div"
                            );


                        /*
                         * Usamos la misma clase
                         * "visita" para no necesitar
                         * modificar el CSS existente.
                         */

                        div.className =
                            "visita";


                        div.innerHTML = `

                            <div class="fecha">
                                ${fecha}
                            </div>

                            <span class="badge entrega">
                                Venta
                            </span>

                            <div class="producto">
                                📦 ${
                                    e.productoNombre ||
                                    "Producto sin nombre"
                                }
                            </div>

                            <div class="producto">
                                🔢 ${
                                    e.cantidad ||
                                    0
                                } ${
                                    e.unidad ||
                                    ""
                                }
                            </div>

                            <div class="producto">
                                🏷️ Lote: ${
                                    e.lote ||
                                    "Sin lote"
                                }
                            </div>

                            <div class="producto">
                                📍 ${
                                    e.ubicacionNombre ||
                                    "Sin ubicación"
                                }
                            </div>

                            ${
                                e.observacion
                                ? `
                                    <div class="producto">
                                        📝 ${e.observacion}
                                    </div>
                                `
                                : ""
                            }

                        `;


                        visitasEl.appendChild(
                            div
                        );

                    }

                }
            );


        } catch (error) {

            console.error(
                "Error cargando historial del cliente:",
                error
            );


            /*
             * No modificamos los datos
             * del cliente ni las ventas.
             *
             * Solo mostramos el error
             * en el historial.
             */

            visitasEl.innerHTML =
                "<p>No se pudo cargar el historial.</p>";

        }

    }

});
