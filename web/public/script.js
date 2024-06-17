// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCATsWr8Z1nvpPNPhwqDLkzBmbxCIcrJew",
    authDomain: "weather-stationg06.firebaseapp.com",
    databaseURL: "https://weather-stationg06-default-rtdb.firebaseio.com",
    projectId: "weather-stationg06",
    storageBucket: "weather-stationg06.appspot.com",
    messagingSenderId: "946732132869",
    appId: "1:946732132869:web:e69a1a90613e91cbac4a6c",
    measurementId: "G-W3083D7YY7"
};

// Inicialización de Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Referencia a la colección 'mediciones' en la base de datos
const medicionesRef = db.ref('mediciones');

// Elemento en el DOM donde se mostrará la medición actual
const medicionActual = document.getElementById('medicion-actual');

// Variable para almacenar la última medición mostrada
let ultimaMedicion = null;

// Función para descargar datos en formato JSON
function descargarDatosJson() {
    medicionesRef.once('value', (snapshot) => {
        const data = snapshot.val();
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'datos.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// Evento para activar la descarga de JSON al hacer clic en el botón correspondiente
document.getElementById('descargarJson').addEventListener('click', descargarDatosJson);

// Función para muestreo de datos reduciendo la cantidad de puntos mostrados
function downsampleData(data, targetPoints) {
    const factor = Math.ceil(data.length / targetPoints);
    return data.filter((_, index) => index % factor === 0);
}

// Evento que escucha cambios en la última medición y actualiza la interfaz
medicionesRef.limitToLast(1).on('value', (snapshot) => {
    snapshot.forEach((childSnapshot) => {
        const medicion = childSnapshot.val();

        if (medicion.fecha !== undefined && medicion.hora !== undefined && medicion.temperatura !== undefined && medicion.humedad !== undefined && medicion.velocidad_vientoKMH !== undefined && medicion.intensidad_luminica !== undefined) {
            // Construcción de HTML para mostrar la medición actual
            const fecha = convertirFecha(medicion.fecha);
            const hora = medicion.hora;
            const temperatura = `${medicion.temperatura} °C`;
            const humedad = `${medicion.humedad} %`;
            const velocidadVientoKMH = `${medicion.velocidad_vientoKMH} km/h`;
            const intensidadLuminica = `${medicion.intensidad_luminica}`;

            // Limpiar contenido anterior en el elemento de medición actual
            while (medicionActual.firstChild) {
                medicionActual.removeChild(medicionActual.firstChild);
            }

            // Crear elemento HTML para mostrar la medición actual
            const paragraph = document.createElement('p');
            paragraph.innerHTML = `
                <h3>Medición Actual</h3>
                <p><i class="fas fa-calendar-alt"></i> Fecha y Hora: ${fecha} - ${formatearHora(hora)}</p>
                <p><i class="fas fa-thermometer-half"></i> Temperatura: ${temperatura}</p>
                <p><i class="fas fa-tint"></i> Humedad: ${humedad}</p>
                <p><i class="fas fa-wind"></i> Velocidad Viento: ${velocidadVientoKMH}</p>
                <p><i class="fas fa-sun"></i> Intensidad Luminica: ${intensidadLuminica}</p>
            `;
            medicionActual.appendChild(paragraph);

            // Almacenar la última medición mostrada
            ultimaMedicion = {
                fecha,
                hora,
                temperatura,
                humedad,
                velocidadVientoKMH,
                intensidadLuminica
            };
        } else if (ultimaMedicion !== null) {
            // Si la última medición existe, mostrarla nuevamente
            const fecha = convertirFecha(ultimaMedicion.fecha);
            const hora = ultimaMedicion.hora;
            const temperatura = ultimaMedicion.temperatura;
            const humedad = ultimaMedicion.humedad;
            const velocidadVientoKMH = ultimaMedicion.velocidadVientoKMH;
            const intensidadLuminica = ultimaMedicion.intensidadLuminica;

            while (medicionActual.firstChild) {
                medicionActual.removeChild(medicionActual.firstChild);
            }

            const paragraph = document.createElement('p');
            paragraph.innerHTML = `
                <h3>Medición Actual</h3>
                <p><i class="fas fa-calendar-alt"></i> Fecha y Hora: ${fecha} - ${formatearHora(hora)}</p>
                <p><i class="fas fa-thermometer-half"></i> Temperatura: ${temperatura}</p>
                <p><i class="fas fa-tint"></i> Humedad: ${humedad}</p>
                <p><i class="fas fa-wind"></i> Velocidad Viento: ${velocidadVientoKMH}</p>
                <p><i class="fas fa-sun"></i> Intensidad Lumínica: ${intensidadLuminica}</p>
            `;
            medicionActual.appendChild(paragraph);
        }
    });
});

function formatearHora(hora) {
    // Dividimos la hora en horas, minutos y segundos
    var partes = hora.split(':');
    var horas = partes[0];
    var minutos = partes[1];
    var segundos = partes[2];

    // Añadimos ceros delante si es necesario
    if (horas.length < 2) horas = '0' + horas;
    if (minutos.length < 2) minutos = '0' + minutos;
    if (segundos.length < 2) segundos = '0' + segundos;

    // Devolvemos la hora formateada
    return horas + ':' + minutos + ':' + segundos;
}


// Definimos la función de conversión de fecha
function convertirFecha(formatoYYYMMD) {
    // Asegúrate de que la cadena tenga al menos 7 caracteres y máximo 8
    if (formatoYYYMMD.length < 7 || formatoYYYMMD.length > 8) {
        throw new Error("El formato de la fecha no es válido. Debe ser YYYYMMD o YYYYMMDD.");
    }
    
    // Extrae el año
    const año = formatoYYYMMD.substring(0, 4);
    
    // Extrae el mes y el día
    let mes = formatoYYYMMD.substring(4, 6);
    let día = formatoYYYMMD.substring(6, formatoYYYMMD.length);
    
    // Asegurarse de que el mes y el día tengan dos dígitos
    if (mes.length === 1) {
        mes = '0' + mes;
    }
    if (día.length === 1) {
        día = '0' + día;
    }
    
    // Formar la nueva cadena en el formato DD/MM/YYYY
    const fechaConvertida = `${día}/${mes}/${año}`;
    
    return fechaConvertida;
}

// Configuración y creación de gráficos utilizando Chart.js
const temperaturaChart = new Chart(document.getElementById('temperatura-chart').getContext('2d'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperatura (°C)',
            data: [],
            borderColor: 'red',
            borderWidth: 1,
            fill: false
        }]
    }
});

const humedadChart = new Chart(document.getElementById('humedad-chart').getContext('2d'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Humedad (%)',
            data: [],
            borderColor: 'green',
            borderWidth: 1,
            fill: false
        }]
    }
});

const luminosidadChart = new Chart(document.getElementById('luminosidad-chart').getContext('2d'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Luminosidad',
            data: [],
            borderColor: 'blue',
            borderWidth: 1,
            fill: false
        }]
    }
});

const velocidadVientoChart = new Chart(document.getElementById('velocidad-viento-chart').getContext('2d'), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Velocidad Viento (km/h)',
            data: [],
            borderColor: 'purple',
            borderWidth: 1,
            fill: false
        }]
    }
});

// Evento que escucha cambios en los datos y actualiza los gráficos
medicionesRef.on('value', (snapshot) => {
    const data = snapshot.val();

    // Extracción de datos para gráficos
    const labels = [];
    const temperaturaData = [];
    const humedadData = [];
    const luminosidadData = [];
    const velocidadVientoData = [];

    // Iterar sobre los datos obtenidos
    for (const key in data) {
        labels.push(data[key].hora);
        temperaturaData.push(data[key].temperatura);
        humedadData.push(data[key].humedad);
        luminosidadData.push(data[key].intensidad_luminica);
        velocidadVientoData.push(data[key].velocidad_vientoKMH);
    }

    // Muestreo de datos para reducir la cantidad de puntos en los gráficos
    const maxDataPoints = 100;
    const downsampledLabels = downsampleData(labels, maxDataPoints);
    const downsampledTemperaturaData = downsampleData(temperaturaData, maxDataPoints);
    const downsampledHumedadData = downsampleData(humedadData, maxDataPoints);
    const downsampledLuminosidadData = downsampleData(luminosidadData, maxDataPoints);
    const downsampledVelocidadVientoData = downsampleData(velocidadVientoData, maxDataPoints);

    // Actualización de datos en los gráficos
    temperaturaChart.data.labels = downsampledLabels;
    temperaturaChart.data.datasets[0].data = downsampledTemperaturaData;
    temperaturaChart.update();

    humedadChart.data.labels = downsampledLabels;
    humedadChart.data.datasets[0].data = downsampledHumedadData;
    humedadChart.update();

    luminosidadChart.data.labels = downsampledLabels;
    luminosidadChart.data.datasets[0].data = downsampledLuminosidadData;
    luminosidadChart.update();

    velocidadVientoChart.data.labels = downsampledLabels;
    velocidadVientoChart.data.datasets[0].data = downsampledVelocidadVientoData;
    velocidadVientoChart.update();
});

// Función para calcular promedios por hora
function calcularPromedios(data) {
    const promedios = {};

    // Iterar sobre las mediciones
    Object.values(data).forEach((medicion) => {
        const hora = medicion.hora;
        if (hora) {
            const horaSplit = hora.split(":");
            const horaIndex = horaSplit[0];
            const temperatura = parseFloat(medicion.temperatura);
            const humedad = parseFloat(medicion.humedad);
            const luminosidad = parseFloat(medicion.intensidad_luminica);
            const velocidadViento = parseFloat(medicion.velocidad_vientoKMH);

            // Validar que los datos sean numéricos antes de incluirlos en el promedio
            if (!isNaN(temperatura) && !isNaN(humedad) && !isNaN(luminosidad) && !isNaN(velocidadViento)) {
                if (!promedios[horaIndex]) {
                    promedios[horaIndex] = {
                        temperatura: [temperatura],
                        humedad: [humedad],
                        luminosidad: [luminosidad],
                        velocidadViento: [velocidadViento]
                    };
                } else {
                    promedios[horaIndex].temperatura.push(temperatura);
                    promedios[horaIndex].humedad.push(humedad);
                    promedios[horaIndex].luminosidad.push(luminosidad);
                    promedios[horaIndex].velocidadViento.push(velocidadViento);
                }
            }
        }
    });

    // Elemento de la tabla en HTML donde se mostrarán los promedios por hora
    const tablaPromedios = document.getElementById('tabla-promedios').getElementsByTagName('tbody')[0];
    tablaPromedios.innerHTML = ''; // Limpiar contenido previo

    // Crear filas con los promedios por hora calculados
    for (const hora in promedios) {
        const temperaturaMedia = promedios[hora].temperatura.reduce((acc, val) => acc + val, 0) / promedios[hora].temperatura.length;
        const humedadMedia = promedios[hora].humedad.reduce((acc, val) => acc + val, 0) / promedios[hora].humedad.length;
        const luminosidadMedia = promedios[hora].luminosidad.reduce((acc, val) => acc + val, 0) / promedios[hora].luminosidad.length;
        const velocidadVientoMedia = promedios[hora].velocidadViento.reduce((acc, val) => acc + val, 0) / promedios[hora].velocidadViento.length;

        // Crear fila HTML con los datos de promedio por hora
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${hora}:00</td>
            <td>${temperaturaMedia.toFixed(2)} °C</td>
            <td>${humedadMedia.toFixed(2)} %</td>
            <td>${luminosidadMedia.toFixed(2)}</td>
            <td>${velocidadVientoMedia.toFixed(2)} km/h</td>
        `;

        tablaPromedios.appendChild(fila); // Agregar fila a la tabla de promedios
    }
}

// Función para calcular promedios diarios
function calcularPromediosDiarios(data) {
    const promediosDiarios = {};

    // Iterar sobre las mediciones
    for (const key in data) {
        const fecha = data[key].fecha;
        const temperatura = parseFloat(data[key].temperatura);
        const humedad = parseFloat(data[key].humedad);
        const luminosidad = parseFloat(data[key].intensidad_luminica);
        const velocidadViento = parseFloat(data[key].velocidad_vientoKMH);

        // Validar que la fecha y los datos sean numéricos antes de incluirlos en el promedio
        if (fecha && !isNaN(temperatura) && !isNaN(humedad) && !isNaN(luminosidad) && !isNaN(velocidadViento)) {
            if (!promediosDiarios[fecha]) {
                promediosDiarios[fecha] = {
                    temperatura: [temperatura],
                    humedad: [humedad],
                    luminosidad: [luminosidad],
                    velocidadViento: [velocidadViento]
                };
            } else {
                promediosDiarios[fecha].temperatura.push(temperatura);
                promediosDiarios[fecha].humedad.push(humedad);
                promediosDiarios[fecha].luminosidad.push(luminosidad);
                promediosDiarios[fecha].velocidadViento.push(velocidadViento);
            }
        }
    }

    // Elemento de la tabla en HTML donde se mostrarán los promedios diarios
    const tablaPromediosDiarios = document.getElementById('tabla-promedios-diarios').getElementsByTagName('tbody')[0];
    tablaPromediosDiarios.innerHTML = ''; // Limpiar contenido previo

    // Crear filas con los promedios diarios calculados
    for (const fecha in promediosDiarios) {
        const temperaturaMedia = promediosDiarios[fecha].temperatura.reduce((acc, val) => acc + val, 0) / promediosDiarios[fecha].temperatura.length;
        const humedadMedia = promediosDiarios[fecha].humedad.reduce((acc, val) => acc + val, 0) / promediosDiarios[fecha].humedad.length;
        const luminosidadMedia = promediosDiarios[fecha].luminosidad.reduce((acc, val) => acc + val, 0) / promediosDiarios[fecha].luminosidad.length;
        const velocidadVientoMedia = promediosDiarios[fecha].velocidadViento.reduce((acc, val) => acc + val, 0) / promediosDiarios[fecha].velocidadViento.length;

        // Crear fila HTML con los datos de promedio diario
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${convertirFecha(fecha)}</td>
            <td>${temperaturaMedia.toFixed(2)} °C</td>
            <td>${humedadMedia.toFixed(2)} %</td>
            <td>${luminosidadMedia.toFixed(2)}</td>
            <td>${velocidadVientoMedia.toFixed(2)} km/h</td>
        `;

        tablaPromediosDiarios.appendChild(fila); // Agregar fila a la tabla de promedios diarios
    }
}

// Evento que escucha cambios en los datos y llama a las funciones de cálculo de promedios
medicionesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    calcularPromedios(data); // Calcular promedios por hora
    calcularPromediosDiarios(data); // Calcular promedios diarios
});

// Evento para activar la descarga de datos en formato CSV al hacer clic en el botón correspondiente
document.getElementById('descargarCsv').addEventListener('click', descargarDatosCsv);

// Función para descargar datos en formato CSV
function descargarDatosCsv() {
    medicionesRef.once('value', (snapshot) => {
        const data = snapshot.val();
        const jsonData = Object.values(data);

        if (jsonData.length > 0) {
            const keys = Object.keys(jsonData[0]);
            const csvContent = keys.join(',') + '\n';

            // Generar filas CSV con los datos
            const rows = jsonData.map(item => keys.map(key => item[key]).join(','));
            const csvRows = rows.join('\n');

            // Crear objeto Blob y generar URL para descarga
            const blob = new Blob([csvContent, csvRows], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);

            // Crear elemento <a> invisible para activar la descarga y luego removerlo
            const a = document.createElement('a');
            a.href = url;
            a.download = 'datos.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Liberar el objeto URL creado
            URL.revokeObjectURL(url);
        }
    });
}
