import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {

    const nuevaNotaBtn =
        document.getElementById("nuevaNotaBtn");

    const lista =
        document.getElementById(
            "listaVisitasCliente"
        );


    /**********************
     * ESCAPAR HTML
     **********************/
    function escaparHTML(texto) {

        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /**********************
     * OBTENER FECHA
     **********************/
    function obtenerFecha(item) {

        if (
            item?.fecha &&
            typeof item.fecha.toDate === "function"
        ) {
            return item.fecha.toDate();
        }

        if (item?.fecha) {

            const fecha =
                new Date(item.fecha);

            if (!isNaN(fecha.getTime())) {
                return fecha;
            }
        }

        return null;
    }


    /**********************
     * MOSTRAR FECHA
     **********************/
    function mostrarFecha(fecha) {

        if (!fecha) {
            return "Sin fecha";
        }

        return fecha.toLocaleString(
            "es-AR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    /**********************
     * ABRIR NOTA
     **********************/
    function abrirNotaHistorial(nota) {

        const overlay =
            document.createElement("div");

        overlay.style.cssText = `
            position:fixed;
            inset:0;
            background:rgba(0,0,0,.55);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:15px;
            z-index:99999;
        `;


        const ventana =
            document.createElement("div");

        ventana.style.cssText = `
            background:#ffffff;
            width:92%;
            max-width:560px;
            max-height:85vh;
            overflow-y:auto;
            border-radius:16px;
            padding:24px;
            box-shadow:0 8px 30px rgba(0,0,0,.20);
            box-sizing:border-box;
        `;


        const fecha =
            obtenerFecha(nota);


        ventana.innerHTML = `

            <h3
                style="
                    color:#1f4e8c;
                    margin:0 0 8px 0;
                "
            >
                ${escaparHTML(
                    nota.titulo ||
                    "Nota"
                )}
            </h3>


            <div
                style="
                    font-size:13px;
                    color:#6b7280;
                    margin-bottom:18px;
                    line-height:1.5;
                "
            >

                <strong>
                    ${escaparHTML(
                        nota.cliente ||
                        ""
                    )}
                </strong>

                <br>

                ${mostrarFecha(fecha)}

            </div>


            <div
                style="
                    white-space:pre-wrap;
                    line-height:1.55;
                    font-size:16px;
                    color:#2c3e50;
                "
            >
                ${escaparHTML(
                    nota.nota ||
                    ""
                )}
            </div>


            <button
                type="button"
                id="cerrarNotaHistorial"
                style="
                    width:100%;
                    margin-top:20px;
                    padding:13px;
                    border:none;
                    border-radius:8px;
                    background:#eeeeee;
                    color:#333333;
                    font-size:16px;
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
                "#cerrarNotaHistorial"
            )
            .onclick = () => {

                overlay.remove();

            };


        overlay.onclick = event => {

            if (
                event.target === overlay
            ) {
                overlay.remove();
            }

        };
    }


    /**********************
     * CARGAR NOTAS
     **********************/
    async function obtenerNotas() {

        const clienteId =
            new URLSearchParams(
                window.location.search
            ).get("id");


        if (!clienteId) {
            return [];
        }


        try {

            const q =
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


            const snap =
                await getDocs(q);


            const notas = [];


            snap.forEach(
                docSnap => {

                    const datos =
                        docSnap.data();


                    if (
                        datos.tipoVisita !==
                        "Nota"
                    ) {
                        return;
                    }


                    notas.push({

                        id:
                            docSnap.id,

                        ...datos,

                        fechaObjeto:
                            obtenerFecha(
                                datos
                            )

                    });

                }
            );


            notas.sort(
                (a, b) => {

                    const fechaA =
                        a.fechaObjeto
                            ? a.fechaObjeto.getTime()
                            : 0;

                    const fechaB =
                        b.fechaObjeto
                            ? b.fechaObjeto.getTime()
                            : 0;

                    return fechaB - fechaA;

                }
            );


            return notas;


        } catch (error) {

            console.error(
                "Error cargando notas:",
                error
            );

            return [];
        }
    }


    /**********************
     * TRANSFORMAR HISTORIAL
     **********************/
    async function transformarNotas() {

        if (!lista) {
            return;
        }


        const notas =
            await obtenerNotas();


        if (!notas.length) {
            return;
        }


        /*
         * cliente.js crea las tarjetas
         * dentro de #listaVisitasCliente.
         *
         * Buscamos las tarjetas que contienen
         * la etiqueta "Nota".
         */
        const tarjetas =
            Array.from(
                lista.querySelectorAll(
                    ".visita"
                )
            );


        const tarjetasNota =
            tarjetas.filter(
                tarjeta => {

                    /*
                     * Si ya fue transformada,
                     * no la volvemos a tocar.
                     */
                    if (
                        tarjeta.dataset.notaTransformada ===
                        "true"
                    ) {
                        return false;
                    }


                    /*
                     * cliente.js actualmente
                     * muestra "Nota" en estas tarjetas.
                     */
                    const texto =
                        tarjeta.textContent
                            .trim();


                    return (
                        texto.includes("Nota")
                    );

                }
            );


        tarjetasNota.forEach(
            (tarjeta, indice) => {

                const nota =
                    notas[indice];


                if (!nota) {
                    return;
                }


                tarjeta.dataset.notaTransformada =
                    "true";


                tarjeta.className =
                    "visita";


                tarjeta.style.cursor =
                    "pointer";


                tarjeta.style.padding =
                    "12px 8px";


                tarjeta.style.borderRadius =
                    "8px";


                tarjeta.innerHTML = `

                    <div
                        class="fecha"
                    >
                        ${mostrarFecha(
                            nota.fechaObjeto
                        )}
                    </div>


                    <span
                        class="badge comercial"
                    >
                        Nota
                    </span>


                    <span
                        style="
                            display:block;
                            margin-top:7px;
                            font-weight:600;
                            color:#2c3e50;
                        "
                    >
                        ${escaparHTML(
                            nota.titulo ||
                            "Nota"
                        )}
                    </span>

                `;


                tarjeta.onclick =
                    () => {

                        abrirNotaHistorial(
                            nota
                        );

                    };


                tarjeta.onmouseenter =
                    () => {

                        tarjeta.style.background =
                            "#f3f7fb";

                    };


                tarjeta.onmouseleave =
                    () => {

                        tarjeta.style.background =
                            "";

                    };

            }
        );

    }


    /**********************
     * OBSERVAR HISTORIAL
     **********************/
    if (lista) {

        const observador =
            new MutationObserver(
                () => {

                    transformarNotas();

                }
            );


        observador.observe(
            lista,
            {
                childList: true,
                subtree: true
            }
        );


        /*
         * También intentamos varias veces
         * por si el historial ya estaba
         * dibujado antes de crear el observador.
         */
        transformarNotas();


        setTimeout(
            transformarNotas,
            500
        );

        setTimeout(
            transformarNotas,
            1500
        );

        setTimeout(
            transformarNotas,
            3000
        );
    }


    /**********************
     * NUEVA NOTA
     **********************/
    if (nuevaNotaBtn) {

        nuevaNotaBtn.addEventListener(
            "click",
            () => {

                const clienteId =
                    new URLSearchParams(
                        window.location.search
                    ).get("id");


                if (!clienteId) {

                    alert(
                        "No se pudo identificar el cliente."
                    );

                    return;
                }


                const clienteNombreEl =
                    document.getElementById(
                        "clienteNombre"
                    );


                const clienteNombre =
                    clienteNombreEl
                        ? clienteNombreEl.textContent.trim()
                        : "";


                const overlay =
                    document.createElement("div");


                overlay.style.cssText = `
                    position:fixed;
                    inset:0;
                    background:rgba(0,0,0,.6);
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    z-index:9999;
                    padding:15px;
                    box-sizing:border-box;
                `;


                const box =
                    document.createElement("div");


                box.style.cssText = `
                    background:#fff;
                    padding:24px;
                    border-radius:16px;
                    width:92%;
                    max-width:520px;
                    max-height:90vh;
                    overflow-y:auto;
                    font-size:17px;
                    box-sizing:border-box;
                `;


                box.innerHTML = `

                    <h3
                        style="
                            margin-top:0;
                            margin-bottom:18px;
                        "
                    >
                        Nueva nota
                    </h3>


                    <div
                        style="
                            margin-bottom:14px;
                        "
                    >

                        <label
                            style="
                                display:block;
                                font-weight:600;
                                margin-bottom:5px;
                            "
                        >
                            Cliente
                        </label>


                        <input
                            type="text"
                            value="${escaparHTML(
                                clienteNombre
                            )}"
                            readonly
                            style="
                                width:100%;
                                padding:12px;
                                border:1px solid #ddd;
                                border-radius:8px;
                                background:#f3f3f3;
                                font-size:16px;
                                box-sizing:border-box;
                            "
                        >

                    </div>


                    <div
                        style="
                            display:flex;
                            gap:12px;
                            margin-bottom:14px;
                        "
                    >

                        <div style="flex:1;">

                            <label
                                style="
                                    display:block;
                                    font-weight:600;
                                    margin-bottom:5px;
                                "
                            >
                                Fecha
                            </label>


                            <input
                                id="fechaNota"
                                type="text"
                                readonly
                                style="
                                    width:100%;
                                    padding:12px;
                                    border:1px solid #ddd;
                                    border-radius:8px;
                                    background:#f3f3f3;
                                    font-size:16px;
                                    box-sizing:border-box;
                                "
                            >

                        </div>


                        <div style="flex:1;">

                            <label
                                style="
                                    display:block;
                                    font-weight:600;
                                    margin-bottom:5px;
                                "
                            >
                                Hora
                            </label>


                            <input
                                id="horaNota"
                                type="text"
                                readonly
                                style="
                                    width:100%;
                                    padding:12px;
                                    border:1px solid #ddd;
                                    border-radius:8px;
                                    background:#f3f3f3;
                                    font-size:16px;
                                    box-sizing:border-box;
                                "
                            >

                        </div>

                    </div>


                    <div
                        style="
                            margin-bottom:14px;
                        "
                    >

                        <label
                            style="
                                display:block;
                                font-weight:600;
                                margin-bottom:5px;
                            "
                        >
                            Título
                        </label>


                        <input
                            id="tituloNota"
                            type="text"
                            placeholder="Ej.: Reunión con producción"
                            style="
                                width:100%;
                                padding:13px;
                                border:1px solid #ccc;
                                border-radius:8px;
                                font-size:16px;
                                box-sizing:border-box;
                            "
                        >

                    </div>


                    <div
                        style="
                            margin-bottom:18px;
                        "
                    >

                        <label
                            style="
                                display:block;
                                font-weight:600;
                                margin-bottom:5px;
                            "
                        >
                            Nota
                        </label>


                        <textarea
                            id="contenidoNota"
                            rows="9"
                            placeholder="Escribí la información que quieras guardar..."
                            style="
                                width:100%;
                                padding:13px;
                                border:1px solid #ccc;
                                border-radius:8px;
                                font-size:16px;
                                resize:vertical;
                                font-family:inherit;
                                line-height:1.4;
                                box-sizing:border-box;
                            "
                        ></textarea>

                    </div>


                    <div
                        style="
                            display:flex;
                            gap:10px;
                            justify-content:flex-end;
                        "
                    >

                        <button
                            id="cancelarNota"
                            type="button"
                            class="btn-secundario"
                        >
                            Cancelar
                        </button>


                        <button
                            id="guardarNota"
                            type="button"
                            class="btn-principal"
                        >
                            💾 Guardar nota
                        </button>

                    </div>

                `;


                const ahora =
                    new Date();


                box.querySelector(
                    "#fechaNota"
                ).value =
                    ahora.toLocaleDateString(
                        "es-AR",
                        {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                        }
                    );


                box.querySelector(
                    "#horaNota"
                ).value =
                    ahora.toLocaleTimeString(
                        "es-AR",
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    );


                overlay.appendChild(
                    box
                );

                document.body.appendChild(
                    overlay
                );


                box.querySelector(
                    "#cancelarNota"
                ).onclick =
                    () => overlay.remove();


                box.querySelector(
                    "#guardarNota"
                ).onclick =
                    async () => {

                        const titulo =
                            box
                                .querySelector(
                                    "#tituloNota"
                                )
                                .value
                                .trim();


                        const contenido =
                            box
                                .querySelector(
                                    "#contenidoNota"
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
                                "#guardarNota"
                            );


                        try {

                            boton.disabled =
                                true;

                            boton.textContent =
                                "Guardando...";


                            await addDoc(
                                collection(
                                    db,
                                    "visitas"
                                ),
                                {

                                    clienteId:
                                        clienteId,

                                    cliente:
                                        clienteNombre,

                                    tipoVisita:
                                        "Nota",

                                    titulo:
                                        titulo,

                                    nota:
                                        contenido,

                                    fecha:
                                        serverTimestamp()

                                }
                            );


                            overlay.remove();


                            alert(
                                "Nota guardada ✔"
                            );


                            window.location.reload();


                        } catch (error) {

                            console.error(
                                "Error guardando nota:",
                                error
                            );


                            boton.disabled =
                                false;

                            boton.textContent =
                                "💾 Guardar nota";


                            alert(
                                "No se pudo guardar la nota."
                            );

                        }

                    };


                box
                    .querySelector(
                        "#tituloNota"
                    )
                    ?.focus();

            }
        );

    }

});
