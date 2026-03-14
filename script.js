const materiales={

"PLA ELEGOO":24900,
"PETG ELEGOO":23000,
"PLA 3NMAX":19000

}

let precioFinal=0
let costoTotalGlobal=0
let grafico

let historial=JSON.parse(localStorage.getItem("historialImpresiones"))||[]

const materialSelect=document.getElementById("material")

for(let m in materiales){

let option=document.createElement("option")
option.value=m
option.text=m

materialSelect.appendChild(option)

}

function margenRecomendado(tiempo){

if(tiempo<=2) return 40
if(tiempo<=6) return 60
return 80

}

document.getElementById("calcular").addEventListener("click",calcular)

function calcular(){

let gramos=parseFloat(document.getElementById("gramos").value)
let horas=parseFloat(document.getElementById("horas").value)
let minutos=parseFloat(document.getElementById("minutos").value)

let tiempo=horas+(minutos/60)

let precioKg=materiales[materialSelect.value]

let costoMaterial=(precioKg/1000)*gramos

let precioKwh=document.getElementById("precioLuz").value
let consumo=document.getElementById("consumo").value

let costoLuz=(consumo/1000)*tiempo*precioKwh

let repuestos=document.getElementById("repuestos").value
let vida=document.getElementById("vida").value

let desgasteHora=repuestos/vida

let costoDesgaste=desgasteHora*tiempo

let insumos=parseFloat(document.getElementById("insumos").value)

let costoBase=costoMaterial+costoLuz+costoDesgaste+insumos

let fallos=document.getElementById("fallos").value

let costoFallos=costoBase*(fallos/100)

let costoTotal=costoBase+costoFallos

costoTotalGlobal=costoTotal

let margen=margenRecomendado(tiempo)

precioFinal=costoTotal+(costoTotal*margen/100)

let minimo=document.getElementById("minimo").value

precioFinal=Math.max(precioFinal,minimo)

let ganancia=precioFinal-costoTotal

document.getElementById("resultado").innerHTML=

`
Costo material: $${costoMaterial.toFixed(2)}<br>
Electricidad: $${costoLuz.toFixed(2)}<br>
Desgaste: $${costoDesgaste.toFixed(2)}<br>
Fallos: $${costoFallos.toFixed(2)}<br>

<hr>

Costo total: $${costoTotal.toFixed(2)}<br>
Ganancia: $${ganancia.toFixed(2)}
`

document.getElementById("precioFinal").innerText="$"+precioFinal.toFixed(2)

let precioMinimo=costoTotal*1.2
let mayorista=costoTotal*2
let recomendado=costoTotal*3
let premium=costoTotal*4

document.getElementById("cotizacion").innerHTML=

`
<label><input type="radio" name="precioPDF" value="${precioMinimo}"> Min rentable $${precioMinimo.toFixed(2)}</label><br>
<label><input type="radio" name="precioPDF" value="${mayorista}"> Mayorista $${mayorista.toFixed(2)}</label><br>
<label><input type="radio" name="precioPDF" value="${recomendado}" checked> Recomendado $${recomendado.toFixed(2)}</label><br>
<label><input type="radio" name="precioPDF" value="${premium}"> Premium $${premium.toFixed(2)}</label>
`

}

function obtenerPrecioSeleccionado(){

let radios=document.getElementsByName("precioPDF")

for(let r of radios){
if(r.checked){
return parseFloat(r.value)
}
}

return precioFinal

}

document.getElementById("pdf").addEventListener("click",generarPDF)

function generarPDF(){

const { jsPDF } = window.jspdf

let doc = new jsPDF()

let precioPDF = obtenerPrecioSeleccionado()

let cliente = document.getElementById("cliente").value || "Cliente"

let material = materialSelect.value
let gramos = document.getElementById("gramos").value
let horas = document.getElementById("horas").value
let minutos = document.getElementById("minutos").value

let contacto = "WhatsApp: +54 3512715524  - 3516425664"


// numero presupuesto automatico
let numero = localStorage.getItem("numeroPresupuesto")

if(!numero){
numero = 1
}else{
numero = parseInt(numero)+1
}

localStorage.setItem("numeroPresupuesto",numero)

let numeroFormateado = String(numero).padStart(4,"0")

let numeroPresupuesto = "P-"+new Date().getFullYear()+"-"+numeroFormateado



let img = new Image()
img.src = "logo.png"


img.onload = function(){


// MARCA DE AGUA
doc.setGState(new doc.GState({opacity:0.08}))
doc.addImage(img,"PNG",40,60,120,120)
doc.setGState(new doc.GState({opacity:1})

)

// LOGO ENCABEZADO
doc.addImage(img,"PNG",15,10,40,20)

doc.setFontSize(18)
doc.text("PRESUPUESTO IMPRESIÓN 3D",105,20,null,null,"center")


doc.setFontSize(11)

doc.text("Número: "+numeroPresupuesto,150,30)
doc.text("Fecha: "+new Date().toLocaleDateString(),150,36)


doc.line(10,40,200,40)


doc.setFontSize(12)

doc.text("Cliente: "+cliente,20,50)

doc.line(10,60,200,60)


doc.setFontSize(13)

doc.text("DETALLE DEL TRABAJO",20,75)

doc.setFontSize(11)

doc.text("Material: "+material,20,85)

doc.text("Filamento usado: "+gramos+" g",20,92)

doc.text("Tiempo de impresión: "+horas+"h "+minutos+"m",20,99)


doc.line(10,110,200,110)


doc.setFontSize(16)
doc.text("TOTAL",20,125)

doc.setFontSize(28)
doc.text("$"+precioPDF.toFixed(2),20,140)



doc.setFontSize(11)

doc.text("Tiempo de entrega sujeto a cola de impresión.",20,165)

doc.text("Estimado entre 3 y 5 días.",20,172)

doc.text("Gracias por confiar en nuestro servicio.",20,179)



// contacto
doc.setFontSize(12)

doc.text(contacto,105,195,null,null,"center")


doc.save("presupuesto-"+numeroPresupuesto+".pdf")

}

}

if("serviceWorker" in navigator){

navigator.serviceWorker.register("service-worker.js")

.then(()=>console.log("APP lista para usar offline"))

}