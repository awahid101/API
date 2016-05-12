const FileCookieStore = require('tough-cookie-filestore'),
      request = require('request'),
      chalk = require('chalk'),
      portal = 'https://portal.takapuna.school.nz/student/index.php';

var j = request.jar(new FileCookieStore('cookies.json'));

module.exports = (req, res) => {
    if (req.params.action == 'login') {
        request({
            url: `${portal}/process-login`,
            method: 'POST',
            jar: j,
            form: {
                username: req.query.username,
                password: decodeURIComponent(req.query.password)
            }
        }, () => {
            res.send(j.getCookies(`${portal}/process-login`));
        });
    } else {
        request({
            url: `${portal}/timetable`,
            method: 'POST',
            jar: j
        }, (error, response, body) => {
            if (error) 
                return res.send(error);
            var ___ = body;
            try {
                ___ = ___.split('<table id="timetable_table">')[1].split('</table>')[0]
                .replace(/<\/?[^>]+(>|$)/g, '')
                .replace(/\t\t\t\t\t\n\t\t\t\t\t\t/g, '=')
                .replace(/\n/g, '')
                .replace(/\t\t\t\t\t\t\t\t\t\t\t/g, '')
                .replace(/\t\t\t\t\t\t\t\t\t/g, '%')
                .replace(/\t\t\t\t\t\t\t\t/g, '|')
                .replace(/\t\t\t\t\t\t\t/g, '+')
                .replace(/\t\t\t\t\t/g, '^')
                .replace(/\t\t\t\t/g, '$')
                .replace(/\t\=\|/g, '+')
                .replace(/\t\t/g, '@')
                .replace(/\%/g, '\n')
                .replace(/\$\|\@/g, '\n\n')
                .replace(/\|\|/g, '\n\n')
                .replace(/\t\n\n/g, '::')
                .replace(/\@\=/g, '\n\n\n')
                .split('Tutor Time=8:45 am')[1]
                .replace(/Period 1=9:00 am/, '')
                .replace(/Period 2=10:00 am/, '')
                .replace(/Period 3=11:25 am/, '')
                .replace(/Period 4=12:25 pm/, '')
                .replace(/Period 5=2:10 pm/, '')
                .replace(/HM=&nbsp;/, '')
                .replace(/\=/g, '')
                .split(/\^\t/);
                for (var i = 0; i < ___.length; i++) {
                    ___[i] = ___[i].split(/\n\n\n(\n|\$\=)/);
                    for (var j = 0; j < ___[i].length; j++){
                        if (___[i][j].trim() === '')
                            ___[i][j] = null;
                        if (___[i][j] == '\n' || ___[i][j] == '$=')
                            ___[i][j] = '';
                        if (___[i][j] !== null)
                            ___[i][j] = ___[i][j].split(/\n/)[0].split('+');
                    }
                }
                res.jsonp({//[  Form  ] [Period 1] [Period 2] [Hous/Mnk] [Period 3] [Period 4] [Period 5]
                    "Mon": [___[1][0], ___[2][0], ___[3][0],    [/**/], ___[5][0], ___[6][0], ___[7][0]],
                    "Tue": [___[1][2], ___[2][2], ___[3][2],    [/**/], ___[5][2], ___[6][2], ___[7][2]],
                    "Wed": [   [/**/],    [/**/], ___[3][2], ___[4][2], ___[5][4], ___[6][4], ___[7][4]],
                    "Thu": [___[1][4], ___[2][4], ___[3][6],    [/**/], ___[5][6], ___[6][6], ___[7][6]],
                    "Fri": [___[1][6], ___[2][6], ___[3][8],    [/**/], ___[5][8], ___[6][8], ___[7][8]], 
                });
            } catch (Exception) {
                console.error(chalk.red(Exception));
                return res.send('invalid login Or timeout');
            }
        });
    }
};
