import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", async () => {

    const nuevaNotaBtn =
        document.getElementById("nuevaNotaBtn");

    if (!nuevaNotaBtn) {
        console.error(
            "No se encontró el botón #nuevaNotaBtn"
        );
        return;
    }


    /*
     * ==========================================
     * NUEVA NOTA
     * ==========================================
     */

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
                        value="${escaparHTML(clienteNombre)}"
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


            /*
             * FECHA Y HORA
             */

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
            ).value = fecha;


            box.querySelector(
                "#horaNota"
            ).value = hora;


            overlay.appendChild(box);

            document.body.appendChild(
                overlay
            );


            /*
             * CANCELAR
             */

            box.querySelector(
                "#cancelarNota"
            ).addEventListener(
                "click",
                () => {
                    overlay.remove();
                }
            );


            /*
             * GUARDAR
             */

            box.querySelector(
                "#guardarNota"
            ).addEventListener(
                "click",
                async () => {

                    const titulo =
                        box.querySelector(
                            "#tituloNota"
                        ).value.trim();


                    const contenido =
                        box.querySelector(
                            "#contenidoNota"
                        ).value.trim();


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


            box.querySelector(
                "#tituloNota"
            )?.focus();

        }
    );


    /*
     * ==========================================
     * MOSTRAR NOTAS GUARDADAS
     * ==========================================
     *
     * Esto se ejecuta al cargar la página.
     * Busca las notas del cliente y las agrega
     * al historial mostrando título y contenido.
     */

    await mostrarNotasGuardadas();


    async function mostrarNotasGuardadas() {

        const clienteId =
            new URLSearchParams(
                window.location.search
            ).get("id");


        if (!clienteId) {
            return;
        }


        const historial =
            document.getElementById(
                "listaVisitasCliente"
            );


        if (!historial) {
            return;
        }


        try {

            const qNotas =
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
                await getDocs(
                    qNotas
                );


            const notas = [];


            snap.forEach(
                docSnap => {

                    const dato =
                        docSnap.data();


                    if (
                        dato.tipoVisita !==
                        "Nota"
                    ) {
                        return;
                    }


                    notas.push({
                        id:
                            docSnap.id,

                        ...dato
                    });

                }
            );


            /*
             * Orden más reciente primero.
             */

            notas.sort(
                (a, b) => {

                    const fechaA =
                        obtenerFecha(
                            a.fecha
                        );

                    const fechaB =
                        obtenerFecha(
                            b.fecha
                        );

                    return (
                        fechaB -
                        fechaA
                    );

                }
            );


            /*
             * Agregamos cada nota al historial.
             */

            notas.forEach(
                nota => {

                    const fecha =
                        obtenerFecha(
                            nota.fecha
                        );


                    const div =
                        document.createElement(
                            "div"
                        );


                    div.className =
                        "visita";


                    div.innerHTML = `
                        <div class="fecha">
                            ${mostrarFecha(fecha)}
                        </div>

                        <span
                            class="badge"
                            style="
                                background:#e8f4ff;
                                color:#1f4e8c;
                            "
                        >
                            Nota
                        </span>

                        <div
                            style="
                                margin-top:10px;
                            "
                        >

                            <strong
                                style="
                                    display:block;
                                    font-size:17px;
                                    margin-bottom:7px;
                                "
                            >
                                ${escaparHTML(
                                    nota.titulo ||
                                    "Sin título"
                                )}
                            </strong>


                            <div
                                style="
                                    white-space:pre-wrap;
                                    line-height:1.5;
                                    color:#333;
                                "
                            >
                                ${escaparHTML(
                                    nota.nota ||
                                    ""
                                )}
                            </div>

                        </div>
                    `;


                    historial.appendChild(
                        div
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


    function obtenerFecha(valor) {

        if (
            valor &&
            typeof valor.toDate ===
                "function"
        ) {
            return valor.toDate();
        }


        if (valor) {

            const fecha =
                new Date(
                    valor
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


    function escaparHTML(valor) {

        return String(
            valor ?? ""
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

});
