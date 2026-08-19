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
     * FECHA PARA ORDENAR
     * ============================================================
     */

    function obtenerFechaOrden(item) {

        if (
            item.fecha &&
            typeof item.fecha.toDate ===
            "function"
        ) {

            return item.fecha.toDate();

        }


        if (
            typeof item.fecha === "string" &&
            item.fecha.trim() !== ""
        ) {

            /*
             * Formato YYYY-MM-DD
             */

            const partes =
                item.fecha.split("-");


            if (
                partes.length === 3 &&
                partes[0].length === 4
            ) {

                const año =
                    Number(partes[0]);

                const mes =
                    Number(partes[1]) - 1;

                const dia =
                    Number(partes[2]);


                return new Date(
                    año,
                    mes,
                    dia
                );

            }


            const fecha =
                new Date(
                    item.fecha
                );


            if (
                !isNaN(
                    fecha.getTime()
                )
            ) {

                return fecha;

            }

        }


        /*
         * creadoEn como respaldo
         */

        if (
            item.creadoEn &&
            typeof item.creadoEn.toDate ===
            "function"
        ) {

            return item.creadoEn.toDate();

        }


        return null;

    }


    /*
     * ============================================================
     * FECHA PARA MOSTRAR
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
     * ESCAPAR HTML
     * ============================================================
     */

    function escaparHTML(texto) {

        return String(
            texto ?? ""
        )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

    }


    /*
     * ============================================================
     * NORMALIZAR EGRESO
     * ============================================================
     */

    function convertirEgresoAProducto(egreso) {

        return {

            nombre:
                egreso.productoNombre ||
                "Producto sin nombre",

            cantidad:
                egreso.cantidad ??
                "",

            unidad:
                egreso.unidad ||
                "",

            lote:
                egreso.lote ||
                ""

        };

    }


    /*
     * ============================================================
     * CARGAR HISTORIAL DEL CLIENTE
     *
     * VISITAS
     * VENTAS
     *
     * Las ventas se agrupan cuando pertenecen
     * a la misma entrega.
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
             * HISTORIAL GENERAL
             * ==================================================
             */

            const historial = [];


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
                     * Las ventas NO se toman desde visitas.
                     *
                     * La venta verdadera se obtiene
                     * desde egresos.
                     */

                    if (
                        v.tipoVisita ===
                        "Venta"
                    ) {

                        return;

                    }


                    const fecha =
                        obtenerFechaOrden(v);


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
             *
             * AGRUPAR POR ENTREGA
             * ==================================================
             */

            const ventas = [];


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
                        obtenerFechaOrden(e);


                    ventas.push({

                        id:
                            docSnap.id,

                        fecha:
                            fecha,

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
             * AGRUPAR VENTAS
             *
             * Primero intentamos utilizar
             * un identificador de agrupación
             * si existe.
             *
             * Si no existe, usamos:
             *
             * cliente + fecha
             *
             * Esto permite que las ventas
             * antiguas sigan funcionando.
             * ==================================================
             */

            const gruposVentas =
                new Map();


            ventas.forEach(
                venta => {

                    const e =
                        venta.datos;


                    /*
                     * Posibles identificadores
                     * utilizados por distintas
                     * versiones de egreso-stock.
                     */

                    const grupoId =
                        e.ventaId ||
                        e.egresoGrupoId ||
                        e.entregaId ||
                        e.grupoVentaId ||
                        e.ventaGrupoId;


                    let clave;


                    if (
                        grupoId
                    ) {

                        clave =
                            `grupo-${grupoId}`;

                    }

                    else {

                        /*
                         * Para ventas sin identificador:
                         * agrupamos por fecha de entrega.
                         */

                        const fecha =
                            e.fecha ||
                            "";


                        clave =
                            `fecha-${fecha}`;

                    }


                    if (
                        !gruposVentas.has(
                            clave
                        )
                    ) {

                        gruposVentas.set(
                            clave,
                            {

                                tipo:
                                    "venta",

                                fechaOrden:
                                    venta.fechaOrden,

                                fecha:
                                    venta.fecha,

                                productos:
                                    []

                            }
                        );

                    }


                    const grupo =
                        gruposVentas.get(
                            clave
                        );


                    /*
                     * Si encontramos una venta
                     * con fecha más precisa,
                     * usamos esa fecha.
                     */

                    if (
                        venta.fechaOrden >
                        grupo.fechaOrden
                    ) {

                        grupo.fechaOrden =
                            venta.fechaOrden;

                        grupo.fecha =
                            venta.fecha;

                    }


                    grupo.productos.push(
                        convertirEgresoAProducto(
                            e
                        )
                    );

                }
            );


            /*
             * ==================================================
             * PASAR LAS VENTAS AGRUPADAS
             * AL HISTORIAL
             * ==================================================
             */

            gruposVentas.forEach(
                grupo => {

                    historial.push(
                        grupo
                    );

                }
            );


            /*
             * ==================================================
             * ORDENAR TODO
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
                historial.length === 0
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
                     * VENTA
                     * ==========================================
                     */

                    if (
                        registro.tipo ===
                        "venta"
                    ) {

                        const div =
                            document.createElement(
                                "div"
                            );


                        div.className =
                            "visita";


                        let productosHTML =
                            "";


                        registro.productos.forEach(
                            producto => {

                                productosHTML += `

                                    <div class="producto-venta">

                                        <span class="dato-producto">
                                            📦
                                            ${escaparHTML(
                                                producto.nombre
                                            )}
                                        </span>

                                        <span class="dato-cantidad">
                                            ⚖️
                                            ${escaparHTML(
                                                producto.cantidad
                                            )}
                                            ${escaparHTML(
                                                producto.unidad
                                            )}
                                        </span>

                                        <span class="dato-lote">
                                            🏷️
                                            ${escaparHTML(
                                                producto.lote ||
                                                "Sin lote"
                                            )}
                                        </span>

                                    </div>

                                `;

                            }
                        );


                        div.innerHTML = `

                            <div class="fecha">
                                ${mostrarFecha(
                                    registro.fecha
                                )}
                            </div>

                            <span class="badge entrega">
                                🏷️ Venta
                            </span>

                            <div class="productos-venta">

                                ${productosHTML}

                            </div>

                        `;


                        visitasEl.appendChild(
                            div
                        );


                        return;

                    }


                    /*
                     * ==========================================
                     * VISITA / ENSAYO / ENTREGA
                     * ==========================================
                     */

                    const v =
                        registro.datos;


                    const fecha =
                        obtenerFechaOrden(v);


                    const fechaTexto =
                        mostrarFecha(
                            fecha
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
                        tipo ===
                        "Entrega de productos" &&
                        Array.isArray(
                            v.productos
                        )
                    ) {

                        productosHTML =
                            v.productos
                                .map(
                                    p => `

                                        <div class="producto">
                                            📦
                                            ${escaparHTML(
                                                p.nombre
                                            )}

                                            ${
                                                p.cantidad
                                                    ? `⚖️ ${escaparHTML(
                                                        p.cantidad
                                                    )}`
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
                            ${fechaTexto}
                        </div>

                        <span class="badge ${clase}">
                            ${escaparHTML(
                                tipo
                            )}
                        </span>

                        ${productosHTML}

                    `;


                    visitasEl.appendChild(
                        div
                    );

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
