const express = require('express'),
      request = require('request'),
      fs = require('fs'),
      SHA256 = require('./sha256'),
      chalk = require('chalk'),
      port = process.env.PORT || 3698;

var app = express();

try {
    fs.readFile('database.json', (err, up) => {
        if (err && err.errno == -4058)
            fs.writeFile('database.json', JSON.stringify({"1970-01-01": 0}, null, '\t'));
        });
} catch (e) {
    fs.writeFile('database.json', JSON.stringify({"1970-01-01": 0}, null, '\t'));
}

var gl = (callback) => {
    request({
        uri: 'https://docs.google.com/document/preview?hgd=1&id=1lOfZHuQy4ciPoh2ymt3H80aiHBEEicdAx6toJUMfmqg',
        method: 'GET'
    }, function (error, response, data) {
        //.replace(/<\/?[^>]+(>|$)/g,'')
        if (error)
            return callback(error);
        var raw = [JSON.parse(data.split('DOCS_modelChunk = ')[1].split('];')[0] + ']')],
            j = 1;
        while (j !== false) {
            try {
                raw.push(JSON.parse(data.split('DOCS_modelChunk = ')[j += 2].split('];')[0] + ']'));
            } catch (e) {
                //console.log(`There are ${j} items so there are ~${0.5 * (j + 1)} pages of notices.`);
                break;
            }
        }
        var text = [];
        for (var i = 0; i < raw.length; i++)
            text[i] = raw[i][0].s;
        
        text = text.join('###').split(' ');
        
        for (var i = 0; i < text.length; i++)
            if (text[i].toUpperCase() == text[i]) {
                if (text[i] === '' || text[i] == ' ')
                    text[i] = '';
                else
                    text[i] = `<em>${text[i]}<\/em>`;
            }
        callback(error || text.join(' ')
                .replace(/\n/g, '<br/>')
                .replace(/[^\x00-\x7F]/g, '<font color="red">\'</font>')
                .replace(/<em> <\/em>/igm, '')
                .replace(/<em><\/em>/mgi, '')
                .replace(/<\/em> <em>/gim, ' ')
                
                .replace('ASSEMBLIES', '<hr/><h3>ASSEMBLIES</h3>')
                .replace('GENERAL', '<hr/><h3>GENERAL</h3>')
                .replace('LIBRARY', '<hr/><h3>LIBRARY</h3>')
                .replace('PERFORMING ARTS', '<hr/><h3>PERFORMING ARTS</h3>')
                .replace('SPORT', '<hr/><h3>SPORT</h3>')
                .replace('CAREERS NOTICES ', '<hr/><h3>CAREERS NOTICES </h3>')
                .replace('STUDENT SERVICES', '<hr/><h3>STUDENT SERVICES</h3>')
                .replace(/<br\/><hr\/>/g, '<hr\/>')
            );
    });
};
app.get('/database/:date', (req, res) => {
    fs.readFile('database.json', (err, file) => {
    	if (req.params.date.toString() == '2002-06-06')
    	    return res.jsonp(JSON.parse(file));
        res.jsonp(JSON.parse(file)[req.params.date] || `We didn\'t saved the notices on ${escape(req.params.date)}.`);
    });
});
app.get('/database/:command/:date', (req, res) => {
    if (SHA256(req.query.auth ? req.query.auth.toString() : '') != '2a281435878ec2c138c76d42f4035f330e13bb67cc383734683c85ffea114ecc')
        return res.send('Invalid token');
    fs.readFile('database.json', (err, file) => {
        if (err)
            return res.send(err);
        var db = JSON.parse(file);
        if (req.params.command == 'delete')
            delete db[req.params.date];
        else if (req.params.command == 'update')
            db[req.params.date] = req.query.value || '';
        else
            return res.send('Invalid command');
        fs.writeFile('database.json', JSON.stringify(db, null, '\t'), (err) => {
            res.send(err || `${req.params.command}d archive for ${req.params.date}.`);
        });
    });
});
app.get('/save_new', (req, res) => {
    fs.readFile('database.json', (err, file) => {
        var json = JSON.parse(file),
            date = new Date();
        date.setHours(date.getHours() + 12);
        date = date.toISOString().split('T')[0];
        if (json[date] !== undefined) {
            res.send(`we\'ve already saved something today (${date}).`);
        } else {
            gl((notices) => {
                json[date] = notices;
                fs.writeFile('database.json', JSON.stringify(json, null, '\t'), (err) => {
                    res.send(err || 'Saved!');
                });
            });
        }
    });
});
app.listen(port, () => {
    console.log(`Server running on port ${chalk.cyan(port)}`);
});
