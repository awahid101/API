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
      fs = require('fs'),

      lan = util.argv(/--?l(an)?/),
      port = lan ? 80 : (process.env.OPENSHIFT_NODEJS_PORT || process.env.port || 3978),
      ip = lan ? (secrets.IP || `192.168.1.${lan}`) : (process.env.OPENSHIFT_NODEJS_IP ||  '127.0.0.1');

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
    
dialog.matches('.*(^!|TGS(-| )*Bot).*', session => session.send("I don't understand that 😕" || "Something went wrong (bug)"));
    
var app = express();

app.use((req, res, next) => next(void (process.env.AZURE && process.stdout.write(`${chalk[req.method == 'GET' ? 'green' : 'yellow'].bold(req.method)}\t${chalk.grey(req.url)}`))));
app.get('/', (req, res) => res.send(jade.compileFile('jade/index.jade', {
    pretty: port == 3978
})({
    news: requireNew('./database').news + `<li><center>More news on <a href="http://instagr.am/takapuna.grapevine">Instagram</a></center></li>`,
    blog: requireNew('./database').blog,
    version: requireNew('./package').version,
    notices: requireNew('./database').notices
})));
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
            name: 'gDrive',
            value: '✔', //if you can see this then it must be up to date...
            color: '#4dbd33'
        }, {
            name: 'IG/FB',
            value: '✔',
            color: '#4dbd33'
        }, {
            name: 'KAMAR',
            value: '🔧',
            color: '#cf25cf'
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
app.get('/scipad/:book', (req, res) => { /*
    
    ╔═══╤═════════╤════════════════════════╤══════════════╗
    ║ 7 ╎ [Level] ╎ [Bio, Phys, Chem, Sci] ╎ [standard]   ║
    ║ 7 ╎ [Level] ╎ [Bio, Phys, Chem]      ╎ [int, ext]   ║
    ║ 7 ╎ 7       ╎ [year level]           ╎ [year level] ║
    ╚═══╧═════════╧════════════════════════╧══════════════╝
    
  */var s = {
        '7709': ["19crgtuug4p5ljo", "Year 9 Science"],
        '7710': ["ip778qpclejktxr", "Year 10 Science"],

        '7103': ["u47l8jnq68p12i3", "Level 1 Biology 1.3"],
        '7104': ["i603ti90rggf6lt", "Level 1 Biology 1.4"],
        '7105': ["tg5tx54lwq182z0", "Level 1 Biology 1.5"],

        '7113': ["ki7e1d6xzk1bf23", "Level 1 Physics 1.3"],
        '7114': ["410ib9ddfy12hcv", "Level 1 Physics 1.4"],
        '7115': ["zy7zii489fbmt49", "Level 1 Physics 1.5"],

        '7123': ["13mkbtukzcwhes3", "Level 1 Chemistry 1.3"],
        '7124': ["9vglqucqst4m1i1", "Level 1 Chemistry 1.4"],
        '7125': ["3nbu0f4rxp8bxh5", "Level 1 Chemistry 1.5"],

        '7131': ["cb8bjg5uhpe5orw", "Level 1 Science 1.1"],
        '7135': ["ddk5folg9koh5af", "Level 1 Science 1.5"],
        '7139': ["a9cuplv35cqy73c", "Level 1 Science 1.9"],

        '7200': null,
        '7201': ["k297ngv68q6o8ai", "Level 2 Biology Externals"],

        '7210': ["shxneny0c58yb8z", "Level 2 Physics Internals"],
        '7211': ["1bxr81hqjwzsqft", "Level 2 Physics Externals"],

        '7220': ["qq75jtokrysikxn", "Level 2 Chemistry Internals"],
        '7221': ["aphhpjpzy0mxtn6", "Level 2 Chemistry Externals"]
    };
    res.redirect((a => {
        try {
            return `https://www.dropbox.com/s/${s[a][0]}/${encodeURIComponent(s[a[1]])}.pdf?dl=1`;
        } catch (err) {
            console.warn(chalk.red(err));
            return '../?scipad=error';
        }
    })(req.params.book.toString()));
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
app.post('/api/messages', bot.verifyBotFramework(), bot.listen());
app.post('/kamar/login', urlencodedParser, KAMAR.login);
app.get('/kamar/timetable', urlencodedParser, KAMAR.TT);
app.get('/database.json', (req, res) => res.send(requireNew('./database')));

app.use(express.static('public'));
app.use((req, res, next) => res.status(404).send('HTTP 404'));

app.listen(port, ip, () => console.log(`Server running on port ${chalk.cyan(port)}`));
