const sms = false,

      requireNew = require('require-new'),
      downloader = require('./download'),
      express = require('express'),
      request = require('request'),
      SHA256 = require('./sha256'),
      chalk = require('chalk'),
      fs = require('fs'),
      
      port = process.env.PORT || 3699,
      shorten = (t, r) => {
          var n = t.length > r,
              s = n ? t.substr(0, r - 1) : t;
          return s = n ? s.substr(0, s.lastIndexOf(" ")) : s,
                     n ? `${s}...` : s;
      },
      trueTime = UTCoffset => {
        var d = new Date(),
            utc = d.getTime() + (d.getTimezoneOffset() * 60000),
            n = new Date(utc + (3600000 * UTCoffset)),
            f = n.toLocaleString().toString().split(', '),
            e = f[0].split('/');
            if (Number(e[0]) < 10)
                e[0] = 0 + e[0];
            if (Number(e[1]) < 10)
                e[1] = 0 + e[1];
        return [`${e[1]}-${e[0]}-${e[2]}`, f[1]]; //DST - https://msdn.microsoft.com/en-us/library/jj863688(v=vs.85).aspx?
      },
      sendReport = (value2, value3) => 
          request({
              uri: `https://maker.ifttt.com/trigger/${sms ? 'sms' : 'send'}/with/key/beLHmIjsKLpsfLFe0_-Ig-`,
              method: 'GET',
              qs: {
                  value1: 'TGSBot: ',
                  value2,
                  value3
              }
          });
      
require('./test');
const KAMAR = require('./kamar'); //must be after test

var app = express();

app.get('/', (req, res) => res.send('The local time in Auckland is ' + trueTime(+12).join('. ')));
app.get('/database/all', (req, res) => {
    var file = requireNew('./database');
    res.send(file);
});
app.get('/database/:command/:date', (req, res) => {
    if (SHA256(req.query.auth ? req.query.auth.toString() : '') != '2a281435878ec2c138c76d42f4035f330e13bb67cc383734683c85ffea114ecc')
        return res.send('Invalid token');
    var db = requireNew('./database');
    if (req.params.command == 'delete')
        delete db[req.params.date];
    else if (req.params.command == 'update')
        db[req.params.date] = req.query.value || '';
    else
        return res.send('Invalid command');
    fs.writeFile(`./database.json`, JSON.stringify(db, null, '\t'), (err) => {
        res.send(err || `${req.params.command}d archive for ${req.params.date}.`);
    });
});
app.get('/kamar/:action', KAMAR);
app.get('/sync', (req, res) => {
    request({
        uri: `http://${req.query.dev ? `${req.query.dev}.ngrok.io` : 'tgs.kyle.cf'}/sync`,
        method: 'PUT',
        json: {
            notices: JSON.stringify(requireNew('./database')),
            news: JSON.stringify(requireNew('./news'))
        }
    }, (error, response, data) => {
        try {
            var report = `sync ${req.query.src == 'ifttt' ? '(IFTTT) ' : ''} ${error ? 'failed' : 'done'}`;
            if (report != 'sync (IFTTT) done')
                sendReport(report);
            
            if (req.query.r && req.query.r.toString() == 'y')
                return res.redirect('http://tgs.kyle.cf');
            res.send(data);
        } catch (err) {
            sendReport(`sync error: ${err}`);
        }
    });
});
app.get('/download', (req, res) => {
    function news(callback) {
        request({
            uri: 'https://www.instagram.com/takapuna.grapevine/media/',
            method: 'GET'
        }, (err, resp, data) => {
            if (err)
                return callback('failed to download news.');
            var r = '';
            data = JSON.parse(data);
            for (var i = 0; i < 3; i++) r += `
                <li class="padding-hor-16" style="min-height:6rem;">
                    <img class="left circle margin-right" src="${data.items[i].images.thumbnail.url}" style="width:60px" />
                    ${shorten(data.items[i].caption.text.replace(/\n/g, '<br />'), 200)} 
                    <a href="${data.items[i].link}"> Read more</a>.
                </li>`;
            fs.writeFile('./news.json', JSON.stringify({
                file: r + `<li>
                              <center>
                                More news on <a href="https://instagram.com/takapuna.grapevine/">Instagram</a>
                              </center>
                            </li>`}, null, 4), (err) => {
                callback(err ? 'failed to save news' : 'saved news');
            });
        });
    }
    function notices(callback) {
        var json = requireNew('./database'),
            date = trueTime(+12)[0];
        if (json[date] !== undefined) 
            return callback(`already saved notices today (${date})`);
        else {
            downloader((notices) => {
                json[date] = notices;
                fs.writeFile(`./database.json`, JSON.stringify(json, null, '\t'), (err) => {
                    callback(err ? 'failed to save notices' : 'saved notices');
                });
            });
        }
    }
    news(stdout1 => {
        notices(stdout2 => {
            res.send(void sendReport(`${stdout1}, `, stdout2) || 'done');
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${chalk.cyan(port)}`);
});