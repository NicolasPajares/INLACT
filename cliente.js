import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
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


        if (!snap.exists()) {

            nombreEl.textContent =
                "Cliente no encontrado";

            return;

        }


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

        ].forEach(input => {

            input.hidden = !editable;

        });


        [
            contactoTxt,
            posicionTxt,
            telefonoTxt,
            emailTxt,
            observacionesTxt

        ].forEach(texto => {

            texto.hidden = editable;

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
     * ORDEN NATURAL DE PRODUCTOS
     * ============================================================
     *
     * FAST 01
     * FAST 02
     * FAST 10
     *
     * El número se interpreta correctamente.
     * ============================================================
     */

    function compararProductos(a, b) {

        const nombreA =
            String(
                a.nombre || ""
            ).trim();

        const nombreB =
            String(
                b.nombre || ""
            ).trim();


        return nombreA.localeCompare(
            nombreB,
            "es",
            {
                numeric: true,
                sensitivity: "base"
            }
        );

    }


    /*
     * ============================================================
     * FECHA VISITA
     * ============================================================
     */

    function obtenerFechaVisita(v) {

        if (
            v.fecha &&
            typeof v.fecha.toDate ===
            "function"
        ) {

            return v.fecha.toDate();

        }


        if (v.fecha) {

            const fecha =
                new Date(v.fecha);


            if (
                !isNaN(
                    fecha.getTime()
                )
            ) {

                return fecha;

            }

        }


        return null;

    }


    /*
     * ============================================================
     * FECHA VENTA
     * ============================================================
     */

    function obtenerFechaVenta(e) {

        if (
            e.fecha &&
            typeof e.fecha.toDate ===
            "function"
        ) {

            return e.fecha.toDate();

        }


        if (e.fecha) {

            const fecha =
                new Date(
                    `${e.fecha}T00:00:00`
                );


            if (
                !isNaN(
                    fecha.getTime()
                )
            ) {

                return fecha;

            }

        }


        if (
            e.creadoEn &&
            typeof e.creadoEn.toDate ===
            "function"
        ) {

            return e.creadoEn.toDate();

        }


        return null;

    }


    /*
     * ============================================================
     * MOSTRAR FECHA
     * ============================================================
     */

    function mostrarFecha(fecha) {

        if (!fecha) {

            return "Sin fecha";

        }


        return fecha.toLocaleString(
            "es-AR",
            {

                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"

            }
        );

    }


    /*
     * ============================================================
     * CARGAR HISTORIAL
     * ============================================================
     */

    async function cargarVisitas() {

        visitasEl.innerHTML =
            "Cargando historial...";


        try {

            /*
             * ==================================================
             * VISITAS
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
             * EGRESOS
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
             * HISTORIAL
             * ==================================================
             */

            const historial =
                [];


            /*
             * ==================================================
             * VISITAS NORMALES
             * ==================================================
             */

            snapVisitas.forEach(
                docSnap => {

                    const v =
                        docSnap.data();


                    /*
                     * La venta se toma
                     * solamente desde EGRESOS.
                     */

                    if (
                        v.tipoVisita ===
                        "Venta"
                    ) {

                        return;

                    }


                    const fecha =
                        obtenerFechaVisita(
                            v
                        );


                    historial.push({

                        tipo:
                            "visita",

                        fechaOrden:
                            fecha
                                ? fecha.getTime()
                                : 0,

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

            const ventas =
                [];


            snapEgresos.forEach(
                docSnap => {

                    const e =
                        docSnap.data();


                    if (
                        e.tipoEgreso !==
                        "venta"
                    ) {

                        return;

                    }


                    const fecha =
                        obtenerFechaVenta(
                            e
                        );


                    ventas.push({

                        id:
                            docSnap.id,

                        fecha:
                            e.fecha ||
                            null,

                        fechaOrden:
                            fecha
                                ? fecha.getTime()
                                : 0,

                        datos:
                            e

                    });

                }
            );


            /*
             * ==================================================
             * AGRUPAR VENTAS POR FECHA
             * ==================================================
             */

            const ventasAgrupadas =
                new Map();


            ventas.forEach(
                venta => {

                    const e =
                        venta.datos;


                    const clave =
                        e.fecha ||
                        (
                            venta.fechaOrden
                                ? new Date(
                                    venta.fechaOrden
                                )
                                    .toISOString()
                                    .slice(
                                        0,
                                        10
                                    )
                                : "sin-fecha"
                        );


                    if (
                        !ventasAgrupadas.has(
                            clave
                        )
                    ) {

                        ventasAgrupadas.set(
                            clave,
                            {

                                tipo:
                                    "venta",

                                fechaOrden:
                                    venta.fechaOrden,

                                fecha:
                                    e.fecha,

                                productos:
                                    []

                            }
                        );

                    }


                    const grupo =
                        ventasAgrupadas.get(
                            clave
                        );


                    grupo.productos.push({

                        nombre:
                            e.productoNombre ||
                            "Producto sin nombre",

                        cantidad:
                            e.cantidad,

                        unidad:
                            e.unidad ||
                            "",

                        lote:
                            e.lote ||
                            ""

                    });


                    if (
                        venta.fechaOrden >
                        grupo.fechaOrden
                    ) {

                        grupo.fechaOrden =
                            venta.fechaOrden;

                    }

                }
            );


            /*
             * ==================================================
             * AGREGAR VENTAS
             * ==================================================
             */

            ventasAgrupadas.forEach(
                grupo => {

                    grupo.productos.sort(
                        compararProductos
                    );


                    historial.push(
                        grupo
                    );

                }
            );


            /*
             * ==================================================
             * ORDENAR HISTORIAL
             * ==================================================
             */

            historial.sort(
                (a, b) =>
                    b.fechaOrden -
                    a.fechaOrden
            );


            /*
             * ==================================================
             * LIMPIAR
             * ==================================================
             */

            visitasEl.innerHTML =
                "";


            if (
                historial.length ===
                0
            ) {

                visitasEl.innerHTML =
                    "<p>No hay registros en el historial.</p>";

                return;

            }


            /*
             * ==================================================
             * MOSTRAR
             * ==================================================
             */

            historial.forEach(
                registro => {

                    /*
                     * ==========================================
                     * VISITA / ENSAYO
                     * ==========================================
                     */

                    if (
                        registro.tipo ===
                        "visita"
                    ) {

                        const v =
                            registro.datos;


                        const fecha =
                            obtenerFechaVisita(
                                v
                            );


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

                        else if (
                            tipo ===
                            "Ensayo"
                        ) {

                            clase =
                                "ensayo";

                        }

                        else if (
                            tipo ===
                            "Entrega de productos"
                        ) {

                            clase =
                                "entrega";

                        }


                        let productosHTML =
                            "";


                        if (
                            Array.isArray(
                                v.productos
                            ) &&
                            v.productos.length
                        ) {

                            const productos =
                                [
                                    ...v.productos
                                ];


                            productos.sort(
                                compararProductos
                            );


                            productosHTML =
                                productos
                                    .map(
                                        producto => `

                                            <div class="producto">

                                                📦
                                                ${String(
                                                    producto.nombre ||
                                                    "Producto sin nombre"
                                                )}

                                                ${
                                                    producto.cantidad
                                                        ? `(${producto.cantidad})`
                                                        : ""
                                                }

                                            </div>

                                        `
                                    )
                                    .join(
                                        ""
                                    );

                        }


                        const div =
                            document.createElement(
                                "div"
                            );


                        div.className =
                            "visita";


                        div.innerHTML = `

                            <div class="fecha">

                                ${mostrarFecha(
                                    fecha
                                )}

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

                    else if (
                        registro.tipo ===
                        "venta"
                    ) {

                        const productos =
                            [
                                ...registro.productos
                            ];


                        /*
                         * ORDEN ALFABÉTICO
                         * + NUMÉRICO
                         */

                        productos.sort(
                            compararProductos
                        );


                        /*
                         * ==================================================
                         * IMPORTANTE:
                         *
                         * Cada producto es UNA SOLA FILA.
                         *
                         * PC:
                         * Producto | Cantidad | Lote
                         *
                         * Celular:
                         * el CSS podrá apilar las columnas.
                         * ==================================================
                         */

                        const productosHTML =
                            productos
                                .map(
                                    producto => `

                                        <div class="producto-venta">

                                            <span class="col-producto">

                                                📦
                                                ${String(
                                                    producto.nombre ||
                                                    "Producto sin nombre"
                                                )}

                                            </span>


                                            <span class="col-cantidad">

                                                ⚖️
                                                ${String(
                                                    producto.cantidad ??
                                                    ""
                                                )}
                                                ${String(
                                                    producto.unidad ||
                                                    ""
                                                )}

                                            </span>


                                            <span class="col-lote">

                                                🏷️
                                                ${String(
                                                    producto.lote ||
                                                    ""
                                                )}

                                            </span>

                                        </div>

                                    `
                                )
                                .join(
                                    ""
                                );


                        /*
                         * VENTA EN VERDE
                         * SIN EMOJI EN EL TÍTULO
                         */

                        const div =
                            document.createElement(
                                "div"
                            );


                        div.className =
                            "visita";


                        let fechaTexto =
                            "Sin fecha";


                        if (
                            registro.fecha
                        ) {

                            const fecha =
                                new Date(
                                    registro.fecha +
                                    "T00:00:00"
                                );


                            if (
                                !isNaN(
                                    fecha.getTime()
                                )
                            ) {

                                fechaTexto =
                                    fecha.toLocaleDateString(
                                        "es-AR"
                                    );

                            }

                        }


                        div.innerHTML = `

                            <div class="fecha">

                                ${fechaTexto}

                            </div>


                            <span class="badge entrega">

                                Venta

                            </span>


                            <div class="productos-venta">

                                ${productosHTML}

                            </div>

                        `;


                        visitasEl.appendChild(
                            div
                        );

                    }

                }
            );


        }

        catch (error) {

            console.error(
                "Error cargando historial del cliente:",
                error
            );


            visitasEl.innerHTML =
                "<p>No se pudo cargar el historial.</p>";

        }

    }

});
