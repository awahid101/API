const katal = require('katal');
var KAMAR = new katal('https://student.kamar.nz/api/api.php', 'JSON');

KAMAR.authenticate({
    username: 'web.student',
    password: 'student'
}, (err, Key) => {
    if (err)
        return console.error(err);
    console.log(Key);
    KAMAR.getFile(`StudentTimetable_2016TT_web.student`, {
        Command: 'GetStudentDetails',
        Key,
        FileStudentID: 'web.student',
        PastoralNotes: ''
    }, (error, result) => console.info(error || JSON.stringify(result, null, 4)));
});