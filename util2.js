const secrets = process.env.AZURE ? {} : require('./secrets'),
      request = require('request'),
      chalk = require('chalk'),
      fs = require('fs');

try {
    require('./database');
} catch (e) {
    console.error(chalk.cyan.bold('[util] '), chalk.red(e));
    fs.writeFile('./database.json', '{}');
}

module.exports = {
    report: (value1, value2, value3) => {
        var qs = { value1, value2, value3 };
        console.log(chalk.cyan.bold('[util] '), chalk.grey(JSON.stringify(qs)));
        request({
              uri: `https://maker.ifttt.com/trigger/${'send'}/with/key/${process.env.IFTTT_KEY || secrets.IFTTT_KEY}`,
              method: 'GET',
              qs
        });
        return value2;
    },
    argv: name => {
          var args = process.argv.slice(2);
          for (var i = 0; i < args.length; i++)
              if (name.test(args[i]))
                  return args[i].split('=')[1] || true;
          return false;
    },
    rainbow: s => {
        const r = 'red yellow green blue magenta'.split(' ');
        s = s.toString().split('');
        for (var i = 0; i < s.length; i++)
            if (s[i] != " ")
                s[i] = chalk.bold[r[i % r.length]](s[i]);
        return s.join(''); 
    }
};
