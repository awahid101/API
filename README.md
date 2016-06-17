# TGS App & Skype Bot
[![Inline docs](http://inch-ci.org/github/tgs-app/api.svg?branch=master)](http://inch-ci.org/github/tgs-app/api)
[![Build Status](https://travis-ci.org/TGS-App/API.svg?branch=master)](https://travis-ci.org/TGS-App/API)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg?style=flat)](LICENSE)
[![Last Sync](http://kyle2.azurewebsites.net/badge.svg?i=0)](http://tgs.kyle.cf)
[![gDrive](http://kyle2.azurewebsites.net/badge.svg?i=1)](http://tgs.kyle.cf)
[![IG/FB](http://kyle2.azurewebsites.net/badge.svg?i=2)](http://tgs.kyle.cf)
[![KAMAR](http://kyle2.azurewebsites.net/badge.svg?i=3)](http://tgs.kyle.cf)

:school: Web-App & Skype Bot for TGS Daily Notices, news, blog and timetable.   

Hosted on [Azure](http://kyle2.azurewebsites.net) and [OpenShift](http://tgs.kyle.cf)

```sh
git clone git://github.com/TGS-App/API.git
cd API
npm install && npm start
```

# Read the database
```handlebars
http://{{base_url}}/api/v1/?q={{item}}
```   

where `{{item}}` is either `notices`, `news` or `blog`.

# KAMAR API

Read the [KAMAR API Docs](KAMAR)

# Intranet

Use the `-l|--lan[=*]` flag to run on the local intranet instead of localhost
```powershell
> node server.js
  [info] Server running on 127.0.0.1:3978

> node server.js -l
  [info] Server running on 192.168.1.76:80

> node server.js --lan=192.168.1.80
  [info] Server running on 192.168.1.80:80

> node server.js --lan="tgs-app.local"
  [info] Server running on tgs-app.local:80
```