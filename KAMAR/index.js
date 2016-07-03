const request = require('request'),
      chalk = require('chalk'),
      jade = require('pug'),
      fs = require('fs'),
      portal = 'https://portal.takapuna.school.nz/api/api.php', //tgs-kamar.local

      UserAgent = 'Katal/5.2 (Cargo 3.69; Andriod; Linux;) RedDog/14 KAMAR/1455 CFNetwork/790.2 Darwin/16.0.0';

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
                    res.redirect(`./?username=${req.body.username}&key=${error ? 'null' : body.toString().split('<Key>')[1].split('</Key>')[0]}`);
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
    index: (req, res) => res.send(jade.compileFile('jade/kamar/index.jade')({ Key: req.query.key, ID: req.query.username, qp: req.url.split('?')[1] || '' })),
    TT: (req, res) => {
        console.time('kamar-timetable');
        try {
            request({
                url: portal,
                method: 'POST',
                form: {
                    Command: 'GetStudentTimetable',
                    FileName: `StudentTimetable_2016TT_${req.query.username}`,
                    Key: req.query.key,
                    FileStudentID: req.query.username,
                    Grid: "2016TT"
                },
                headers: {
                    'User-Agent': UserAgent
                }
            }, (error, response, body) => void res.send(jade.compileFile('jade/kamar/timetable.jade')({
                XML: body,
                ID:  req.query.username,
                qp: req.url.split('?')[1] || '' 
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
                    FileName: `StudentDetails_${req.query.username}_`,
                    Key: req.query.key,
                    FileStudentID: req.query.username,
                    PastoralNotes: ''
                },
                headers: {
                    'User-Agent': UserAgent
                }
            }, (error, response, body) => void res.send(jade.compileFile('jade/kamar/details.jade', {
                pretty: true
            })({
                XML: body,
                ID:  req.query.username,
                Key: req.query.key || '',
                qp: req.url.split('?')[1] || '' 
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
    }
};
