const request = require('request'),
      chalk = require('chalk');

const {parseString} = require('xml2js');

class KAMAR {
    constructor(portal, format, UserAgent) {
        if (!portal)
            throw new Error('You must include a portal address');
        this.portal = portal;
        this.JSON = format == 'JSON';
        this.UserAgent = UserAgent || 'Katal/5.4 (Cargo 3.69; Andriod; Linux;) KAMAR/1455 CFNetwork/790.2 Darwin/16.0.0';
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
                if (this.JSON)
                    parseString(body, (err, result) => {
                        console.dir(result);
                    });
                    callback(null, body);
            });
        } catch (err) {
            console.warn(chalk.cyan.bold('[kamar]'), chalk.red.bold(err));
            callback(err);
        }
    }
}
module.exports = KAMAR;