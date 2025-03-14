// Variables y constantes
let saldo = 1000; // Saldo inicial
const nombreUsuario = "Juan Perez"; // Nombre del usuario

// Funciones
function mostrarSaldo() {
    console.log(`Saldo actual: $${saldo}`); // Muestra el saldo en la consola
    alert(`Hola ${nombreUsuario}, tu saldo actual es: $${saldo}`); // También muestra el saldo en un cuadro de alerta
}

function depositarDinero() {
    let monto = parseFloat(prompt("Ingrese el monto a depositar:")); // Solicita el monto a depositar
    if (isNaN(monto) || monto <= 0) {
        console.log("Monto inválido. Intente nuevamente."); // Mensaje en la consola
        alert("Monto inválido. Intente nuevamente."); // Mensaje en un cuadro de alerta
    } else {
        saldo += monto;
        console.log(`Has depositado $${monto}. Tu nuevo saldo es: $${saldo}`); // Muestra el nuevo saldo en la consola
        alert(`Has depositado $${monto}. Tu nuevo saldo es: $${saldo}`); // También muestra el nuevo saldo en un cuadro de alerta
    }
}

function retirarDinero() {
    let monto = parseFloat(prompt("Ingrese el monto a retirar:")); // Solicita el monto a retirar
    if (isNaN(monto) || monto <= 0) {
        console.log("Monto inválido. Intente nuevamente."); // Mensaje en la consola
        alert("Monto inválido. Intente nuevamente."); // Mensaje en un cuadro de alerta
    } else if (monto > saldo) {
        console.log("Fondos insuficientes."); // Mensaje en la consola
        alert("Fondos insuficientes."); // Mensaje en un cuadro de alerta
    } else {
        saldo -= monto;
        console.log(`Has retirado $${monto}. Tu nuevo saldo es: $${saldo}`); // Muestra el nuevo saldo en la consola
        alert(`Has retirado $${monto}. Tu nuevo saldo es: $${saldo}`); // También muestra el nuevo saldo en un cuadro de alerta
    }
}

// Interacción inicial
function iniciarHomeBanking() {
    let opcion;
    do {
        console.log("\nSeleccione una opción:");
        console.log("1. Consultar saldo");
        console.log("2. Depositar dinero");
        console.log("3. Retirar dinero");
        console.log("4. Salir");
        opcion = prompt("Ingrese el número de la opción deseada:"); // Solicita la opción al usuario
        switch (opcion) {
            case "1":
                mostrarSaldo();
                break;
            case "2":
                depositarDinero();
                break;
            case "3":
                retirarDinero();
                break;
            case "4":
                console.log("Gracias por usar el home banking. ¡Hasta luego!");
                alert("Gracias por usar el home banking. ¡Hasta luego!"); // Mensaje de despedida en la consola y en un cuadro de alerta
                break;
            default:
                console.log("Opción inválida. Intente nuevamente."); // Mensaje en la consola
                alert("Opción inválida. Intente nuevamente."); // Mensaje en un cuadro de alerta
        }
    } while (opcion !== "4");
}

// Iniciar la aplicación
iniciarHomeBanking();