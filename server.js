process.stdout.write('Loading...\033[0G');

const requireNew = require('require-new'),
      bodyParser = require('body-parser'),
      download = require('./download'),
      builder = require('botbuilder'),
      secrets = process.env.AZURE ? {} : require('./secrets'),
      express = require('express'),
      util   = require('./util2'),
      KAMAR = require('./kamar'),
      chalk = require('chalk'),
      jade = require('pug'),
      fs = require('fs');

var bot = new builder.BotConnectorBot({ 
    appId: process.env.BOTFRAMEWORK_APPID || secrets.BOTFRAMEWORK_APPID, 
    appSecret: process.env.BOTFRAMEWORK_APPSECRET || secrets.BOTFRAMEWORK_APPSECRET
}), dialog = new builder.CommandDialog();

bot.add('/', dialog);

dialog.matches('(^!|TGS(-| )*Bot).*h(i|(e|a)llo)', session => session.send("Hi, I'm TGS Bot! (learn)"));
dialog.matches('(^!|TGS(-| )*Bot).*(version|(\-|\/)v|update)', session => session.send(`Bot version [${requireNew('./package').version}](http://github.com/tgs-app/api) (latest)`));
dialog.matches('(^!|TGS(-| )*Bot).*time(-| )*table', session => session.send("You don't have permission (confidential)")); //this isn't a feture yet so it just returns 403 error
dialog.matches('(^!|TGS(-| )*Bot).*news', session => session.send(requireNew('./database').news.replace(/<\/?[^>]+(>|$)/g, '') +  '\n - View more on [Instagram](http://instagr.am/takapuna.grapevine)'));
dialog.matches('(^!|TGS(-| )*Bot).*(daily )?notices?', session => session.send(`daily notices: ...${requireNew('./database').notices
    .replace(/<br\/>/g, '; ')
    .replace(/<(\/|)h3>/g, '**')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .substring(50, 150)
    .replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '')}...\nView more on [the website](http://tgs.kyle.cf)`));
    
dialog.matches('.*(^!|TGS(-| )*Bot).*', session => session.send("Something went wrong (bug)"));
    
var app = express();

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

var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.post('/api/api.php', urlencodedParser, (req, res) => {
    if (!req.body)
        res.status(400).send(fs.readFileSync('KAMAR/Examples/400.xml'));
    else if (req.body.Command == 'GetSettings') 
        res.send(fs.readFileSync('KAMAR/Examples/ServerSettings.xml'));
    else if (req.body.Command == 'Logon') 
        res.send(fs.readFileSync('KAMAR/Examples/Logon.xml').toString().replace('$$ID$$', req.body.Username));
    else 
        res.send('u wot m8?');  
});

app.get('/badges?(.svg)?', (req, res) => {
    try {
        var stuff = [{
            name: 'Last Sync',
            value: (date => date.getMinutes() - 3)(new Date()) + 'min',
            color: '#1e90ff'
        }, {
            name: 'Spider',
            value: '✔', //if you can see this then it must be up to date...
            color: '#4dbd33'
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
});//\033[0G
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

app.post('/api/messages', bot.verifyBotFramework(), bot.listen());

app.get('/kamar/', urlencodedParser, KAMAR.index);
    app.post('/kamar/login', urlencodedParser, KAMAR.login);
    app.get('/kamar/timetable', urlencodedParser, KAMAR.TT);
    app.get('/kamar/details', urlencodedParser, KAMAR.details);
    app.get('/kamar/details/map.js',  KAMAR.map);

app.get('/database.json', (req, res) => res.send(requireNew('./database')));

app.use(express.static('public'));
app.use((req, res, next) => res.status(404).send('HTTP 404'));

util.host(host => app.listen(host.port, host.ip, () => console.log(`Server running on ${chalk.cyan(host.ip)}:${chalk.cyan.bold(host.port)}`)));
