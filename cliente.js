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

        const telefono =
            telefonoInput?.value || "";


        const email =
            emailInput?.value || "";


        const telefonoLimpio =
            telefono.replace(
                /\D/g,
                ""
            );


        if (wspLink) {

            if (telefonoLimpio) {

                wspLink.href =
                    `https://wa.me/54${telefonoLimpio}`;

                wspLink.hidden =
                    false;

            }

            else {

                wspLink.hidden =
                    true;

            }

        }


        if (mailLink) {

            if (email) {

                mailLink.href =
                    `mailto:${email}`;

                mailLink.hidden =
                    false;

            }

            else {

                mailLink.hidden =
                    true;

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
 * FINAL
 * ============================================================
 */
console.log("PRUEBA CLIENTE.JS - SE EJECUTÓ");
    console.log(
    "FUNCIÓN HISTORIAL:",
    typeof cargarHistorialHistorial
);
});
