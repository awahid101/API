const chalk = require('chalk'),
      request = require('request');

module.exports = (callback) => {
    request({
        uri: 'https://docs.google.com/document/preview?hgd=1&id=1lOfZHuQy4ciPoh2ymt3H80aiHBEEicdAx6toJUMfmqg',
        method: 'GET'
    }, (error, response, data) => {
        //.replace(/<\/?[^>]+(>|$)/g,'')
        if (error)
            return callback(error);
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
        
        text = text
                .join('<font color="aqua">###</font>')
                .replace('ASSEMBLIES', '<hr/><h3>ASSEMBLIES</h3>')
                .replace('GENERAL', '<hr/><h3>GENERAL</h3>')
                .replace('LIBRARY', '<hr/><h3>LIBRARY</h3>')
                .replace('PERFORMING ARTS', '<hr/><h3>PERFORMING ARTS</h3>')
                .replace('SPORT', '<hr/><h3>SPORT</h3>')
                .replace('CAREERS NOTICES', '<hr/><h3>CAREERS NOTICES</h3>')
                .replace('STUDENT SERVICES', '<hr/><h3>STUDENT SERVICES</h3>')
                .split(' ');
        for (var i = 0; i < text.length; i++)
            if (text[i].toUpperCase() == text[i]) {
                if (text[i] === '' || text[i] == ' ')
                    text[i] = '';
                else
                    text[i] = `<em>${text[i]}<\/em>`;
            }
        callback(error || text.join(' ')
                .replace(/\n/g, '<br/>')
                .replace(/[^\x00-\x7F]/g, '<font color="red">?</font>')
                .replace(/<em> <\/em>/igm, '')
                .replace(/<em><\/em>/mgi, '')
                .replace(/<\/em> <em>/gim, ' ')
                .replace(/<br\/><hr\/>/g, '<hr\/>')
            );
    });
};
