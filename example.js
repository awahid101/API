const katal = require('katal');
var KAMAR = new katal({ portal: 'student.kamar.nz' });


KAMAR
  .authenticate({ username: 'web.student', password: 'student' })
  .then(key => KAMAR
    .getAbsences({ username: 'web.student', key })
    .then(absences => console.log(absences))
    .catch(err => console.error(err)))
  .catch(err => console.error(err));