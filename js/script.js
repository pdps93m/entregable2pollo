// 1. Declaración de variables y constantes globales
let usuarios = []; // Array para almacenar los usuarios registrados
let usuarioLogueado = null; // Variable para almacenar el usuario actualmente logueado

// 2. Función para manejar la visibilidad de las secciones
function actualizarVisibilidad(seccionesVisibles) {
    const todasLasSecciones = [
        "homeBanking",
        "registro",
        "login",
        "formTransferirPropias",
        "formTransferirTerceros",
        "resultadoOperaciones",
        "cambioContrasenia",
        "solicitarPrestamoForm",
        "comprarDolaresForm",
        "historialOperaciones"
    ];

    todasLasSecciones.forEach((id) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (seccionesVisibles.includes(id)) {
                elemento.classList.remove("d-none"); // Hacer visible
            } else {
                elemento.classList.add("d-none"); // Ocultar
            }
        } else {
            console.error(`El elemento con id '${id}' no existe en el DOM.`);
        }
    });
}
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

// Migrar el historial de préstamos para actualizar el formato
function migrarHistorial() {
    usuarios.forEach((usuario) => {
        usuario.historial.forEach((accion) => {
            if (accion.tipo === "Préstamo" && accion.detalle) {
                const partes = accion.detalle.split(",");
                accion.monto = partes[0].split(":")[1].trim().replace("$", "");
                accion.plazo = parseInt(partes[1].split(":")[1].trim());
                accion.cuota = partes[2].split(":")[1].trim().replace("$", "");
                delete accion.detalle; // Eliminar el campo detalle
            }
        });
    });
    guardarUsuariosEnLocalStorage();
}


migrarHistorial(); // Llamar a la función para migrar el historial

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

    // Crear el nuevo usuario con un identificador único
    const nuevoUsuario = {
        id: Date.now(), // Generar un identificador único basado en la fecha actual
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


// Función para manejar el cambio de contraseña
function cambiarContrasenia(e) {
    e.preventDefault(); // Evitar que el formulario recargue la página

    const contraseniaActual = document.getElementById("contraseniaActual").value;
    const nuevaContrasenia = document.getElementById("nuevaContrasenia").value;

    // Validar que el usuario esté logueado
    if (!usuarioLogueado) {
        const mensaje = document.getElementById("cambiarContraseniaMensaje");
        mensaje.textContent = "Debe iniciar sesión para cambiar la contraseña.";
        mensaje.classList.remove("d-none");
        return;
    }

    // Validar que la contraseña actual sea correcta
    if (contraseniaActual !== usuarioLogueado.contrasenia) {
        document.getElementById("cambiarContraseniaMensaje").textContent = "La contraseña actual es incorrecta.";
        return;
    }

    // Validar que la nueva contraseña no esté vacía y tenga al menos 6 caracteres
    if (!nuevaContrasenia || nuevaContrasenia.length < 6) {
        document.getElementById("cambiarContraseniaMensaje").textContent = "La nueva contraseña debe tener al menos 6 caracteres.";
        return;
    }

    // Actualizar la contraseña del usuario logueado
    usuarioLogueado.contrasenia = nuevaContrasenia;


    // Sincronizar el cambio en el array usuarios

    const indexUsuario = usuarios.findIndex((u) => u.id === usuarioLogueado.id);
    if (indexUsuario !== -1) {
        usuarios[indexUsuario].contrasenia = nuevaContrasenia;
    }


    // Guardar los cambios en localStorage
    guardarUsuariosEnLocalStorage();


    // Mostrar mensaje de éxito
    const mensaje = document.getElementById("cambiarContraseniaMensaje");
    mensaje.textContent = "Contraseña cambiada con éxito. Redirigiendo al inicio de sesión...";
    mensaje.classList.remove("d-none");

    // Redirigir al formulario de inicio de sesión después de 2 segundos
    setTimeout(() => {
        // Ocultar todas las secciones exclusivas para usuarios logueados
        document.getElementById("homeBanking").classList.add("d-none");
        document.getElementById("transferenciaPropias").classList.add("d-none");
        document.getElementById("transferenciaTerceros").classList.add("d-none");
        document.getElementById("historialOperaciones").classList.add("d-none");
        document.getElementById("resultadoOperaciones").classList.add("d-none");

        // Desloguear al usuario
        usuarioLogueado = null;

        // Mostrar el formulario de inicio de sesión
        document.getElementById("cambioContrasenia").classList.add("d-none"); // Ocultar el formulario de cambio de contraseña
        document.getElementById("login").classList.remove("d-none"); // Mostrar el formulario de inicio de sesión
    }, 2000);
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

        // Guardar el id del usuario logueado en localStorage
        localStorage.setItem("usuarioLogueadoId", usuarioLogueado.id);

        mostrarPantallaInicio(); // Mostrar la pantalla de inicio personalizada
    } else {
        document.getElementById("loginMensaje").textContent = "Usuario o contraseña incorrectos.";
    }
}

// 6.1. Función para cerrar sesión
function cerrarSesion() {
    // Desloguear al usuario
    usuarioLogueado = null;

    // Eliminar el id del usuario logueado del localStorage
    localStorage.removeItem("usuarioLogueadoId");

    // Ocultar todas las secciones exclusivas para usuarios logueados
    const homeBanking = document.getElementById("homeBanking");
    if (homeBanking) {
        homeBanking.classList.add("d-none");
    }

    const transferenciaPropias = document.getElementById("transferenciaPropias");
    if (transferenciaPropias) {
        transferenciaPropias.classList.add("d-none");
    }

    const transferenciaTerceros = document.getElementById("transferenciaTerceros");
    if (transferenciaTerceros) {
        transferenciaTerceros.classList.add("d-none");
    } else {
        console.error("El elemento con id 'transferenciaTerceros' no existe en el DOM.");
    }

    const historialOperaciones = document.getElementById("historialOperaciones");
    if (historialOperaciones) {
        historialOperaciones.classList.add("d-none");
    }

    const resultadoOperaciones = document.getElementById("resultadoOperaciones");
    if (resultadoOperaciones) {
        resultadoOperaciones.classList.add("d-none");
    }

    // Ocultar el botón de cerrar sesión
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.classList.add("d-none");
    }

    // Mostrar el formulario de inicio de sesión
    const login = document.getElementById("login");
    if (login) {
        login.classList.remove("d-none");
    } else {
        console.error("El elemento con id 'login' no existe en el DOM.");
    }
}


// 7. Función para mostrar la pantalla de inicio personalizada
function mostrarPantallaInicio() {
    console.log("Ejecutando mostrarPantallaInicio");

    // Ocultar el formulario de inicio de sesión
    const login = document.getElementById("login");
    if (login) {
        login.classList.add("d-none");
    }

    // Ocultar el formulario de registro
    const registro = document.getElementById("registro");
    if (registro) {
        registro.classList.add("d-none");
    }

    // Mostrar la sección de home banking
    const homeBanking = document.getElementById("homeBanking");
    if (homeBanking) {
        homeBanking.classList.remove("d-none");
    }

    // Hacer visibles todos los botones de la sección "acciones"
    const botonesAcciones = document.querySelectorAll("#acciones button");
    botonesAcciones.forEach((boton) => {
        boton.classList.remove("d-none"); // Eliminar la clase d-none de cada botón
    });

    console.log("Todos los botones de acciones son visibles.");
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

    // Actualizar los detalles de la operación
    actualizarDetallesOperacion();

    setTimeout(() => {
        mensaje.classList.add("d-none");
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
}

function solicitarPrestamo() {
    // Obtener los valores del formulario
    const monto = parseFloat(document.getElementById("montoPrestamo").value);
    const plazo = parseInt(document.getElementById("plazoPrestamo").value);

    // Validar los datos ingresados
    if (isNaN(monto) || monto <= 0 || isNaN(plazo) || plazo <= 0) {
        document.getElementById("prestamoMensaje").textContent = "Por favor, ingrese un monto y plazo válidos.";
        return;
    }

    const tasaInteres = 0.05; // 5% de interés mensual
    const cuota = (monto * (1 + tasaInteres * plazo)) / plazo;

    // Actualizar el saldo del usuario logueado
    usuarioLogueado.saldoActual += monto;

    // Registrar la operación en el historial
    const fecha = new Date();
    usuarioLogueado.historial.push({
        tipo: "Préstamo",
        monto: monto.toFixed(2),
        plazo: plazo,
        cuota: cuota.toFixed(2),
        fecha: fecha.toLocaleDateString(),
        hora: fecha.toLocaleTimeString()
    });

    guardarUsuariosEnLocalStorage();

    // Mostrar mensaje de éxito
    const mensaje = document.getElementById("prestamoMensaje");
    mensaje.textContent = `Préstamo aprobado. Se han acreditado $${monto.toFixed(2)} a tu saldo.`;
    mensaje.classList.remove("d-none");

    // Actualizar los detalles de la operación
    actualizarDetallesOperacion();

    // Ocultar el mensaje después de 2 segundos
    setTimeout(() => {
        mensaje.classList.add("d-none");
    }, 2000);
}

function comprarDolares() {
    // Obtener los valores del formulario
    const montoPesos = parseFloat(document.getElementById("montoCompraDolares").value);

    // Validar los datos ingresados
    if (isNaN(montoPesos) || montoPesos <= 0) {
        document.getElementById("compraDolaresMensaje").textContent = "Por favor, ingrese un monto válido.";
        return;
    }

    if (usuarioLogueado.saldoActual < montoPesos) {
        document.getElementById("compraDolaresMensaje").textContent = "Saldo insuficiente.";
        return;
    }

    const tasaCambio = 350; // Simulación de tasa de cambio
    const dolares = montoPesos / tasaCambio;

    // Actualizar los saldos del usuario logueado
    usuarioLogueado.saldoActual -= montoPesos;
    usuarioLogueado.cuentaDolares += dolares;

    // Registrar la operación en el historial
    const fecha = new Date();
    usuarioLogueado.historial.push({
        tipo: "Compra de Dólares",
        detalle: `Monto en pesos: $${montoPesos}, Dólares: $${dolares.toFixed(2)}`,
        fecha: fecha.toLocaleDateString(),
        hora: fecha.toLocaleTimeString()
    });

    guardarUsuariosEnLocalStorage();

    // Mostrar mensaje de éxito
    const mensaje = document.getElementById("compraDolaresMensaje");
    mensaje.textContent = `Compra realizada con éxito. Se han acreditado $${dolares.toFixed(2)} dólares.`;
    mensaje.classList.remove("d-none");

    // Actualizar los detalles de la operación
    actualizarDetallesOperacion();

    // Ocultar el mensaje después de 2 segundos
    setTimeout(() => {
        mensaje.classList.add("d-none");
    }, 2000);
}

// 10. Función para actualizar los detalles de la operación
function actualizarDetallesOperacion() {
    const cuerpoTablaTransferencias = document.getElementById("cuerpoTablaTransferencias");
    if (cuerpoTablaTransferencias) {
        cuerpoTablaTransferencias.innerHTML = "";
    } else {
        console.error("El elemento con id 'cuerpoTablaTransferencias' no existe en el DOM.");
    }

    const cuerpoTablaPrestamos = document.getElementById("cuerpoTablaPrestamos");
    if (cuerpoTablaPrestamos) {
        cuerpoTablaPrestamos.innerHTML = "";
    } else {
        console.error("El elemento con id 'cuerpoTablaPrestamos' no existe en el DOM.");
    }

    if (usuarioLogueado) {
        const transferencias = usuarioLogueado.historial.filter(
            (accion) => accion.tipo === "Transferencia a terceros" || accion.tipo === "Transferencia a cuenta propia"
        );
        const prestamos = usuarioLogueado.historial.filter((accion) => accion.tipo === "Préstamo");

        if (transferencias.length === 0 && cuerpoTablaTransferencias) {
            cuerpoTablaTransferencias.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No hay transferencias registradas.</td>
                </tr>
            `;
        } else {
            transferencias.forEach((transferencia) => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${transferencia.tipo}</td>
                    <td>${transferencia.origen}</td>
                    <td>${transferencia.destino}</td>
                    <td>$${transferencia.monto}</td>
                    <td>${transferencia.fecha}</td>
                    <td>${transferencia.hora}</td>
                `;
                if (cuerpoTablaTransferencias) {
                    cuerpoTablaTransferencias.appendChild(fila);
                }
            });
        }

        if (prestamos.length === 0 && cuerpoTablaPrestamos) {
            cuerpoTablaPrestamos.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No hay préstamos registrados.</td>
                </tr>
            `;
        } else {
            prestamos.forEach((prestamo) => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>$${prestamo.monto}</td>
                    <td>${prestamo.plazo} meses</td>
                    <td>$${prestamo.cuota}</td>
                    <td>${prestamo.fecha}</td>
                    <td>${prestamo.hora}</td>
                `;
                if (cuerpoTablaPrestamos) {
                    cuerpoTablaPrestamos.appendChild(fila);
                }
            });
        }
    }
}

// Función para manejar el cambio de contraseña
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

    // Crear el nuevo usuario con un identificador único
    const nuevoUsuario = {
        id: Date.now(), // Generar un identificador único basado en la fecha actual
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

// 10. Función para mostrar el historial de operaciones
function mostrarHistorial() {


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

function mostrarHistorialPrestamos() {
    prestamos.forEach((prestamo, index) => {
        const item = document.createElement("div");
        item.classList.add("card", "mb-2", "shadow-sm");
        item.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">Préstamo ${index + 1}</h5>
                <p class="card-text"><strong>Monto:</strong> $${prestamo.monto}</p>
                <p class="card-text"><strong>Plazo:</strong> ${prestamo.plazo} meses</p>
                <p class="card-text"><strong>Cuota:</strong> $${prestamo.cuota}</p>
                <p class="card-text"><strong>Fecha:</strong> ${prestamo.fecha}</p>
                <p class="card-text"><strong>Hora:</strong> ${prestamo.hora}</p>
            </div>
        `;
        listaHistorialPrestamos.appendChild(item);
    });

    historialPrestamos.classList.remove("d-none"); // Mostrar el historial
}

function mostrarHistorialComprasDolares() {
    const historialComprasDolares = document.getElementById("historialComprasDolares");
    const listaHistorialComprasDolares = document.getElementById("listaHistorialComprasDolares");

    listaHistorialComprasDolares.innerHTML = ""; // Limpiar contenido previo

    const compras = usuarioLogueado.historial.filter((accion) => accion.tipo === "Compra de Dólares");

    if (compras.length === 0) {
        listaHistorialComprasDolares.innerHTML = `
            <div class="alert alert-info text-center" role="alert">
                No hay compras de dólares registradas.
            </div>
        `;
    } else {
        compras.forEach((compra, index) => {
            const item = document.createElement("div");
            item.classList.add("card", "mb-2", "shadow-sm");
            item.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">Compra ${index + 1}</h5>
                    <p class="card-text"><strong>Monto en pesos:</strong> $${compra.detalle.split(",")[0].split(":")[1].trim()}</p>
                    <p class="card-text"><strong>Dólares comprados:</strong> ${compra.detalle.split(",")[1].split(":")[1].trim()}</p>
                    <p class="card-text"><strong>Fecha:</strong> ${compra.fecha}</p>
                    <p class="card-text"><strong>Hora:</strong> ${compra.hora}</p>
                </div>
            `;
            listaHistorialComprasDolares.appendChild(item);
        });
    }

    historialComprasDolares.classList.remove("d-none"); // Mostrar el historial
}

// 11. Eventos para manejar la interacción
document.addEventListener("DOMContentLoaded", () => {
    // Recuperar el id del usuario logueado desde localStorage
    const usuarioLogueadoId = localStorage.getItem("usuarioLogueadoId");
    console.log("Usuario logueado ID:", usuarioLogueadoId); // Verificar si hay un usuario logueado
    if (usuarioLogueadoId) {
        usuarioLogueado = usuarios.find((u) => u.id === parseInt(usuarioLogueadoId));
        if (usuarioLogueado) {
            console.log("Usuario logueado encontrado:", usuarioLogueado); // Verificar si el usuario fue encontrado
            mostrarPantallaInicio(); // Restaurar la pantalla de inicio personalizada
        }
    }

    // Vincular el botón de cerrar sesión
    const btnCerrarSesion = document.getElementById("btnCerrarSesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", cerrarSesion);
    } else {
        console.error("El elemento con id 'btnCerrarSesion' no existe en el DOM.");
    }

    // Vincular el botón para mostrar el formulario de "Solicitar Préstamo"
    const btnMostrarPrestamo = document.getElementById("solicitarPrestamo");
    if (btnMostrarPrestamo) {
        btnMostrarPrestamo.addEventListener("click", mostrarFormularioPrestamo);
    } else {
        console.error("El elemento con id 'solicitarPrestamo' no existe en el DOM.");
    }

    // Vincular el botón para mostrar el formulario de "Comprar Dólares"
    const btnMostrarCompraDolares = document.getElementById("comprarDolares");
    if (btnMostrarCompraDolares) {
        btnMostrarCompraDolares.addEventListener("click", mostrarFormularioCompraDolares);
    } else {
        console.error("El elemento con id 'comprarDolares' no existe en el DOM.");
    }

    // Buscar el botón "Cambiar Contraseña"
    const botonCambiarContrasenia = document.getElementById("cambiarContrasenia");
    if (botonCambiarContrasenia) {
        botonCambiarContrasenia.addEventListener("click", mostrarFormularioCambiarContrasenia);
    } else {
        console.error("El elemento con id 'cambiarContrasenia' no existe en el DOM.");
    }

    // Vincular el formulario de cambio de contraseña
    const formCambiarContrasenia = document.getElementById("formCambiarContrasenia");
    if (formCambiarContrasenia) {
        formCambiarContrasenia.addEventListener("submit", cambiarContrasenia);
    } else {
        console.error("El formulario con id 'formCambiarContrasenia' no existe en el DOM.");
    }

    // Vincular el botón de registro
    const btnRegistro = document.getElementById("btnRegistro");
    if (btnRegistro) {
        btnRegistro.addEventListener("click", mostrarFormularioRegistro);
    } else {
        console.error("El botón con id 'btnRegistro' no existe en el DOM.");
    }

    // Vincular el formulario de registro
    const formRegistro = document.getElementById("formRegistro");
    if (formRegistro) {
        formRegistro.addEventListener("submit", registrarUsuario);
    } else {
        console.error("El formulario con id 'formRegistro' no existe en el DOM.");
    }

    // Vincular el formulario de inicio de sesión
    const formLogin = document.getElementById("formLogin");
    if (formLogin) {
        formLogin.addEventListener("submit", iniciarSesion);
    } else {
        console.error("El formulario con id 'formLogin' no existe en el DOM.");
    }

    // Vincular el formulario de transferencias a cuentas propias
    const formTransferirPropias = document.getElementById("formTransferirPropias");
    if (formTransferirPropias) {
        formTransferirPropias.addEventListener("submit", transferirACuentasPropias);
    } else {
        console.error("El formulario con id 'formTransferirPropias' no existe en el DOM.");
    }

    // Vincular el formulario de transferencias a terceros
    const formTransferirTerceros = document.getElementById("formTransferirTerceros");
    if (formTransferirTerceros) {
        formTransferirTerceros.addEventListener("submit", transferirATerceros);
    } else {
        console.error("El formulario con id 'formTransferirTerceros' no existe en el DOM.");
    }

    // Vincular el botón para mostrar transferencias a cuentas propias
    const transferirPropias = document.getElementById("transferirPropias");
    if (transferirPropias) {
        transferirPropias.addEventListener("click", mostrarTransferenciaPropias);
    } else {
        console.error("El botón con id 'transferirPropias' no existe en el DOM.");
    }

    // Vincular el botón para mostrar transferencias a terceros
    const transferirTerceros = document.getElementById("transferirTerceros");
    if (transferirTerceros) {
        transferirTerceros.addEventListener("click", mostrarTransferenciaTerceros);
    } else {
        console.error("El botón con id 'transferirTerceros' no existe en el DOM.");
    }

    // Vincular el botón para mostrar el historial de operaciones
    const btnVerHistorial = document.getElementById("verHistorial");
    if (btnVerHistorial) {
        btnVerHistorial.addEventListener("click", mostrarHistorial);
    } else {
        console.error("El botón con id 'verHistorial' no existe en el DOM.");
    }

    // Vincular el botón para solicitar un préstamo
    const btnSolicitarPrestamo = document.getElementById("solicitarPrestamo");
    if (btnSolicitarPrestamo) {
        btnSolicitarPrestamo.addEventListener("click", solicitarPrestamo);
    } else {
        console.error("El botón con id 'solicitarPrestamo' no existe en el DOM.");
    }

    // Vincular el botón de "Comprar Dólares"
    const btnComprarDolares = document.getElementById("comprarDolares");
    if (btnComprarDolares) {
        btnComprarDolares.addEventListener("click", comprarDolares);
    } else {
        console.error("El botón con id 'btnComprarDolares' no existe en el DOM.");
    }


// Otros eventos
    document.getElementById("btnRegistro").addEventListener("click", mostrarFormularioRegistro);
    document.getElementById("formRegistro").addEventListener("submit", registrarUsuario);
    document.getElementById("formLogin").addEventListener("submit", iniciarSesion);
    document.getElementById("formTransferirPropias").addEventListener("submit", transferirACuentasPropias);
    document.getElementById("formTransferirTerceros").addEventListener("submit", transferirATerceros);
   
    document.getElementById("verHistorial").addEventListener("click", mostrarHistorial);
    document.getElementById("solicitarPrestamo").addEventListener("click", mostrarFormularioPrestamo);
    document.getElementById("comprarDolares").addEventListener("click", mostrarFormularioCompraDolares);
    
    document.getElementById("btnCerrarSesion").addEventListener("click", cerrarSesion);
});

// 12. Funciones para mostrar las secciones de transferencia
function mostrarTransferenciaPropias() {
    const transferenciaPropias = document.getElementById("transferirPropias");
    if (transferenciaPropias) {
        transferenciaPropias.classList.remove("d-none");
    } else {
        console.error("El elemento con id 'transferenciaPropias' no existe en el DOM.");
    }

    const transferenciaTerceros = document.getElementById("transfeirTerceros");
    if (transferenciaTerceros) {
        transferenciaTerceros.classList.add("d-none");
    } else {
        console.error("El elemento con id 'transferenciaTerceros' no existe en el DOM.");
    }

    const resultadoOperaciones = document.getElementById("resultadoOperaciones");
    if (resultadoOperaciones) {
        resultadoOperaciones.classList.add("d-none");
    } else {
        console.error("El elemento con id 'resultadoOperaciones' no existe en el DOM.");
    }

    const mensajeOperaciones = document.getElementById("mensajeOperaciones");
    if (mensajeOperaciones) {
        mensajeOperaciones.classList.add("d-none");
    } else {
        console.error("El elemento con id 'mensajeOperaciones' no existe en el DOM.");
    }
}

function mostrarTransferenciaTerceros() {
    const transferenciaTerceros = document.getElementById("transferirTerceros");
    if (transferenciaTerceros) {
        transferenciaTerceros.classList.remove("d-none");
    } else {
        console.error("El elemento con id 'transferenciaTerceros' no existe en el DOM.");
    }

    const transferenciaPropias = document.getElementById("transferirPropias");
    if (transferenciaPropias) {
        transferenciaPropias.classList.add("d-none");
    } else {
        console.error("El elemento con id 'transferenciaPropias' no existe en el DOM.");
    }

    const mensajeOperaciones = document.getElementById("mensajeOperaciones");
    if (mensajeOperaciones) {
        mensajeOperaciones.classList.add("d-none");
    } else {
        console.error("El elemento con id 'mensajeOperaciones' no existe en el DOM.");
    }
}

function mostrarFormularioCambiarContrasenia() {
    // Ocultar todas las secciones innecesarias
    document.getElementById("transferirPropias").classList.add("d-none");
    document.getElementById("transferirTerceros").classList.add("d-none");
    document.getElementById("historialOperaciones").classList.add("d-none");
    document.getElementById("resultadoOperaciones").classList.add("d-none");

    // Mostrar el formulario de cambio de contraseña
    document.getElementById("cambioContrasenia").classList.remove("d-none");
}

function mostrarFormularioPrestamo() {
    mostrarHistorialPrestamos(); // Mostrar el historial de préstamos
    document.getElementById("solicitarPrestamoForm").classList.remove("d-none");
    document.getElementById("comprarDolaresForm").classList.add("d-none");
    document.getElementById("transferirPropias").classList.add("d-none");
    document.getElementById("transferirTerceros").classList.add("d-none");
    document.getElementById("resultadoOperaciones").classList.add("d-none");
}

function mostrarFormularioCompraDolares() {
    mostrarHistorialComprasDolares(); // Mostrar el historial de compras de dólares
    document.getElementById("comprarDolaresForm").classList.remove("d-none");
    document.getElementById("solicitarPrestamoForm").classList.add("d-none");
    document.getElementById("transferirPropias").classList.add("d-none");
    document.getElementById("transferirTerceros").classList.add("d-none");
    document.getElementById("historialOperaciones").classList.add("d-none");
}