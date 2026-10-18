// firmware/RescueMeshESP32/RescueMeshESP32.ino
// Track 1 owns this file — ESP32 SoftAP + DNSServer captive portal + NVS + REST API + LoRa
// Pin map: SCK 5 MISO 19 MOSI 27 CS 18 RST 14 DIO0 26 LED 2
// AP: "🚨 RESCUE-MESH-SOS 🚨"  IP 192.168.4.1  DNS *:53  HTTP :80
// Routes: GET /  POST /submit  GET /get_requests  GET /health  POST /clear
// NVS namespace: "rescue-mesh"  LoRa: 868.0 MHz BW125 SF7  packet <200B hopCount max 5
// NOTE: This is a placeholder — Track 1 replaces with full sketch.
// Libraries: WiFi, DNSServer, ESPAsyncWebServer, AsyncTCP, Preferences, ArduinoJson, RadioLib
#include <Arduino.h>
void setup() { Serial.begin(115200); Serial.println("RESCUE-MESH ESP32 — Track 1 will implement here"); }
void loop() {}
