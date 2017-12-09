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

+ MySQL Table Settings

*tmapdata
mysql> DESC tmapdata;
+---------------+-----------+------+-----+-------------------+-------------------+
| Field         | Type      | Null | Key | Default           | Extra             |
+---------------+-----------+------+-----+-------------------+-------------------+
| SEQ           | int(11)   | NO   | PRI | NULL              | auto_increment    |
| totalDistance | int(11)   | YES  |     | 0                 |                   |
| totalTime     | int(11)   | YES  |     | 0                 |                   |
| totalFare     | int(11)   | YES  |     | 0                 |                   |
| taxiFare      | int(11)   | YES  |     | 0                 |                   |
| timestamp     | timestamp | NO   |     | CURRENT_TIMESTAMP |                   |
| startX        | double    | YES  |     | NULL              |                   |
| startY        | double    | YES  |     | NULL              |                   |
| endX          | double    | YES  |     | NULL              |                   |
| endY          | double    | YES  |     | NULL              |                   |
| code          | int(11)   | YES  |     | NULL              |                   |
| days          | int(11)   | YES  |     | NULL              | VIRTUAL GENERATED |
| hours         | int(11)   | YES  |     | NULL              | VIRTUAL GENERATED |
+---------------+-----------+------+-----+-------------------+-------------------+

days = weekday(timestamp)
hours = floor(hour(timestamp)/3)

2. hourstable
mysql> DESC hourstable;
+-------+---------+------+-----+---------+-------+
| Field | Type    | Null | Key | Default | Extra |
+-------+---------+------+-----+---------+-------+
| hours | int(11) | NO   |     | NULL    |       |
| value | int(11) | YES  |     | 0       |       |
+-------+---------+------+-----+---------+-------+

mysql> select * from hourstable;
+-------+-------+
| hours | value |
+-------+-------+
|     1 |     0 |
|     2 |     0 |
|     3 |     0 |
|     4 |     0 |
|     5 |     0 |
|     6 |     0 |
|     7 |     0 |
|     0 |     0 |
+-------+-------+
*
