const chalk = require('chalk'),
      request = require('request'),
      requireNew = require('require-new'),
      fs = require('fs'),
      shorten = (t, r) => {
          var n = t.length > r,
              s = n ? t.substr(0, r - 1) : t; 
          return s = n ? s.substr(0, s.lastIndexOf(" ")) : s, n ? `${s}...` : s; 
      };

module.exports = {
    notices: callback => {
        request({
            uri: 'https://docs.google.com/document/preview?hgd=1&id=1lOfZHuQy4ciPoh2ymt3H80aiHBEEicdAx6toJUMfmqg',
            method: 'GET'
        }, (error, response, data) => {
            if (error)
                return callback('failed to download  notices');
            var raw = [JSON.parse(data.split('DOCS_modelChunk = ')[1].split('];')[0] + ']')],
                j = 1;
            while (j !== false) {
                try {
                    raw.push(JSON.parse(data.split('DOCS_modelChunk = ')[j += 2].split('];')[0] + ']'));
                } catch (e) {
                    console.log(`There are ${chalk.cyan(j)} items so there are ~${chalk.magenta((j + 1) / 2)} pages of notices.`);
                    break;
                }
            }
            var text = [];
            for (var i = 0; i < raw.length; i++)
                text[i] = raw[i][0].s;
            
            var db = requireNew('./database');
            db.notices = text.join()
                .replace('ASSEMBLIES',       '<hr/><h3>ASSEMBLIES</h3>')
                .replace('GENERAL',          '<hr/><h3>GENERAL</h3>')
                .replace('LIBRARY',          '<hr/><h3>LIBRARY</h3>')
                .replace('PERFORMING ARTS',  '<hr/><h3>PERFORMING ARTS</h3>')
                .replace('SPORT',            '<hr/><h3>SPORT</h3>')
                .replace('CAREERS NOTICES',  '<hr/><h3>CAREERS NOTICES</h3>')
                .replace('STUDENT SERVICES', '<hr/><h3>STUDENT SERVICES</h3>')
                .replace(/\n/g,              '<br/>')
                .replace(/[^\x00-\x7F]/g,    '<font color="red">?</font>')
                .replace(/<br\/><hr\/>/g,    '<hr\/>');
            fs.writeFile(`./database.json`, JSON.stringify(db, null, '\t'), err => callback(err ? 'failed to save notices' : 'saved notices'));
        });
    },
    news: callback => {
        try {
            request({
                uri: 'https://www.instagram.com/takapuna.grapevine/media/',
                method: 'GET'
            }, (error, response, data) => {
                if (error)
                    return callback('failed to download news.');
                var r = '';
                data = JSON.parse(data);
                for (var i = 0; i < 5; i++) 
                    r += `<li class="padding-hor-16" style="min-height:6rem;">
                            <img class="left circle margin-right" src="${data.items[i].images.thumbnail.url}" style="width:60px" />
                            ${shorten(data.items[i].caption.text.replace(/\n/g, '<br />'), 200)} 
                            <a href="${data.items[i].link}"> Read more</a>.
                          </li>`;
                
                var db = requireNew('./database');
                db.news = r;
                fs.writeFile('./database.json', JSON.stringify(db, null, 4).replace(/\n +/g, ''), err => callback(err ? 'failed to save news' : 'saved news'));
            });
        } catch (err) {
            console.log(err);
        }
    },
    blog: callback => {
        try { /*.split('\r\n\r\n\r\n\r\n\r\n \r\n \r\n\r\n\t\t\r\n\t\t\r\n\t\r\n\t\r\n\t\t\r\n\t\t\r\n\t\t\r\n\r\n')[0]*/
            request({
                uri: 'http://takapuna.school.nz/news/latest-news/',
                method: 'GET',
                strictSSL: false
            }, (error, response, data) => {
                if (error)
                    return void console.log(error) || callback('failed to download blog.');
                var r = data.split('<div class="article">');
                r.shift();
                for (var i = 0; i < r.length; i++) 
                    r[i] = r[i].replace(/<\/h1>/g, '!@#').replace(/<h1>/g, '$%^').replace(/<\/?[^>|^a]+(>|$)/mgi, '');
                r.length = 6;
                
                var db = requireNew('./database');
                db.blog = r.join('</li><li>').replace(/\!\@\#/g, '</strong> - ').replace(/\$\%\^/g, '<strong>');
                fs.writeFile('./database.json', JSON.stringify(db, null, 4).replace(/\n +/g, ''), err => callback(err ? 'failed to save blog' : 'saved blog'));
            });
        } catch (err) {
            console.log(err);
        }
    }
};