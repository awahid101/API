const request = require('request'),
      chalk = require('chalk');

const {parseString} = require('xml2js');

const UA = 'Katal/5.4 (Cargo 3.69; Andriod; Linux;) KAMAR/1455 CFNetwork/790.2 Darwin/16.0.0';

class KAMAR {
    constructor(portal, format, UserAgent) {
        if (!portal)
            throw new Error('No portal address supplied');
        else if (typeof portal == 'object') {
            this.portal = portal.url;
            this.useXML = portal.format == 'XML';
            this.UserAgent = portal.UserAgent || UA;
        } else {
            this.portal = portal;
            this.useXML = format == 'XML';
            this.UserAgent = UserAgent || UA;
        }
    }

    authenticate(userObj, callback) {
        request({
            url: this.portal,
            method: 'POST',
            form: {
                Command: 'Logon',
                FileName: 'Logon',
                Key: 'vtku',
                Username: userObj.username,
                Password: userObj.password
            },
            headers: {
                'User-Agent': this.UserAgent
            }
        }, (error, response, body) => {
            try {
                if (error)
                    return callback(error);
                    parseString(body, (err, result) => {
                        if (err)
                            throw err;
                        if (result.LogonResults.Success && result.LogonResults.Success[0] == 'YES')
                            return callback(null, result.LogonResults.Key[0]);

                        callback(result.LogonResults.Error[0]);
                    });
                
            } catch (err) {
                console.warn(chalk.cyan.bold('[kamar]'), chalk.red.bold(err));
                callback(err);
            }
        });
    }
    getFile(FileName, form, callback) {
        try {
            form.FileName = FileName;
            request({
                url: this.portal,
                method: 'POST',
                form,
                headers: {
                    'User-Agent': this.UserAgent
                }
            }, (error, response, body) => {
                if (error)
                    return callback(error);
                if (this.useXML)
                    return callback(null, body);
                parseString(body, (err, result) => callback(null, result));
            });
        } catch (err) {
            console.warn(chalk.cyan.bold('[kamar]'), chalk.red.bold(err));
            callback(err);
        }
    }
}
module.exports = KAMAR;