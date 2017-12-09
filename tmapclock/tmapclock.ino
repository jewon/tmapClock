#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

// WiFi 셋팅
const char* ssid = "****ssid";
const char* password = "****password";

WiFiClient client;

// 알아보기 쉽게 다시 변수로 선언
const int CLOCK_pin = 0; //SCLK to D3
const int LATCH_pin = 2; //RCLK to D4
const int DATA_pin = 4; //DIO to D2
const int RED_LED = 15;
const int GREEN_LED = 13;

unsigned long current_time = millis();
unsigned long prev_time = current_time;

int t[4] = { 0, 0, 0, 0};
int tsize = 3;
String host = "http://jewon.xyz/nodemcu";

void setup() {
  // put your setup code here, to run once:

  pinMode(CLOCK_pin, OUTPUT);
  pinMode(LATCH_pin, OUTPUT);
  pinMode(DATA_pin, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  digitalWrite(GREEN_LED, HIGH);

  Serial.begin(115200);
  delay(10);

  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");

  digitalWrite(GREEN_LED, LOW);
  Serial.print("Requesting URL: ");
}

void loop() {
  if(current_time - prev_time >5000){
    if (WiFi.status() == WL_CONNECTED) { //Check WiFi connection status
      
      Serial.println(host);
      HTTPClient http;
  
      http.begin(host);
      int httpCode = http.GET();//Send the request
   
      if (httpCode > 0) { //Check the returning code
        String payload = http.getString();   //Get the request response payload
        Serial.println(payload); //Print the response payload
        digitalWrite(RED_LED, LOW);
        for (int i = 0 ; i < 4 ; i++)
        {
          t[i] = payload.charAt(i)-48; // ASCII CODE to Number
          Serial.print(t[i]);
          if(t[i] < 0) break;
          tsize = i;
          Serial.print(tsize);
        }
      }
  
      else
      {
        Serial.print("Connect Failed");
        digitalWrite(RED_LED, HIGH);
      }
      http.end();   //Close connection
      }
      current_time = millis();
      prev_time = current_time;
    }
    
    else
    {

    // 숫자별 FND 설정값
    int num[] = {
      0B00000011, //0
      0B10011111, //1
      0B00100101, //2
      0B00001101, //3
      0B10011001, //4
      0B01001001, //5
      0B01000001, //6
      0B00011111, //7
      0B00000001, //8
      0B00001001, //9
      0B11111111, //공백      
      };  
    
      int digitPos = 8;
  
      for (int i = 0 ; i < tsize + 1 ; i++) {
        // Latch 핀을 LOW로 설정해야 Data를 전송할 수 있다.
        digitalWrite(LATCH_pin, LOW);
        // 표시할 문자 정보 전송
        shiftOut(DATA_pin, CLOCK_pin, LSBFIRST, num[t[i]]);
        // 자릿수 정보 전송
        shiftOut(DATA_pin, CLOCK_pin, MSBFIRST, digitPos) ;
        digitalWrite(LATCH_pin, HIGH);
        // 1비트씩 오늘쪽으로 쉬프트
        digitPos >>= 1;
        }
      current_time = millis();
    }
}


