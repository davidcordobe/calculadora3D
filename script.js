let precioFinal = 0;
let precioConMargenGlobal = 0;
let montoDescuentoGlobal = 0;
let descuentoGlobal = 0;
let precioSinRedondeoGlobal = 0;

document.addEventListener("DOMContentLoaded", () => {
  const materiales = {
    "PLA ELEGOO": 30000,
    "PETG ELEGOO": 30000,
    "PLA 3NMAX": 23000,
    "PLA GRILON3": 26000,
  };

  const materialSelect = document.getElementById("material");
  const contenedorProductos = document.getElementById("productos");

  for (const m in materiales) {
    const option = document.createElement("option");
    option.value = m;
    option.textContent = m;
    materialSelect.appendChild(option);
  }

  let contadorProductos = 1;

  function agregarProducto() {
    const div = document.createElement("div");
    div.className = "producto-card";

    div.innerHTML = `
    <div class="fila-superior">
        <input placeholder="Producto ${contadorProductos}" class="nombreProducto">
        <input type="number" placeholder="g" class="gramosProducto">
        <button type="button" class="eliminar">✕</button>
    </div>

    <div class="fila-tiempo">
        <input type="number" placeholder="Horas" class="horasProducto">
        <input type="number" placeholder="Min" class="minutosProducto">
    </div>

    <div class="fila-descripcion">
        <input placeholder="Descripción (opcional)" class="descripcionProducto">
    </div>
    <div class="fila-imagen">
    <label class="btn-imagen">
        📷 Agregar imagen
        <input type="file" accept="image/*" class="imagenProducto" style="display:none">
    </label>
    <span class="nombre-imagen" style="font-size:12px; color:gray;"></span>

    </div>
`;

    contadorProductos++;

    div.querySelector(".eliminar").addEventListener("click", () => {
      div.remove();
      calcular();
    });

    div.querySelector(".imagenProducto").addEventListener("change", (e) => {
      const archivo = e.target.files[0];
      div.querySelector(".nombre-imagen").textContent = archivo
        ? archivo.name
        : "";
    });

    contenedorProductos.appendChild(div);
  }

  document
    .getElementById("agregarProducto")
    .addEventListener("click", agregarProducto);
  agregarProducto();

  function obtenerGramosTotales() {
    let total = 0;
    document.querySelectorAll(".gramosProducto").forEach((input) => {
      const val = parseFloat(input.value);
      if (!isNaN(val)) total += val;
    });
    return total;
  }

  function obtenerTiempoTotal() {
    let total = 0;
    document.querySelectorAll(".producto-card").forEach((p) => {
      const h = parseFloat(p.querySelector(".horasProducto")?.value) || 0;
      const m = parseFloat(p.querySelector(".minutosProducto")?.value) || 0;
      total += h + m / 60;
    });
    return total;
  }

  function calcular() {
    const gramos = obtenerGramosTotales();
    const tiempo = obtenerTiempoTotal();

    if (gramos <= 0 || tiempo <= 0) {
      document.getElementById("precioFinal").innerText = "$0";
      return;
    }

    // ================= COSTOS =================
    const precioKg = materiales[materialSelect.value] || 0;
    const costoMaterial = (precioKg / 1000) * gramos;

    const precioKwh =
      parseFloat(document.getElementById("precioLuz").value) || 0;
    const consumo = parseFloat(document.getElementById("consumo").value) || 0;
    const costoLuz = (consumo / 1000) * tiempo * precioKwh;

    const repuestos =
      parseFloat(document.getElementById("repuestos").value) || 0;
    const vida = parseFloat(document.getElementById("vida").value) || 1;
    const costoDesgaste = (repuestos / vida) * tiempo;

    const insumos = parseFloat(document.getElementById("insumos").value) || 0;

    const costoHora = 50; // podés ajustar (80 más equilibrado)
    const costoTrabajo = tiempo * costoHora;

    const costoBase =
      costoMaterial + costoLuz + costoDesgaste + insumos + costoTrabajo;

    const fallos = parseFloat(document.getElementById("fallos").value) || 0;
    const costoFallos = costoBase * (fallos / 100);

    const costoTotal = costoBase + costoFallos;

    // ================= GANANCIA =================
    let multiplicador =
      parseFloat(document.getElementById("multiplicador").value) || 2;
    if (multiplicador < 2) multiplicador = 2;

    precioConMargenGlobal = costoTotal * multiplicador;

    descuentoGlobal =
      parseFloat(document.getElementById("descuento").value) || 0;
    montoDescuentoGlobal = precioConMargenGlobal * (descuentoGlobal / 100);

    let precio = precioConMargenGlobal - montoDescuentoGlobal;

    // ================= CALCULO REAL =================
    const ganancia = precio - costoTotal;
    const margenPorcentaje = (ganancia / costoTotal) * 100;

    // ================= ANALISIS PRO =================
    let colorMargen = "";
    let mensajeMargen = "";
    let precioSugerido = 0;

    if (margenPorcentaje < 100) {
      colorMargen = "red";
      mensajeMargen = "Margen bajo (estás ganando poco)";
      precioSugerido = costoTotal * 2.5;
    } else if (margenPorcentaje < 200) {
      colorMargen = "orange";
      mensajeMargen = "Margen aceptable";
      precioSugerido = costoTotal * 3;
    } else {
      colorMargen = "green";
      mensajeMargen = "Buen margen";
      precioSugerido = costoTotal * 3.5;
    }

    precioSugerido = Math.ceil(precioSugerido / 100) * 100;

    // ================= FINAL =================
    precioSinRedondeoGlobal = precio;

    precio = Math.ceil(precio / 100) * 100;
    precioFinal = precio;

    // ================= UI =================
    document.getElementById("resultado").innerHTML = `
        Filamento: $${costoMaterial.toFixed(0)}<br>
        Luz: $${costoLuz.toFixed(0)}<br>
        Desgaste: $${costoDesgaste.toFixed(0)}<br>
        Trabajo: $${costoTrabajo.toFixed(0)}<br>
        Fallos: $${costoFallos.toFixed(0)}<br>
        <hr>
        Tiempo total: ${tiempo.toFixed(2)} hs<br>
        Costo total: $${costoTotal.toFixed(0)}<br>
        Multiplicador: x${multiplicador}<br>
        <hr>
        Ganancia: $${ganancia.toFixed(0)}<br>
        
        <span style="color:${colorMargen}; font-weight:bold;">
            Margen: ${margenPorcentaje.toFixed(0)}%<br>
            ${mensajeMargen}
        </span>
        
<hr>
<div style="
    margin-top:15px;
    padding:12px;
    background:linear-gradient(#fc8332,#38bdf8,#fc8332);
    color: #000;
    border-radius:10px;
    font-weight:bold;
    text-align:center;
">
    💡 Precio sugerido: $${precioSugerido.toFixed(0)}
</div>
    `;

    const precioEl = document.getElementById("precioFinal");

    precioEl.innerText = "Precio Final $" + precioFinal;

    precioEl.style.boxShadow = `0 0 15px ${colorMargen}`;
    precioEl.style.fontWeight = "bold";
    precioEl.style.fontSize = "42px";
    precioEl.style.textAlign = "center";

    // 🔥 reinicia animación
    precioEl.classList.remove("pulse");
    void precioEl.offsetWidth; // truco para reiniciar animación
    precioEl.classList.add("pulse");
  }

  document.addEventListener("input", calcular);
});

// ================= PDF =================
function generarPDF(e) {
    if (e) e.preventDefault();

    if (precioFinal === 0) {
        alert("Primero calculá el presupuesto");
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("jsPDF no está cargado correctamente.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const cliente = (document.getElementById("cliente").value || "Cliente").trim().toUpperCase();
    const fecha = new Date().toLocaleDateString();

    let numero = localStorage.getItem("numeroPresupuesto");
    numero = numero ? parseInt(numero, 10) + 1 : 1;
    localStorage.setItem("numeroPresupuesto", numero);

    const numeroPresupuesto = "P-" + new Date().getFullYear() + "-" + String(numero).padStart(4, "0");

    function obtenerGramosTotalesPDF() {
        let total = 0;
        document.querySelectorAll(".gramosProducto").forEach((input) => {
            const val = parseFloat(input.value);
            if (!isNaN(val)) total += val;
        });
        return total;
    }

    function obtenerTiempoTotalPDF() {
        let total = 0;
        document.querySelectorAll(".producto-card").forEach((p) => {
            const h = parseFloat(p.querySelector(".horasProducto")?.value) || 0;
            const m = parseFloat(p.querySelector(".minutosProducto")?.value) || 0;
            total += h + m / 60;
        });
        return total;
    }

    // ================= CARGAR TODAS LAS IMÁGENES PRIMERO =================
    const tarjetas = Array.from(document.querySelectorAll(".producto-card"));

    const promesasImagenes = tarjetas.map((p) => {
        return new Promise((resolve) => {
            const imagenInput = p.querySelector(".imagenProducto");
            const imagenFile = imagenInput?.files?.[0];

            if (imagenFile) {
                const reader = new FileReader();
                reader.onload = (e) => resolve({ tarjeta: p, imgData: e.target.result });
                reader.onerror = () => resolve({ tarjeta: p, imgData: null });
                reader.readAsDataURL(imagenFile);
            } else {
                resolve({ tarjeta: p, imgData: null });
            }
        });
    });

    Promise.all(promesasImagenes).then((productos) => {

        function dibujarContenido(logoCargado, logoImg) {

            // ================= HEADER =================
            doc.setFillColor("#FFC5D3");
            doc.rect(0, 0, 210, 35, "F");

            if (logoCargado && logoImg) {
                try { doc.addImage(logoImg, "PNG", 165, 5, 25, 25); } catch {}
            }

            doc.setTextColor("#fc8332");
            doc.setFontSize(20);
            doc.text("Nina Store", 20, 20);
            doc.setFontSize(15);
            doc.text("Impresión 3D Profesional", 20, 28);

            // ================= MARCA DE AGUA =================
            if (logoCargado && logoImg && doc.GState) {
                try {
                    doc.setGState(new doc.GState({ opacity: 0.08 }));
                    doc.addImage(logoImg, "PNG", 40, 80, 130, 130);
                    doc.setGState(new doc.GState({ opacity: 1 }));
                } catch {}
            }

            doc.setTextColor(0);

            // ================= DATOS =================
            doc.setFillColor(241, 245, 249);
            doc.rect(10, 45, 190, 25, "F");

            doc.setFont("helvetica", "bold");
            doc.text("Cliente:", 15, 55);
            doc.text("Fecha:", 15, 63);
            doc.text("N°:", 120, 55);
            doc.text(cliente, 40, 55);
            doc.text(fecha, 40, 63);
            doc.text(numeroPresupuesto, 135, 55);

            doc.line(10, 75, 200, 75);

            // ================= TABLA =================
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("Producto", 15, 85);
            doc.text("Gramos", 110, 85);
            doc.text("Precio", 195, 85, { align: "right" });

            let y = 90;

            const gramosTotales = obtenerGramosTotalesPDF();
            const tiempoTotal = obtenerTiempoTotalPDF();

            // ================= PRODUCTOS =================
            productos.forEach(({ tarjeta: p, imgData }) => {
                const nombre = p.querySelector(".nombreProducto")?.value || "Producto";
                const gramos = parseFloat(p.querySelector(".gramosProducto")?.value) || 0;
                const descripcion = p.querySelector(".descripcionProducto")?.value?.trim() || "";

                const h = parseFloat(p.querySelector(".horasProducto")?.value) || 0;
                const m = parseFloat(p.querySelector(".minutosProducto")?.value) || 0;
                const tiempoProducto = h + m / 60;

                const pesoTiempo = tiempoTotal > 0 ? tiempoProducto / tiempoTotal : 0;
                const pesoGramos = gramosTotales > 0 ? gramos / gramosTotales : 0;
                const ponderacion = pesoTiempo * 0.6 + pesoGramos * 0.4;
                const precioProducto = precioFinal * ponderacion;

                if (y > 240) { doc.addPage(); y = 20; }

                y += 10;

                if (imgData) {
                    // Con imagen
                    try {
                        doc.addImage(imgData, "JPEG", 15, y - 6, 22, 22);
                    } catch {}
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(11);
                    doc.setTextColor(0);
                    doc.text(nombre, 42, y);
                    doc.text(`${gramos} g`, 110, y);
                    doc.text(`$${precioProducto.toFixed(0)}`, 195, y, { align: "right" });

                    if (descripcion) {
                        y += 6;
                        doc.setFont("helvetica", "italic");
                        doc.setFontSize(9);
                        doc.setTextColor(100);
                        doc.text(descripcion, 42, y);
                        doc.setTextColor(0);
                        doc.setFontSize(11);
                        doc.setFont("helvetica", "normal");
                    }
                    y += 12;
                } else {
                    // Sin imagen
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(11);
                    doc.setTextColor(0);
                    doc.text(nombre, 15, y);
                    doc.text(`${gramos} g`, 110, y);
                    doc.text(`$${precioProducto.toFixed(0)}`, 195, y, { align: "right" });

                    if (descripcion) {
                        y += 6;
                        doc.setFont("helvetica", "italic");
                        doc.setFontSize(9);
                        doc.setTextColor(100);
                        doc.text(descripcion, 18, y);
                        doc.setTextColor(0);
                        doc.setFontSize(11);
                        doc.setFont("helvetica", "normal");
                    }
                }
            });

            // ================= TOTALES =================
            y += 15;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.text("Subtotal:", 120, y);
            doc.text(`$${precioFinal.toFixed(0)}`, 195, y, { align: "right" });

            if (descuentoGlobal > 0) {
                y += 8;
                doc.text(`Descuento (${descuentoGlobal}%):`, 120, y);
                doc.text(`-$${montoDescuentoGlobal.toFixed(0)}`, 195, y, { align: "right" });
            }

            y += 10;
            doc.setFillColor("#FFC5D3");
            doc.rect(110, y, 90, 25, "F");
            doc.setTextColor("#fc8332");
            doc.setFontSize(11);
            doc.text("TOTAL FINAL", 115, y + 10);
            doc.setFontSize(20);
            doc.text(`$${precioFinal.toFixed(0)}`, 195, y + 18, { align: "right" });
            doc.setTextColor(120);

            // ================= FOOTER =================
            doc.setDrawColor(200);
            doc.line(10, 270, 200, 270);
            doc.setFontSize(10);
            doc.text("Validez del presupuesto: 7 días", 20, 276);
            doc.text("Tiempo estimado: 3 a 5 días habiles", 20, 282);
            doc.text("Contacto: 351-2715524", 200, 276, { align: "right" });
            doc.text("Instagram:  @NINASTORE.CBA", 200, 285, { align: "right" });

            // ================= QR =================
            const mensajeQR = `Hola! Vi el presupuesto ${numeroPresupuesto} y quiero avanzar.`;
            const urlWhatsApp = "https://api.whatsapp.com/send?phone=5493512715524&text=" + encodeURIComponent(mensajeQR);
            const qrURL = "https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=" + encodeURIComponent(urlWhatsApp);

            const qrImg = new Image();
            qrImg.crossOrigin = "Anonymous";
            qrImg.onload = function () {
                try {
                    doc.addImage(qrImg, "PNG", 160, 225, 35, 35);
                    doc.setFontSize(8);
                    doc.text("Escaneá para contactarnos", 160, 222);
                } catch {}
                doc.save("presupuesto-" + numeroPresupuesto + ".pdf");
            };
            qrImg.onerror = function () {
                doc.save("presupuesto-" + numeroPresupuesto + ".pdf");
            };
            qrImg.src = qrURL;
        }

        // ================= CARGAR LOGO =================
        const logo = new Image();
        logo.onload = () => dibujarContenido(true, logo);
        logo.onerror = () => dibujarContenido(false, null);
        logo.src = "logo.png";

    });
}

document.getElementById("pdf").addEventListener("click", generarPDF);

// ================= WHATSAPP =================
document.getElementById("whatsapp").addEventListener("click", () => {
  if (precioFinal === 0) {
    alert("Primero completá los datos");
    return;
  }

  let mensaje = `📦 Presupuesto impresión 3D\n\n`;

  document.querySelectorAll(".producto-card").forEach((p) => {
    const nombre = p.querySelector(".nombreProducto")?.value || "Producto";
    const gramos = p.querySelector(".gramosProducto")?.value || 0;
    const h = p.querySelector(".horasProducto")?.value || 0;
    const m = p.querySelector(".minutosProducto")?.value || 0;

    const descripcion =
      p.querySelector(".descripcionProducto")?.value?.trim() || "";
    mensaje += `• ${nombre} - ${gramos}g (${h}h ${m}m)${descripcion ? `\n  📝 ${descripcion}` : ""}\n`;
  });

  mensaje += `\n💰 Total: $${precioFinal}`;

  const url =
    "https://api.whatsapp.com/send?text=" + encodeURIComponent(mensaje);
  window.open(url, "_blank");
});
