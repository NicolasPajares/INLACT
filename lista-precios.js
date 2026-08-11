/* ============================================================
   FIREBASE
============================================================ */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* ============================================================
   CONFIG FIREBASE
============================================================ */

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


/* ============================================================
   ELEMENTOS DOM
============================================================ */

const listaEl =
    document.getElementById("listaPrecios");

const buscadorEl =
    document.getElementById("buscadorListas");

const btnNuevaLista =
    document.getElementById("btnNuevaLista");


let listas = [];


/* ============================================================
   NUEVA LISTA
============================================================ */

btnNuevaLista.addEventListener(
    "click",
    () => {

        window.location.href =
            "nueva-lista-precios.html";

    }
);


/* ============================================================
   CARGAR LISTAS
============================================================ */

async function cargarListas() {

    listaEl.innerHTML =
        "Cargando listas de precios...";

    listas = [];


    try {

        const q =
            query(
                collection(
                    db,
                    "listaprecios"
                ),
                orderBy(
                    "fecha",
                    "desc"
                )
            );


        const snap =
            await getDocs(q);


        snap.forEach(
            d => {

                listas.push({

                    id:
                        d.id,

                    ...d.data()

                });

            }
        );


        if (
            listas.length === 0
        ) {

            listaEl.innerHTML =
                "<li class='item-vacio'>No hay listas de precios cargadas</li>";

            return;

        }


        renderListas(listas);

    }

    catch (error) {

        console.error(
            "Error cargando listas:",
            error
        );

        listaEl.innerHTML =
            "<li class='item-vacio'>No se pudieron cargar las listas de precios.</li>";

    }

}


/* ============================================================
   RENDER LISTAS
============================================================ */

function renderListas(lista) {

    listaEl.innerHTML = "";


    lista.forEach(
        l => {


            /* ------------------------------------------------
               CONTENEDOR PRINCIPAL
            ------------------------------------------------ */

            const li =
                document.createElement(
                    "li"
                );


            li.className =
                "precio-item";


            /* ------------------------------------------------
               FECHA
            ------------------------------------------------ */

            const fecha =
                l.fecha?.toDate
                    ? l.fecha
                        .toDate()
                        .toLocaleDateString(
                            "es-AR"
                        )
                    : "--/--/----";


            /* ------------------------------------------------
               INFORMACIÓN
            ------------------------------------------------ */

            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "precio-info";


            info.innerHTML = `

                <small>
                    ${fecha}
                </small>

                <strong>
                    ${l.nombre || "Lista sin nombre"}
                </strong>

            `;


            /* ------------------------------------------------
               CLICK EN LA LISTA
            ------------------------------------------------ */

            info.onclick =
                () => {

                    window.location.href =
                        `lista-precio.html?id=${l.id}`;

                };


            /* ------------------------------------------------
               CONTENEDOR DE ACCIONES
            ------------------------------------------------ */

            const acciones =
                document.createElement(
                    "div"
                );


            acciones.className =
                "acciones-lista";


            /* ------------------------------------------------
               BOTÓN TRES PUNTITOS
            ------------------------------------------------ */

            const btnMenu =
                document.createElement(
                    "button"
                );


            btnMenu.type =
                "button";


            btnMenu.className =
                "btn-menu-lista";


            btnMenu.textContent =
                "⋮";


            btnMenu.title =
                "Opciones";


            /* ------------------------------------------------
               MENÚ
            ------------------------------------------------ */

            const menu =
                document.createElement(
                    "div"
                );


            menu.className =
                "menu-lista";


            menu.innerHTML = `

                <button
                    type="button"
                    class="btn-editar-lista"
                >
                    ✏️ Editar
                </button>

                <button
                    type="button"
                    class="btn-eliminar-lista"
                >
                    🗑️ Eliminar
                </button>

            `;


            /* ------------------------------------------------
               MOSTRAR / OCULTAR MENÚ
            ------------------------------------------------ */

            btnMenu.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    /*
                     * Cerrar otros menús
                     */

                    document
                        .querySelectorAll(
                            ".menu-lista"
                        )
                        .forEach(
                            otroMenu => {

                                if (
                                    otroMenu !== menu
                                ) {

                                    otroMenu.classList.remove(
                                        "mostrar"
                                    );

                                }

                            }
                        );


                    menu.classList.toggle(
                        "mostrar"
                    );

                }
            );


            /* ------------------------------------------------
               EDITAR
            ------------------------------------------------ */

            const btnEditar =
                menu.querySelector(
                    ".btn-editar-lista"
                );


            btnEditar.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    window.location.href =
                        `nueva-lista-precios.html?id=${l.id}`;

                }
            );


            /* ------------------------------------------------
               ELIMINAR
            ------------------------------------------------ */

            const btnEliminar =
                menu.querySelector(
                    ".btn-eliminar-lista"
                );


            btnEliminar.addEventListener(
                "click",
                async event => {

                    event.stopPropagation();


                    const ok =
                        confirm(
                            `¿Querés borrar la lista "${l.nombre}"?`
                        );


                    if (
                        !ok
                    ) {

                        return;

                    }


                    try {

                        await deleteDoc(
                            doc(
                                db,
                                "listaprecios",
                                l.id
                            )
                        );


                        /*
                         * Volver a cargar
                         */

                        await cargarListas();

                    }

                    catch (error) {

                        console.error(
                            "Error eliminando lista:",
                            error
                        );


                        alert(
                            "No se pudo eliminar la lista de precios."
                        );

                    }

                }
            );


            /* ------------------------------------------------
               ARMAR ACCIONES
            ------------------------------------------------ */

            acciones.appendChild(
                btnMenu
            );

            acciones.appendChild(
                menu
            );


            /* ------------------------------------------------
               ARMAR ITEM
            ------------------------------------------------ */

            li.appendChild(
                info
            );

            li.appendChild(
                acciones
            );


            listaEl.appendChild(
                li
            );

        }
    );

}


/* ============================================================
   CERRAR MENÚ AL HACER CLICK AFUERA
============================================================ */

document.addEventListener(
    "click",
    () => {

        document
            .querySelectorAll(
                ".menu-lista"
            )
            .forEach(
                menu => {

                    menu.classList.remove(
                        "mostrar"
                    );

                }
            );

    }
);


/* ============================================================
   BUSCADOR
============================================================ */

buscadorEl.addEventListener(
    "input",
    () => {

        const texto =
            buscadorEl.value
                .toLowerCase()
                .trim();


        const filtradas =
            listas.filter(
                l =>
                    (
                        l.nombre || ""
                    )
                        .toLowerCase()
                        .includes(
                            texto
                        )
            );


        renderListas(
            filtradas
        );

    }
);


/* ============================================================
   INIT
============================================================ */

cargarListas();
