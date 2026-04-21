let csv = "manzana,pera,uva,mango,banano";

let frutas = csv.split(",");
console.log(frutas);
console.log("La lista tiene", frutas.length, "frutas");

let resultado = frutas.join(" - ");

console.log(resultado);
