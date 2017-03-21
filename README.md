# KAMAR API (project katal)
[![npm version](https://badge.fury.io/js/katal.svg)](https://badge.fury.io/js/katal)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg?style=flat)](LICENSE)

[![NPM](https://nodei.co/npm/katal.png)](https://npmjs.org/package/katal)

> :school: :school_satchel: :books: Unofficial node.js module for interfacing with the undocumented [KAMAR](http://kamar.nz) API (project katal).

# Install

```sh
npm i -S katal
```

# Usage

```js
const katal = require('katal');
const options = {
  portal: 'student.kamar.nz'
};
var KAMAR = new katal(options);
```
The `options` object can contain the folowing properties: 
 - `portal` - the url of the KAMAR portal - do not include `http(s)://` or `/api/api.php`
 - `year` - the year to lookup all queries with.
 - `TT` - the [Timetable Grid](https://www.kamar.nz/103835) to lookup Timetable and Absences by. Leave blank unless you understand how grids work. By default it is the `year + "TT"`.
 - `UserAgent` - specify a custom UserAgent for requests to the KAMAR portal here, if required.

## Authenticating
```js
KAMAR
    .authenticate(credentials); //credentials is an object containing `username` and `password`.
    .then(key => doSomethingWithKey(key))
    .catch(error => throw new Error(error));
```   



## Fetching Files
```js
KAMAR.getXXXXX(credentials);  //credentials is the object returned KAMAR.authenticate (containing `username`, `key` & `authLevel`).
```

### Methods
 - `authenticate` -  see [above](#Authenticating)
 - `getAbsences` - Note that Absence-Statistics are in a seperate file.
 - `getAbsencesStatistics` - Note that Absence by period are in a seperate file.
 - `getTimeTable` - Get this- & next week's Timetable.
 - `getDetails` - Get Personal Details about student.
 - `getResults` - Note that OfficialResults & NCEASummary are both in seperate files.
 - `getNCEASummary` - Note that OfficialResults & Results are both in seperate files.
 - -----
 - `searchStudents` - Note that you need to be authenticated with a user who has permission to do this.
 - -----
 - `sendCommand` - send a command to KAMAR - Note that more convenient methods exist for common files.
 - ~getFile~ - deprecated by KAMAR (April 2017). Use `sendCommand` instead.
 - -----
 - `makevCardFromDetails` - convert Details to vCard (VCF) format.
 - `makeASCIItableWithAbsences` - convert Absences to ASCII table (TXT) format.

See the [Example Responses](Examples) and the [FileName rules](api.md#4-get-more-stuff) (for the `getFile` query)

# Example

```js    
const katal = require('katal');
var KAMAR = new katal({ portal: 'student.kamar.nz' });


KAMAR
  .authenticate({ username: 'web.student', password: 'student' })
  .then(key => KAMAR
    .getAbsences({ username: 'web.student', key })
    .then(absences => console.log(absences))
    .catch(err => console.error(err)))
  .catch(err => console.error(err));
```
See [example.js](example.js) or [try it in your browser on runkit.com](https://runkit.com/npm/katal)

# low-level KAMAR API

The low-level, XML-based API has been (unofficially) documented in the following file: [KAMAR API Docs](api.md)