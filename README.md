# Estación Meteorológica IoT

Este proyecto fue desarrollado como parte del curso de Arquitectura de Computadoras en la carrera de Ingeniería en Informática. Consiste en una estación meteorológica IoT que captura y visualiza datos climáticos en tiempo real utilizando diferentes tecnologías y componentes.

## Descripción del Proyecto

El objetivo principal de este proyecto era crear una solución práctica y funcional para monitorear condiciones climáticas locales utilizando tecnología IoT. La estación meteorológica integra sensores de temperatura, humedad, luz y velocidad del viento, conectados a un Arduino UNO que envía los datos a una base de datos en la nube a través de NodeMCU ESP8266.

## Componentes Utilizados

- Sensor DHT11: Para medir temperatura y humedad.
- Fotorresistencia: Para medir la intensidad lumínica del entorno.
- Anemómetro casero: Diseñado para medir la velocidad del viento.
- Sensor de proximidad IR: Utilizado en el anemómetro para contar las RPM.
- Arduino UNO: Controla la captura y procesamiento de datos de los sensores.
- NodeMCU ESP8266: Placa Wi-Fi para transmitir datos a la nube.

## Funcionamiento

1. **Arduino**: Captura datos de sensores (DHT11, fotorresistencia, sensor IR) y los procesa.
2. **NodeMCU**: Recibe datos del Arduino, se conecta a Wi-Fi y los envía a Firebase.
3. **Firebase**: Almacena datos en tiempo real y permite su acceso desde una aplicación web.

## Enlaces

- **Trabajo Integrador Escrito**: [https://drive.google.com/file/d/1-UAaJwjOcxqlqXzhrGDJLbMoAPQItJzh/view?usp=sharing](https://drive.google.com/file/d/1-UAaJwjOcxqlqXzhrGDJLbMoAPQItJzh/view?usp=sharing)
- **Página Web de Visualización de Datos**: [https://weather-stationg06.web.app/](https://weather-stationg06.web.app/)

## Resultados y Conclusiones

El proyecto demostró ser una solución efectiva para la recolección y visualización de datos climáticos en tiempo real. A pesar de los desafíos técnicos encontrados, logramos implementar un sistema funcional que destaca por la integración de tecnologías Arduino e IoT en aplicaciones de monitoreo ambiental.

Este trabajo no solo cumplió con los requisitos académicos del curso, sino que también proporcionó una experiencia práctica valiosa en el diseño y desarrollo de sistemas IoT.

