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
                    <button type="button">
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
     *
     * IMPORTANTE:
     *
     * El botón "Agregar contacto" NO modifica
     * el contacto principal.
     *
     * Abre un formulario nuevo.
     *
     * El nuevo contacto se guarda dentro del
     * array "contactos" del cliente.
     *
     * Esto permite tener:
     *
     * - Dueño
     * - Encargado de producción
     * - Compras
     * - Administración
     * - Ventas
     * - etc.
     *
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

    /*
     * Primero usamos el mismo formulario
     * que ya funciona para agregar contactos.
     */

    mostrarFormularioNuevoContacto();


    /*
     * Esperamos a que el formulario exista
     */

    const formulario =
        document.getElementById(
            "nuevoContactoForm"
        );

    if (!formulario) {
        return;
    }


    /*
     * Marcar que estamos editando
     */

    formulario.dataset.modo =
        "editar";

    formulario.dataset.indice =
        String(indice);


    /*
     * Cambiar título
     */

    const titulo =
        formulario.querySelector("h3");

    if (titulo) {

        titulo.textContent =
            "Editar contacto";

    }


    /*
     * Cargar datos actuales
     */

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


    /*
     * Cambiar texto del botón
     */

    const guardarBtnContacto =
        document.getElementById(
            "guardarNuevoContactoBtn"
        );

    if (guardarBtnContacto) {

        guardarBtnContacto.textContent =
            "💾 Guardar cambios";

    }


    /*
     * Llevar el formulario al centro
     */

    formulario.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });


    /*
     * Cursor en nombre
     */

    nombreInput?.focus();

}


    /*
 * ============================================================
 * EDITAR CONTACTO PRINCIPAL
 * ============================================================
 */

function mostrarFormularioEditarContactoPrincipal() {

    /*
     * Usamos el mismo formulario que ya funciona
     * para los contactos secundarios.
     */

    mostrarFormularioNuevoContacto();


    const formulario =
        document.getElementById(
            "nuevoContactoForm"
        );


    if (!formulario) {
        return;
    }


    /*
     * Indicamos que se trata del contacto principal.
     */

    formulario.dataset.modo =
        "editar-principal";


    /*
     * Cambiar título
     */

    const titulo =
        formulario.querySelector("h3");


    if (titulo) {

        titulo.textContent =
            "Editar contacto principal";

    }


    /*
     * Cargar datos actuales
     */

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


    /*
     * Cambiar texto del botón
     */

    const guardarContactoBtn =
        document.getElementById(
            "guardarNuevoContactoBtn"
        );


    if (guardarContactoBtn) {

        guardarContactoBtn.textContent =
            "💾 Guardar cambios";

    }


    /*
     * Llevar el formulario al centro
     */

    formulario.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });


    /*
     * Cursor en nombre
     */

    document
        .getElementById(
            "nuevoContactoNombre"
        )
        ?.focus();

}
    function mostrarFormularioNuevoContacto() {

        /*
         * Si ya hay un formulario abierto,
         * simplemente vamos hasta él.
         */

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


        /*
         * Crear formulario
         */

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


        /*
         * CANCELAR
         */

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


        /*
         * GUARDAR
         */

        document
            .getElementById(
                "guardarNuevoContactoBtn"
            )
            ?.addEventListener(
                "click",
                guardarNuevoContacto
            );


        /*
         * Poner cursor en nombre
         */

        document
            .getElementById(
                "nuevoContactoNombre"
            )
            ?.focus();


        /*
         * Llevar hasta el formulario
         */

        formulario.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }
        /*
     * ============================================================
     * GUARDAR NUEVO CONTACTO
     * ============================================================
     */

   /*
 * ============================================================
 * GUARDAR NUEVO CONTACTO / GUARDAR EDICIÓN
 * ============================================================
 */

async function guardarNuevoContacto() {

    const nombre =
        document
            .getElementById(
                "nuevoContactoNombre"
            )
            ?.value
            .trim();


    const posicion =
        document
            .getElementById(
                "nuevoContactoPosicion"
            )
            ?.value
            .trim();


    const telefono =
        document
            .getElementById(
                "nuevoContactoTelefono"
            )
            ?.value
            .trim();


    const email =
        document
            .getElementById(
                "nuevoContactoEmail"
            )
            ?.value
            .trim();


    const observaciones =
        document
            .getElementById(
                "nuevoContactoObservaciones"
            )
            ?.value
            .trim();


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
     * OBJETO CONTACTO
     * ============================================================
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


    const boton =
        document.getElementById(
            "guardarNuevoContactoBtn"
        );


    /*
     * ============================================================
     * DETECTAR SI ESTAMOS EDITANDO
     * ============================================================
     */

    const formulario =
        document.getElementById(
            "nuevoContactoForm"
        );


    const estaEditando =
        formulario?.dataset.modo ===
        "editar";


    const indiceEditar =
        formulario?.dataset.indice !== undefined
            ? Number(
                formulario.dataset.indice
            )
            : null;


    try {

        /*
         * Evitar doble clic
         */

        if (boton) {

            boton.disabled =
                true;

            boton.textContent =
                "Guardando...";

        }


        /*
         * ========================================================
         * EDITAR CONTACTO EXISTENTE
         * ========================================================
         */

        if (
            estaEditando &&
            indiceEditar !== null &&
            !isNaN(indiceEditar)
        ) {

            const snap =
                await getDoc(
                    clienteRef
                );


            if (!snap.exists()) {

                throw new Error(
                    "El cliente no existe."
                );

            }


            const datosCliente =
                snap.data();


            const contactosActuales =
                Array.isArray(
                    datosCliente.contactos
                )
                    ? [
                        ...datosCliente.contactos
                    ]
                    : [];


            if (
                indiceEditar < 0 ||
                indiceEditar >=
                    contactosActuales.length
            ) {

                throw new Error(
                    "No se encontró el contacto a editar."
                );

            }


            /*
             * Reemplazar solamente
             * el contacto seleccionado.
             */

            contactosActuales[
                indiceEditar
            ] =
                nuevoContacto;


            await updateDoc(

                clienteRef,

                {

                    contactos:
                        contactosActuales

                }

            );


            formulario?.remove();


            await cargarCliente();


            alert(
                "Contacto actualizado ✔"
            );


            return;

        }


        /*
         * ========================================================
         * AGREGAR CONTACTO NUEVO
         * ========================================================
         *
         * Esta es la lógica que ya teníamos.
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


        /*
         * Eliminar formulario
         */

        formulario?.remove();


        /*
         * Recargar cliente
         */

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


        if (boton) {

            boton.disabled =
                false;

            boton.textContent =
                estaEditando
                    ? "💾 Guardar cambios"
                    : "💾 Guardar contacto";

        }


        alert(
            estaEditando
                ? "No se pudo actualizar el contacto."
                : "No se pudo guardar el nuevo contacto."
        );

    }

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

        ].forEach(

            input => {

                input.hidden =
                    !editable;

            }

        );


        [

            contactoTxt,

            posicionTxt,

            telefonoTxt,

            emailTxt,

            observacionesTxt

        ].forEach(

            texto => {

                texto.hidden =
                    editable;

            }

        );

    }


    /*
     * ============================================================
     * BOTÓN AGREGAR CONTACTO
     * ============================================================
     *
     * ANTES:
     *
     * editarBtn.onclick = modoEdicion
     *
     * Eso hacía que "Agregar contacto" editara
     * el contacto principal.
     *
     * AHORA:
     *
     * abre un formulario para crear otro contacto.
     *
     * ============================================================
     */

    editarBtn.onclick =
        mostrarFormularioNuevoContacto;


    /*
     * ============================================================
     * GUARDAR CAMBIOS DEL CONTACTO PRINCIPAL
     * ============================================================
     *
     * Esta función queda conservada para no romper
     * la estructura existente.
     *
     * ============================================================
     */

    guardarBtn.onclick =
        async () => {

            try {

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

            }


            catch (error) {

                console.error(
                    "Error guardando cambios:",
                    error
                );


                alert(
                    "No se pudieron guardar los cambios."
                );

            }

        };


    /*
     * ============================================================
     * LINKS WHATSAPP / EMAIL
     * ============================================================
     */

    function actualizarLinks() {

        const tel =
            telefonoInput.value
                .replace(
                    /\D/g,
                    ""
                );


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

                numeric:
                    true,

                sensitivity:
                    "base"

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
                new Date(
                    v.fecha
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
     *
     * Se conserva la lógica actual:
     *
     * - Visitas
     * - Ensayos
     * - Entregas
     * - Ventas
     *
     * Las ventas se toman de "egresos".
     *
     * ============================================================
     */

    async function cargarVisitas() {

        visitasEl.innerHTML =
            "Cargando historial...";


        try {

            /*
             * ==================================================
             * BUSCAR VISITAS
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
             * BUSCAR EGRESOS
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
                     * Las ventas no se muestran
                     * desde visitas.
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


                    /*
                     * Solamente egresos
                     * de tipo venta.
                     */

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
             * AGREGAR VENTAS AL HISTORIAL
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
             * ORDENAR TODO EL HISTORIAL
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
             * MOSTRAR HISTORIAL
             * ==================================================
             */

            historial.forEach(

                registro => {

                    /*
                     * ==========================================
                     * VISITA / ENSAYO / ENTREGA
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


                        productos.sort(
                            compararProductos
                        );


                        /*
                         * Cada producto ocupa
                         * una sola fila.
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
                         * FECHA
                         */

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


                        /*
                         * CREAR REGISTRO
                         */

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
