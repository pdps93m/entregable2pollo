// 1. Declaración de variables y constantes globales
let usuarios = []; // Array para almacenar los usuarios registrados
let usuarioLogueado = null; // Variable para almacenar el usuario actualmente logueado

// 2. Funciones para manejar localStorage
function guardarUsuariosEnLocalStorage() {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function recuperarUsuariosDeLocalStorage() {
    const usuariosGuardados = localStorage.getItem("usuarios");
    if (usuariosGuardados) {
        return JSON.parse(usuariosGuardados);
    }
    return [];
}

// Inicializar usuarios desde localStorage
usuarios = recuperarUsuariosDeLocalStorage();

// 3. Inicializar la propiedad cuentaDolares en todos los usuarios existentes
function inicializarUsuarios() {
    usuarios.forEach((usuario) => {
        if (usuario.cuentaDolares === undefined) {
            usuario.cuentaDolares = 0; // Inicializar con saldo 0 si no existe
        }
    });
    guardarUsuariosEnLocalStorage(); // Guardar los cambios en localStorage
}
inicializarUsuarios();

// 4. Función para mostrar el formulario de registro
function mostrarFormularioRegistro() {
    document.getElementById("login").classList.add("d-none"); // Ocultar el formulario de inicio de sesión
    document.getElementById("registro").classList.remove("d-none"); // Mostrar el formulario de registro
}

// 5. Función para registrar un usuario
function registrarUsuario(e) {
    e.preventDefault(); // Evitar que el formulario recargue la página

    // Obtener los valores de los campos del formulario
    const nombre = document.getElementById("nombreRegistro").value;
    const apellido = document.getElementById("apellidoRegistro").value;
    const usuario = document.getElementById("usuarioRegistro").value;
    const contrasenia = document.getElementById("contraseniaRegistro").value;
    const saldoInicial = parseFloat(document.getElementById("saldoRegistro").value);

    // Validar los campos
    if (!nombre || !apellido || !usuario || !contrasenia || isNaN(saldoInicial) || saldoInicial < 0) {
        document.getElementById("registroMensaje").textContent = "Todos los campos son obligatorios y el saldo debe ser válido.";
        return;
    }

    // Crear el nuevo usuario con cuenta en dólares
    const nuevoUsuario = {
        nombre,
        apellido,
        usuario,
        contrasenia,
        saldoActual: saldoInicial,
        cuentaDolares: 0, // Saldo inicial en dólares
        historial: []
    };

    // Agregar el usuario al array y guardar en localStorage
    usuarios.push(nuevoUsuario);
    guardarUsuariosEnLocalStorage();

    // Mostrar mensaje de éxito y redirigir al formulario de inicio de sesión
    document.getElementById("registroMensaje").textContent = "Usuario registrado con éxito. Ahora puede iniciar sesión.";
    setTimeout(() => {
        document.getElementById("registro").classList.add("d-none"); // Ocultar el formulario de registro
        document.getElementById("login").classList.remove("d-none"); // Mostrar el formulario de inicio de sesión
    }, 2000); // Esperar 2 segundos antes de redirigir
}

// 6. Función para iniciar sesión
function iniciarSesion(e) {
    e.preventDefault(); // Evitar que el formulario recargue la página

    // Obtener los valores de los campos del formulario
    const usuarioIngresado = document.getElementById("usuarioLogin").value;
    const contraseniaIngresada = document.getElementById("contraseniaLogin").value;

    // Buscar el usuario en el array
    const usuarioEncontrado = usuarios.find(
        (u) => u.usuario === usuarioIngresado && u.contrasenia === contraseniaIngresada
    );

    if (usuarioEncontrado) {
        usuarioLogueado = usuarioEncontrado;
        mostrarPantallaInicio(); // Mostrar la pantalla de inicio personalizada
    } else {
        document.getElementById("loginMensaje").textContent = "Usuario o contraseña incorrectos.";
    }
}

// 7. Función para mostrar la pantalla de inicio personalizada
function mostrarPantallaInicio() {
    // Ocultar todas las secciones innecesarias
    document.getElementById("login").classList.add("d-none");
    document.getElementById("registro").classList.add("d-none");
    document.getElementById("transferenciaPropias").classList.add("d-none");
    document.getElementById("transferenciaTerceros").classList.add("d-none");

    // Mostrar el home banking
    const homeBanking = document.getElementById("homeBanking");
    homeBanking.classList.remove("d-none"); // Eliminar la clase d-none
    homeBanking.style.display = "block"; // Asegurarse de que el display sea block

    // Asegurarse de que "Resultados de las operaciones" esté visible
    const mensajeOperaciones = document.getElementById("mensajeOperaciones");
    mensajeOperaciones.classList.remove("d-none");

    // Actualizar el nombre y saldo del usuario logueado
    if (usuarioLogueado) {
        const saldoDolares = usuarioLogueado.cuentaDolares ? usuarioLogueado.cuentaDolares.toFixed(2) : "0.00";
        document.getElementById("mensajeOperaciones").innerHTML = `
            ¡Bienvenido, ${usuarioLogueado.nombre}!<br>
            Saldo en pesos: $${usuarioLogueado.saldoActual.toFixed(2)}<br>
            Saldo en dólares: USD ${saldoDolares}
        `;
    } else {
        document.getElementById("mensajeOperaciones").textContent = "Error: No hay un usuario logueado.";
    }
}

// 8. Función para transferir dinero a cuentas propias
function transferirACuentasPropias(e) {
    e.preventDefault(); // Evitar que el formulario recargue la página

    const monto = parseFloat(document.getElementById("montoTransferenciaPropias").value);

    if (isNaN(monto) || monto <= 0) {
        document.getElementById("transferenciaPropiasMensaje").textContent = "Por favor, ingrese un monto válido.";
        return;
    }

    if (usuarioLogueado.saldoActual < monto) {
        document.getElementById("transferenciaPropiasMensaje").textContent = "Saldo insuficiente en la cuenta en pesos.";
        return;
    }

    const tasaDeCambio = 350; // Ejemplo: 1 dólar = 350 pesos
    const montoEnDolares = monto / tasaDeCambio;

    usuarioLogueado.saldoActual -= monto;
    usuarioLogueado.cuentaDolares += montoEnDolares;

    const fecha = new Date();
    usuarioLogueado.historial.push({
        tipo: "Transferencia a cuenta propia",
        origen: "Cuenta en pesos",
        destino: "Cuenta en dólares",
        monto: monto.toFixed(2),
        fecha: fecha.toLocaleDateString(),
        hora: fecha.toLocaleTimeString()
    });

    guardarUsuariosEnLocalStorage();

    const mensaje = document.getElementById("transferenciaPropiasMensaje");
    mensaje.textContent = "Transferencia realizada con éxito.";
    mensaje.classList.remove("d-none");

    setTimeout(() => {
        mensaje.classList.add("d-none");
        mostrarPantallaInicio();
    }, 2000);
}

// 9. Función para transferir dinero a terceros
function transferirATerceros(e) {
    e.preventDefault();

    const usuarioDestino = document.getElementById("usuarioDestino").value;
    const monto = parseFloat(document.getElementById("montoTransferencia").value);

    if (!usuarioDestino || isNaN(monto) || monto <= 0) {
        document.getElementById("transferenciaMensaje").textContent = "Por favor, ingrese datos válidos.";
        return;
    }

    const destinatario = usuarios.find((u) => u.usuario === usuarioDestino);

    if (!destinatario) {
        document.getElementById("transferenciaMensaje").textContent = "El usuario destino no existe.";
        return;
    }

    if (usuarioLogueado.saldoActual < monto) {
        document.getElementById("transferenciaMensaje").textContent = "Saldo insuficiente.";
        return;
    }

    usuarioLogueado.saldoActual -= monto;
    destinatario.saldoActual += monto;

    const fecha = new Date();
    usuarioLogueado.historial.push({
        tipo: "Transferencia a terceros",
        origen: usuarioLogueado.usuario,
        destino: usuarioDestino,
        monto: monto.toFixed(2),
        fecha: fecha.toLocaleDateString(),
        hora: fecha.toLocaleTimeString()
    });

    guardarUsuariosEnLocalStorage();

    const mensaje = document.getElementById("transferenciaMensaje");
    mensaje.textContent = "Transferencia realizada con éxito.";
    mensaje.classList.remove("d-none");

    setTimeout(() => {
        mensaje.classList.add("d-none");
        mostrarPantallaInicio();
    }, 2000);
}

// 10. Función para mostrar el historial de operaciones
function mostrarHistorial() {
    console.log("Mostrando historial de operaciones");

    const historialOperaciones = document.getElementById("historialOperaciones");
    const listaHistorial = document.getElementById("listaHistorial");

    listaHistorial.innerHTML = "";

    if (usuarioLogueado.historial.length === 0) {
        listaHistorial.innerHTML = `
            <div class="alert alert-info text-center" role="alert">
                No hay operaciones registradas.
            </div>
        `;
    } else {
        usuarioLogueado.historial.forEach((accion, index) => {
            const cuadro = document.createElement("div");
            cuadro.classList.add("card", "mb-3", "shadow-sm");

            cuadro.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">Operación ${index + 1}</h5>
                    <p class="card-text"><strong>Tipo:</strong> ${accion.tipo}</p>
                    <p class="card-text"><strong>Origen:</strong> ${accion.origen}</p>
                    <p class="card-text"><strong>Destino:</strong> ${accion.destino}</p>
                    <p class="card-text"><strong>Monto:</strong> $${accion.monto}</p>
                    <p class="card-text"><strong>Fecha:</strong> ${accion.fecha}</p>
                    <p class="card-text"><strong>Hora:</strong> ${accion.hora}</p>
                </div>
            `;

            listaHistorial.appendChild(cuadro);
        });
    }

    historialOperaciones.classList.remove("d-none");
}

// 11. Eventos para manejar la interacción
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnRegistro").addEventListener("click", mostrarFormularioRegistro);
    document.getElementById("formRegistro").addEventListener("submit", registrarUsuario);
    document.getElementById("formLogin").addEventListener("submit", iniciarSesion);
    document.getElementById("formTransferirPropias").addEventListener("submit", transferirACuentasPropias);
    document.getElementById("formTransferirTerceros").addEventListener("submit", transferirATerceros);
    document.getElementById("transferirPropias").addEventListener("click", mostrarTransferenciaPropias);
    document.getElementById("transferirTerceros").addEventListener("click", mostrarTransferenciaTerceros);
    document.getElementById("btnVerHistorial").addEventListener("click", mostrarHistorial);
});

// 12. Funciones para mostrar las secciones de transferencia
function mostrarTransferenciaPropias() {
    document.getElementById("transferenciaPropias").classList.remove("d-none");
    document.getElementById("transferenciaTerceros").classList.add("d-none");
    document.getElementById("mensajeOperaciones").classList.add("d-none");
}

function mostrarTransferenciaTerceros() {
    document.getElementById("transferenciaTerceros").classList.remove("d-none");
    document.getElementById("transferenciaPropias").classList.add("d-none");
    document.getElementById("mensajeOperaciones").classList.add("d-none");
}