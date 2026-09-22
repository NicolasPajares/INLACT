import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion
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
                            document.createElement("div");

                        menu.className =
                            "menu-opciones-contacto";

                        menu.innerHTML = `
    <button
        type="button"
        id="editarContactoPrincipalBtn"
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

                        document
                            .querySelector(
                                ".contacto-principal"
                            )
                            .appendChild(menu);

                        const editarPrincipalBtn =
                            document.getElementById(
                                "editarContactoPrincipalBtn"
                            );


                        if (editarPrincipalBtn) {

                            editarPrincipalBtn.addEventListener(
                                "click",
                                () => {

                                    menu.hidden = true;

                                    mostrarFormularioEditarContactoPrincipal();

                                }
                            );

                        }

                    }

                    menu.hidden =
                        !menu.hidden;

                }
            );

        }

    }


    /*
     * ============================================================
     * MOSTRAR CONTACTOS ADICIONALES
     * ============================================================
     */

    function mostrarContactosGuardados(contactos) {

        const contenedor =
            document.getElementById(
                "contactosAdicionales"
            );

        if (!contenedor) {
            return;
        }

        contenedor.innerHTML = "";

        contenedor.className =
            "lista-contactos";

        if (
            !Array.isArray(contactos) ||
            contactos.length === 0
        ) {
            return;
        }


        contactos.forEach(
            (contacto, indice) => {

                const tarjeta =
                    document.createElement("div");

                tarjeta.className =
                    "contacto-card";


                const nombre =
                    contacto?.nombre ||
                    "Contacto sin nombre";

                const posicion =
                    contacto?.posicion ||
                    "";

                const telefono =
                    contacto?.telefono ||
                    "";

                const email =
                    contacto?.email ||
                    "";

                const observaciones =
                    contacto?.observaciones ||
                    "";


                const telefonoLimpio =
                    String(telefono)
                        .replace(/\D/g, "");


                const telefonoHTML =
                    telefono
                        ? `
                        <span>
                            ${escaparHTML(telefono)}
                        </span>

                        <a
                            href="https://wa.me/54${telefonoLimpio}"
                            target="_blank"
                            rel="noopener"
                        >
                            WhatsApp
                        </a>
                      `
                        : "-";


                const emailHTML =
                    email
                        ? `
                        <span>
                            ${escaparHTML(email)}
                        </span>

                        <a
                            href="mailto:${encodeURIComponent(email)}"
                        >
                            Email
                        </a>
                      `
                        : "-";


                tarjeta.innerHTML = `

                <div class="campo">

                    <label>
                        Nombre
                    </label>

                    <span>
                        ${escaparHTML(nombre)}
                    </span>

                </div>


                <div class="campo">

                    <label>
                        Posición
                    </label>

                    <span>
                        ${escaparHTML(
                            posicion || "-"
                        )}
                    </span>

                </div>


                <div class="campo">

                    <label>
                        Teléfono
                    </label>

                    <span>
                        ${telefonoHTML}
                    </span>

                </div>


                <div class="campo">

                    <label>
                        Email
                    </label>

                    <span>
                        ${emailHTML}
                    </span>

                </div>


                <div class="campo">

                    <label>
                        Observaciones
                    </label>

                    <p>
                        ${escaparHTML(
                            observaciones || "-"
                        )}
                    </p>

                </div>

            `;


                /*
                 * ==========================================
                 * BOTÓN TRES PUNTITOS
                 * ==========================================
                 */

                const menuBtn =
                    document.createElement("button");

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

    /*
     * ============================================================
     * EDITAR CONTACTO EXISTENTE
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
     * EDITAR CONTACTO PRINCIPAL
     * ============================================================
     */

    function mostrarFormularioEditarContactoPrincipal() {

        mostrarFormularioNuevoContacto();


        const formulario =
            document.getElementById(
                "nuevoContactoForm"
            );


        if (!formulario) {
            return;
        }


        formulario.dataset.modo =
            "editar-principal";


        const titulo =
            formulario.querySelector("h3");


        if (titulo) {

            titulo.textContent =
                "Editar contacto principal";

        }


        document
            .getElementById(
                "nuevoContactoNombre"
            )
            .value =
                contactoInput.value || "";


        document
            .getElementById(
                "nuevoContactoPosicion"
            )
            .value =
                posicionInput.value || "";


        document
            .getElementById(
                "nuevoContactoTelefono"
            )
            .value =
                telefonoInput.value || "";


        document
            .getElementById(
                "nuevoContactoEmail"
            )
            .value =
                emailInput.value || "";


        document
            .getElementById(
                "nuevoContactoObservaciones"
            )
            .value =
                observacionesInput.value || "";


        const guardarContactoBtn =
            document.getElementById(
                "guardarNuevoContactoBtn"
            );


        if (guardarContactoBtn) {

            guardarContactoBtn.textContent =
                "💾 Guardar cambios";

        }


        formulario.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });


        document
            .getElementById(
                "nuevoContactoNombre"
            )
            ?.focus();

    }


    function mostrarFormularioNuevoContacto() {

        const formularioExistente =
            document.getElementById(
                "nuevoContactoForm"
            );


        if (formularioExistente) {

            formularioExistente.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });

            return;

        }


        const formulario =
            document.createElement("div");


        formulario.id =
            "nuevoContactoForm";


        formulario.className =
            "form-contacto";


        formulario.innerHTML = `

            <h3>
                Nuevo contacto
            </h3>


            <div class="contacto-form-grid">


                <div class="campo">

                    <label>
                        Nombre
                    </label>

                    <input
                        type="text"
                        id="nuevoContactoNombre"
                        placeholder="Nombre y apellido"
                    >

                </div>


                <div class="campo">

                    <label>
                        Posición
                    </label>

                    <input
                        type="text"
                        id="nuevoContactoPosicion"
                        placeholder="Dueño, producción, compras, etc."
                    >

                </div>


                <div class="campo">

                    <label>
                        Teléfono
                    </label>

                    <input
                        type="text"
                        id="nuevoContactoTelefono"
                        placeholder="Teléfono / WhatsApp"
                    >

                </div>


                <div class="campo">

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        id="nuevoContactoEmail"
                        placeholder="correo@empresa.com"
                    >

                </div>


                <div
                    class="campo"
                    style="grid-column: 1 / -1;"
                >

                    <label>
                        Observaciones
                    </label>

                    <textarea
                        id="nuevoContactoObservaciones"
                        rows="3"
                        placeholder="Información adicional del contacto"
                    ></textarea>

                </div>


            </div>


            <div class="acciones-form">

                <button
                    id="guardarNuevoContactoBtn"
                    class="btn-principal"
                    type="button"
                >
                    💾 Guardar contacto
                </button>


                <button
                    id="cancelarNuevoContactoBtn"
                    class="btn-secundario"
                    type="button"
                >
                    Cancelar
                </button>

            </div>

        `;


        const clienteCard =
            document.querySelector(
                ".cliente-card"
            );


        if (clienteCard) {

            clienteCard.appendChild(
                formulario
            );

        } else {

            document
                .getElementById(
                    "clienteDatos"
                )
                ?.appendChild(
                    formulario
                );

        }


        document
            .getElementById(
                "cancelarNuevoContactoBtn"
            )
            ?.addEventListener(
                "click",
                () => {

                    formulario.remove();

                }
            );


        document
            .getElementById(
                "guardarNuevoContactoBtn"
            )
            ?.addEventListener(
                "click",
                guardarNuevoContacto
            );


        document
            .getElementById(
                "nuevoContactoNombre"
            )
            ?.focus();


        formulario.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }
        /*
     * ============================================================
     * GUARDAR NUEVO / EDITAR CONTACTO
     * ============================================================
     */

    async function guardarNuevoContacto() {

        const nombre =
            document
                .getElementById(
                    "nuevoContactoNombre"
                )
                ?.value
                .trim() || "";


        const posicion =
            document
                .getElementById(
                    "nuevoContactoPosicion"
                )
                ?.value
                .trim() || "";


        const telefono =
            document
                .getElementById(
                    "nuevoContactoTelefono"
                )
                ?.value
                .trim() || "";


        const email =
            document
                .getElementById(
                    "nuevoContactoEmail"
                )
                ?.value
                .trim() || "";


        const observaciones =
            document
                .getElementById(
                    "nuevoContactoObservaciones"
                )
                ?.value
                .trim() || "";


        if (!nombre) {

            alert(
                "Ingresá el nombre del contacto."
            );

            return;

        }


        const formulario =
            document.getElementById(
                "nuevoContactoForm"
            );


        const modo =
            formulario?.dataset?.modo || "";


        try {

            /*
             * ====================================================
             * EDITAR CONTACTO PRINCIPAL
             * ====================================================
             */

            if (
                modo ===
                "editar-principal"
            ) {

                await updateDoc(

                    clienteRef,

                    {

                        contacto:
                            nombre,

                        posicion:
                            posicion,

                        telefono:
                            telefono,

                        email:
                            email,

                        observaciones:
                            observaciones

                    }

                );


                if (formulario) {
                    formulario.remove();
                }


                await cargarCliente();


                alert(
                    "Contacto principal actualizado ✔"
                );


                return;

            }


            /*
             * ====================================================
             * EDITAR CONTACTO ADICIONAL
             * ====================================================
             */

            if (
                modo ===
                "editar"
            ) {

                const indice =
                    Number(
                        formulario.dataset.indice
                    );


                const snap =
                    await getDoc(
                        clienteRef
                    );


                if (!snap.exists()) {

                    alert(
                        "No se encontró el cliente."
                    );

                    return;

                }


                const datos =
                    snap.data();


                const contactos =
                    Array.isArray(
                        datos.contactos
                    )
                        ? [...datos.contactos]
                        : [];


                if (
                    indice < 0 ||
                    indice >= contactos.length
                ) {

                    alert(
                        "No se encontró el contacto."
                    );

                    return;

                }


                contactos[indice] = {

                    nombre:
                        nombre,

                    posicion:
                        posicion,

                    telefono:
                        telefono,

                    email:
                        email,

                    observaciones:
                        observaciones

                };


                await updateDoc(

                    clienteRef,

                    {

                        contactos:
                            contactos

                    }

                );


                if (formulario) {
                    formulario.remove();
                }


                await cargarCliente();


                alert(
                    "Contacto actualizado ✔"
                );


                return;

            }


            /*
             * ====================================================
             * NUEVO CONTACTO
             * ====================================================
             */

            const nuevoContacto = {

                nombre:
                    nombre,

                posicion:
                    posicion,

                telefono:
                    telefono,

                email:
                    email,

                observaciones:
                    observaciones

            };


            await updateDoc(

                clienteRef,

                {

                    contactos:
                        arrayUnion(
                            nuevoContacto
                        )

                }

            );


            if (formulario) {
                formulario.remove();
            }


            await cargarCliente();


            alert(
                "Contacto guardado ✔"
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

    }


    /*
     * ============================================================
     * BOTÓN EDITAR CONTACTO PRINCIPAL
     * ============================================================
     */

    if (editarBtn) {

        editarBtn.addEventListener(
            "click",
            () => {

                mostrarFormularioEditarContactoPrincipal();

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

                const nombre =
                    contactoInput
                        .value
                        .trim();


                const posicion =
                    posicionInput
                        .value
                        .trim();


                const telefono =
                    telefonoInput
                        .value
                        .trim();


                const email =
                    emailInput
                        .value
                        .trim();


                const observaciones =
                    observacionesInput
                        .value
                        .trim();


                try {

                    await updateDoc(

                        clienteRef,

                        {

                            contacto:
                                nombre,

                            posicion:
                                posicion,

                            telefono:
                                telefono,

                            email:
                                email,

                            observaciones:
                                observaciones

                        }

                    );


                    await cargarCliente();


                    alert(
                        "Datos actualizados ✔"
                    );

                }

                catch (error) {

                    console.error(
                        "Error actualizando cliente:",
                        error
                    );


                    alert(
                        "No se pudieron guardar los cambios."
                    );

                }

            }
        );

    }


    /*
     * ============================================================
     * TOGGLE INPUTS
     * ============================================================
     */

    function toggleInputs(
        habilitados
    ) {

        [
            contactoInput,
            posicionInput,
            telefonoInput,
            emailInput,
            observacionesInput

        ].forEach(
            input => {

                if (input) {

                    input.disabled =
                        !habilitados;

                }

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

            wspLink.textContent =
                "WhatsApp";

            wspLink.style.display =
                "inline-flex";

        }

        else {

            wspLink.removeAttribute(
                "href"
            );

            wspLink.textContent =
                "";

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

            mailLink.textContent =
                "Email";

            mailLink.style.display =
                "inline-flex";

        }

        else {

            mailLink.removeAttribute(
                "href"
            );

            mailLink.textContent =
                "";

            mailLink.style.display =
                "none";

        }

    }

}

    /*
     * ============================================================
     * ACTUALIZAR LINKS CUANDO CAMBIAN LOS CAMPOS
     * ============================================================
     */

    [
        telefonoInput,
        emailInput

    ].forEach(
        input => {

            input?.addEventListener(
                "input",
                actualizarLinks
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


/*
 * ============================================================
 * HISTORIAL DE VISITAS, NOTAS Y VENTAS
 * ============================================================
 */

async function cargarHistorialHistorial() {

    const listaHistorial =
        document.getElementById(
            "listaVisitasCliente"
        );

    if (!listaHistorial) {

        console.warn(
            "No se encontró #listaVisitasCliente"
        );

        return;
    }


    listaHistorial.innerHTML =
        "<p>Cargando historial...</p>";


    try {

        const {
            collection,
            query,
            where,
            getDocs
        } =
            await import(
                "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
            );


        /*
         * ========================================================
         * BUSCAR VISITAS Y NOTAS
         * ========================================================
         */

        const consultaVisitas =
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


        const resultadoVisitas =
            await getDocs(
                consultaVisitas
            );


        /*
         * ========================================================
         * BUSCAR VENTAS
         * ========================================================
         */

        const consultaEgresos =
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


        const resultadoEgresos =
            await getDocs(
                consultaEgresos
            );

        /*
 * ========================================================
 * BUSCAR ENSAYOS
 * ========================================================
 */

const consultaEnsayos =
    query(
        collection(
            db,
            "ensayos"
        ),
        where(
            "clienteId",
            "==",
            clienteId
        )
    );

const resultadoEnsayos =
    await getDocs(
        consultaEnsayos
    );


/*
 * ========================================================
 * BUSCAR COTIZACIONES
 * ========================================================
 */

const consultaCotizaciones =
    query(
        collection(
            db,
            "cotizaciones"
        ),
        where(
            "clienteId",
            "==",
            clienteId
        )
    );

const resultadoCotizaciones =
    await getDocs(
        consultaCotizaciones
    );

        console.log(
            "ID CLIENTE HISTORIAL:",
            clienteId
        );


        console.log(
            "VISITAS ENCONTRADAS:",
            resultadoVisitas.size
        );


        console.log(
            "EGRESOS ENCONTRADOS:",
            resultadoEgresos.size
        );


        const actividades = [];


        /*
         * ========================================================
         * VISITAS Y NOTAS
         * ========================================================
         */

        resultadoVisitas.forEach(
            documento => {

                const datos =
                    documento.data();


                console.log(
                    "REGISTRO VISITA/NOTA:",
                    documento.id,
                    datos
                );


                if (
                    datos.tipoVisita !== "Nota de visita" &&
                    datos.tipoVisita !== "Nota"
                ) {

                    return;

                }


                let fecha = null;


                if (
                    datos.fecha &&
                    typeof datos.fecha.toDate ===
                    "function"
                ) {

                    fecha =
                        datos.fecha.toDate();

                }

                else if (datos.fecha) {

                    const fechaConvertida =
                        new Date(
                            datos.fecha
                        );


                    if (
                        !isNaN(
                            fechaConvertida.getTime()
                        )
                    ) {

                        fecha =
                            fechaConvertida;

                    }

                }


                actividades.push({

                    id:
                        documento.id,

                    origen:
                        "visita",

                    datos:
                        datos,

                    fecha:
                        fecha

                });

            }
        );


        /*
         * ========================================================
         * VENTAS
         * ========================================================
         */

        const ventasPorFecha =
            new Map();


        resultadoEgresos.forEach(
            documento => {

                const datos =
                    documento.data();


                if (
                    datos.tipoEgreso !== "venta"
                ) {

                    return;

                }


                console.log(
                    "VENTA ENCONTRADA:",
                    documento.id,
                    datos
                );


                /*
                 * ------------------------------------------------
                 * FECHA DE LA VENTA
                 * ------------------------------------------------
                 */

              let fecha = null;


/*
 * Para ventas usamos la fecha y hora real
 * del momento en que se registró el egreso.
 */

if (
    datos.creadoEn &&
    typeof datos.creadoEn.toDate ===
    "function"
) {

    fecha =
        datos.creadoEn.toDate();

}


/*
 * Si una venta antigua no tiene creadoEn,
 * usamos la fecha guardada como respaldo.
 */

if (
    !fecha &&
    datos.fecha
) {

    const fechaConvertida =
        new Date(
            `${datos.fecha}T00:00:00`
        );


    if (
        !isNaN(
            fechaConvertida.getTime()
        )
    ) {

        fecha =
            fechaConvertida;

    }

}

                /*
                 * ------------------------------------------------
                 * CLAVE PARA AGRUPAR
                 * ------------------------------------------------
                 */

                let claveFecha =
                    "sin-fecha";


                if (fecha) {

                    claveFecha =
                        fecha
                            .getFullYear()
                            + "-"
                            +
                        String(
                            fecha.getMonth() + 1
                        ).padStart(
                            2,
                            "0"
                        )
                            + "-"
                            +
                        String(
                            fecha.getDate()
                        ).padStart(
                            2,
                            "0"
                        );

                }


                /*
                 * ------------------------------------------------
                 * CREAR GRUPO
                 * ------------------------------------------------
                 */

                if (
                    !ventasPorFecha.has(
                        claveFecha
                    )
                ) {

                    ventasPorFecha.set(
                        claveFecha,
                        {

                            id:
                                "venta-" +
                                claveFecha,

                            origen:
                                "venta",

                            fecha:
                                fecha,

                            productos:
                                []

                        }
                    );

                }


                const venta =
                    ventasPorFecha.get(
                        claveFecha
                    );


                /*
                 * ------------------------------------------------
                 * AGREGAR PRODUCTO
                 * ------------------------------------------------
                 */

                venta.productos.push({

                    nombre:
                        datos.productoNombre ||
                        "Producto sin nombre",

                    cantidad:
                        datos.cantidad,

                    unidad:
                        datos.unidad ||
                        "",

                    lote:
                        datos.lote ||
                        ""

                });


                /*
                 * Si encontramos una fecha más nueva
                 * para el mismo grupo, la conservamos.
                 */

                if (
                    fecha &&
                    (
                        !venta.fecha ||
                        fecha > venta.fecha
                    )
                ) {

                    venta.fecha =
                        fecha;

                }

            }
        );


        /*
         * ========================================================
         * AGREGAR VENTAS AL HISTORIAL
         * ========================================================
         */

        ventasPorFecha.forEach(
            venta => {

                actividades.push(
                    venta
                );

            }
        );

/*
 * ========================================================
 * ENSAYOS
 * ========================================================
 */

resultadoEnsayos.forEach(
    documento => {

        const datos =
            documento.data();

        let fecha = null;

        // Usar fecha real de creación
        if (
            datos.creadoEn &&
            typeof datos.creadoEn.toDate ===
            "function"
        ) {

            fecha =
                datos.creadoEn.toDate();

        }

        // Compatibilidad con ensayos antiguos
        else if (
            datos.fecha &&
            typeof datos.fecha.toDate ===
            "function"
        ) {

            fecha =
                datos.fecha.toDate();

        }

        else if (datos.fecha) {

            const fechaConvertida =
                new Date(
                    `${datos.fecha}T00:00:00`
                );

            if (
                !isNaN(
                    fechaConvertida.getTime()
                )
            ) {

                fecha =
                    fechaConvertida;

            }

        }

        actividades.push({

            id:
                documento.id,

            origen:
                "ensayo",

            datos:
                datos,

            fecha:
                fecha

        });

    }
);
/*
 * ========================================================
 * COTIZACIONES
 * ========================================================
 */

resultadoCotizaciones.forEach(
    documento => {

        const datos =
            documento.data();

        let fecha = null;

        // Usar fecha real de creación
        if (
            datos.creadoEn &&
            typeof datos.creadoEn.toDate ===
            "function"
        ) {

            fecha =
                datos.creadoEn.toDate();

        }

        // Compatibilidad con cotizaciones antiguas
        else if (
            datos.fecha &&
            typeof datos.fecha.toDate ===
            "function"
        ) {

            fecha =
                datos.fecha.toDate();

        }

        else if (datos.fecha) {

            const fechaConvertida =
                new Date(
                    `${datos.fecha}T00:00:00`
                );

            if (
                !isNaN(
                    fechaConvertida.getTime()
                )
            ) {

                fecha =
                    fechaConvertida;

            }

        }

        actividades.push({

            id:
                documento.id,

            origen:
                "cotizacion",

            datos:
                datos,

            fecha:
                fecha

        });

    }
);
        
        
        /*
         * ========================================================
         * ORDENAR TODO DE MÁS NUEVO A MÁS VIEJO
         * ========================================================
         */

        actividades.sort(
            (a, b) =>
                (
                    b.fecha?.getTime() || 0
                )
                -
                (
                    a.fecha?.getTime() || 0
                )
        );


        listaHistorial.innerHTML =
            "";


        if (
            actividades.length === 0
        ) {

            listaHistorial.innerHTML =
                "<p>No hay registros en el historial.</p>";

            return;

        }


        /*
         * ========================================================
         * MOSTRAR HISTORIAL
         * ========================================================
         */

        actividades.forEach(
            actividad => {


                /*
                 * ==================================================
                 * VENTA
                 * ==================================================
                 */

                if (
                    actividad.origen ===
                    "venta"
                ) {

                    const tarjeta =
                        document.createElement(
                            "div"
                        );


                    tarjeta.className =
                        "visita";


                    const fechaTexto =
                        actividad.fecha
                            ? actividad.fecha.toLocaleString(
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
                            )
                            : "Sin fecha";


                    tarjeta.innerHTML = `

                        <div
                            style="
                                font-size:13px;
                                color:#777;
                                margin-bottom:5px;
                            "
                        >
                            ${fechaTexto}
                        </div>


                       <div
    style="
        display:inline-block;
        background:#f1f4f8;
        color:#1f4e8c;
        padding:5px 10px;
        border-radius:12px;
        font-size:13px;
        font-weight:600;
        margin-bottom:8px;
    "
>
    💰 Venta
</div>


                        <div
                            style="
                                font-size:17px;
                                font-weight:600;
                                color:#1f4e8c;
                            "
                        >
                            ${actividad.productos.length}
                            producto${actividad.productos.length === 1 ? "" : "s"}
                        </div>

                    `;


                    tarjeta.style.cursor =
                        "pointer";


                    tarjeta.addEventListener(
                        "click",
                        () => {

                            const overlay =
                                document.createElement(
                                    "div"
                                );


                            overlay.style.cssText = `
                                position:fixed;
                                inset:0;
                                background:rgba(0,0,0,.6);
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                z-index:99999;
                                padding:20px;
                            `;


                            const ventana =
                                document.createElement(
                                    "div"
                                );


                            ventana.style.cssText = `
                                background:white;
                                width:92%;
                                max-width:600px;
                                max-height:85vh;
                                overflow-y:auto;
                                border-radius:16px;
                                padding:25px;
                                box-sizing:border-box;
                            `;


                            let productosHTML =
                                "";


                            actividad.productos.forEach(
                                producto => {

                                    productosHTML += `

                                        <div
                                            style="
                                                padding:12px 0;
                                                border-bottom:1px solid #ddd;
                                            "
                                        >

                                            <strong
                                                style="
                                                    color:#1f4e8c;
                                                    font-size:16px;
                                                "
                                            >
                                                ${escaparHTML(
                                                    producto.nombre
                                                )}
                                            </strong>

                                            <div
                                                style="
                                                    margin-top:5px;
                                                    color:#555;
                                                "
                                            >
                                                Cantidad:
                                                ${producto.cantidad ?? "-"}
                                                ${escaparHTML(
                                                    producto.unidad
                                                )}
                                            </div>

                                            ${
                                                producto.lote
                                                    ? `
                                                        <div
                                                            style="
                                                                margin-top:3px;
                                                                color:#777;
                                                                font-size:13px;
                                                            "
                                                        >
                                                            Lote:
                                                            ${escaparHTML(
                                                                producto.lote
                                                            )}
                                                        </div>
                                                    `
                                                    : ""
                                            }

                                        </div>

                                    `;

                                }
                            );


                            ventana.innerHTML = `

                                <h2
                                    style="
                                        margin-top:0;
                                        color:#2e7d32;
                                    "
                                >
                                    Venta
                                </h2>


                                <div
                                    style="
                                        font-size:13px;
                                        color:#777;
                                        margin-bottom:15px;
                                    "
                                >
                                    ${fechaTexto}
                                </div>


                                <div>
                                    ${productosHTML}
                                </div>


                                <button
                                    type="button"
                                    style="
                                        width:100%;
                                        margin-top:20px;
                                        padding:13px;
                                        border:0;
                                        border-radius:8px;
                                        background:#1f4e8c;
                                        color:white;
                                        font-size:16px;
                                        font-weight:bold;
                                        cursor:pointer;
                                    "
                                >
                                    Cerrar
                                </button>

                            `;


                            overlay.appendChild(
                                ventana
                            );


                            document.body.appendChild(
                                overlay
                            );


                            ventana
                                .querySelector(
                                    "button"
                                )
                                .onclick =
                                () => {

                                    overlay.remove();

                                };


                            overlay.onclick =
                                event => {

                                    if (
                                        event.target ===
                                        overlay
                                    ) {

                                        overlay.remove();

                                    }

                                };

                        }
                    );


                    listaHistorial.appendChild(
                        tarjeta
                    );


                    return;

                }

/*
 * ==================================================
 * ENSAYO / COTIZACIÓN
 * ==================================================
 */

if (
    actividad.origen === "ensayo" ||
    actividad.origen === "cotizacion"
) {

    const datos =
        actividad.datos;


    const tarjeta =
        document.createElement(
            "div"
        );


    tarjeta.className =
        "visita";


    const esEnsayo =
        actividad.origen ===
        "ensayo";


    const tipoTexto =
        esEnsayo
            ? "🧪 Ensayo"
            : "📄 Cotización";


    const titulo =
        esEnsayo
            ? (
                datos.nombreEnsayo ||
                "Ensayo"
            )
            : (
                datos.nombreCotizacion ||
                "Cotización"
            );


    const fechaTexto =
        actividad.fecha
            ? actividad.fecha.toLocaleString(
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
            )
            : "Sin fecha";


    tarjeta.innerHTML = `

        <div
            style="
                font-size:13px;
                color:#777;
                margin-bottom:5px;
            "
        >
            ${fechaTexto}
        </div>


        <div
            style="
                display:inline-block;
                background:#f1f4f8;
                color:#1f4e8c;
                padding:5px 10px;
                border-radius:12px;
                font-size:13px;
                font-weight:600;
                margin-bottom:8px;
            "
        >
            ${tipoTexto}
        </div>


        <div
            style="
                font-size:17px;
                font-weight:600;
                color:#1f4e8c;
            "
        >
            ${escaparHTML(titulo)}
        </div>

    `;


    tarjeta.style.cursor =
        "pointer";


    tarjeta.addEventListener(
        "click",
        () => {

            window.location.href =
                esEnsayo
                    ? `ensayo.html?id=${actividad.id}`
                    : `cotizacion.html?id=${actividad.id}`;

        }
    );


    listaHistorial.appendChild(
        tarjeta
    );


    return;

}

                
                /*
                 * ==================================================
                 * VISITA / NOTA
                 * ==================================================
                 */

                const datos =
                    actividad.datos;


                const tarjeta =
                    document.createElement(
                        "div"
                    );


                tarjeta.className =
                    "visita";


                const titulo =
                    datos.titulo ||
                    (
                        datos.tipoVisita === "Nota"
                            ? "Nota"
                            : "Visita"
                    );


                const fechaTexto =
                    actividad.fecha
                        ? actividad.fecha.toLocaleString(
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
                        )
                        : "Sin fecha";


               const tipoTexto =
                datos.tipoVisita === "Nota"
                ? "📝 Nota"
                : "📍 Visita";


                tarjeta.innerHTML = `

                    <div
                        style="
                            font-size:13px;
                            color:#777;
                            margin-bottom:5px;
                        "
                    >
                        ${fechaTexto}
                    </div>


                  <div
    style="
        display:inline-block;
        background:#f1f4f8;
        color:#1f4e8c;
        padding:5px 10px;
        border-radius:12px;
        font-size:13px;
        font-weight:600;
        margin-bottom:8px;
    "
>
    ${tipoTexto}
</div>


                    <div
                        style="
                            font-size:17px;
                            font-weight:600;
                            color:#1f4e8c;
                        "
                    >
                        ${escaparHTML(titulo)}
                    </div>

                `;


                tarjeta.style.cursor =
                    "pointer";


                tarjeta.addEventListener(
                    "click",
                    () => {

                        const contenido =
                            datos.nota ||
                            "";


                        const overlay =
                            document.createElement(
                                "div"
                            );


                        overlay.style.cssText = `
                            position:fixed;
                            inset:0;
                            background:rgba(0,0,0,.6);
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            z-index:99999;
                            padding:20px;
                        `;


                        const ventana =
                            document.createElement(
                                "div"
                            );


                        ventana.style.cssText = `
                            background:white;
                            width:92%;
                            max-width:600px;
                            max-height:85vh;
                            overflow-y:auto;
                            border-radius:16px;
                            padding:25px;
                            box-sizing:border-box;
                        `;


                        ventana.innerHTML = `

                            <h2
                                style="
                                    margin-top:0;
                                    color:#1f4e8c;
                                "
                            >
                                ${escaparHTML(titulo)}
                            </h2>


                            <div
                                style="
                                    font-size:13px;
                                    color:#777;
                                    margin-bottom:18px;
                                "
                            >
                                ${fechaTexto}
                            </div>


                            <div
                                style="
                                    white-space:pre-wrap;
                                    line-height:1.5;
                                    font-size:16px;
                                    color:#333;
                                    margin-bottom:20px;
                                "
                            >
                                ${escaparHTML(
                                    contenido ||
                                    "Sin contenido."
                                )}
                            </div>


                            <button
                                type="button"
                                style="
                                    width:100%;
                                    padding:13px;
                                    border:0;
                                    border-radius:8px;
                                    background:#1f4e8c;
                                    color:white;
                                    font-size:16px;
                                    font-weight:bold;
                                    cursor:pointer;
                                "
                            >
                                Cerrar
                            </button>

                        `;


                        overlay.appendChild(
                            ventana
                        );


                        document.body.appendChild(
                            overlay
                        );


                        ventana
                            .querySelector(
                                "button"
                            )
                            .onclick =
                            () => {

                                overlay.remove();

                            };


                        overlay.onclick =
                            event => {

                                if (
                                    event.target ===
                                    overlay
                                ) {

                                    overlay.remove();

                                }

                            };

                    }
                );


                listaHistorial.appendChild(
                    tarjeta
                );

            }
        );

    }

    catch (error) {

        console.error(
            "ERROR CARGANDO HISTORIAL:",
            error
        );


        listaHistorial.innerHTML =
            "<p>No se pudo cargar el historial.</p>";

    }

}


/*
 * ============================================================
 * CARGAR HISTORIAL
 * ============================================================
 */

await cargarHistorialHistorial();
    
/*
 * ============================================================
 * FINAL
 * ============================================================
 */
});
