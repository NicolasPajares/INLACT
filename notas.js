document.addEventListener("DOMContentLoaded", () => {

  /*
   * ============================================================
   * BOTÓN NUEVA NOTA
   * ============================================================
   */

  const botones =
    document.querySelectorAll("button");

  let btnNuevaNota = null;

  botones.forEach(btn => {

    if (
      btn.textContent
        .trim()
        .toLowerCase() === "nueva nota"
    ) {

      btnNuevaNota = btn;

    }

  });


  if (!btnNuevaNota) {

    console.error(
      "No se encontró el botón Nueva nota."
    );

    return;

  }


  /*
   * ============================================================
   * ABRIR FORMULARIO
   * ============================================================
   */

  btnNuevaNota.addEventListener(
    "click",
    mostrarFormularioNuevaNota
  );


  /*
   * ============================================================
   * FORMULARIO NUEVA NOTA
   * ============================================================
   */

  function mostrarFormularioNuevaNota() {

    /*
     * Evitar abrir dos formularios
     */

    const formularioExistente =
      document.getElementById(
        "formularioNuevaNota"
      );

    if (formularioExistente) {

      return;

    }


    /*
     * CLIENTE
     */

    const clienteEl =
      document.getElementById(
        "clienteNombre"
      );

    const cliente =
      clienteEl?.textContent.trim() || "";


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


    /*
     * OVERLAY
     */

    const overlay =
      document.createElement("div");


    overlay.id =
      "formularioNuevaNota";


    overlay.style.cssText = `
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.6);
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:9999;
      padding:15px;
    `;


    /*
     * CAJA
     */

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
    `;


    /*
     * CONTENIDO
     */

    box.innerHTML = `

      <h3 style="margin-bottom:18px;">
        Nueva nota
      </h3>


      <div style="margin-bottom:14px;">

        <label style="
          display:block;
          font-weight:600;
          margin-bottom:5px;
        ">
          Cliente
        </label>

        <input
          type="text"
          value="${escaparHTML(cliente)}"
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


      <div style="
        display:flex;
        gap:12px;
        margin-bottom:14px;
      ">

        <div style="flex:1;">

          <label style="
            display:block;
            font-weight:600;
            margin-bottom:5px;
          ">
            Fecha
          </label>

          <input
            type="text"
            value="${fecha}"
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

          <label style="
            display:block;
            font-weight:600;
            margin-bottom:5px;
          ">
            Hora
          </label>

          <input
            type="text"
            value="${hora}"
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


      <div style="margin-bottom:14px;">

        <label style="
          display:block;
          font-weight:600;
          margin-bottom:5px;
        ">
          Título
        </label>

        <input
          id="tituloNuevaNota"
          type="text"
          placeholder="Ej.: Información importante"
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


      <div style="margin-bottom:18px;">

        <label style="
          display:block;
          font-weight:600;
          margin-bottom:5px;
        ">
          Nota
        </label>

        <textarea
          id="contenidoNuevaNota"
          rows="9"
          placeholder="Escribí la información que quieras guardar sobre este cliente..."
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


      <button
        id="guardarNuevaNota"
        style="
          width:100%;
          padding:15px;
          background:linear-gradient(135deg,#1f4e8c,#3b82f6);
          color:#fff;
          border:none;
          border-radius:8px;
          font-size:17px;
          font-weight:bold;
          cursor:pointer;
        "
      >
        Guardar nota
      </button>


      <button
        id="cancelarNuevaNota"
        style="
          width:100%;
          padding:13px;
          margin-top:10px;
          background:#eee;
          color:#333;
          border:none;
          border-radius:8px;
          font-size:16px;
          cursor:pointer;
        "
      >
        Cancelar
      </button>

    `;


    /*
     * AGREGAR AL DOCUMENTO
     */

    overlay.appendChild(box);

    document.body.appendChild(overlay);


    /*
     * ============================================================
     * CANCELAR
     * ============================================================
     */

    box
      .querySelector(
        "#cancelarNuevaNota"
      )
      .onclick = () => {

        overlay.remove();

      };


    /*
     * ============================================================
     * GUARDAR
     *
     * POR AHORA SOLO PROBAMOS EL FORMULARIO.
     * NO GUARDA EN FIREBASE.
     * ============================================================
     */

    box
      .querySelector(
        "#guardarNuevaNota"
      )
      .onclick = () => {

        const titulo =
          box
            .querySelector(
              "#tituloNuevaNota"
            )
            .value
            .trim();


        const contenido =
          box
            .querySelector(
              "#contenidoNuevaNota"
            )
            .value
            .trim();


        if (!titulo) {

          alert(
            "Escribí un título para la nota."
          );

          box
            .querySelector(
              "#tituloNuevaNota"
            )
            .focus();

          return;

        }


        if (!contenido) {

          alert(
            "Escribí una nota."
          );

          box
            .querySelector(
              "#contenidoNuevaNota"
            )
            .focus();

          return;

        }


        alert(
          "Formulario funcionando correctamente ✔"
        );

      };


    /*
     * ============================================================
     * CURSOR
     * ============================================================
     */

    setTimeout(() => {

      box
        .querySelector(
          "#tituloNuevaNota"
        )
        ?.focus();

    }, 100);

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

});
