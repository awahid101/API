const request = require('request'),
      chalk = require('chalk'),
      jade = require('pug'),
      fs = require('fs'),
      portal = 'https://portal.takapuna.school.nz/api/api.php'; //tgs-kamar.local

module.exports = {
    login: (req, res) => {
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
                    res.redirect(`./timetable?username=${req.body.username}&key=${error ? 'null' : body.toString().split('<Key>')[1].split('</Key>')[0]}`);
                } catch (err) {
                    console.error(chalk.red(err));
                    return res.send(body);
                }
                
            });
        } catch (err) {
            console.warn(chak.yellow(err));
            res.status(418).send('Error 418 during login');
        }
    },
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
            }, (error, response, body) => res.send(jade.compileFile('jade/timetable.jade')({
                XML: body,
                ID:  req.query.username
            })));
        } catch (err) {
            console.warn(chak.yellow(err));
            res.status(400).send('Error 400');
        }
    }
};
