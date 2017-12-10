# tmapClock
Schedule searching spatial route from A to B


1. node.js
modeules:
http, request, node-schedule, fs, JSON, express, body-parser, mysql, chart.js

2. mysql
version over 5.7
table - tmapdata, hourstable

3. tmapclock(arduino)
using nodeMCU(ESP8266)
4-bit-LED Digital Tube using 5 pin, 74LS595 Register
PIN Settings
4 bit LED : SCLK - D3, RCLK - D4, DIO - D2
Red Led - D8 (sign of Server Request Error), Yellow Led - D7 (sign of Unable to Connet WiFi)

EJS View directory is setted to rootDirectory (Should NOT use Views folder)
