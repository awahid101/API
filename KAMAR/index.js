const request = require('request'),
      chalk = require('chalk'),
      jade = require('pug'),
      fs = require('fs'),
      portal = 'https://portal.takapuna.school.nz/api/api.php', //tgs-kamar.local

      UserAgent = 'Katal/5.3 (Cargo 3.69; Andriod; Linux;) RedDog/14 KAMAR/1455 CFNetwork/790.2 Darwin/16.0.0';

module.exports = {
    login: (req, res) => {
        console.time('kamar-login');
        try {
            request({
                url: portal,
                method: 'POST',
                form: {
                    Command: 'Logon',
                    FileName: 'Logon',
                    Key: 'vtku',
                    Username: req.body.username,
                    Password: req.body.password
                },
                headers: {
                    'User-Agent': UserAgent
                }
            }, (error, response, body) => {
                try {
                    res.cookie('username', req.body.username);
                    res.cookie('key', error ? 'null' : body.toString().split('<Key>')[1].split('</Key>')[0]);
                    res.redirect(req.body.return_to || '../kamar/');
                    console.timeEnd('kamar-login');
                } catch (err) {  
                    console.error(chalk.red(err));
                    res.send(body);
                    console.timeEnd('kamar-login');
                }
                
            });
        } catch (err) {
            console.warn(chak.yellow(err));
            res.status(418).send('Error 418 during login');
        }
    },
    index: (req, res) => res.send(jade.compileFile(`jade/kamar/${req.query.login && req.query.login.toString() == 'required' ? 'login' : 'index'}.jade`)({
        Key: req.cookies.key,
        ID: req.cookies.username,
        return_to: req.query.return_to || ''
    })),
    TT: (req, res) => {
        console.time('kamar-timetable');
        try {
            request({
                url: portal,
                method: 'POST',
                form: {
                    Command: 'GetStudentTimetable',
                    FileName: `StudentTimetable_2016TT_${req.cookies.username}`,
                    Key: req.cookies.key,
                    FileStudentID: req.cookies.username,
                    Grid: "2016TT"
                },
                headers: {
                    'User-Agent': UserAgent
                }
            }, (error, response, body) => void res.send(jade.compileFile('jade/kamar/timetable.jade')({
                XML: body,
                ID:  req.cookies.username
            })) || console.timeEnd('kamar-timetable'));
        } catch (err) {
            console.warn(chak.yellow(err));
            res.status(400).send('Error 400');
            console.timeEnd('kamar-timetable');
        }
    },
    details: (req, res) => {
        console.time('kamar-details');
        try {
            request({
                url: portal,
                method: 'POST',
                form: {
                    Command: 'GetStudentDetails',
                    FileName: `StudentDetails_${req.cookies.username}_`,
                    Key: req.cookies.key,
                    FileStudentID: req.cookies.username,
                    PastoralNotes: ''
                },
                headers: {
                    'User-Agent': UserAgent
                }
            }, (error, response, body) => void res.send(jade.compileFile('jade/kamar/details.jade', {
                pretty: true
            })({
                XML: body,
                ID:  req.cookies.username,
                Key: req.cookies.key || ''
            })) || console.timeEnd('kamar-details'));
        } catch (err) {
            console.warn(chak.yellow(err));
            res.status(400).send('Error 400');
            console.timeEnd('kamar-details');
        }
    },
    map: (req, res) => {
        console.time('kamar-details-map');
        try {
            request({
                url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(req.query.q)}&region=nz`,
                method: 'GET',
                headers: {
                    'User-Agent': UserAgent
                }
            }, (error, response, body) => void res.jsonp(JSON.parse(body).results[0].geometry.location) || console.timeEnd('kamar-details-map'));
        } catch (err) {
            console.warn(chak.yellow(err));
            res.status(400).send('Error 400');
            console.timeEnd('kamar-details-map');
        }
    },
    calendar: (req, res) => {
        const makeReadable = require('./subjects');
        if (req.body.submit.toString() != 'Save to Calendar') return res.status(401).send('Did not submit<script>history.back();</script>');
        res.contentType('text/calendar');
        const event = (lesson, DD, day, start, end) => `\nBEGIN:VEVENT\nSUMMARY:${makeReadable(lesson.split(',')[0])}\nX-ALT-DESC;FMTTYPE=text/html:
DESCRIPTION:Teacher: ${lesson.split(',')[1]}\\nGenerated by TGS App - http://tgs-app.github.io \nCLASS:PUBLIC\nLOCATION:${lesson.split(',')[2]}\nDTSTART;TZID=New Zealand Standard Time:201602${day}T${start}00
DTEND;TZID=New Zealand Standard Time:201602${day}T${end}00\nRRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=${DD};WKST=SU\nDTSTAMP:201602${day}T${start}00\nEND:VEVENT`;
        
        res.send(`BEGIN:VCALENDAR\nPRODID:${'-//KyleH/TGSApp//DST v5.2.4//EN'}\nVERSION:2.0\nBEGIN:VTIMEZONE\nTZID:New Zealand Standard Time\nBEGIN:STANDARD
DTSTART:20000101T030000\nTZOFFSETFROM:+1300\nTZOFFSETTO:+1200\nRRULE:FREQ=YEARLY;INTERVAL=1;BYDAY=1SU;BYMONTH=4\nEND:STANDARD\nBEGIN:DAYLIGHT
DTSTART:20000101T020000\nTZOFFSETFROM:+1200\nTZOFFSETTO:+1300\nRRULE:FREQ=YEARLY;INTERVAL=1;BYDAY=-1SU;BYMONTH=9\nEND:DAYLIGHT\nEND:VTIMEZONE\n`

//+event(req.body['0;1|1'], 'MO', '08', '0840', '0900')//Day 1, Form Class
+event(req.body['0;1|2'], 'MO', '08', '0900',  1000 )//Day 1, Period 1
+event(req.body['0;1|3'], 'MO', '08',  1000 ,  1100 )//Day 1, Period 2
+event(req.body['0;1|5'], 'MO', '08',  1125 ,  1225 )//Day 1, Period 3
+event(req.body['0;1|6'], 'MO', '08',  1225 ,  1325 )//Day 1, Period 4
+event(req.body['0;1|7'], 'MO', '08',  1405 ,  1505 )//Day 1, Period 5

//+event(req.body['0;2|1'], 'TU', '09', '0840', '0900')//Day 2, Form Class
+event(req.body['0;2|2'], 'TU', '09', '0900',  1000 )//Day 2, Period 1
+event(req.body['0;2|3'], 'TU', '09',  1000 ,  1100 )//Day 2, Period 2
+event(req.body['0;2|5'], 'TU', '09',  1125 ,  1225 )//Day 2, Period 3
+event(req.body['0;2|6'], 'TU', '09',  1225 ,  1325 )//Day 2, Period 4
+event(req.body['0;2|7'], 'TU', '09',  1405 ,  1505 )//Day 2, Period 5

+event(req.body['0;3|3'], 'WE',  10 , '0930',  1030 )//Day 3, Period 2
+event(req.body['0;3|4'], 'WE',  10 ,  1030 ,  1100 )//Day 3, House Assembly
+event(req.body['0;3|5'], 'WE',  10 ,  1125 ,  1225 )//Day 3, Period 3
+event(req.body['0;3|6'], 'WE',  10 ,  1225 ,  1325 )//Day 3, Period 4
+event(req.body['0;3|7'], 'WE',  10 ,  1405 ,  1505 )//Day 3, Period 5

//+event(req.body['0;4|1'], 'TH',  11 , '0840', '0900')//Day 4, Form Class
+event(req.body['0;4|2'], 'TH',  11 , '0900',  1000 )//Day 4, Period 1
+event(req.body['0;4|3'], 'TH',  11 ,  1000 ,  1100 )//Day 4, Period 2
+event(req.body['0;4|5'], 'TH',  11 ,  1125 ,  1225 )//Day 4, Period 3
+event(req.body['0;4|6'], 'TH',  11 ,  1225 ,  1325 )//Day 4, Period 4
+event(req.body['0;4|7'], 'TH',  11 ,  1405 ,  1505 )//Day 4, Period 5

//+event(req.body['0;5|1'], 'FR',  12 , '0840', '0900')//Day 5, Form Class
+event(req.body['0;5|2'], 'FR',  12 , '0900',  1000 )//Day 5, Period 1
+event(req.body['0;5|3'], 'FR',  12 ,  1000 ,  1100 )//Day 5, Period 2
+event(req.body['0;5|5'], 'FR',  12 ,  1125 ,  1225 )//Day 5, Period 3
+event(req.body['0;5|6'], 'FR',  12 ,  1225 ,  1325 )//Day 5, Period 4
+event(req.body['0;5|7'], 'FR',  12 ,  1405 ,  1505 )//Day 5, Period 5

//+event(req.body['1;1|1'], 'MO',  15 , '0840', '0900')//Day 6, Form Class
+event(req.body['1;1|2'], 'MO',  15 , '0900',  1000 )//Day 6, Period 1
+event(req.body['1;1|3'], 'MO',  15 ,  1000 ,  1100 )//Day 6, Period 2
+event(req.body['1;1|5'], 'MO',  15 ,  1125 ,  1225 )//Day 6, Period 3
+event(req.body['1;1|6'], 'MO',  15 ,  1225 ,  1325 )//Day 6, Period 4
+event(req.body['1;1|7'], 'MO',  15 ,  1405 ,  1505 )//Day 6, Period 5

//+event(req.body['1;2|1'], 'TU',  16 , '0840', '0900')//Day 7, Form Class
+event(req.body['1;2|2'], 'TU',  16 , '0900',  1000 )//Day 7, Period 1
+event(req.body['1;2|3'], 'TU',  16 ,  1000 ,  1100 )//Day 7, Period 2
+event(req.body['1;2|5'], 'TU',  16 ,  1125 ,  1225 )//Day 7, Period 3
+event(req.body['1;2|6'], 'TU',  16 ,  1225 ,  1325 )//Day 7, Period 4
+event(req.body['1;2|7'], 'TU',  16 ,  1405 ,  1505 )//Day 7, Period 5

+event(req.body['1;3|3'], 'WE',  17 , '0930',  1030 )//Day 8, Period 2
+event(req.body['1;3|4'], 'WE',  17 ,  1030 ,  1100 )//Day 8, House As
+event(req.body['1;3|5'], 'WE',  17 ,  1125 ,  1225 )//Day 8, Period 3
+event(req.body['1;3|6'], 'WE',  17 ,  1225 ,  1325 )//Day 8, Period 4
+event(req.body['1;3|7'], 'WE',  17 ,  1405 ,  1505 )//Day 8, Period 5

//+event(req.body['1;4|1'], 'TH',  18 , '0840', '0900')//Day 9, Form Class
+event(req.body['1;4|2'], 'TH',  18 , '0900',  1000 )//Day 9, Period 1
+event(req.body['1;4|3'], 'TH',  18 ,  1000 ,  1100 )//Day 9, Period 2
+event(req.body['1;4|5'], 'TH',  18 ,  1125 ,  1225 )//Day 9, Period 3
+event(req.body['1;4|6'], 'TH',  18 ,  1225 ,  1325 )//Day 9, Period 4
+event(req.body['1;4|7'], 'TH',  18 ,  1405 ,  1505 )//Day 9, Period 5

//+event(req.body['1;5|1'], 'FR',  19 , '0840', '0900')//Day 10, Form Class
+event(req.body['1;5|2'], 'FR',  19 , '0900',  1000 )//Day 10, Period 1
+event(req.body['1;5|3'], 'FR',  19 ,  1000 ,  1100 )//Day 10, Period 2
+event(req.body['1;5|5'], 'FR',  19 ,  1125 ,  1225 )//Day 10, Period 3
+event(req.body['1;5|6'], 'FR',  19 ,  1225 ,  1325 )//Day 10, Period 4
+event(req.body['1;5|7'], 'FR',  19 ,  1405 ,  1505 )//Day 10, Period 5
        );
    },
    AbsStats: (req, res) => {
        console.time('kamar-AbsStats');
        try {
            request({
                url: portal,
                method: 'POST',
                form: {
                    Command: 'GetStudentAbsenceStats',
                    FileName: `StudentAbsStats_2016TT_${req.cookies.username}`,
                    Key: req.cookies.key,
                    FileStudentID: req.cookies.username,
                    Grid: '2016TT'
                },
                headers: {
                    'User-Agent': UserAgent
                }
            }, (error, response, body) => void res.send(jade.compileFile('jade/kamar/AbsStats.jade', {
                pretty: true
            })({
                XML: body,
                ID:  req.cookies.username,
                Key: req.cookies.key || ''
            })) || console.timeEnd('kamar-AbsStats'));
        } catch (err) {
            console.warn(chak.yellow(err));
            res.status(400).send('Error 400');
            console.timeEnd('kamar-AbsStats');
        }
    },
    Attendance: (req, res) => {
        console.time('kamar-Attendance');
        try {
            request({
                url: portal,
                method: 'POST',
                form: {
                    Command: 'GetStudentAttendance',
                    FileName: `StudentAttendance_0_2016TT_${req.cookies.username}`,
                    Key: req.cookies.key,
                    FileStudentID: req.cookies.username,
                    Grid: '2016TT'
                },
                headers: {
                    'User-Agent': UserAgent
                }
            }, (error, response, body) => void res.send(jade.compileFile('jade/kamar/Attendance.jade', {
                pretty: true
            })({
                XML: body,
                ID:  req.cookies.username,
                Key: req.cookies.key || ''
            })) || console.timeEnd('kamar-Attendance'));
        } catch (err) {
            console.warn(chak.yellow(err));
            res.status(400).send('Error 400');
            console.timeEnd('kamar-Attendance');
        }
    }
};
