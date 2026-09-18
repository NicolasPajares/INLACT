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

    if (!nuevaNotaBtn) {
        console.error(
            "No se encontró el botón #nuevaNotaBtn"
        );
        return;
    }


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
            item.fecha &&
            typeof item.fecha.toDate === "function"
        ) {
            return item.fecha.toDate();
        }

        if (item.fecha) {

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

        overlay.className =
            "overlay-nota-historial";


        const ventana =
            document.createElement("div");

        ventana.className =
            "ventana-nota-historial";


        const fecha =
            obtenerFecha(nota);


        ventana.innerHTML = `

            <h3>
                ${escaparHTML(
                    nota.titulo ||
                    "Nota"
                )}
            </h3>

            <div class="datos-nota-historial">

                <strong>
                    ${escaparHTML(
                        nota.cliente ||
                        ""
                    )}
                </strong>

                <br>

                ${mostrarFecha(fecha)}

            </div>

            <div class="contenido-nota-historial">

                ${escaparHTML(
                    nota.nota ||
                    ""
                )}

            </div>

            <button
                class="cerrar-nota-historial"
                type="button"
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
                ".cerrar-nota-historial"
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
     * MOSTRAR NOTAS
     **********************/
    async function cargarNotas() {

        const clienteId =
            new URLSearchParams(
                window.location.search
            ).get("id");


        const lista =
            document.getElementById(
                "listaVisitasCliente"
            );


        if (!clienteId || !lista) {
            return;
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

                        fecha:
                            obtenerFecha(
                                datos
                            )

                    });

                }
            );


            notas.sort(
                (a, b) => {

                    const fechaA =
                        a.fecha
                            ? a.fecha.getTime()
                            : 0;

                    const fechaB =
                        b.fecha
                            ? b.fecha.getTime()
                            : 0;

                    return fechaB - fechaA;

                }
            );


            notas.forEach(
                nota => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "visita item-nota-visita";


                    item.innerHTML = `

                        <div class="fecha">

                            ${mostrarFecha(
                                nota.fecha
                            )}

                        </div>


                        <span
                            class="badge comercial"
                        >
                            Nota
                        </span>


                        <span
                            class="titulo-nota-historial"
                        >
                            ${escaparHTML(
                                nota.titulo ||
                                "Nota"
                            )}
                        </span>

                    `;


                    item.addEventListener(
                        "click",
                        () => {

                            abrirNotaHistorial(
                                nota
                            );

                        }
                    );


                    lista.appendChild(
                        item
                    );

                }
            );


        } catch (error) {

            console.error(
                "Error cargando notas:",
                error
            );

        }
    }


    /**********************
     * NUEVA NOTA
     **********************/
    nuevaNotaBtn.addEventListener(
        "click",
        async () => {

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
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 15px;
                box-sizing: border-box;
            `;


            const box =
                document.createElement("div");


            box.style.cssText = `
                background: #fff;
                padding: 24px;
                border-radius: 16px;
                width: 92%;
                max-width: 520px;
                max-height: 90vh;
                overflow-y: auto;
                font-size: 17px;
                box-sizing: border-box;
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


            const fecha =
                ahora.toLocaleDateString(
                    "es-AR",
                    {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    }
                );


            const hora =
                ahora.toLocaleTimeString(
                    "es-AR",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            box.querySelector(
                "#fechaNota"
            ).value =
                fecha;


            box.querySelector(
                "#horaNota"
            ).value =
                hora;


            overlay.appendChild(
                box
            );


            document.body.appendChild(
                overlay
            );


            box.querySelector(
                "#cancelarNota"
            ).addEventListener(
                "click",
                () => {

                    overlay.remove();

                }
            );


            box.querySelector(
                "#guardarNota"
            ).addEventListener(
                "click",
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


                    const guardarBtn =
                        box.querySelector(
                            "#guardarNota"
                        );


                    try {

                        guardarBtn.disabled =
                            true;

                        guardarBtn.textContent =
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


                        guardarBtn.disabled =
                            false;


                        guardarBtn.textContent =
                            "💾 Guardar nota";


                        alert(
                            "No se pudo guardar la nota."
                        );

                    }

                }
            );


            box
                .querySelector(
                    "#tituloNota"
                )
                ?.focus();

        }
    );


    /**********************
     * CARGAR AL ENTRAR
     **********************/
    cargarNotas();

});
