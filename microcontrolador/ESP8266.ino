// Incluir las bibliotecas necesarias
#include <ArduinoJson.h>         // Biblioteca para manejar JSON
#include <ESP8266WiFi.h>         // Biblioteca para WiFi en ESP8266
#include <FirebaseESP8266.h>     // Biblioteca para Firebase en ESP8266
#include <NTPClient.h>           // Biblioteca para cliente NTP
#include <WiFiUdp.h>             // Biblioteca para UDP en WiFi
#include <TimeLib.h>             // Biblioteca para manejo de tiempo

// Definir las credenciales de WiFi y Firebase
#define WIFI_SSID "UGD"                      // Nombre de la red WiFi
#define WIFI_PASSWORD "launiversidad11"       // Contraseña de la red WiFi
#define API_KEY "AIzaSyCATsWr8Z1nvpPNPhwqDLkzBmbxCIcrJew"  // Clave de API de Firebase
#define DATABASE_URL "https://weather-stationg06-default-rtdb.firebaseio.com/"  // URL de la base de datos en Firebase
#define USER_EMAIL "giulianohillebrand@gmail.com"    // Correo electrónico para autenticación en Firebase
#define USER_PASSWORD "1234abcd"                    // Contraseña para autenticación en Firebase
#define TIME 10000    // Intervalo de tiempo para enviar datos a Firebase (en milisegundos)

// Configuración del protocolo de tiempo
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", -3*3600, 60000); // Cliente NTP para obtener la hora actual

// Instancias para acceder a Firebase
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0; // Tiempo desde el último envío de datos

void setup() {
  Serial.begin(115200); // Inicialización de comunicación serial para debug

  // Intento de conexión a la red WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // Esperar hasta que se conecte a la red WiFi
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP()); // Muestra la dirección IP asignada

  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION); // Muestra la versión del cliente de Firebase

  // Configuración de credenciales y URL de Firebase
  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.database_url = DATABASE_URL;

  // Inicialización de Firebase con la configuración y autenticación
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true); // Reconexión automática en caso de pérdida de conexión
  Firebase.setDoubleDigits(5);  // Configuración para números decimales

  timeClient.begin(); // Inicia el cliente NTP
  timeClient.update(); // Obtiene la hora actual
}

void loop() {
  timeClient.update(); // Actualiza la hora desde el servidor NTP

  // Verifica si hay datos disponibles para leer desde el puerto serial
  if (Serial.available() > 0) {
    String jsonString = Serial.readStringUntil('\n');

    // Crear un objeto JSON para procesar la cadena recibida
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, jsonString);

    // Verificar si hubo un error en la deserialización
    if (error) {
      Serial.print(F("Error al deserializar: "));
      Serial.println(error.c_str());
      return;
    }

    // Comprueba si Firebase está listo y si ha pasado el tiempo necesario para enviar datos
    if (Firebase.ready() && (millis() - sendDataPrevMillis > TIME || sendDataPrevMillis == 0)) {
      sendDataPrevMillis = millis(); // Actualiza el tiempo del último envío

      // Obtener las mediciones del JSON recibido
      float temperatura = doc["temperatura"];
      float humedad = doc["humedad"];
      float velocidadVientoMS = doc["velocidadVientoMS"];
      float velocidadVientoKMH = doc["velocidadVientoKMH"];
      int intensidadLuminica = doc["intensidadLuminica"];
      int RPM = doc["RPM"];

      char idUnico[50];
      tmElements_t tm;
      breakTime(timeClient.getEpochTime(), tm); // Descompone el tiempo en elementos (año, mes, día, etc.)

      // Crear un identificador único combinando fecha, hora y dirección MAC
      sprintf(idUnico, "med-%04d%02d%02d:%02d%02d%02d-%s",
              tm.Year + 1970, tm.Month, tm.Day, tm.Hour, tm.Minute, tm.Second,
              WiFi.macAddress().c_str());

      String rutaMedicion = "/mediciones/" + String(idUnico); // Ruta de almacenamiento en Firebase

      // Envía los datos a Firebase
      Firebase.setFloat(fbdo, rutaMedicion + "/temperatura", temperatura);
      Firebase.setFloat(fbdo, rutaMedicion + "/humedad", humedad);
      Firebase.setInt(fbdo, rutaMedicion + "/RPM", RPM);
      Firebase.setFloat(fbdo, rutaMedicion + "/velocidad_vientoMS", velocidadVientoMS);
      Firebase.setFloat(fbdo, rutaMedicion + "/velocidad_vientoKMH", velocidadVientoKMH);
      Firebase.setInt(fbdo, rutaMedicion + "/intensidad_luminica", intensidadLuminica);

      // Incluir la fecha y hora en la medición
      String fecha = String(tm.Year + 1970) + String(tm.Month) + String(tm.Day);
      String hora = String(tm.Hour) + ":" + String(tm.Minute) + ":" + String(tm.Second);

      Firebase.setString(fbdo, rutaMedicion + "/fecha", fecha);
      Firebase.setString(fbdo, rutaMedicion + "/hora", hora);
    }
  }
}
