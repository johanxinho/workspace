let usuario = "alex";
let contrasena = "12345678";

if (usuario === "") {
    console.log("El usuario está vacío");
} else if (contrasena.length < 8) {
    console.log("La contraseña debe tener al menos 8 caracteres");
} else {
    console.log("Login exitoso");
}