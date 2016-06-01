const requireNew = require('require-new'),
      download = require('./download'),
      builder = require('botbuilder'),
      secrets = process.env.AZURE ? {} : require('./secrets'),
      express = require('express'),
      chalk = require('chalk'),
      jade = require('pug'),
      fs = require('fs'),
      port = process.env.OPENSHIFT_NODEJS_PORT || process.env.port || 3978,
      ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
      $ = (text, keywords) => {
          for (var i = 0; i < keywords.length; i++)
              if (text.indexOf(keywords[i].toLowerCase()) != -1)
                  return true;
          return false;
      },
      sendReport = (value2, value3) => 
          void request({
              uri: `https://maker.ifttt.com/trigger/${'send'}/with/key/${process.env.IFTTT_KEY || secrets.IFTTT_KEY}`,
              method: 'GET',
              qs: {
                  value1: '@TGS-Bot: ',
                  value2,
                  value3
              }
          }) || value2;

try {
    require('./cookies');
} catch (e) {
    console.error(chalk.red(e));
    fs.writeFile('./cookies.json', '{}');
}

const KAMAR = require('./kamar');

var bot = new builder.BotConnectorBot({ 
    appId: process.env.BOTFRAMEWORK_APPID || secrets.BOTFRAMEWORK_APPID, 
    appSecret: process.env.BOTFRAMEWORK_APPSECRET || secrets.BOTFRAMEWORK_APPSECRET
}), dialog = new builder.CommandDialog();

bot.add('/', dialog);

dialog.matches('(TGS(-| |)Bot|^!)(.+)?h(i|(e|a)llo)', session =>
    session.send("Hi, I'm TGS Bot! (learn)")
);

dialog.matches('(TGS(-| |)Bot|^!)(.+)?(version|\-v|\/v|update)', session =>
    session.send(`Bot version [${requireNew('./package').version}](http://github.com/tgs-app/api) (latest)`)
);

dialog.matches('(TGS(-| |)Bot|^!)(.+)?(daily )?notices?', session =>
    session.send(`notices: ...${(requireNew('./database').notices)
        .replace(/<br\/>/g, '; ')
        .replace(/<(\/|)h3>/g, '**')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .substring(50, 150)}...\nView more on [the website](http://tgs.kyle.cf)`)
);

dialog.matches('(TGS(-| |)Bot|^!)(.+)?(blog|news)', (session) => {
    var news = requireNew('./database').news.preview;
    session.send(news[0]);
    session.send(news[1]);
    session.send(news[2]);
    session.send('View more on [Instagram](http://instagr.am/takapuna.grapevine)');
});

dialog.matches('(TGS(-| |)Bot|^!)(.+)?time(-| )?table', (session) =>
    session.send("You don't have permission (confidential)") //this isn't a feture yet so it just returns 403 error
);

dialog.matches('(TGS(-| |)Bot|^!)(.+)?(who ?am ?i|participants?|members?)', (session) =>
    session.send(`participants (${session.message.totalParticipants}): ${(() => {
        var r = [];
        for (var i = 0; i < session.message.participants.length; i++) 
            r.push(session.message.participants[i].name);
        return r.join(', ');
    })()}`)
);

dialog.matches('(.+)?(TGS(-| |)Bot|^!)(.+)?', (session) => 
    session.send("I don't understand that 😕")
    //session.send("Something went wrong (bug)")
);

var app = express();

app.use((req, res, next) => next(console.log(`${chalk[req.method == 'GET' ? 'green' : 'cyan'](req.method)} ${chalk.grey(req.url)}`)));

app.get('/', (req, res) => res.send(jade.compileFile('jade/index.jade', {
    pretty: port == 3978
})({
    news: requireNew('./database').news.file,
    notices: requireNew('./database').notices,
    version: requireNew('./package').version
})));
app.get('/api/v1/', (req, res) => res.jsonp(req.query.q == 'news' ?
    requireNew('./database').news.file :
    requireNew('./database').notices
));
app.get('/badges?(.svg)?', (req, res) => {
    try {
        var stuff = [{
            name: 'Last Sync',
            value: (date => date.getMinutes() - 3)(new Date()) + 'min',
            color: '#1e90ff'
        }, {
            name: 'Notices',
            value: '✔',
            color: '#4DBD33'
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
app.get('/scipad/:book', (req, res) => {
    //[Bio, Phys, Chem]
    //[int, ext]
    var s = {
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
        '7125': ["9vglqucqst4m1i1", "Level 1 Chemistry 1.5"],
        '7200': null,
        '7201': ["k297ngv68q6o8ai", "Level 2 Biology Externals"],
        '7210': ["shxneny0c58yb8z", "Level 2 Physics Internals"],
        '7211': ["1bxr81hqjwzsqft", "Level 2 Physics Externals"],
        '7220': ["qq75jtokrysikxn", "Level 2 Chemistry Internals"],
        '7221': ["aphhpjpzy0mxtn6", "Level 2 Chemistry Externals"]
    };
    res.redirect(((a) => {
        try {
            return `https://www.dropbox.com/s/${s[a][0]}/${encodeURIComponent(s[a[1]])}.pdf?dl=1`;
        } catch (err) {
            console.warn(chalk.red(err));
            return '../?error#scipad';
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
    download.notices(x => download.news(y => sendReport(x, y)));
    res.send('downloading...');
});
app.post('/api/messages', bot.verifyBotFramework(), bot.listen());
app.get('/kamar/:action', KAMAR);
app.get('/database.json', (req, res) => res.send(requireNew('./database')));
app.use(express.static('public'));
app.get(/.+/, (req, res) => res.send('End of stack'));

app.listen(port, ip, () => console.log(`Server running on port ${chalk.cyan(port)}`));
