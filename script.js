const materiales={

"PLA ELEGOO":24900,
"PETG ELEGOO":23000,
"PLA 3NMAX":19000

}

let precioFinal=0

const materialSelect=document.getElementById("material")

for(let m in materiales){

let opt=document.createElement("option")
opt.value=m
opt.text=m
materialSelect.appendChild(opt)

}

function margenRecomendado(tiempo){

if(tiempo<=2){

return 40

}else if(tiempo<=6){

return 60

}else{

return 80

}

}

document.getElementById("calcular").addEventListener("click",calcular)

function calcular(){

let gramos=parseFloat(document.getElementById("gramos").value)

let horas=parseFloat(document.getElementById("horas").value)

let minutos=parseFloat(document.getElementById("minutos").value)

let tiempo=horas+(minutos/60)

let precioKg=materiales[materialSelect.value]

let costoMaterial=(precioKg/1000)*gramos

let precioLuz=document.getElementById("luz").value

let costoLuz=tiempo*(precioLuz/100)

let costoMaquina=tiempo*document.getElementById("maquina").value

let costoTotal=costoMaterial+costoLuz+costoMaquina

let costoFallos=costoTotal*(document.getElementById("fallos").value/100)

costoTotal=costoTotal+costoFallos

let margen=margenRecomendado(tiempo)

precioFinal=costoTotal+(costoTotal*margen/100)

let minimoTrabajo=parseFloat(document.getElementById("minimoTrabajo").value)

let precioMinimo=Math.max(precioFinal,minimoTrabajo)

precioFinal=precioMinimo

document.getElementById("resultado").innerHTML=

`
Material: $${costoMaterial.toFixed(2)}<br>
Electricidad: $${costoLuz.toFixed(2)}<br>
Uso máquina: $${costoMaquina.toFixed(2)}<br>
Costo fallos: $${costoFallos.toFixed(2)}<br>

<hr>

Costo base: $${costoTotal.toFixed(2)}<br>
Margen recomendado: ${margen}%<br>

<hr>

Precio final sugerido: $${precioFinal.toFixed(2)}
`

document.getElementById("precioMin").innerText="$"+precioFinal.toFixed(2)

}

document.getElementById("pdf").addEventListener("click",generarPDF)

function generarPDF(){

const { jsPDF } = window.jspdf

let doc=new jsPDF()

let cliente=document.getElementById("cliente").value
let material=materialSelect.value
let gramos=document.getElementById("gramos").value

let img=new Image()

img.src="logo.png"

img.onload=function(){

doc.addImage(img,"PNG",15,10,35,20)

doc.setFontSize(18)
doc.text("PRESUPUESTO / FACTURA",150,20,null,null,"right")

doc.setFontSize(11)
doc.text("Fecha: "+new Date().toLocaleDateString(),150,30,null,null,"right")

doc.line(10,40,200,40)

doc.text("Cliente:",20,55)
doc.text(cliente,60,55)

doc.line(10,65,200,65)

doc.setFontSize(12)

doc.text("Descripción",20,75)
doc.text("Material",120,75)
doc.text("Precio",170,75)

doc.line(10,80,200,80)

doc.text("Impresión 3D personalizada",20,95)
doc.text(material,120,95)
doc.text("$"+precioFinal.toFixed(2),170,95)

doc.line(10,110,200,110)

doc.setFontSize(14)

doc.text("TOTAL",140,125)
doc.text("$"+precioFinal.toFixed(2),170,125)

doc.setFontSize(10)

doc.text("Tiempo de entrega sujeto a cola de impresión.",20,150)

doc.text("Gracias por confiar en nuestro servicio.",20,160)

doc.text("Contacto: 3512715524",20,180)
doc.text("WhatsApp / Instagram",20,190)

doc.save("presupuesto-"+cliente+".pdf")

}

}