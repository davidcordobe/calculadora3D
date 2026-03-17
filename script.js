document.addEventListener("DOMContentLoaded", () => {

const materiales = {
"PLA ELEGOO":24900,
"PETG ELEGOO":23000,
"PLA 3NMAX":19000
}

let precioFinal = 0

const materialSelect = document.getElementById("material")
const contenedorProductos = document.getElementById("productos")

// =====================
// CARGAR MATERIALES
// =====================
for (let m in materiales) {
let option = document.createElement("option")
option.value = m
option.text = m
materialSelect.appendChild(option)
}

// =====================
// AGREGAR PRODUCTOS
// =====================
let contadorProductos = 1

function agregarProducto(){

let div = document.createElement("div")
div.className = "fila producto"

div.innerHTML = `
<input placeholder="Producto ${contadorProductos}" class="nombreProducto">
<input type="number" placeholder="g" class="gramosProducto">
<button type="button" class="eliminar">✕</button>
`

contadorProductos++

div.querySelector(".eliminar").onclick = () => div.remove()

contenedorProductos.appendChild(div)
}

document.getElementById("agregarProducto").addEventListener("click", agregarProducto)

// primer producto
agregarProducto()

// =====================
// CALCULO
// =====================
function obtenerGramosTotales(){

let total = 0

document.querySelectorAll(".gramosProducto").forEach(input=>{

let valor = input.value.replace(",", ".").trim()

let numero = parseFloat(valor)

if(!isNaN(numero)){
total += numero
}

})

return total

}

function margenRecomendado(tiempo){
if(tiempo<=2) return 40
if(tiempo<=6) return 60
return 80
}

function calcular(){

let gramos = obtenerGramosTotales()

let horas = parseFloat(document.getElementById("horas").value) || 0
let minutos = parseFloat(document.getElementById("minutos").value) || 0

let tiempo = horas + (minutos/60)

let precioKg = materiales[materialSelect.value]

let costoMaterial = (precioKg/1000) * gramos

let precioKwh = parseFloat(document.getElementById("precioLuz").value) || 0
let consumo = parseFloat(document.getElementById("consumo").value) || 0

let costoLuz = (consumo/1000) * tiempo * precioKwh

let repuestos = parseFloat(document.getElementById("repuestos").value) || 0
let vida = parseFloat(document.getElementById("vida").value) || 1

let desgasteHora = repuestos / vida

let costoDesgaste = desgasteHora * tiempo

let insumos = parseFloat(document.getElementById("insumos").value) || 0

let costoBase = costoMaterial + costoLuz + costoDesgaste + insumos

let fallos = parseFloat(document.getElementById("fallos").value) || 0

let costoFallos = costoBase * (fallos/100)

let costoTotal = costoBase + costoFallos

let margen = margenRecomendado(tiempo)

precioFinal = costoTotal + (costoTotal * margen / 100)

let minimo = parseFloat(document.getElementById("minimo").value) || 0

precioFinal = Math.max(precioFinal, minimo)

document.getElementById("resultado").innerHTML = `
Filamento total: ${gramos} g<br>
Costo total: $${costoTotal.toFixed(2)}
`

document.getElementById("precioFinal").innerText = "$"+precioFinal.toFixed(2)

}

document.getElementById("calcular").addEventListener("click", calcular)

// =====================
// PDF
// =====================
function generarPDF(){

if(precioFinal === 0){
alert("Primero calculá el presupuesto")
return
}

const { jsPDF } = window.jspdf
let doc = new jsPDF()

let cliente = document.getElementById("cliente").value || "Cliente"
let fecha = new Date().toLocaleDateString()

// NUMERO
let numero = localStorage.getItem("numeroPresupuesto")
numero = numero ? parseInt(numero)+1 : 1
localStorage.setItem("numeroPresupuesto",numero)

let numeroFormateado = String(numero).padStart(4,"0")
let numeroPresupuesto = "P-"+new Date().getFullYear()+"-"+numeroFormateado


// ================= LOGO =================
let logo = new Image()
logo.src = "logo.png"

logo.onload = function(){

// ================= HEADER =================
doc.setFillColor("#a3ccd3")
doc.rect(0,0,210,30,"F")

// LOGO
doc.addImage(logo,"PNG",160,5,30,20)

// TEXTO EMPRESA
doc.setTextColor("#f9d19b")
doc.setFontSize(30)
doc.text("Norte, Nudo, Next",20,18)

doc.setFontSize(15)
doc.text("Impresión 3D Profesional",20,25)

doc.setTextColor(0)


// ================= MARCA DE AGUA =================

// tamaño del PDF
const pageWidth = doc.internal.pageSize.getWidth()
const pageHeight = doc.internal.pageSize.getHeight()

// tamaño del logo (ajustalo a gusto)
const imgWidth = 100
const imgHeight = 100

const centerX = (pageWidth - imgWidth) / 2
const centerY = (pageHeight - imgHeight) / 2

doc.setGState(new doc.GState({ opacity: 0.09 }))
doc.addImage(logo, "PNG", centerX, centerY, imgWidth, imgHeight)
doc.setGState(new doc.GState({ opacity: 1 }))

// ================= CAJA DATOS =================
doc.setDrawColor(200)
doc.rect(140,35,60,35)

doc.setFontSize(10)
doc.text("Presupuesto",145,42)
doc.text(numeroPresupuesto,145,48)

doc.text("Fecha",145,58)
doc.text(fecha,145,64)


// ================= CLIENTE =================
doc.setFontSize(11)
doc.text("Cliente:",20,45)
doc.text(cliente,20,52)

doc.line(10,70,200,70)


// ================= TABLA =================
doc.setFillColor(240)
doc.rect(10,75,190,10,"F")

doc.setFontSize(11)
doc.text("Producto",15,82)
doc.text("Gramos",120,82)
doc.text("Precio",165,82)

let y = 85
doc.setDrawColor(220)

// 🔥 gramos totales reales
let gramosTotales = obtenerGramosTotales()

document.querySelectorAll(".producto").forEach((p)=>{

let nombre = p.querySelector(".nombreProducto").value || "Producto"

// 👇 importante: misma lógica robusta que usás arriba
let valor = p.querySelector(".gramosProducto").value.replace(",", ".").trim()
let gramos = parseFloat(valor)

if(isNaN(gramos)) gramos = 0

// 🔥 cálculo proporcional real
let porcentaje = gramosTotales > 0 ? gramos / gramosTotales : 0
let precioProducto = precioFinal * porcentaje

y += 10

doc.line(10,y,200,y)

doc.text(nombre,15,y-3)
doc.text(gramos+" g",120,y-3)
doc.text("$"+precioProducto.toFixed(0),165,y-3)

})

doc.line(10,y+2,200,y+2)


// ================= TOTAL =================
doc.setFillColor("#a3ccd3")
doc.rect(120,y+15,80,20,"F")

doc.setTextColor("#fc8332")
doc.setFontSize(12)
doc.text("TOTAL",125,y+25)

doc.setFontSize(18)
doc.text("$"+precioFinal.toFixed(0),150,y+25)

doc.setTextColor(0)


// ================= FOOTER =================
doc.setDrawColor(200)
doc.line(10,270,200,270)

doc.setFontSize(12)
doc.text("Gracias por confiar en nosotros",20,280)
doc.text("Validez del presupuesto: 7 días",20,285)
doc.text("Demora estimada: 3-5 días hábiles",20,275)
doc.text("Contacto: 351-2715524",20,290)


// ================= GUARDAR =================
doc.save("presupuesto-"+numeroPresupuesto+".pdf")

}

}
document.getElementById("pdf").addEventListener("click", generarPDF)

// =====================
// WHATSAPP
// =====================
function enviarWhatsApp(){

let mensaje="Presupuesto impresión 3D\n\n"

document.querySelectorAll(".producto").forEach((p,i)=>{

let nombre=p.querySelector(".nombreProducto").value||"Producto"
let gramos=p.querySelector(".gramosProducto").value||0

mensaje+=`${i+1} - ${nombre} (${gramos} g)\n`

})

mensaje+=`\nTotal: $${precioFinal.toFixed(2)}`

let url="https://wa.me/?text="+encodeURIComponent(mensaje)

window.open(url,"_blank")

}

document.getElementById("whatsapp").addEventListener("click", enviarWhatsApp)

})