document.addEventListener("DOMContentLoaded", () => {
    const materiales = {
        "PLA ELEGOO": 24900,
        "PETG ELEGOO": 23000,
        "PLA 3NMAX": 19000
    };

    // ================= VARIABLES GLOBALES =================
    let precioFinal = 0;
    let precioConMargenGlobal = 0;
    let montoDescuentoGlobal = 0;
    let descuentoGlobal = 0;

    const materialSelect = document.getElementById("material");
    const contenedorProductos = document.getElementById("productos");
    const botonAgregarProducto = document.getElementById("agregarProducto");
    const botonCalcular = document.getElementById("calcular");
    const botonPDF = document.getElementById("pdf");
    const botonWhatsApp = document.getElementById("whatsapp");

    // ================= MATERIALES =================
    for (const m in materiales) {
        const option = document.createElement("option");
        option.value = m;
        option.textContent = m;
        materialSelect.appendChild(option);
    }

    // ================= PRODUCTOS =================
    let contadorProductos = 1;

    function agregarProducto() {
        const div = document.createElement("div");
        div.className = "fila producto";

        div.innerHTML = `
      <input placeholder="Producto ${contadorProductos}" class="nombreProducto">
      <input type="number" placeholder="g" class="gramosProducto">
      <button type="button" class="eliminar">✕</button>
    `;

        contadorProductos++;

        const botonEliminar = div.querySelector(".eliminar");
        botonEliminar.addEventListener("click", () => div.remove());

        contenedorProductos.appendChild(div);
    }

    botonAgregarProducto.addEventListener("click", agregarProducto);
    agregarProducto();

    // ================= GRAMOS =================
    function obtenerGramosTotales() {
        let total = 0;

        document.querySelectorAll(".gramosProducto").forEach((input) => {
            const valor = (input.value || "").replace(",", ".").trim();
            const numero = parseFloat(valor);
            if (!isNaN(numero)) total += numero;
        });

        return total;
    }

    // ================= MARGEN =================
    function margenRecomendado(tiempo) {
        if (tiempo <= 2) return 40;
        if (tiempo <= 6) return 60;
        return 80;
    }

    // ================= CALCULAR =================
    function calcular() {
        const gramos = obtenerGramosTotales();

        const horas = parseFloat(document.getElementById("horas").value) || 0;
        const minutos = parseFloat(document.getElementById("minutos").value) || 0;
        const tiempo = horas + minutos / 60;

        const precioKg = materiales[materialSelect.value] || 0;
        const costoMaterial = (precioKg / 1000) * gramos;

        const precioKwh = parseFloat(document.getElementById("precioLuz").value) || 0;
        const consumo = parseFloat(document.getElementById("consumo").value) || 0;
        const costoLuz = (consumo / 1000) * tiempo * precioKwh;

        const repuestos = parseFloat(document.getElementById("repuestos").value) || 0;
        const vida = parseFloat(document.getElementById("vida").value) || 1;
        const desgasteHora = repuestos / vida;
        const costoDesgaste = desgasteHora * tiempo;

        const insumos = parseFloat(document.getElementById("insumos").value) || 0;

        const costoBase = costoMaterial + costoLuz + costoDesgaste + insumos;

        const fallos = parseFloat(document.getElementById("fallos").value) || 0;
        const costoFallos = costoBase * (fallos / 100);

        const costoTotal = costoBase + costoFallos;
        const margen = margenRecomendado(tiempo);

        precioConMargenGlobal = costoTotal + (costoTotal * margen) / 100;

        descuentoGlobal = parseFloat(document.getElementById("descuento").value) || 0;
        montoDescuentoGlobal = precioConMargenGlobal * (descuentoGlobal / 100);

        precioFinal = precioConMargenGlobal - montoDescuentoGlobal;

        const minimo = parseFloat(document.getElementById("minimo").value) || 0;
        precioFinal = Math.max(precioFinal, minimo);

        document.getElementById("resultado").innerHTML = `
      Filamento total: ${gramos} g<br>
      Costo total: $${costoTotal.toFixed(2)}<br>
      Precio con margen: $${precioConMargenGlobal.toFixed(2)}<br>
      Descuento (${descuentoGlobal}%): -$${montoDescuentoGlobal.toFixed(2)}
    `;

        document.getElementById("precioFinal").innerText = "$" + precioFinal.toFixed(2);
    }

    botonCalcular.addEventListener("click", calcular);

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

        const cliente = document.getElementById("cliente").value || "Cliente";
        const fecha = new Date().toLocaleDateString();

        let numero = localStorage.getItem("numeroPresupuesto");
        numero = numero ? parseInt(numero, 10) + 1 : 1;
        localStorage.setItem("numeroPresupuesto", numero);

        const numeroPresupuesto =
            "P-" + new Date().getFullYear() + "-" + String(numero).padStart(4, "0");

        function guardarPDF() {
            doc.save("presupuesto-" + numeroPresupuesto + ".pdf");
        }

        function dibujarContenido(logoCargado, logoImg) {
            // HEADER
            doc.setFillColor(163, 204, 211);
            doc.rect(0, 0, 210, 30, "F");

            if (logoCargado && logoImg) {
                try {
                    doc.addImage(logoImg, "PNG", 160, 5, 30, 20);
                } catch (err) {
                    console.log("No se pudo insertar el logo:", err);
                }
            }

            doc.setTextColor(252, 131, 50);
            doc.setFontSize(16);
            doc.text("Norte, Nudo, Next", 20, 18);

            doc.setFontSize(10);
            doc.text("Impresión 3D Profesional", 20, 25);

            doc.setTextColor(0);

            // MARCA DE AGUA
            if (logoCargado && logoImg) {
                try {
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();

                    const imgWidth = 100;
                    const imgHeight = 100;

                    const centerX = (pageWidth - imgWidth) / 2;
                    const centerY = (pageHeight - imgHeight) / 2;

                    if (doc.GState && doc.setGState) {
                        doc.setGState(new doc.GState({ opacity: 0.08 }));
                        doc.addImage(logoImg, "PNG", centerX, centerY, imgWidth, imgHeight);
                        doc.setGState(new doc.GState({ opacity: 1 }));
                    }
                } catch (err) {
                    console.log("No se pudo aplicar la marca de agua:", err);
                }
            }

            // DATOS
            doc.text("Cliente: " + cliente, 20, 45);
            doc.text("Fecha: " + fecha, 20, 52);
            doc.text("N°: " + numeroPresupuesto, 20, 59);

            doc.line(10, 70, 200, 70);

            // TABLA
            doc.text("Producto", 15, 80);
            doc.text("Gramos", 120, 80);
            doc.text("Precio", 165, 80);

            let y = 85;
            const gramosTotales = obtenerGramosTotales();

            document.querySelectorAll(".producto").forEach((p) => {
                const nombre = p.querySelector(".nombreProducto")?.value || "Producto";

                let valor = p.querySelector(".gramosProducto")?.value || "0";
                valor = valor.replace(",", ".").trim();

                let gramos = parseFloat(valor);
                if (isNaN(gramos)) gramos = 0;

                const porcentaje = gramosTotales > 0 ? gramos / gramosTotales : 0;
                const precioProducto = precioFinal * porcentaje;

                y += 10;

                doc.text(String(nombre), 15, y);
                doc.text(gramos + " g", 120, y);
                doc.text("$" + precioProducto.toFixed(0), 165, y);
            });

            // TOTALES
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");

            doc.text("Subtotal:", 120, y + 20);
            doc.text("$" + precioConMargenGlobal.toFixed(0), 190, y + 20, { align: "right" });

            let offsetY = 28;

            if (descuentoGlobal > 0) {
                doc.text("Descuento (" + descuentoGlobal + "%):", 120, y + offsetY);
                doc.text("-$" + montoDescuentoGlobal.toFixed(0), 190, y + offsetY, { align: "right" });
                offsetY += 8;
            }

            doc.setFillColor(163, 204, 211);
            doc.rect(120, y + 35, 80, 22, "F");

            doc.setTextColor(252, 131, 50);
            doc.setFontSize(11);
            doc.text("TOTAL FINAL", 125, y + 43);

            doc.setFontSize(18);
            doc.text("$" + precioFinal.toFixed(0), 195, y + 50, { align: "right" });

            doc.setTextColor(120);

            // FOOTER
            doc.setDrawColor(200);
            doc.line(10, 270, 200, 270);

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Gracias por confiar en nuestro servicio", 20, 276);
            doc.text("Validez del presupuesto: 7 días", 20, 282);
            doc.text("Tiempo estimado de entrega: 3 a 5 días", 20, 288);
            doc.text("Contacto: 351-2715524", 200, 276, { align: "right" });

            // QR
            const mensajeQR = `Hola! Vi el presupuesto ${numeroPresupuesto} y quiero consultar`;
            const urlWhatsApp =
                "https://api.whatsapp.com/send?phone=5493512715524&text=" +
                encodeURIComponent(mensajeQR);

            const qrURL =
                "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" +
                encodeURIComponent(urlWhatsApp);

            const qrImg = new Image();
            qrImg.crossOrigin = "Anonymous";

            qrImg.onload = function () {
                try {
                    doc.addImage(qrImg, "PNG", 160, 230, 35, 35);
                    doc.setFontSize(8);
                    doc.setTextColor("#fc8332");
                    doc.text("Escaneá para contactarnos", 160, 226);
                } catch (err) {
                    console.log("No se pudo insertar el QR:", err);
                }
                guardarPDF();
            };

            qrImg.onerror = function () {
                console.log("El QR no cargó. Se guarda el PDF igual.");
                guardarPDF();
            };

            qrImg.src = qrURL;
        }

        const logo = new Image();

        logo.onload = function () {
            dibujarContenido(true, logo);
        };

        logo.onerror = function () {
            console.log("No se encontró logo.png. Se genera el PDF sin logo.");
            dibujarContenido(false, null);
        };

        logo.src = "logo.png";
    }

    botonPDF.addEventListener("click", generarPDF);

    // ================= WHATSAPP =================
    function enviarWhatsApp() {
        if (precioFinal === 0) {
            alert("Primero calculá el presupuesto");
            return;
        }

        let mensaje = "Presupuesto impresión 3D\n\n";

        document.querySelectorAll(".producto").forEach((p, i) => {
            const nombre = p.querySelector(".nombreProducto")?.value || "Producto";
            const gramos = p.querySelector(".gramosProducto")?.value || 0;
            mensaje += `${i + 1} - ${nombre} (${gramos} g)\n`;
        });

        mensaje += `\nTotal: $${precioFinal.toFixed(2)}`;

        const url = "https://api.whatsapp.com/send?text=" + encodeURIComponent(mensaje);
        window.open(url, "_blank");
    }

    botonWhatsApp.addEventListener("click", enviarWhatsApp);
});