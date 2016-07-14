process.stdout.write('Loading...\033[0G');

const cookieParser = require('cookie-parser'),
      requireNew = require('require-new'),
      bodyParser = require('body-parser'),
      download = require('./download'),
      express = require('express'),
      util = require('./util2'),
      KAMAR = require('./kamar'),
      chalk = require('chalk'),
      jade = require('pug'),
      fs = require('fs');

process.on('uncaughtException', err => console.error(chalk.red.bold(util.report('TGS App: Fatal:', err.toString()))));

var app = express(),
    urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(cookieParser());

app.use((req, res, next) => next(void (!process.env.AZURE && console.log(`${chalk[req.method == 'GET' ? 'green' : 'yellow'].bold(req.method)}\t${chalk.grey(req.url)}`))));
app.get('/', (req, res) => void console.time('index') || void res.send(jade.compileFile('jade/index.jade', {
    pretty: !process.env.isAzure
})({
    news: requireNew('./database').news + `<li><center>More news on <a href="http://instagr.am/takapuna.grapevine">Instagram</a></center></li>`,
    blog: requireNew('./database').blog,
    version: requireNew('./package').version,
    notices: requireNew('./database').notices
})) || console.timeEnd('index'));
app.get('/api/v1/', (req, res) => {
    try {
        res.jsonp(requireNew('./database')[req.query.q.toString()]);
    } catch (err) {
        console.log(chalk.yellow.bold(`API Error: Request for "${req.query.q}" failed.`));
        res.send('Invalid API Query');
    }
});
//Begin: Fake KAMAR API
app.get('/school-assets/logo.png', (req, res) => void res.contentType('image/png') || res.send(fs.readFileSync('public/img/rhino.png')));
app.get('/api/img.php', (req, res) => void res.contentType('image/pjpeg') || res.send(fs.readFileSync('public/img/img.jpg')));
app.post('/api/api.php', urlencodedParser, (req, res) => {
    if (!req.body)
        res.status(400).send(fs.readFileSync('KAMAR/Examples/400.xml'));
    else
        switch (req.body.Command) {
            case 'GetCalendar':               res.send(fs.readFileSync('KAMAR/Examples/calendar.xml'                                 )); break;
            case 'GetEvents':                 res.send(fs.readFileSync('KAMAR/Examples/events.xml'                                    )); break;
            case 'GetNotices':                res.send(fs.readFileSync('KAMAR/Examples/notices.xml'                                    )); break;
            case 'GetStudentAbsenceStats':    res.send(fs.readFileSync('KAMAR/Examples/AbsStats.xml'                                    )); break;
            case 'GetStudentAttendance':      res.send(fs.readFileSync('KAMAR/Examples/Attendance.xml'                                   )); break;
            case 'GetStudentDetails':         res.send(fs.readFileSync('KAMAR/Examples/Details.xml'                                       )); break;
            case 'GetStudentNCEASummary':     res.send(fs.readFileSync('KAMAR/Examples/nceaSum.xml'                                        )); break;
            case 'GetStudentOfficialResults': res.send(fs.readFileSync('KAMAR/Examples/OfficialResults.xml'                                 )); break;
            case 'GetStudentResults':         res.send(fs.readFileSync('KAMAR/Examples/results.xml'                                          )); break;
            case 'GetStudentTimetable':       res.send(fs.readFileSync('KAMAR/Examples/Timetable.xml'                                         )); break;
            case 'GetGlobals':                res.send(fs.readFileSync('KAMAR/Examples/Globals.xml'                                            )); break;
            case 'GetSettings':               res.send(fs.readFileSync('KAMAR/Examples/ServerSettings.xml'                                      )); break;
            case 'Logon':                     res.send(fs.readFileSync('KAMAR/Examples/Logon.xml').toString().replace('15999', req.body.Username )); break;

            default: res.send('u wot m8?');
        }
});
//End: Fake KAMAR API
app.get('/badges?(.svg)?', (req, res) => {
    try {
        var stuff = [{
            name: 'Last Sync',
            value: (date => date.getMinutes() - 3)(new Date()) + 'min',
            color: '#1e90ff'
        }, {
            name: 'KAMAR',
            value: 'stable', //if you get a 200 here then it must be OK...
            color: '#FFA824'
        }];
        res.contentType('image/svg+xml');
        res.send(jade.compileFile('jade/badges.jade')(stuff[Number(req.query.i.toString()) || 0]));
    } catch (err) {
        res.send(jade.compileFile('jade/badges.jade')({
            name: 'Error',
            value: '404',
            color: '#1E4F5E'
        }));
    }
});
app.get('/download', (req, res) => {
    try {
        requireNew('./database');
    } catch (e) {
        console.warn(chalk.red(e));
        fs.writeFile('./database.json', "{}", err => console.log(err || 'created database'));
    }
    download.notices(x => download.news(y => download.blog(z => util.report(x, y, z))));
    res.send('downloading...');
});
app.get('/news/:item', (req, res) => res.redirect(`http://takapuna.school.nz/news/${req.params.item}`));
app.get('/manifest.appcache', (req, res) => {
    const dd = (new Date()).toISOString().split('T');
    res.contentType('text/cache-manifest');
    res.send(fs.readFileSync('jade/manifest.appcache').toString().replace('[date]', dd[0]).replace('[minor]', process.env.isAzure ? 0 : dd[1].split(':')[1]));
});
app.get('/kamar/', KAMAR.index);
app.post('/kamar/login', urlencodedParser, KAMAR.login);
app.get('/kamar/timetable', KAMAR.TT);
app.post('/kamar/timetable/download.ics', urlencodedParser, KAMAR.calendar);
app.get('/kamar/details', KAMAR.details);
app.get('/kamar/details/map.js', KAMAR.map);
app.get('/kamar/absences', KAMAR.AbsStats);
app.get('/kamar/absences/detail', KAMAR.Attendance);
app.get('/database.json', (req, res) => res.jsonp(requireNew('./database')));
app.use(express.static('public'));
app.use((req, res, next) => res.status(404).send('HTTP 404'));

util.host(host => app.listen(host.port, host.ip, () => console.log(`Server running on ${chalk.cyan(host.ip)}:${chalk.cyan.bold(host.port)}`)));
