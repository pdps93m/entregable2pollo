/*class Persona {
constructor(nombre, apellido, edad, direccion, telefono, email, usuario, contrasenia, saldoInicial, saldoactual);{
    this.nombre = nombre;
    this.apellido = apellido;
    this.edad = edad;
    this.direccion = direccion;
    this.telefono = telefono;
    this.email = email;
    this.usuario = usuario;
    this.contrasenia = contrasenia;
    this.saldoInicial = saldoInicial;
    this.saldoactual = saldoactual;
    this.mostrarSaldo = function () {
        console.log(`Tu saldo actual es: $${this.saldoactual}`);
        alert(`Tu saldo actual es: $${this.saldoactual}`);
    }
}*/


/*class Persona {
    constructor(nombre, apellido, edad, direccion, telefono, email, usuario, contrasenia, saldoactual) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.edad = edad;
        this.direccion = direccion;
        this.telefono = telefono;
        this.email = email;
        this.usuario = usuario;
        this.contrasenia = contrasenia;
        this.saldoActual = saldoactual;


        }
}*/



// Clase Persona
class Persona {
    constructor(nombre, apellido, edad, direccion, telefono, email, usuario, contrasenia, saldoActual) {
        this.nombre = nombre; // Nombre del usuario
        this.apellido = apellido; // Apellido del usuario
        this.edad = edad; // Edad del usuario
        this.direccion = direccion; // Dirección del usuario
        this.telefono = telefono; // Teléfono del usuario
        this.email = email; // Email del usuario
        this.usuario = usuario; // Nombre de usuario
        this.contrasenia = contrasenia; // Contraseña del usuario
        this.saldoActual = saldoActual; // Saldo actual del usuario
        this.historial = []; // Historial de transacciones del usuario
    }

    // Método para mostrar el saldo actual
    mostrarSaldo() {
        return `Tu saldo actual es: $${this.saldoActual}`;
    }

    // Método para depositar dinero
    depositarDinero(monto) {
        if (monto > 0) {
            this.saldoActual += monto;
            this.historial.push(`Depósito: +$${monto}`);
            return `Has depositado $${monto}. Tu nuevo saldo es: $${this.saldoActual}`;
        } else {
            return "El monto ingresado no es válido.";
        }
    }

    // Método para retirar dinero
    retirarDinero(monto) {
        if (monto > 0 && monto <= this.saldoActual) {
            this.saldoActual -= monto;
            this.historial.push(`Retiro: -$${monto}`);
            return `Has retirado $${monto}. Tu nuevo saldo es: $${this.saldoActual}`;
        } else if (monto > this.saldoActual) {
            return "Fondos insuficientes.";
        } else {
            return "El monto ingresado no es válido.";
        }
    }

    // Método para transferir dinero a otro usuario
    transferirDinero(destinatario, monto) {
        if (monto > 0 && monto <= this.saldoActual) {
            this.saldoActual -= monto;
            destinatario.saldoActual += monto;
            this.historial.push(`Transferencia enviada: -$${monto} a ${destinatario.nombre}`);
            destinatario.historial.push(`Transferencia recibida: +$${monto} de ${this.nombre}`);
            return `Has transferido $${monto} a ${destinatario.nombre}. Tu nuevo saldo es: $${this.saldoActual}`;
        } else if (monto > this.saldoActual) {
            return "Fondos insuficientes.";
        } else {
            return "El monto ingresado no es válido.";
        }
    }

    // Método para mostrar el historial de transacciones
    mostrarHistorial() {
        if (this.historial.length === 0) {
            return "No tienes transacciones registradas.";
        }
        return this.historial.join("\n");
    }
}
