import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", async () => {

    const clienteId =
        new URLSearchParams(window.location.search).get("id");


    /*
     * ============================================================
     * ELEMENTOS CLIENTE
     * ============================================================
     */

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


    let clienteRef;


    /*
     * ============================================================
     * CARGA INICIAL
     * ============================================================
     */

    await cargarCliente();


    /*
     * ============================================================
     * CARGAR DATOS DEL CLIENTE
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


        /*
         * CONTACTO PRINCIPAL
         *
         * Se mantienen los campos que ya tenía
         * el cliente.
         */

        const contactoPrincipal = {

            nombre:
                c.contacto || "",

            posicion:
                c.posicion || "",

            telefono:
                c.telefono || "",

            email:
                c.email || "",

            observaciones:
                c.observaciones || ""

        };


        contactoTxt.textContent =
            contactoPrincipal.nombre || "-";

        posicionTxt.textContent =
            contactoPrincipal.posicion || "-";

        telefonoTxt.textContent =
            contactoPrincipal.telefono || "-";

        emailTxt.textContent =
            contactoPrincipal.email || "-";

        observacionesTxt.textContent =
            contactoPrincipal.observaciones || "-";


        /*
         * INPUTS DEL CONTACTO PRINCIPAL
         */

        contactoInput.value =
            contactoPrincipal.nombre;

        posicionInput.value =
            contactoPrincipal.posicion;

        telefonoInput.value =
            contactoPrincipal.telefono;

        emailInput.value =
            contactoPrincipal.email;

        observacionesInput.value =
            contactoPrincipal.observaciones;


        actualizarLinks();

        modoLectura();


        const tarjetaPrincipal =
            document.querySelector(
                ".contacto-principal"
            );


        if (
            tarjetaPrincipal &&
            !tarjetaPrincipal.querySelector(
                ".menu-contacto"
            )
        ) {

            const menuBtnPrincipal =
                document.createElement("button");

            menuBtnPrincipal.type =
                "button";

            menuBtnPrincipal.className =
                "menu-contacto";

            menuBtnPrincipal.textContent =
                "⋮";

            tarjetaPrincipal.appendChild(
                menuBtnPrincipal
            );

        }


        /*
         * CONTACTOS ADICIONALES
         */

        const contactos =
            Array.isArray(c.contactos)
                ? c.contactos
                : [];


        mostrarContactosGuardados(
            contactos
        );


        // MENÚ DEL CONTACTO PRINCIPAL

        const menuPrincipalBtn =
            document.querySelector(
                ".contacto-principal .menu-contacto"
            );


        if (menuPrincipalBtn) {

            menuPrincipalBtn.addEventListener(
                "click",
                (evento) => {

                    evento.stopPropagation();

                    let menu =
                        document.querySelector(
                            ".contacto-principal .menu-opciones-contacto"
                        );


                    if (!menu) {

                        menu =
                            document.createElement(
                                "div"
                            );

                        menu.className =
                            "menu-opciones-contacto";

                        menu.innerHTML = `

                            <button
                                type="button"
                                class="editar-contacto-principal"
                            >
                                Editar
                            </button>

                            <button
                                type="button"
                                class="eliminar-contacto"
                            >
                                Eliminar
                            </button>

                        `;

                        menuPrincipalBtn
                            .parentElement
                            .appendChild(menu);


                        const editarPrincipal =
                            menu.querySelector(
                                ".editar-contacto-principal"
                            );


                        editarPrincipal.onclick =
                            () => {

                                menu.remove();

                                mostrarFormularioEditarContactoPrincipal();

                            };


                        const eliminarPrincipal =
                            menu.querySelector(
                                ".eliminar-contacto"
                            );


                        eliminarPrincipal.onclick =
                            () => {

                                menu.remove();

                                alert(
                                    "La eliminación del contacto principal se habilitará más adelante."
                                );

                            };

                    }

                    else {

                        menu.remove();

                    }

                }
            );

        }


        /*
         * CERRAR MENÚ AL HACER CLICK
         * FUERA DEL MISMO
         */

        document.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".menu-opciones-contacto"
                    )
                    .forEach(
                        menu => menu.remove()
                    );

            }
        );

    }


    /*
     * ============================================================
     * MODO LECTURA
     * ============================================================
     */

    function modoLectura() {

        contactoTxt.style.display =
            "block";

        posicionTxt.style.display =
            "block";

        telefonoTxt.style.display =
            "block";

        emailTxt.style.display =
            "block";

        observacionesTxt.style.display =
            "block";


        contactoInput.style.display =
            "none";

        posicionInput.style.display =
            "none";

        telefonoInput.style.display =
            "none";

        emailInput.style.display =
            "none";

        observacionesInput.style.display =
            "none";


        editarBtn.style.display =
            "none";

        guardarBtn.style.display =
            "none";

    }


    /*
     * ============================================================
     * MODO EDICIÓN
     * ============================================================
     */

    function modoEdicion() {

        contactoTxt.style.display =
            "none";

        posicionTxt.style.display =
            "none";

        telefonoTxt.style.display =
            "none";

        emailTxt.style.display =
            "none";

        observacionesTxt.style.display =
            "none";


        contactoInput.style.display =
            "block";

        posicionInput.style.display =
            "block";

        telefonoInput.style.display =
            "block";

        emailInput.style.display =
            "block";

        observacionesInput.style.display =
            "block";


        editarBtn.style.display =
            "inline-block";

        guardarBtn.style.display =
            "inline-block";

    }


    /*
     * ============================================================
     * BOTÓN EDITAR
     * ============================================================
     */

    if (editarBtn) {

        editarBtn.addEventListener(
            "click",
            () => {

                modoEdicion();

            }
        );

    }


    /*
     * ============================================================
     * GUARDAR CONTACTO PRINCIPAL
     * ============================================================
     */

    if (guardarBtn) {

        guardarBtn.addEventListener(
            "click",
            async () => {

                try {

                    await updateDoc(
                        clienteRef,
                        {

                            contacto:
                                contactoInput.value.trim(),

                            posicion:
                                posicionInput.value.trim(),

                            telefono:
                                telefonoInput.value.trim(),

                            email:
                                emailInput.value.trim(),

                            observaciones:
                                observacionesInput.value.trim()

                        }
                    );


                    contactoTxt.textContent =
                        contactoInput.value.trim() || "-";

                    posicionTxt.textContent =
                        posicionInput.value.trim() || "-";

                    telefonoTxt.textContent =
                        telefonoInput.value.trim() || "-";

                    emailTxt.textContent =
                        emailInput.value.trim() || "-";

                    observacionesTxt.textContent =
                        observacionesInput.value.trim() || "-";


                    actualizarLinks();

                    modoLectura();


                    alert(
                        "Contacto actualizado correctamente."
                    );

                }

                catch (error) {

                    console.error(
                        "Error actualizando contacto:",
                        error
                    );

                    alert(
                        "No se pudo actualizar el contacto."
                    );

                }

            }
        );

    }
                menuBtn.type =
                "button";

            menuBtn.className =
                "menu-contacto";

            menuBtn.textContent =
                "⋮";


            /*
             * ==========================================
             * MENÚ
             * ==========================================
             */

            const menu =
                document.createElement("div");

            menu.className =
                "menu-opciones-contacto";

            menu.hidden =
                true;


            /*
             * BOTÓN EDITAR
             */

            const editarContactoBtn =
                document.createElement("button");

            editarContactoBtn.type =
                "button";

            editarContactoBtn.textContent =
                "Editar";


            /*
             * BOTÓN ELIMINAR
             */

            const eliminarContactoBtn =
                document.createElement("button");

            eliminarContactoBtn.type =
                "button";

            eliminarContactoBtn.textContent =
                "Eliminar";

            eliminarContactoBtn.className =
                "eliminar-contacto";


            /*
             * AGREGAR OPCIONES AL MENÚ
             */

            menu.appendChild(
                editarContactoBtn
            );

            menu.appendChild(
                eliminarContactoBtn
            );


            /*
             * AGREGAR MENÚ A LA TARJETA
             */

            tarjeta.appendChild(
                menuBtn
            );

            tarjeta.appendChild(
                menu
            );


            /*
             * ==========================================
             * ABRIR / CERRAR MENÚ
             * ==========================================
             */

            menuBtn.addEventListener(
                "click",
                (evento) => {

                    evento.stopPropagation();

                    document
                        .querySelectorAll(
                            ".menu-opciones-contacto"
                        )
                        .forEach(
                            otroMenu => {

                                if (
                                    otroMenu !== menu
                                ) {

                                    otroMenu.hidden =
                                        true;

                                }

                            }
                        );

                    menu.hidden =
                        !menu.hidden;

                }
            );


            /*
             * ==========================================
             * EDITAR
             * ==========================================
             */

            editarContactoBtn.addEventListener(
                "click",
                () => {

                    menu.hidden = true;

                    mostrarFormularioEditarContacto(
                        contacto,
                        indice
                    );

                }
            );


            /*
             * ==========================================
             * ELIMINAR
             * ==========================================
             */

            eliminarContactoBtn.addEventListener(
                "click",
                async () => {

                    menu.hidden =
                        true;

                    const confirmar =
                        confirm(
                            `¿Querés eliminar el contacto "${nombre}"?`
                        );

                    if (!confirmar) {
                        return;
                    }


                    try {

                        const nuevosContactos =
                            contactos.filter(
                                (_, i) =>
                                    i !== indice
                            );


                        await updateDoc(

                            clienteRef,

                            {

                                contactos:
                                    nuevosContactos

                            }

                        );


                        await cargarCliente();


                        alert(
                            "Contacto eliminado ✔"
                        );

                    }

                    catch (error) {

                        console.error(
                            "Error eliminando contacto:",
                            error
                        );

                        alert(
                            "No se pudo eliminar el contacto."
                        );

                    }

                }
            );


            contenedor.appendChild(
                tarjeta
            );

        }
    );


    /*
     * ==========================================
     * CERRAR MENÚ AL HACER CLICK AFUERA
     * ==========================================
     */

    document.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(
                    ".menu-opciones-contacto"
                )
                .forEach(
                    menu => {

                        menu.hidden =
                            true;

                    }
                );

        }
    );

}


    /*
     * ============================================================
     * ESCAPAR HTML
     * ============================================================
     */

    function escaparHTML(valor) {

        return String(valor ?? "")

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
     * NUEVO CONTACTO
     * ============================================================
     */

    function mostrarFormularioEditarContacto(
        contacto,
        indice
    ) {

        mostrarFormularioNuevoContacto();


        const formulario =
            document.getElementById(
                "nuevoContactoForm"
            );

        if (!formulario) {
            return;
        }


        formulario.dataset.modo =
            "editar";

        formulario.dataset.indice =
            String(indice);


        const titulo =
            formulario.querySelector("h3");

        if (titulo) {

            titulo.textContent =
                "Editar contacto";

        }


        const nombreInput =
            document.getElementById(
                "nuevoContactoNombre"
            );

        const posicionInput =
            document.getElementById(
                "nuevoContactoPosicion"
            );

        const telefonoInput =
            document.getElementById(
                "nuevoContactoTelefono"
            );

        const emailInput =
            document.getElementById(
                "nuevoContactoEmail"
            );

        const observacionesInput =
            document.getElementById(
                "nuevoContactoObservaciones"
            );


        nombreInput.value =
            contacto?.nombre || "";

        posicionInput.value =
            contacto?.posicion || "";

        telefonoInput.value =
            contacto?.telefono || "";

        emailInput.value =
            contacto?.email || "";

        observacionesInput.value =
            contacto?.observaciones || "";


        const guardarBtnContacto =
            document.getElementById(
                "guardarNuevoContactoBtn"
            );

        if (guardarBtnContacto) {

            guardarBtnContacto.textContent =
                "💾 Guardar cambios";

        }


        formulario.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });


        nombreInput?.focus();

    }
    /*
     * ============================================================
     * VALIDACIONES
     * ============================================================
     */

    if (!nombre) {

        alert(
            "Ingresá el nombre del contacto."
        );

        return;
    }


    if (!posicion) {

        alert(
            "Ingresá la posición del contacto."
        );

        return;
    }


    if (
        !telefono &&
        !email
    ) {

        alert(
            "Ingresá al menos un teléfono o un email."
        );

        return;
    }


    /*
     * ============================================================
     * OBTENER FORMULARIO
     * ============================================================
     */

    const formulario =
        document.getElementById(
            "nuevoContactoForm"
        );


    /*
     * ============================================================
     * DETERMINAR SI ES NUEVO O EDICIÓN
     * ============================================================
     */

    const modo =
        formulario?.dataset?.modo ||
        "nuevo";


    const indice =
        formulario?.dataset?.indice !== undefined
            ? Number(
                formulario.dataset.indice
            )
            : null;


    /*
     * ============================================================
     * OBJETO CONTACTO
     * ============================================================
     */

    const nuevoContacto = {

        nombre,

        posicion,

        telefono,

        email,

        observaciones

    };


    /*
     * ============================================================
     * BOTÓN GUARDAR
     * ============================================================
     */

    const boton =
        document.getElementById(
            "guardarNuevoContactoBtn"
        );


    if (boton) {

        boton.disabled =
            true;

        boton.textContent =
            "Guardando...";

    }


    try {

        /*
         * ========================================================
         * EDICIÓN
         * ========================================================
         */

        if (
            modo === "editar" &&
            indice !== null &&
            !isNaN(indice)
        ) {

            const snap =
                await getDoc(
                    clienteRef
                );


            if (!snap.exists()) {

                throw new Error(
                    "No se encontró el cliente."
                );

            }


            const cliente =
                snap.data();


            const contactos =
                Array.isArray(
                    cliente.contactos
                )
                    ? [
                        ...cliente.contactos
                    ]
                    : [];


            if (
                indice < 0 ||
                indice >= contactos.length
            ) {

                throw new Error(
                    "No se encontró el contacto a editar."
                );

            }


            contactos[indice] =
                nuevoContacto;


            await updateDoc(

                clienteRef,

                {

                    contactos

                }

            );


            formulario?.remove();


            await cargarCliente();


            alert(
                "Contacto actualizado correctamente."
            );


            return;

        }


        /*
         * ========================================================
         * NUEVO CONTACTO
         * ========================================================
         */

        await updateDoc(

            clienteRef,

            {

                contactos:
                    arrayUnion(
                        nuevoContacto
                    )

            }

        );


        formulario?.remove();


        await cargarCliente();


        alert(
            "Contacto guardado correctamente."
        );

    }

    catch (error) {

        console.error(
            "Error guardando contacto:",
            error
        );


        alert(
            "No se pudo guardar el contacto."
        );

    }

    finally {

        if (boton) {

            boton.disabled =
                false;

            boton.textContent =
                modo === "editar"
                    ? "💾 Guardar cambios"
                    : "💾 Guardar contacto";

        }

    }

}


    /*
     * ============================================================
     * EDITAR CONTACTO PRINCIPAL
     * ============================================================
     */

    function mostrarFormularioEditarContactoPrincipal() {

        /*
         * Activamos los campos principales
         */

        modoEdicion();


        /*
         * Ponemos el foco
         */

        setTimeout(
            () => {

                contactoInput?.focus();

            },
            100
        );

    }


    /*
     * ============================================================
     * AGREGAR CONTACTO
     * ============================================================
     */

    const agregarContactoBtn =
        document.getElementById(
            "agregarContactoBtn"
        );


    if (agregarContactoBtn) {

        agregarContactoBtn.addEventListener(
            "click",
            () => {

                mostrarFormularioNuevoContacto();

            }
        );

    }


    /*
     * ============================================================
     * ACTUALIZAR LINKS
     * ============================================================
     */

    function actualizarLinks() {

        /*
         * WHATSAPP
         */

        if (wspLink) {

            const telefono =
                telefonoInput?.value
                    ?.replace(
                        /\D/g,
                        ""
                    ) || "";


            if (telefono) {

                wspLink.href =
                    `https://wa.me/54${telefono}`;

                wspLink.style.display =
                    "inline-flex";

            }

            else {

                wspLink.removeAttribute(
                    "href"
                );

                wspLink.style.display =
                    "none";

            }

        }


        /*
         * EMAIL
         */

        if (mailLink) {

            const email =
                emailInput?.value
                    ?.trim() || "";


            if (email) {

                mailLink.href =
                    `mailto:${email}`;

                mailLink.style.display =
                    "inline-flex";

            }

            else {

                mailLink.removeAttribute(
                    "href"
                );

                mailLink.style.display =
                    "none";

            }

        }

    }


    /*
     * ============================================================
     * BOTÓN NOTA / VISITA DESDE CLIENTE
     * ============================================================
     */

    const nuevaNotaBtn =
        document.getElementById(
            "nuevaNotaBtn"
        );


    if (nuevaNotaBtn) {

        nuevaNotaBtn.addEventListener(
            "click",
            () => {

                mostrarFormularioNota();

            }
        );

    }


    /*
     * ============================================================
     * FORMULARIO NOTA
     * ============================================================
     */

    function mostrarFormularioNota() {

        const overlay =
            document.createElement(
                "div"
            );


        overlay.className =
            "overlay-nota";


        overlay.style.cssText = `

            position:fixed;
            inset:0;
            background:rgba(0,0,0,.6);
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:99999;
            padding:15px;

        `;


        const box =
            document.createElement(
                "div"
            );


        box.style.cssText = `

            background:#fff;
            width:92%;
            max-width:600px;
            max-height:90vh;
            overflow-y:auto;
            border-radius:16px;
            padding:24px;
            box-sizing:border-box;

        `;


        box.innerHTML = `

            <h3 style="
                margin-top:0;
                margin-bottom:18px;
            ">
                Nueva nota
            </h3>


            <div style="
                margin-bottom:14px;
            ">

                <label style="
                    display:block;
                    font-weight:600;
                    margin-bottom:6px;
                ">
                    Título
                </label>

                <input
                    id="notaTitulo"
                    type="text"
                    placeholder="Ej.: Reunión con producción"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:13px;
                        border:1px solid #ccc;
                        border-radius:8px;
                        font-size:16px;
                    "
                >

            </div>


            <div style="
                margin-bottom:18px;
            ">

                <label style="
                    display:block;
                    font-weight:600;
                    margin-bottom:6px;
                ">
                    Nota
                </label>

                <textarea
                    id="notaContenido"
                    rows="9"
                    placeholder="Escribí todo lo hablado, realizado o acordado..."
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:13px;
                        border:1px solid #ccc;
                        border-radius:8px;
                        font-size:16px;
                        resize:vertical;
                        font-family:inherit;
                        line-height:1.4;
                    "
                ></textarea>

            </div>


            <button
                id="guardarNotaBtn"
                style="
                    width:100%;
                    padding:15px;
                    border:0;
                    border-radius:8px;
                    background:#1f4e8c;
                    color:white;
                    font-size:17px;
                    font-weight:bold;
                    cursor:pointer;
                "
            >
                Guardar nota
            </button>


            <button
                id="cancelarNotaBtn"
                style="
                    width:100%;
                    padding:13px;
                    margin-top:10px;
                    border:0;
                    border-radius:8px;
                    background:#eee;
                    color:#333;
                    font-size:16px;
                    cursor:pointer;
                "
            >
                Cancelar
            </button>

        `;


        overlay.appendChild(
            box
        );

        document.body.appendChild(
            overlay
        );


        /*
         * CANCELAR
         */

        box
            .querySelector(
                "#cancelarNotaBtn"
            )
            .onclick =
            () => {

                overlay.remove();

            };


        /*
         * GUARDAR NOTA
         */

        box
            .querySelector(
                "#guardarNotaBtn"
            )
            .onclick =
            async () => {

                const titulo =
                    box
                        .querySelector(
                            "#notaTitulo"
                        )
                        .value
                        .trim();


                const contenido =
                    box
                        .querySelector(
                            "#notaContenido"
                        )
                        .value
                        .trim();


                if (!titulo) {

                    alert(
                        "Escribí un título para la nota."
                    );

                    return;

                }


                if (!contenido) {

                    alert(
                        "Escribí el contenido de la nota."
                    );

                    return;

                }


                const boton =
                    box.querySelector(
                        "#guardarNotaBtn"
                    );


                boton.disabled =
                    true;

                boton.textContent =
                    "Guardando...";


                try {

                    /*
                     * Las notas creadas desde
                     * cliente se guardan como:
                     *
                     * tipoVisita: "Nota"
                     *
                     * Esto las diferencia de las visitas
                     * comerciales creadas desde index.
                     */

                    await addDoc(
                        collection(
                            db,
                            "visitas"
                        ),
                        {

                            clienteId:
                                clienteId,

                            cliente:
                                nombreEl
                                    ?.textContent
                                    ?.trim() || "",

                            tipoVisita:
                                "Nota",

                            titulo:
                                titulo,

                            nota:
                                contenido,

                            fecha:
                                new Date()

                        }
                    );


                    alert(
                        "✅ Nota guardada"
                    );


                    overlay.remove();


                    /*
                     * Actualizar historial
                     */

                    await cargarHistorialParte2();

                }

                catch (error) {

                    console.error(
                        "Error guardando nota:",
                        error
                    );


                    alert(
                        "No se pudo guardar la nota."
                    );


                    boton.disabled =
                        false;

                    boton.textContent =
                        "Guardar nota";

                }

            };


        setTimeout(
            () => {

                box
                    .querySelector(
                        "#notaTitulo"
                    )
                    ?.focus();

            },
            100
        );

    }
    /*
     * ============================================================
     * HISTORIAL DE VISITAS
     * ============================================================
     *
     * En esta etapa solamente cargamos:
     *
     * VISITAS → colección "visitas"
     *
     * Las notas generales NO se cargan acá.
     * Las maneja notas.js.
     *
     * Tampoco cargamos todavía:
     * - ventas
     * - ensayos
     * - cotizaciones
     * - entregas
     * ============================================================
     */


    const listaHistorial =
        document.getElementById(
            "listaVisitasCliente"
        );


    /*
     * ============================================================
     * OBTENER FECHA
     * ============================================================
     */

    function fechaHistorial(actividad) {

        if (
            actividad.fecha &&
            typeof actividad.fecha.toDate === "function"
        ) {

            return actividad.fecha.toDate();

        }


        if (actividad.fecha) {

            const fecha =
                new Date(
                    actividad.fecha
                );


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
     * ESCAPAR HTML
     * ============================================================
     */

    function escaparHistorial(texto) {

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
     * MOSTRAR FECHA
     * ============================================================
     */

    function mostrarFechaHistorial(fecha) {

        if (!fecha) {

            return "";

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
     * CARGAR VISITAS
     * ============================================================
     */

    async function cargarHistorialParte2() {

        if (!listaHistorial) {

            console.warn(
                "No se encontró #listaVisitasCliente"
            );

            return;

        }


        listaHistorial.innerHTML =
            "<p>Cargando visitas...</p>";


        try {

            /*
             * Buscar solamente las visitas
             * correspondientes a este cliente.
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


            console.log(
                "VISITAS ENCONTRADAS:",
                snapVisitas.size
            );


            const visitas = [];


            /*
             * ========================================================
             * RECORRER VISITAS
             * ========================================================
             */

            snapVisitas.forEach(
                docSnap => {

                    const actividad =
                        docSnap.data();


                    /*
                     * IMPORTANTE:
                     *
                     * Solo tomamos las visitas
                     * creadas desde index.js.
                     *
                     * Las notas generales tienen
                     * otro origen y otro tratamiento.
                     */

                    if (
                        actividad.tipoVisita !==
                        "Nota de visita"
                    ) {

                        return;

                    }


                    visitas.push({

                        id:
                            docSnap.id,

                        datos:
                            actividad,

                        fecha:
                            fechaHistorial(
                                actividad
                            )

                    });

                }
            );


            /*
             * ========================================================
             * ORDENAR DE MÁS NUEVA A MÁS VIEJA
             * ========================================================
             */

            visitas.sort(

                (a, b) =>

                    (
                        b.fecha?.getTime() || 0
                    )

                    -

                    (
                        a.fecha?.getTime() || 0
                    )

            );


            /*
             * ========================================================
             * LIMPIAR HISTORIAL
             * ========================================================
             */

            listaHistorial.innerHTML =
                "";


            /*
             * ========================================================
             * SI NO HAY VISITAS
             * ========================================================
             */

            if (!visitas.length) {

                listaHistorial.innerHTML =
                    "<p>No hay visitas registradas.</p>";

                return;

            }


            /*
             * ========================================================
             * MOSTRAR VISITAS
             * ========================================================
             */

            visitas.forEach(

                registro => {

                    const actividad =
                        registro.datos;


                    const div =
                        document.createElement(
                            "div"
                        );


                    div.className =
                        "visita";


                    const fecha =
                        mostrarFechaHistorial(
                            registro.fecha
                        );


                    const titulo =
                        actividad.titulo ||
                        "Visita";


                    /*
                     * ==================================================
                     * TARJETA DE VISITA
                     * ==================================================
                     */

                    div.innerHTML = `

                        <div class="fecha">
                            ${escaparHistorial(
                                fecha
                            )}
                        </div>


                        <span class="badge comercial">
                            Visita
                        </span>


                        <span class="titulo-nota-historial">
                            ${escaparHistorial(
                                titulo
                            )}
                        </span>

                    `;


                    /*
                     * ==================================================
                     * GUARDAR DATOS PARA ABRIR DETALLE
                     * ==================================================
                     */

                    div.dataset.visitaId =
                        registro.id;


                    /*
                     * ==================================================
                     * CLICK EN LA VISITA
                     * ==================================================
                     */

                    div.addEventListener(

                        "click",

                        () => {

                            mostrarDetalleVisita(
                                actividad
                            );

                        }

                    );


                    listaHistorial.appendChild(
                        div
                    );

                }

            );

        }

        catch (error) {

            console.error(
                "ERROR CARGANDO VISITAS:",
                error
            );


            listaHistorial.innerHTML =
                "<p>No se pudieron cargar las visitas.</p>";

        }

    }


    /*
     * ============================================================
     * DETALLE DE VISITA
     * ============================================================
     */

    function mostrarDetalleVisita(
        actividad
    ) {

        const overlay =
            document.createElement(
                "div"
            );


        overlay.style.cssText = `

            position:fixed;
            inset:0;
            background:rgba(0,0,0,.55);
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:99999;
            padding:15px;

        `;


        const box =
            document.createElement(
                "div"
            );


        box.style.cssText = `

            background:#fff;
            width:92%;
            max-width:600px;
            max-height:90vh;
            overflow-y:auto;
            border-radius:16px;
            padding:24px;
            box-sizing:border-box;

        `;


        const fecha =
            mostrarFechaHistorial(
                fechaHistorial(
                    actividad
                )
            );


        box.innerHTML = `

            <h3 style="
                margin-top:0;
                margin-bottom:18px;
            ">
                Visita
            </h3>


            <div style="
                margin-bottom:12px;
                color:#666;
                font-size:14px;
            ">
                ${escaparHistorial(
                    fecha
                )}
            </div>


            <div style="
                margin-bottom:14px;
            ">

                <strong>
                    ${escaparHistorial(
                        actividad.titulo ||
                        "Visita"
                    )}
                </strong>

            </div>


            <div style="
                white-space:pre-wrap;
                line-height:1.5;
                margin-bottom:20px;
            ">
                ${escaparHistorial(
                    actividad.nota ||
                    ""
                )}
            </div>


            <button
                id="cerrarDetalleVisita"
                style="
                    width:100%;
                    padding:13px;
                    border:0;
                    border-radius:8px;
                    background:#eee;
                    color:#333;
                    font-size:16px;
                    cursor:pointer;
                "
            >
                Cerrar
            </button>

        `;


        overlay.appendChild(
            box
        );


        document.body.appendChild(
            overlay
        );


        box
            .querySelector(
                "#cerrarDetalleVisita"
            )
            .onclick =
            () => {

                overlay.remove();

            };


        overlay.addEventListener(

            "click",

            evento => {

                if (
                    evento.target ===
                    overlay
                ) {

                    overlay.remove();

                }

            }

        );

    }


    /*
     * ============================================================
     * CARGAR AL ABRIR LA PÁGINA
     * ============================================================
     */

    await cargarHistorialParte2();
    /*
     * ============================================================
     * BOTÓN "VER HISTORIAL COMPLETO"
     * ============================================================
     */

    const verHistorialCompleto =
        document.getElementById(
            "verHistorialCompleto"
        );


    if (verHistorialCompleto) {

        verHistorialCompleto.addEventListener(

            "click",

            () => {

                /*
                 * Por ahora simplemente volvemos
                 * a cargar el historial.
                 *
                 * Más adelante podemos convertir
                 * este botón en una vista completa
                 * con filtros.
                 */

                cargarHistorialParte2();

            }

        );

    }


    /*
     * ============================================================
     * ACTUALIZAR LINKS AL CAMBIAR DATOS
     * ============================================================
     */

    [
        telefonoInput,
        emailInput
    ]

    .forEach(

        input => {

            if (!input) {
                return;
            }


            input.addEventListener(

                "input",

                () => {

                    actualizarLinks();

                }

            );

        }

    );


    /*
     * ============================================================
     * CERRAR MENÚS AL HACER CLICK AFUERA
     * ============================================================
     */

    document.addEventListener(

        "click",

        evento => {

            const menu =
                evento.target.closest(
                    ".menu-opciones-contacto"
                );


            const boton =
                evento.target.closest(
                    ".menu-contacto"
                );


            if (
                menu ||
                boton
            ) {

                return;

            }


            document
                .querySelectorAll(
                    ".menu-opciones-contacto"
                )
                .forEach(

                    elemento => {

                        elemento.hidden =
                            true;

                    }

                );

        }

    );


    /*
     * ============================================================
     * ESTADO INICIAL
     * ============================================================
     */

    modoLectura();


    actualizarLinks();


    /*
     * ============================================================
     * FIN
     * ============================================================
     */

});
