const express = require('express'),
	  request = require('request'),
	  fs = require('fs'),
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
                    text[i] = `<strong>${text[i]}<\/strong>`;
            }
            callback(error || text.join(' ')
                .replace(/\n/g, '<br/>')
                .replace(/(\\u0011|\\u0012|\\u0013)/g, '<font color=blue>*</font>')
                .replace(/[^\x00-\x7F]/g, '<font color=red>\'</font>'));
    });
};
app.get('/database/:date', (req, res) => {

    
    fs.readFile('database.json', (err, file) => {
        res.jsonp(JSON.parse(file)[req.params.date] || `We didn\'t saved the notices on ${escape(req.params.date)}.`);
    });
});
app.get('/save_new', (req, res) => {
    fs.readFile('database.json', (err, file) => {
        var json = JSON.parse(file),
            date = new Date().toISOString().split('T');
        
        if (json[date[0]] !== undefined) {
            res.send(`we\'ve already saved something today (${date[0]}).`);
        } else {
            gl((notices) => {
                json[date[0]] = notices;
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