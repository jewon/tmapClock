//Packages Load
const http = require('http');
const request = require('request');
const schedule = require('node-schedule');
const fs = require('fs');
const JSON = require('JSON');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');

//Local Settings
const rootDirectory = '***Project Directory'
const port = 80

//Default StartXY, End XY
var startX = 14143439.537091;
var startY = 4522549.652549;//디폴트 출발지 : 경희대 서울캠퍼스
var endX = 14146867.260078;
var endY = 4472551.475751;//디폴트 도착지 : 경희대 국제캠퍼스

var totalTime = 0; //최근 소요시간(초) 저장할 변수

//mySQL 연결 설정
var connection = mysql.createConnection({
  host     : 'localhost',
  port     : '***mySQL Port Number',
  user     : '***mySQL Username',
  password : '***mySQL Password',
  database : '***mySQL Table Name'
});

function resetD(){ //tmapdata 테이블의 모든 데이터 삭제 (경로 바뀔 시 호출됨)
  connection.query("delete from tmapdata", function(err, rows, fields) {
    if(err){
      throw err;
    } else {
      console.log("all data deleted by Client")
    }
  });
}

//HTML Render엔진 설정(ejs)
app.set('views', rootDirectory);
app.set('view engine', 'ejs');

//mySQL 연결 및 tmapdata 테이블 확인
connection.connect();
connection.query('DESC tmapdata', function(err, rows, fields) {
  if (!err)
    console.log('DB Access OK');
  else
    console.log('DB Access Error', err);
});

//stat에서 조회할 SQL 쿼리문
var ncode = 0; // ncode는 출발-도착지 조합 순서 저장(sql)
var sqlStatString = "select hourstable.hours, avg(totalTime) as time from tmapdata right outer join hourstable on tmapdata.hours=hourstable.hours group by hours";

//Json, Urlencoded Body 파서 사용 설정
app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));

//Chart.js HTML script src로 사용 설정
app.use('/lib', express.static(rootDirectory + "node_modules/chart.js/dist"))

//Web Page Router
app.listen(port, function(){
  console.log(port,' port listening')
});
app.get('/', function(req, res){
  res.render("index", { totalTime : Number((totalTime/60).toFixed(0)) })
}); //index.ejs (dynamic)
app.get('/index*', function(req, res){
  res.redirect('/')
}) //index* 값 입력시 메인으로 redirect
app.get('/xyset', function(req, res){ //xyset.html (static)
  fs.readFile('XYset.html', function(err, data){
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  })
});
app.get('/routeOnTmap', function(req, res){
  res.render("routeOnTmap", { startX : startX, startY : startY, endX : endX, endY : endY })
});
app.get('/nodeMcu', function(req, res){
  res.set('Content-Type', 'text/plain');
  res.send(200, totalTime/60);
});
app.get('/stat', function(req, res){
  connection.query(sqlStatString, function(err, rows, fields) {
  if(err){
      throw err;
  } else {
      console.log("SQL ROWS : ", rows)
      var n = Object.keys(rows).length -1;
      res.render("stat", {title : 'data' , totalTime : totalTime/60, rows : rows, size : n});
      }
  });
});
app.get('/settings', function(req, res){ //settings.html (static)
  fs.readFile('settings.html', function(err, data){
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  })
});

//저장된 데이터 전체삭제
app.post('/deleteallroutesdata', function(req, res){
      connection.query("delete from tmapdata", function(err, rows, fields) {
        if(err){
          throw err;
        } else {
          console.log("all data deleted by Client")
          res.redirect('/')
    }
  })
});

//디폴트 출발, 도착지로 변경
app.post('/xysettingtodefault', function(req, res){
  startX = 14143439.537091;
  startY = 4522549.652549;//디폴트 출발지 : 경희대 서울캠퍼스
  endX = 14146867.260078;
  endY = 4472551.475751;//디폴트 도착지 : 경희대 국제캠퍼스
  console.log('XY chaged to default')
  resetD();
  routeJob();
  res.redirect('/')
});

//출발, 도착지 변경
app.post('/xyset', function(req, res){
  startX = req.body.startX;
  startY = req.body.startY;
  endX = req.body.endX;
  endY = req.body.endY;
  console.log('route start/end Changed!')
  resetD();
  routeJob();
  res.redirect('/');
});

//출발, 도착지 맞바꿈 기능
app.post('/xyexchange', function(req, res){
  var tX = startX;
  var tY = startY;
  startX = endX;
  startY = endY;
  endX = tX;
  endY = tY;
  console.log('route start/end EX-Changed!')
  resetD();
  routejob();
  res.redirect('/');
});

var reqtime = 0; // request 횟수 저장
routeJob(); // 서버 시작시 최초 1회 탐색
var rule = new schedule.RecurrenceRule();
rule.minute = [0, 10, 20, 30, 40, 50]; // 스케쥴 설정 : 10분 간격
var init = schedule.scheduleJob(rule, function(){
  routeJob()
});

//API 요청 - 응답 파싱 - DB 저장
function routeJob(){
  reqtime++;

  //request URL 생성
  var urlStr = "https://apis.skplanetx.com/tmap/routes?version=1&format=json"
  urlStr += "&startX="+startX;
  urlStr += "&startY="+startY;
  urlStr += "&endX="+endX;
  urlStr += "&endY="+endY;
  urlStr += "&appKey=***Tmap API Private key";

  //HTTP 파라이터들 설정
  var headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
  }
  var options = {
      url: urlStr,
      method: 'POST',
      headers: headers
  }

  //API request
  request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) { //응답 성공시
          console.log(reqtime, 'response 200 OK');

          var responseBody = JSON.parse(body); // 파싱

          //파싱한 경로데이터 추출
          var totalDistance = responseBody.features[0].properties.totalDistance; //경로거리
          totalTime = responseBody.features[0].properties.totalTime; //소요시간(초)
          var totalFare = responseBody.features[0].properties.totalFare; //경로요금
          var taxiFare = responseBody.features[0].properties.taxiFare; //택시요금

          //SQL Query문 만들기
          var sqlInsertString = 'insert into a.tmapdata(totalDistance, totalTime, totalFare, taxiFare, startX, startY, endX, endY) values(' + totalDistance + ', ' + totalTime + ',' + totalFare + ',' + taxiFare + ',' + startX + ',' + startY + ',' + endX + ',' + endY + ')';

          //SQL Insert
          connection.query(sqlInsertString, function(err, rows, fields) {
            if (!err)
              console.log(reqtime, 'Route data Inserted to DB');
            else
              console.log('DB Insert Error', err);
          });
      }
      else {
        console.log(reqtime, 'request Failed');
      }
    });
};
