// Precios por material
const preciosMateriales = {
    'PLA ELEGOO': 24500,
    'PTEG ELEGOO': 22000,
    'PLA 3N': 18000
};

const materialSelect = document.getElementById('material');
const precioMaterialInput = document.getElementById('precioMaterial');

materialSelect.addEventListener('change', function() {
    const seleccionado = materialSelect.value;
    precioMaterialInput.value = preciosMateriales[seleccionado] || '';
});

// Inicializar precio al cargar
window.addEventListener('DOMContentLoaded', function() {
    precioMaterialInput.value = preciosMateriales[materialSelect.value];
});

document.getElementById('calcForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // Obtener valores
    const material = materialSelect.value;
    const precioMaterial = parseFloat(precioMaterialInput.value);
    const gramos = parseFloat(document.getElementById('gramos').value);
    const horas = parseFloat(document.getElementById('horas').value);
    const precioLuz = parseFloat(document.getElementById('precioLuz').value);
    const consumo = parseFloat(document.getElementById('consumo').value);
    const gastoExtra = parseFloat(document.getElementById('gastoExtra').value);
    const ganancia = parseFloat(document.getElementById('ganancia').value);

    // Cálculos
    const costoMaterial = (precioMaterial / 1000) * gramos;
    const consumoKwh = (consumo * horas) / 1000;
    const costoLuz = consumoKwh * precioLuz;
    const costoTotal = costoMaterial + costoLuz + gastoExtra;
    const precioVenta = costoTotal * (1 + ganancia / 100);

    // Mostrar resultados
    document.getElementById('resultados').innerHTML = `
        <strong>Material:</strong> ${material}<br>
        <strong>Costo de material:</strong> $${costoMaterial.toFixed(2)}<br>
        <strong>Costo de luz:</strong> $${costoLuz.toFixed(2)}<br>
        <strong>Gasto extra:</strong> $${gastoExtra.toFixed(2)}<br>
        <strong><u>Total de gastos:</u></strong> $${costoTotal.toFixed(2)}<br>
        <strong><u>Precio sugerido de venta:</u></strong> $${precioVenta.toFixed(2)}
    `;

    // Fuegos artificiales
    lanzarFuegosArtificiales();
});

// Efecto de fuegos artificiales
function lanzarFuegosArtificiales() {
    const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');
    // Ajustar tamaño al viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const fuegos = [];
    // Más fuegos artificiales
    for (let i = 0; i < 55; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height / 2);
        // Más partículas por fuego
        for (let j = 0; j < 28; j++) {
            // Color random
            const color = `hsl(${Math.floor(Math.random()*360)}, 100%, 55%)`;
            fuegos.push({
                x: x,
                y: y,
                angle: (Math.PI * 2 * j) / 28,
                color: color,
                radius: 0,
                speed: 2 + Math.random() * 2
            });
        }
    }

    let frame = 0;
    const duracion = 150; // Duración aumentada (antes 60)
    function animar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fuegos.forEach(f => {
            f.radius += f.speed;
            const px = f.x + Math.cos(f.angle) * f.radius;
            const py = f.y + Math.sin(f.angle) * f.radius;
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = f.color;
            ctx.globalAlpha = Math.max(1 - f.radius / duracion, 0);
            ctx.fill();
            ctx.globalAlpha = 1;
        });
        frame++;
        if (frame < duracion) {
            requestAnimationFrame(animar);
        } else {
            setTimeout(() => {
                canvas.style.display = 'none';
            }, 1200);
        }
    }
    animar();
}
