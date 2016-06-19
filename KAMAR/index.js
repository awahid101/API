const request = require('request'),
      chalk = require('chalk'),
      jade = require('pug'),
      fs = require('fs'),
      portal = 'https://portal.takapuna.school.nz/api/api.php'; //tgs-kamar.local
console.log('//speedtest TimeEnd');
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
    index: (req, res) => res.send(jade.compileFile('jade/kamar/index.jade')({ ID: req.query.username, qp: req.url.split('?')[1] || '' })),
    TT: (req, res) => {
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
                }
            }, (error, response, body) => res.send(jade.compileFile('jade/kamar/timetable.jade')({
                XML: body,
                ID:  req.query.username,
                qp: req.url.split('?')[1] || '' 
            })));
        } catch (err) {
            console.warn(chak.yellow(err));
            res.status(400).send('Error 400');
        }
    },
    details: (req, res) => {
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
                }
            }, (error, response, body) => res.send(jade.compileFile('jade/kamar/details.jade', {
                pretty: true
            })({
                XML: body,
                ID:  req.query.username,
                Key: req.query.key || '',
                qp: req.url.split('?')[1] || '' 
            })));
        } catch (err) {
            console.warn(chak.yellow(err));
            res.status(400).send('Error 400');
        }
    }
};
