// Incluir las bibliotecas necesarias
#include <ArduinoJson.h>  // Biblioteca para manejar JSON
#include <DHT.h>          // Biblioteca para el sensor DHT

// Definir los pines de los sensores
#define DHTPIN 7      // Pin del sensor DHT
#define VIENTO_PIN 4  // Pin del sensor de viento
#define LUZ_PIN A4    // Pin del sensor de luz
#define DHTTYPE DHT11 // Tipo de sensor DHT
#define TIME 10000    // Tiempo de medición del sensor de viento (en milisegundos)
#define RADIO 0.1     // Radio del sensor de viento (en metros)

// Crear una instancia del sensor DHT
DHT dht(DHTPIN, DHTTYPE);

void setup() {
    Serial.begin(115200); // Inicialización de comunicación serial para debug
    dht.begin();          // Inicio del sensor DHT
}

void loop() {
    // Leer la intensidad de la luz
    int intensidadLuminica = analogRead(LUZ_PIN);

    // Leer la humedad y la temperatura del sensor DHT
    float humedad = dht.readHumidity();
    float temperatura = dht.readTemperature();

    unsigned long tiempoInicio = millis(); // Tiempo de inicio
    int RPM = 0;
    bool dato_anterior = 1;

    // Leer el valor del sensor de viento durante 10 segundos
    while (millis() - tiempoInicio < TIME) {
        bool dato = digitalRead(VIENTO_PIN); // Lee un dato
        // Contar los pulsos del sensor de viento
        if ((dato == 0 && dato_anterior == 1) || (dato == 1 && dato_anterior == 0)) {
            RPM++; // Incrementa el contador de pulsos
        }
        dato_anterior = dato; // Guarda el estado actual del dato
    }

    // Calcular la velocidad angular y la velocidad del viento
    RPM = RPM / 2; // Se divide por 2 porque se cuentan ambos flancos (subida y bajada)
    float vel_angular = (RPM * (2 * 3.1416) / (TIME / 1000)); // Velocidad angular en radianes por segundo
    float velocidadViento = vel_angular * RADIO;              // Velocidad del viento en m/s

    // Comprobar si hubo un error al leer los datos del sensor DHT
    if (isnan(humedad) || isnan(temperatura)) {
        Serial.println("Error obteniendo los datos del sensor DHT11");
        return;
    }

    // Crear un objeto JSON para almacenar los datos recopilados
    StaticJsonDocument<200> doc;
    doc["temperatura"] = temperatura;
    doc["humedad"] = humedad;
    doc["intensidadLuminica"] = intensidadLuminica;
    doc["velocidadVientoMS"] = velocidadViento;  // Velocidad del viento en m/s

    // Convertir la velocidad del viento a km/h y agregar al JSON
    velocidadViento = velocidadViento * 3.6;  // Convertir a km/h
    doc["velocidadVientoKMH"] = velocidadViento; // Velocidad del viento en km/h
    doc["RPM"] = RPM;  // Agregar el número de RPM al JSON

    // Serializar el JSON a una cadena
    String json;
    serializeJson(doc, json);

    // Enviar la cadena JSON a través del puerto serial
    Serial.println(json);

    // Esperar un tiempo antes de la siguiente transmisión de JSON
    delay(5000);  // Intervalo de espera de 5 segundos (ajustable según sea necesario)
}
