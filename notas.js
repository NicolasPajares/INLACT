document.addEventListener("DOMContentLoaded", () => {

    const nuevaNotaBtn =
        document.getElementById("nuevaNotaBtn");

    if (!nuevaNotaBtn) {
        console.error(
            "No se encontró el botón #nuevaNotaBtn"
        );
        return;
    }

    nuevaNotaBtn.addEventListener(
        "click",
        () => {

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


            overlay.appendChild(box);

            document.body.appendChild(
                overlay
            );


            const cancelarBtn =
                box.querySelector(
                    "#cancelarNota"
                );

            if (cancelarBtn) {

                cancelarBtn.addEventListener(
                    "click",
                    () => {
                        overlay.remove();
                    }
                );

            }


            const tituloInput =
                box.querySelector(
                    "#tituloNota"
                );

            if (tituloInput) {

                tituloInput.focus();

            }


            /*
             * Por ahora el botón Guardar
             * NO guarda en Firebase.
             *
             * Lo conectamos en el próximo paso.
             */

        }
    );

});
