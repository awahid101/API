# KAMAR API (project katal)
[![npm version](https://badge.fury.io/js/katal.svg)](https://badge.fury.io/js/katal)
[![Build Status](https://travis-ci.org/TGS-App/API.svg?branch=master)](https://travis-ci.org/TGS-App/API)
[![Inline docs](http://inch-ci.org/github/tgs-app/api.svg?branch=master)](http://inch-ci.org/github/tgs-app/api)
[![Known Vulnerabilities](https://snyk.io/test/github/tgs-app/api/badge.svg)](https://snyk.io/test/github/tgs-app/api)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg?style=flat)](LICENSE)

[![NPM](https://nodei.co/npm/katal.png)](https://npmjs.org/package/katal)

# Install

```sh
npm i -S katal
```

# Usage

```js
new katal(portal[, format[, UserAgent]]);
```
Where `portal` is the address of the KAMAR portal, `format` is `JSON` or `XML` and UserAgent is the UserAgent.
The default UserAgent is accepted by API version 2.4+ (`Katal/5.4 (Cargo 3.69; Andriod; Linux;) KAMAR/1455 CFNetwork/790.2 Darwin/16.0.0`).

```js
KAMAR.authenticate(credentials, callback);
```
`credentials` is an object containing the `username` and `password` fields.
The callback returns `(err, key)`.
`err` is returned if an error occured, otherwise `err` is `null` and the second parameter is the `key`.

```js
KAMAR.getFile(FileName, formData, callback);
```
`FileName` is the name of the file, formData is an object containing all the other parameters, including `Key`.
The callback returns `(err, key)`. `err` is returned if an error occured, otherwise `err` is `null` and the second parameter is the `response`.

See the [Example Responses](Examples) and the [FileName rules](api.md#4-get-more-stuff)

# Example

```js    
const katal = require('katal');
var KAMAR = new katal({
    url: 'https://student.kamar.nz/api/api.php',
    format: 'JSON',
    UserAgent: 'Katal/5.4 KAMAR/1455 CFNetwork/790.2 Darwin/16.0.0'
});

KAMAR.authenticate({
    username: 'web.student',
    password: 'student'
}, (err, Key) => {
    if (err)
        return console.error(err);
    KAMAR.getFile(`StudentTimetable_2016TT_web.student`, {
        Command: 'GetStudentDetails',
        Key,
        FileStudentID: 'web.student',
        PastoralNotes: ''
    }, (error, result) => console.info(error || JSON.stringify(result, null, 4)));
});
```
See [example.js](example.js) or [try it now on tonicdev.com](https://tonicdev.com/npm/katal)
# Official KAMAR API

Read the [KAMAR API Docs](api.md)