let usuarios = []; // Lista de usuarios registrados
let usuarioLogueado = null; // Usuario actualmente logueado


function actualizarVisibilidad(seccionesVisibles) {

    const todasLasSecciones = [
        "login",
        "registro",
        "homeBanking",
        "acciones",
        "formCambiarContrasenia",
        "formTransferirPropias",
        "formTransferirTerceros",
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
            Swal.fire({
                title: 'Error',
                text: `El elemento con id '${id}' no existe en el DOM.`,
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    });
}



function actualizarMensajeBienvenida() {
    const nombreUsuario = usuarioLogueado.nombre; 
    const saldoPesos = usuarioLogueado.saldoActual.toFixed(2); 
    const saldoDolares = (usuarioLogueado.saldoDolares || 0).toFixed(2); 

    // Actualizar el contenido del mensaje de bienvenida
    document.getElementById("bienvenidaUsuario").textContent = `Bienvenido, ${nombreUsuario}`;
    document.getElementById("saldoPesos").textContent = `Saldo actual en pesos: $${saldoPesos}`;
    document.getElementById("saldoDolares").textContent = `Saldo actual en dólares: $${saldoDolares}`;
}


function mostrarPantallaInicio() {

  
    actualizarMensajeBienvenida();

    
    actualizarVisibilidad(["homeBanking", "acciones", "saldoPesos", "saldoDolares"]);
}

actualizarVisibilidad(["homeBanking", "acciones", "saldoPesos", "saldoDolares"]);



function mostrarFormularioRegistro() {
    actualizarVisibilidad(["registro"]);
}


function iniciarSesion(e) {
    e.preventDefault(); 

    const usuarioIngresado = document.getElementById("usuarioLogin").value.trim();
    const contraseniaIngresada = document.getElementById("contraseniaLogin").value.trim();

    const usuarioEncontrado = usuarios.find(
        (u) => u.usuario === usuarioIngresado && u.contrasenia === contraseniaIngresada
    );

    if (usuarioEncontrado) {
        usuarioLogueado = usuarioEncontrado;
        localStorage.setItem("usuarioLogueadoId", usuarioLogueado.id); 
        mostrarPantallaInicio();
        Swal.fire({
            title: `¡Bienvenido, ${usuarioLogueado.nombre}!`,
            text: 'Has iniciado sesión correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });
    } else {
        Swal.fire({
            title: 'Error',
            text: 'Usuario o contraseña incorrectos.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
}


function registrarUsuario(e) {
    e.preventDefault(); 

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
    localStorage.setItem("usuarios", JSON.stringify(usuarios)); 

    document.getElementById("registroMensaje").textContent = "Usuario registrado con éxito.";
    setTimeout(() => {
        mostrarFormularioLogin();
    }, 2000);
}




function mostrarFormularioLogin() {
    actualizarVisibilidad(["login"]);
}

function cerrarSesion() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: 'Se cerrará tu sesión actual.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            usuarioLogueado = null;
            localStorage.removeItem("usuarioLogueadoId");
            mostrarFormularioLogin();
            Swal.fire({
                title: 'Sesión cerrada',
                text: 'Has cerrado sesión correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
        }
    });
}



function mostrarTransferenciaPropias() {
    actualizarVisibilidad(["homeBanking", "acciones", "formTransferirPropias", "historialTransferenciasPropias"]);
    actualizarHistorialTransferenciasPropias();
}

function confirmarTransferenciaPropias(e) {
    e.preventDefault(); 

    const monto = parseFloat(document.getElementById("montoTransferenciaPropias").value);

    if (isNaN(monto) || monto <= 0) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, ingrese un monto válido.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    if (usuarioLogueado.saldoActual < monto) {
        Swal.fire({
            title: 'Saldo insuficiente',
            text: 'No tienes suficiente saldo para realizar esta transferencia.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
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

    
    actualizarHistorialTransferenciasPropias();

    
    actualizarMensajeBienvenida();

    Swal.fire({
        title: 'Transferencia realizada',
        text: `Has transferido $${monto.toFixed(2)} a tu cuenta propia.`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });


    
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
        Swal.fire({
            title: 'Error',
            text: "El elemento con id 'cuerpoHistorialTransferenciasPropias' no existe en el DOM.",
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    
    cuerpoHistorial.classList.remove("d-none");

    cuerpoHistorial.innerHTML = ""; 

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


function mostrarTransferenciaTerceros() {
    actualizarVisibilidad(["homeBanking", "acciones", "formTransferirTerceros", "historialTransferenciasTerceros"]);
    actualizarHistorialTransferenciasTerceros();
}

function confirmarTransferenciaTerceros(e) {
    e.preventDefault(); 

    const usuarioDestino = document.getElementById("usuarioDestino").value.trim();
    const monto = parseFloat(document.getElementById("montoTransferencia").value);
    const moneda = document.getElementById("monedaTransferencia").value; 

    if (!usuarioDestino || isNaN(monto) || monto <= 0) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, ingrese un usuario destino y un monto válido.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    if (moneda === "pesos") {
        if (usuarioLogueado.saldoActual < monto) {
            Swal.fire({
                title: 'Saldo insuficiente',
                text: 'No tienes suficiente saldo en pesos para realizar esta transferencia.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
            return;
        }
        usuarioLogueado.saldoActual -= monto;
    } else if (moneda === "dolares") {
        if (usuarioLogueado.saldoDolares < monto) {
            Swal.fire({
                title: 'Saldo insuficiente',
                text: 'No tienes suficiente saldo en dólares para realizar esta transferencia.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
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

    
    actualizarHistorialTransferenciasTerceros();

    
    actualizarMensajeBienvenida();

    Swal.fire({
        title: 'Transferencia realizada',
        text: `Has transferido ${monto.toFixed(2)} ${moneda} a ${usuarioDestino}.`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });

    
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
        Swal.fire({
            title: 'Error',
            text: "El elemento con id 'cuerpoHistorialTransferenciasTerceros' no existe en el DOM.",
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    
    cuerpoHistorial.classList.remove("d-none");

    cuerpoHistorial.innerHTML = ""; 

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


function mostrarTodosLosHistoriales() {

    
    actualizarVisibilidad([
        "homeBanking",
        "acciones",
        "historialTransferenciasPropias",
        "historialTransferenciasTerceros",
        "historialComprasDolares",
        "tablaPrestamos"
    ]);

    
    actualizarHistorialTransferenciasPropias();
    actualizarHistorialTransferenciasTerceros();
    actualizarHistorialComprasDolares();
    actualizarHistorialPrestamos();
}


function mostrarFormularioCambiarContrasenia() {
    actualizarVisibilidad(["homeBanking", "acciones", "formCambiarContrasenia"]);

    const campoContraseniaActual = document.getElementById("contraseniaActual");
    const campoNuevaContrasenia = document.getElementById("nuevaContrasenia");
    if (campoContraseniaActual) campoContraseniaActual.value = "";
    if (campoNuevaContrasenia) campoNuevaContrasenia.value = "";
}

function cambiarContrasenia(e) {
    e.preventDefault(); 

    const contraseniaActual = document.getElementById("contraseniaActual").value.trim();
    const nuevaContrasenia = document.getElementById("nuevaContrasenia").value.trim();

    if (!contraseniaActual || !nuevaContrasenia) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, complete todos los campos.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    if (contraseniaActual !== usuarioLogueado.contrasenia) {
        Swal.fire({
            title: 'Error',
            text: 'La contraseña actual ingresada es incorrecta.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    if (contraseniaActual === nuevaContrasenia) {
        Swal.fire({
            title: 'Error',
            text: 'La nueva contraseña no puede ser igual a la actual.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    
    usuarioLogueado.contrasenia = nuevaContrasenia;

   
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    Swal.fire({
        title: 'Éxito',
        text: 'Contraseña cambiada con éxito.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });

    mostrarPantallaInicio(); 
}


function mostrarFormularioTransferenciaTerceros() {
    actualizarVisibilidad([
        "homeBanking",
        "acciones",
        "formTransferirTerceros",
        "historialTransferenciasTerceros",
        "cuerpoHistorialTransferenciasTerceros"
    ]);

    const campoUsuarioDestino = document.getElementById("usuarioDestino");

    if (campoUsuarioDestino) {
        // Verificar si hay un historial de transferencias a terceros
        if (
            usuarioLogueado.historialTransferenciasTerceros &&
            usuarioLogueado.historialTransferenciasTerceros.length > 0
        ) {
            // Obtener el último destinatario del historial
            const ultimaTransferencia =
                usuarioLogueado.historialTransferenciasTerceros[
                usuarioLogueado.historialTransferenciasTerceros.length - 1
                ];
            campoUsuarioDestino.value = ultimaTransferencia.usuarioDestino; 
        } else {
            campoUsuarioDestino.value = ""; 
        }
    }


    actualizarHistorialTransferenciasTerceros();
}


function mostrarFormularioPrestamo() {
    actualizarVisibilidad(["homeBanking", "acciones", "formSolicitarPrestamo"]);

    // Forzar la eliminación de la clase d-none
    const formSolicitarPrestamo = document.getElementById("formSolicitarPrestamo");
    if (formSolicitarPrestamo) {
        formSolicitarPrestamo.classList.remove("d-none");
    }
}

function confirmarSolicitudPrestamo(e) {
    e.preventDefault(); 

    const monto = parseFloat(document.getElementById("montoPrestamo").value);
    const plazo = parseInt(document.getElementById("plazoPrestamo").value);

    if (isNaN(monto) || monto <= 0 || isNaN(plazo) || plazo <= 0) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, ingrese un monto y un plazo válidos.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    
    const tasaInteres = 0.05;
    const cuota = (monto * (1 + tasaInteres * plazo)) / plazo;

    
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

    
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    
    actualizarHistorialPrestamos();

    Swal.fire({
        title: 'Préstamo solicitado',
        text: `Has solicitado un préstamo de $${monto.toFixed(2)} a ${plazo} meses.`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });

    
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
        Swal.fire({
            title: 'Error',
            text: "El elemento con id 'cuerpoTablaPrestamos' no existe en el DOM.",
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    // Asegurarse de que el historial sea visible
    cuerpoHistorial.classList.remove("d-none");

    cuerpoHistorial.innerHTML = ""; 

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
    actualizarVisibilidad([
        "homeBanking",
        "acciones",
        "formSolicitarPrestamo",
        "tablaPrestamos",
        "cuerpoTablaPrestamos"
    ]);

    const campoMontoPrestamo = document.getElementById("montoPrestamo");
    if (campoMontoPrestamo) {
        if (
            usuarioLogueado.historialPrestamos &&
            usuarioLogueado.historialPrestamos.length > 0
        ) {
            // Obtener el último préstamo del historial
            const ultimoPrestamo =
                usuarioLogueado.historialPrestamos[
                usuarioLogueado.historialPrestamos.length - 1
                ];
            campoMontoPrestamo.value = ultimoPrestamo.monto; 
        } else {
            campoMontoPrestamo.value = ""; 
        }
    }

    actualizarHistorialPrestamos();
}

function solicitarPrestamo(e) {
    e.preventDefault(); 

    const monto = parseFloat(document.getElementById("montoPrestamo").value);
    const plazo = parseInt(document.getElementById("plazoPrestamo").value);

    if (isNaN(monto) || monto <= 0 || isNaN(plazo) || plazo <= 0) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, ingrese valores válidos para el monto y el plazo.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    
    const tasaInteres = 0.05;
    const cuota = (monto * (1 + tasaInteres)) / plazo;

    
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

   
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    
    actualizarTablaPrestamos();

    Swal.fire({
        title: 'Préstamo solicitado',
        text: `Has solicitado un préstamo de $${monto.toFixed(2)} a ${plazo} meses.`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });

    
    mostrarPantallaInicio();
}

function actualizarTablaPrestamos() {
    const cuerpoTabla = document.getElementById("cuerpoTablaPrestamos");
    cuerpoTabla.innerHTML = ""; 

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


function mostrarFormularioCompraDolares() {
    
    actualizarVisibilidad(["homeBanking", "acciones", "formComprarDolares", "historialComprasDolares"]);

    const campoTasaCambio = document.getElementById("tasaCambio");
    if (campoTasaCambio) {
        campoTasaCambio.value = 200; 
    }

    
    actualizarHistorialComprasDolares();
}

function comprarDolares(e) {
    e.preventDefault(); 

    const montoPesos = parseFloat(document.getElementById("montoCompraDolares").value);
    const tasaCambio = parseFloat(document.getElementById("tasaCambio").value);

    if (isNaN(montoPesos) || montoPesos <= 0 || isNaN(tasaCambio) || tasaCambio <= 0) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, ingrese valores válidos para el monto y la tasa de cambio.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    const montoDolares = (montoPesos / tasaCambio).toFixed(2);

    if (usuarioLogueado.saldoActual < montoPesos) {
        Swal.fire({
            title: 'Saldo insuficiente',
            text: 'No tienes suficiente saldo en pesos para realizar esta compra.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
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

    
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

   
    actualizarHistorialComprasDolares();

    
    actualizarMensajeBienvenida();

    Swal.fire({
        title: 'Compra realizada',
        text: `Has adquirido ${montoDolares} dólares con éxito.`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });


    
    actualizarVisibilidad(["homeBanking", "acciones", "formComprarDolares", "historialComprasDolares"]);
}

function actualizarHistorialComprasDolares() {
    const cuerpoHistorial = document.getElementById("cuerpoHistorialComprasDolares");
    if (!cuerpoHistorial) {
        Swal.fire({
            title: 'Error',
            text: "El elemento con id 'cuerpoHistorialComprasDolares' no existe en el DOM.",
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    cuerpoHistorial.innerHTML = ""; 
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


function mostrarFormularioPrestamo() {

    
    actualizarVisibilidad(["homeBanking", "acciones", "formSolicitarPrestamo", "tablaPrestamos", "cuerpoTablaPrestamos"]);
}

document.addEventListener("DOMContentLoaded", () => {
    
    const usuariosGuardados = localStorage.getItem("usuarios");
    if (!usuariosGuardados) {
        
        fetch('./js/usuarios.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error("No se pudo cargar el archivo JSON.");
                }
                return response.json();
            })
            .then(data => {
                usuarios = data; // Asignar los datos cargados a la variable global
                localStorage.setItem("usuarios", JSON.stringify(usuarios)); 
                Swal.fire({
                    title: 'Datos cargados',
                    text: 'Los usuarios iniciales se cargaron correctamente desde el archivo JSON.',
                    icon: 'info',
                    confirmButtonText: 'Aceptar'
                });
            })
            .catch(error => {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudieron cargar los datos iniciales.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            });
    } else {
        // Si hay datos en localStorage, usarlos
        usuarios = JSON.parse(usuariosGuardados);
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
            Swal.fire({
                title: 'Error',
                text: 'No se encontró el usuario logueado en la lista de usuarios.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
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

const btnVerHistorial = document.getElementById("verHistorial");
if (btnVerHistorial) {
    btnVerHistorial.addEventListener("click", mostrarTodosLosHistoriales);
}

const btnCerrarSesion = document.getElementById("btnCerrarSesion");
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", cerrarSesion);
}

const btnCambiarContrasenia = document.getElementById("cambiarContrasenia");
if (btnCambiarContrasenia) {
    btnCambiarContrasenia.addEventListener("click", mostrarFormularioCambiarContrasenia);
}

const formCambiarContrasenia = document.getElementById("formularioCambiarContrasenia");
if (formCambiarContrasenia) {
    formCambiarContrasenia.addEventListener("submit", cambiarContrasenia);
}


// Vincular eventos a los botones
document.getElementById("formLogin").addEventListener("submit", iniciarSesion);
document.getElementById("btnRegistro").addEventListener("click", mostrarFormularioRegistro);
document.getElementById("formRegistro").addEventListener("submit", registrarUsuario);
document.getElementById("btnCerrarSesion").addEventListener("click", cerrarSesion);
document.getElementById("transferirPropias").addEventListener("click", mostrarTransferenciaPropias);
document.getElementById("transferirTerceros").addEventListener("click", mostrarTransferenciaTerceros);
document.getElementById("verHistorial").addEventListener("click", mostrarTodosLosHistoriales);
document.getElementById("cambiarContrasenia").addEventListener("click", mostrarFormularioCambiarContrasenia);
document.getElementById("solicitarPrestamo").addEventListener("click", mostrarFormularioPrestamo);
document.getElementById("formSolicitarPrestamo").addEventListener("submit", solicitarPrestamo);
document.getElementById("comprarDolares").addEventListener("click", mostrarFormularioCompraDolares);
document.getElementById("formComprarDolares").addEventListener("submit", comprarDolares);
