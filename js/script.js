// Variables globales
let usuarios = []; // Lista de usuarios registrados
let usuarioLogueado = null; // Usuario actualmente logueado

// Función para manejar la visibilidad de las secciones
function actualizarVisibilidad(seccionesVisibles) {
    console.log("Secciones visibles:", seccionesVisibles);

    const todasLasSecciones = [
        "login",
        "registro",
        "homeBanking",
        "acciones",
        "formCambiarContrasenia",
        "formTransferirPropias",
        "formTransferirTerceros",
        "resultadoOperaciones",
        "formSolicitarPrestamo",
        "formComprarDolares",
        "tablaTransferencias",
        "tablaPrestamos",
        "cuerpoTablaPrestamos",
        "historialComprasDolares",
        "historialTransferenciasPropias",
        "cuerpoHistorialTransferenciasPropias",
        "cuerpoHistorialTransferenciasTerceros",
        "historialTransferenciasTerceros",
        "saldoPesos",
        "saldoDolares",
    ];

    todasLasSecciones.forEach((id) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (seccionesVisibles.includes(id)) {
                elemento.classList.remove("d-none");
            } else {
                elemento.classList.add("d-none");
            }
        } else {
            console.error(`El elemento con id '${id}' no existe en el DOM.`);
        }
    });
}

function actualizarMensajeBienvenida() {
    const nombreUsuario = usuarioLogueado.nombre; // Obtener el nombre del usuario logueado
    const saldoPesos = usuarioLogueado.saldoActual.toFixed(2); // Saldo en pesos
    const saldoDolares = (usuarioLogueado.saldoDolares || 0).toFixed(2); // Saldo en dólares (inicializar en 0 si no existe)

    // Actualizar el contenido del mensaje de bienvenida
    document.getElementById("bienvenidaUsuario").textContent = `Bienvenido, ${nombreUsuario}`;
    document.getElementById("saldoPesos").textContent = `Saldo actual en pesos: $${saldoPesos}`;
    document.getElementById("saldoDolares").textContent = `Saldo actual en dólares: $${saldoDolares}`;
}

// Función para mostrar la pantalla de inicio personalizada
function mostrarPantallaInicio() {
    console.log("Mostrando pantalla de inicio personalizada");

    // Actualizar el mensaje de bienvenida y los saldos
    actualizarMensajeBienvenida();

    // Mostrar la barra de acciones y la pantalla de inicio
    actualizarVisibilidad(["homeBanking", "acciones", "saldoPesos", "saldoDolares"]);
}

actualizarVisibilidad(["homeBanking", "acciones", "saldoPesos", "saldoDolares"]);


// Función para mostrar el formulario de registro
function mostrarFormularioRegistro() {
    console.log("Mostrando formulario de registro");
    actualizarVisibilidad(["registro"]);
}

// Función para manejar el inicio de sesión
function iniciarSesion(e) {
    e.preventDefault(); // Evitar recargar la página

    const usuarioIngresado = document.getElementById("usuarioLogin").value.trim();
    const contraseniaIngresada = document.getElementById("contraseniaLogin").value.trim();

    const usuarioEncontrado = usuarios.find(
        (u) => u.usuario === usuarioIngresado && u.contrasenia === contraseniaIngresada
    );

    if (usuarioEncontrado) {
        usuarioLogueado = usuarioEncontrado;
        localStorage.setItem("usuarioLogueadoId", usuarioLogueado.id); // Guardar el estado del usuario logueado
        mostrarPantallaInicio();
    } else {
        document.getElementById("loginMensaje").textContent = "Usuario o contraseña incorrectos.";
    }
}

// Función para manejar el registro de usuarios
function registrarUsuario(e) {
    e.preventDefault(); // Evitar recargar la página

    const nombre = document.getElementById("nombreRegistro").value.trim();
    const apellido = document.getElementById("apellidoRegistro").value.trim();
    const usuario = document.getElementById("usuarioRegistro").value.trim();
    const contrasenia = document.getElementById("contraseniaRegistro").value.trim();
    const saldoInicial = parseFloat(document.getElementById("saldoRegistro").value);

    if (!nombre || !apellido || !usuario || !contrasenia || isNaN(saldoInicial) || saldoInicial < 0) {
        document.getElementById("registroMensaje").textContent = "Todos los campos son obligatorios.";
        return;
    }

    const nuevoUsuario = {
        id: Date.now(),
        nombre,
        apellido,
        usuario,
        contrasenia,
        saldoActual: saldoInicial,
        saldoDolares: 0,
        historialTransferenciasPropias: [],
        historialTransferenciasTerceros: [],
        historialComprasDolares: [],
        historialPrestamos: [],
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios)); // Guardar usuarios en localStorage

    document.getElementById("registroMensaje").textContent = "Usuario registrado con éxito.";
    setTimeout(() => {
        mostrarFormularioLogin();
    }, 2000);
}



// Función para mostrar el formulario de inicio de sesión
function mostrarFormularioLogin() {
    console.log("Mostrando formulario de inicio de sesión");
    actualizarVisibilidad(["login"]);
}

// Función para cerrar sesión
function cerrarSesion() {
    console.log("Cerrando sesión");
    usuarioLogueado = null;
    localStorage.removeItem("usuarioLogueadoId");
    mostrarFormularioLogin();
}

// Función para mostrar transferencia a cuentas propias
function mostrarTransferenciaPropias() {
    console.log("Mostrando transferencia a cuentas propias");
    actualizarVisibilidad(["homeBanking", "acciones", "formTransferirPropias", "historialTransferenciasPropias"]);
    actualizarHistorialTransferenciasPropias();
}

function confirmarTransferenciaPropias(e) {
    e.preventDefault(); // Evitar recargar la página

    const monto = parseFloat(document.getElementById("montoTransferenciaPropias").value);

    if (isNaN(monto) || monto <= 0) {
        alert("Por favor, ingrese un monto válido.");
        return;
    }

    if (usuarioLogueado.saldoActual < monto) {
        alert("Saldo insuficiente para realizar la transferencia.");
        return;
    }

    // Actualizar el saldo del usuario
    usuarioLogueado.saldoActual -= monto;

    // Registrar la transferencia en el historial
    if (!usuarioLogueado.historialTransferenciasPropias) {
        usuarioLogueado.historialTransferenciasPropias = [];
    }
    usuarioLogueado.historialTransferenciasPropias.push({
        monto,
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString()
    });

    // Actualizar el array `usuarios` en el localStorage
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Actualizar el historial dinámicamente
    actualizarHistorialTransferenciasPropias();

    // Actualizar el mensaje de bienvenida para reflejar los nuevos saldos
    actualizarMensajeBienvenida();

    alert("Transferencia realizada con éxito.");

    // Mantener visible la sección de transferencias propias y su historial
    actualizarVisibilidad([
        "homeBanking",
        "acciones",
        "formTransferirPropias",
        "historialTransferenciasPropias",
        "cuerpoHistorialTransferenciasPropias"
    ]);
}

function actualizarHistorialTransferenciasPropias() {
    const cuerpoHistorial = document.getElementById("cuerpoHistorialTransferenciasPropias");
    if (!cuerpoHistorial) {
        console.error("El elemento con id 'cuerpoHistorialTransferenciasPropias' no existe en el DOM.");
        return;
    }

    // Asegurarse de que el historial sea visible
    cuerpoHistorial.classList.remove("d-none");

    cuerpoHistorial.innerHTML = ""; // Limpiar el historial

    if (usuarioLogueado.historialTransferenciasPropias && usuarioLogueado.historialTransferenciasPropias.length > 0) {
        usuarioLogueado.historialTransferenciasPropias.forEach((transferencia) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${transferencia.monto}</td>
                <td>${transferencia.fecha}</td>
                <td>${transferencia.hora}</td>
            `;
            cuerpoHistorial.appendChild(fila);
        });
    } else {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="3" class="text-center">No hay transferencias registradas.</td>`;
        cuerpoHistorial.appendChild(fila);
    }
}

// Función para mostrar transferencia a terceros
function mostrarTransferenciaTerceros() {
    console.log("Mostrando transferencia a terceros");
    actualizarVisibilidad(["homeBanking", "acciones", "formTransferirTerceros", "historialTransferenciasTerceros"]);
    actualizarHistorialTransferenciasTerceros();
}

function confirmarTransferenciaTerceros(e) {
    e.preventDefault(); // Evitar recargar la página

    const usuarioDestino = document.getElementById("usuarioDestino").value.trim();
    const monto = parseFloat(document.getElementById("montoTransferencia").value);
    const moneda = document.getElementById("monedaTransferencia").value; // Selector de moneda (pesos o dólares)

    if (!usuarioDestino || isNaN(monto) || monto <= 0) {
        alert("Por favor, ingrese un usuario destino y un monto válido.");
        return;
    }

    if (moneda === "pesos") {
        if (usuarioLogueado.saldoActual < monto) {
            alert("Saldo insuficiente en pesos para realizar la transferencia.");
            return;
        }
        usuarioLogueado.saldoActual -= monto;
    } else if (moneda === "dolares") {
        if (usuarioLogueado.saldoDolares < monto) {
            alert("Saldo insuficiente en dólares para realizar la transferencia.");
            return;
        }
        usuarioLogueado.saldoDolares -= monto;
    }

    // Registrar la transferencia en el historial
    if (!usuarioLogueado.historialTransferenciasTerceros) {
        usuarioLogueado.historialTransferenciasTerceros = [];
    }
    usuarioLogueado.historialTransferenciasTerceros.push({
        usuarioDestino,
        monto,
        moneda,
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString()
    });

    // Actualizar el array `usuarios` en el localStorage
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Actualizar el historial dinámicamente
    actualizarHistorialTransferenciasTerceros();

    // Actualizar el mensaje de bienvenida para reflejar los nuevos saldos
    actualizarMensajeBienvenida();

    alert("Transferencia realizada con éxito.");

    // Mantener visible la sección de transferencias a terceros y su historial
    actualizarVisibilidad([
        "homeBanking",
        "acciones",
        "formTransferirTerceros",
        "historialTransferenciasTerceros",
        "cuerpoHistorialTransferenciasTerceros"
    ]);
}

function actualizarHistorialTransferenciasTerceros() {
    const cuerpoHistorial = document.getElementById("cuerpoHistorialTransferenciasTerceros");
    if (!cuerpoHistorial) {
        console.error("El elemento con id 'cuerpoHistorialTransferenciasTerceros' no existe en el DOM.");
        return;
    }

    // Asegurarse de que el historial sea visible
    cuerpoHistorial.classList.remove("d-none");

    cuerpoHistorial.innerHTML = ""; // Limpiar el historial

    if (usuarioLogueado.historialTransferenciasTerceros && usuarioLogueado.historialTransferenciasTerceros.length > 0) {
        usuarioLogueado.historialTransferenciasTerceros.forEach((transferencia) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${transferencia.usuarioDestino}</td>
                <td>${transferencia.monto}</td>
                <td>${transferencia.moneda}</td>
                <td>${transferencia.fecha}</td>
                <td>${transferencia.hora}</td>
            `;
            cuerpoHistorial.appendChild(fila);
        });
    } else {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="5" class="text-center">No hay transferencias registradas.</td>`;
        cuerpoHistorial.appendChild(fila);
    }
}

// Función para mostrar historial de operaciones
function mostrarHistorial() {
    console.log("Mostrando historial de operaciones");
    actualizarVisibilidad(["homeBanking", "acciones", "tablaTransferencias", "tablaPrestamos"]);
}

// Función para mostrar el formulario de cambio de contraseña
function mostrarFormularioCambiarContrasenia() {
    console.log("Mostrando formulario de cambio de contraseña");
    actualizarVisibilidad(["homeBanking", "acciones", "formCambiarContrasenia"]);
}

// Función para mostrar el formulario y el historial de transferencias a terceros
function mostrarFormularioTransferenciaTerceros() {
    console.log("Mostrando formulario de transferencia a terceros");
    actualizarVisibilidad([
        "homeBanking",
        "acciones",
        "formTransferirTerceros",
        "historialTransferenciasTerceros",
        "cuerpoHistorialTransferenciasTerceros"
    ]);
    actualizarHistorialTransferenciasTerceros();
}

// Función para mostrar el formulario de solicitar préstamo
function mostrarFormularioPrestamo() {
    console.log("Mostrando formulario de solicitar préstamo");
    actualizarVisibilidad(["homeBanking", "acciones", "formSolicitarPrestamo"]);

    // Forzar la eliminación de la clase d-none
    const formSolicitarPrestamo = document.getElementById("formSolicitarPrestamo");
    if (formSolicitarPrestamo) {
        formSolicitarPrestamo.classList.remove("d-none");
        console.log("Clase d-none eliminada manualmente del formulario de préstamo");
    }
}

function confirmarSolicitudPrestamo(e) {
    e.preventDefault(); // Evitar recargar la página

    const monto = parseFloat(document.getElementById("montoPrestamo").value);
    const plazo = parseInt(document.getElementById("plazoPrestamo").value);

    if (isNaN(monto) || monto <= 0 || isNaN(plazo) || plazo <= 0) {
        alert("Por favor, ingrese un monto y un plazo válidos.");
        return;
    }

    // Calcular la cuota mensual (interés fijo del 5% mensual como ejemplo)
    const tasaInteres = 0.05;
    const cuota = (monto * (1 + tasaInteres * plazo)) / plazo;

    // Registrar el préstamo en el historial
    if (!usuarioLogueado.historialPrestamos) {
        usuarioLogueado.historialPrestamos = [];
    }
    usuarioLogueado.historialPrestamos.push({
        monto,
        plazo,
        cuota: cuota.toFixed(2),
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString()
    });

    // Actualizar el array `usuarios` en el localStorage
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Actualizar el historial dinámicamente
    actualizarHistorialPrestamos();

    alert("Préstamo solicitado con éxito.");

    // Mantener visible la sección de préstamos y su historial
    actualizarVisibilidad([
        "homeBanking",
        "acciones",
        "formSolicitarPrestamo",
        "tablaPrestamos"
    ]);
}

function actualizarHistorialPrestamos() {
    const cuerpoHistorial = document.getElementById("cuerpoTablaPrestamos");
    if (!cuerpoHistorial) {
        console.error("El elemento con id 'cuerpoTablaPrestamos' no existe en el DOM.");
        return;
    }

    // Asegurarse de que el historial sea visible
    cuerpoHistorial.classList.remove("d-none");

    cuerpoHistorial.innerHTML = ""; // Limpiar el historial

    if (usuarioLogueado.historialPrestamos && usuarioLogueado.historialPrestamos.length > 0) {
        usuarioLogueado.historialPrestamos.forEach((prestamo) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${prestamo.monto}</td>
                <td>${prestamo.plazo} meses</td>
                <td>${prestamo.cuota}</td>
                <td>${prestamo.fecha}</td>
                <td>${prestamo.hora}</td>
            `;
            cuerpoHistorial.appendChild(fila);
        });
    } else {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="5" class="text-center">No hay préstamos registrados.</td>`;
        cuerpoHistorial.appendChild(fila);
    }
}

function mostrarFormularioTransferenciaPropias() {
    console.log("Mostrando formulario de transferencia a cuentas propias");
    actualizarVisibilidad([
        "homeBanking",
        "acciones",
        "formTransferirPropias",
        "historialTransferenciasPropias",
        "cuerpoHistorialTransferenciasPropias"
    ]);
    actualizarHistorialTransferenciasPropias();
}

function mostrarFormularioSolicitarPrestamo() {
    console.log("Mostrando formulario de solicitud de préstamo");
    actualizarVisibilidad([
        "homeBanking",
        "acciones",
        "formSolicitarPrestamo",
        "tablaPrestamos",
        "cuerpoTablaPrestamos"
    ]);
    actualizarHistorialPrestamos();
}

function solicitarPrestamo(e) {
    e.preventDefault(); // Evitar recargar la página

    const monto = parseFloat(document.getElementById("montoPrestamo").value);
    const plazo = parseInt(document.getElementById("plazoPrestamo").value);

    if (isNaN(monto) || monto <= 0 || isNaN(plazo) || plazo <= 0) {
        alert("Por favor, ingrese valores válidos para el monto y el plazo.");
        return;
    }

    // Calcular la cuota mensual (ejemplo: interés fijo del 5%)
    const tasaInteres = 0.05;
    const cuota = (monto * (1 + tasaInteres)) / plazo;

    // Crear el objeto del préstamo
    const nuevoPrestamo = {
        monto,
        plazo,
        cuota: cuota.toFixed(2),
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString()
    };

    // Agregar el préstamo al historial del usuario logueado
    if (!usuarioLogueado.historialPrestamos) {
        usuarioLogueado.historialPrestamos = [];
    }
    usuarioLogueado.historialPrestamos.push(nuevoPrestamo);

    // Actualizar el array `usuarios` en el localStorage
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Actualizar la tabla de préstamos
    actualizarTablaPrestamos();

    // Volver a la pantalla de inicio
    mostrarPantallaInicio();
}

function actualizarTablaPrestamos() {
    const cuerpoTabla = document.getElementById("cuerpoTablaPrestamos");
    cuerpoTabla.innerHTML = ""; // Limpiar la tabla

    if (usuarioLogueado.historialPrestamos && usuarioLogueado.historialPrestamos.length > 0) {
        usuarioLogueado.historialPrestamos.forEach((prestamo) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${prestamo.monto}</td>
                <td>${prestamo.plazo} meses</td>
                <td>${prestamo.cuota}</td>
                <td>${prestamo.fecha}</td>
                <td>${prestamo.hora}</td>
            `;
            cuerpoTabla.appendChild(fila);
        });
    } else {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="5" class="text-center">No hay préstamos registrados.</td>`;
        cuerpoTabla.appendChild(fila);
    }
}

// Función para mostrar el formulario de compra de dólares
function mostrarFormularioCompraDolares() {
    console.log("Ejecutando mostrarFormularioCompraDolares");
    console.log("Secciones visibles esperadas: ['acciones', 'formComprarDolares', 'historialComprasDolares']");
    // Mostrar la barra de acciones, el formulario y el historial de compras
    actualizarVisibilidad(["homeBanking", "acciones", "formComprarDolares", "historialComprasDolares"]);

    // Actualizar el historial de compras de dólares
    actualizarHistorialComprasDolares();
}

function comprarDolares(e) {
    e.preventDefault(); // Evitar recargar la página

    const montoPesos = parseFloat(document.getElementById("montoCompraDolares").value);
    const tasaCambio = parseFloat(document.getElementById("tasaCambio").value);

    if (isNaN(montoPesos) || montoPesos <= 0 || isNaN(tasaCambio) || tasaCambio <= 0) {
        alert("Por favor, ingrese valores válidos para el monto y la tasa de cambio.");
        return;
    }

    const montoDolares = (montoPesos / tasaCambio).toFixed(2);

    if (usuarioLogueado.saldoActual < montoPesos) {
        alert("Saldo insuficiente para realizar la compra.");
        return;
    }

    // Actualizar los saldos del usuario
    usuarioLogueado.saldoActual -= montoPesos;
    usuarioLogueado.saldoDolares += parseFloat(montoDolares);

    // Registrar la operación en el historial de compras de dólares
    if (!usuarioLogueado.historialComprasDolares) {
        usuarioLogueado.historialComprasDolares = [];
    }
    usuarioLogueado.historialComprasDolares.push({
        montoPesos,
        montoDolares,
        tasaCambio,
        fecha: new Date().toLocaleDateString(),
        hora: new Date().toLocaleTimeString()
    });

    // Actualizar el array `usuarios` en el localStorage
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Actualizar el historial dinámicamente
    actualizarHistorialComprasDolares();

    // Actualizar el mensaje de bienvenida para reflejar los nuevos saldos
    actualizarMensajeBienvenida();

    alert(`Compra realizada con éxito. Has adquirido ${montoDolares} dólares.`);

    // Mantener visible la sección de compra de dólares
    actualizarVisibilidad(["homeBanking", "acciones", "formComprarDolares", "historialComprasDolares"]);
}

function actualizarHistorialComprasDolares() {
    const cuerpoHistorial = document.getElementById("cuerpoHistorialComprasDolares");
    cuerpoHistorial.innerHTML = ""; // Limpiar el historial

    if (usuarioLogueado.historialComprasDolares && usuarioLogueado.historialComprasDolares.length > 0) {
        usuarioLogueado.historialComprasDolares.forEach((compra) => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${compra.montoPesos}</td>
                <td>${compra.montoDolares}</td>
                <td>${compra.tasaCambio}</td>
                <td>${compra.fecha}</td>
                <td>${compra.hora}</td>
            `;
            cuerpoHistorial.appendChild(fila);
        });
    } else {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td colspan="5" class="text-center">No hay compras registradas.</td>`;
        cuerpoHistorial.appendChild(fila);
    }
}

// Función para mostrar el formulario de prestamo
function mostrarFormularioPrestamo() {
    console.log("Mostrando formulario de préstamo");

    // Mostrar la barra de acciones y el formulario de préstamo
    actualizarVisibilidad(["homeBanking", "acciones", "formSolicitarPrestamo", "tablaPrestamos", "cuerpoTablaPrestamos"]);
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Inicializando aplicación...");

    // Recuperar usuarios del localStorage
    const usuariosGuardados = localStorage.getItem("usuarios");
    if (usuariosGuardados) {
        usuarios = JSON.parse(usuariosGuardados);
        console.log("Usuarios cargados desde localStorage:", usuarios);
    } else {
        usuarios = [];
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        console.log("No se encontraron usuarios en localStorage. Inicializando array vacío.");
    }

    // Recuperar el estado del usuario logueado
    const usuarioLogueadoId = localStorage.getItem("usuarioLogueadoId");
    if (usuarioLogueadoId) {
        usuarioLogueado = usuarios.find((u) => u.id === parseInt(usuarioLogueadoId));
        if (usuarioLogueado) {
            const accionActual = JSON.parse(localStorage.getItem("accionActual"));
            if (accionActual) {
                // Restaurar el formulario y el historial correspondientes
                actualizarVisibilidad(["homeBanking", "acciones", accionActual.formulario, accionActual.historial]);

                // Limpiar el estado de la acción del localStorage
                localStorage.removeItem("accionActual");
            } else {
                mostrarPantallaInicio();
            }
        } else {
            console.error("No se encontró el usuario logueado en la lista de usuarios.");
            mostrarFormularioLogin();
        }
    } else {
        mostrarFormularioLogin();
    }
});


const btnSolicitarPrestamo = document.getElementById("solicitarPrestamo");
if (btnSolicitarPrestamo) {
    btnSolicitarPrestamo.addEventListener("click", mostrarFormularioSolicitarPrestamo);
}

const formSolicitarPrestamo = document.getElementById("formSolicitarPrestamo");
if (formSolicitarPrestamo) {
    formSolicitarPrestamo.addEventListener("submit", confirmarSolicitudPrestamo);
}

const btnComprarDolares = document.getElementById("comprarDolares");
if (btnComprarDolares) {
    btnComprarDolares.addEventListener("click", mostrarFormularioCompraDolares);
}

const formComprarDolares = document.getElementById("formComprarDolares");
if (formComprarDolares) {
    formComprarDolares.addEventListener("submit", comprarDolares);
}

const btnTransferirPropias = document.getElementById("transferirPropias");
if (btnTransferirPropias) {
    btnTransferirPropias.addEventListener("click", mostrarFormularioTransferenciaPropias);
}

const formTransferirPropias = document.getElementById("formularioTransferenciaPropias");
if (formTransferirPropias) {
    formTransferirPropias.addEventListener("submit", confirmarTransferenciaPropias);
}

const btnTransferirTerceros = document.getElementById("transferirTerceros");
if (btnTransferirTerceros) {
    btnTransferirTerceros.addEventListener("click", mostrarFormularioTransferenciaTerceros);
}

const formTransferirTerceros = document.getElementById("formularioTransferenciaTerceros");
if (formTransferirTerceros) {
    formTransferirTerceros.addEventListener("submit", confirmarTransferenciaTerceros);
}


// Cerrar sesión al recargar o salir de la página

// Vincular eventos a los botones
document.getElementById("formLogin").addEventListener("submit", iniciarSesion);
document.getElementById("btnRegistro").addEventListener("click", mostrarFormularioRegistro);
document.getElementById("formRegistro").addEventListener("submit", registrarUsuario);
document.getElementById("btnCerrarSesion").addEventListener("click", cerrarSesion);
document.getElementById("transferirPropias").addEventListener("click", mostrarTransferenciaPropias);
document.getElementById("transferirTerceros").addEventListener("click", mostrarTransferenciaTerceros);
document.getElementById("verHistorial").addEventListener("click", mostrarHistorial);
document.getElementById("cambiarContrasenia").addEventListener("click", mostrarFormularioCambiarContrasenia);
document.getElementById("solicitarPrestamo").addEventListener("click", mostrarFormularioPrestamo);
document.getElementById("formSolicitarPrestamo").addEventListener("submit", solicitarPrestamo);
document.getElementById("comprarDolares").addEventListener("click", mostrarFormularioCompraDolares);
document.getElementById("formComprarDolares").addEventListener("submit", comprarDolares);
