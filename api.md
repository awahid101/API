# KAMAR API docs (unofficial)

> For the high-level, node.js module see [here](README.MD)    

POST to `/api/api.php` with `application/x-www-form-urlencoded`.     

UserAgent: `KAMAR/{{version}} CFNetwork/758.4.3 Darwin/15.5.0`

Note: documentation has been tested with KAMAR Mobile `v1455` and `v21xx`.

# 1. Get `ServerSettings` (optional)


```
Command:	GetSettings
FileName:	ServerSettings
Key:		vtku
```

This should return: 
```xml
<?xml version="1.0" encoding="UTF-8"?>
<SettingsResults apiversion="2.4.2">
    <FileName>ServerSettings</FileName>
    <ErrorCode>0</ErrorCode>
    <SettingsVersion>1.03</SettingsVersion>
    <MiniOSVersion>2.14</MiniOSVersion>
    <MinAndroidVersion>1.08</MinAndroidVersion>
    <StudentsAllowed>1</StudentsAllowed>
    <StaffAllowed>1</StaffAllowed>
    <StudentsSavedPasswords>1</StudentsSavedPasswords>
    <StaffSavedPasswords>0</StaffSavedPasswords>
    <SchoolName>Takapuna Grammar School</SchoolName>
    <LogoPath>https://portal.takapuna.school.nz/school-assets/logo.png</LogoPath>
    <AssessmentTypesShown>AU</AssessmentTypesShown>
    <ShowEnrolledEntries>0</ShowEnrolledEntries>
    <UserAccess>
        <User index="0">
            <Notices>1</Notices>
            <Events>1</Events>
        </User>
        <User index="1">
            <Notices>1</Notices>
            <Events>1</Events>
            <Details>1</Details>
            <Timetable>1</Timetable>
            <Attendance>1</Attendance>
            <NCEA>1</NCEA>
            <Results>1</Results>
            <Groups>0</Groups>
            <Awards>0</Awards>
            <Pastoral>0</Pastoral>
        </User>

        [...]
        
    </UserAccess>
</SettingsResults>
```
In this file there are lots of setting that have been specified by your IT admin, they are explained below:
| Property Name | Usage/Explianation |
| ------------- | ------------------ |
| FileName | This is the name of the file within FileMaker Pro, the database software. This is present in almost all requests. |
| ErrorCode | 0 unless there was an error |
| MiniOSVersion | for the iOS app to check against, and refuse to run if the iOS app is outdated. |
| MinAndroidVersion | *same as above but for the Android app* |
| StudentsAllowed | This tells the app how many students it may save in the portal list. If 0 then the API may not be used by Students |
| StaffAllowed | *same as above but for Staff* |
| StudentsSavedPasswords | Wether or not Student's passwords may be saved in the app. If 0 (No) then the key may still be saved. |
| StaffSavedPasswords | *same as above but for Staff* |
| SchoolName | The name of the school, to display throughout that app. |
| LogoPath | the url of the school's logo, by default it is the KAMAR logo. By default the url is `/school-assets/logo.png` |
| AssessmentTypesShown | This is an array of characters (sperated by nothing) which specify what type of assesments are shown in the results view. (e.g. NCEA, IB, Cambridge, E-ASSTLE etc.) |
| UserAccess | Each child of this element has an `index` attribute, which specifies the logon level. Typicly `0` is unauthenticated, `1` is student, `2` is caregiver, `10` is teacher etc. **This varies between school** With in each `User` element are elements for each section, which specify wether or not the that category of users can view that infomation. |


# 2. Authenticate

```handlebars
Command:    Logon
FileName:   Logon
Key:        vtku
Username:   {{Username}}
Password:   {{Password}}
```

For students this should return: 
```xml
<?xml version="1.0" encoding="UTF-8"?>
<LogonResults apiversion="2.4.2">
    <FileName>Logon</FileName>
    <ErrorCode>0</ErrorCode>
    <Success>YES</Success>
    <LogonLevel>1</LogonLevel>
    <CurrentStudent>{{ID}}</CurrentStudent>
    <Key>xxxxxxxxxxxxxxxxxxxxxxxx</Key>
</LogonResults>
```
`LogonLevel` refers to the type of user which is logged in (see `UserAccess` in the table above).     
The `Key` is the key for that user.     
If logged in as a teacher, there will be additional personal infomation included about that teacher.     

# 3. Get the "globals" (optional)

```handlebars

Command:	GetGlobals
FileName:	Globals
Key:    	{{key returned by step #2}}
```

This should return: 
```xml
<?xml version="1.0" encoding="UTF-8"?>
<GlobalsResults apiversion="2.4.2">
    <FileName>Globals</FileName>
    <ErrorCode>0</ErrorCode>
    <NumberRecords>2</NumberRecords>
    <PeriodDefinitions>
        <PeriodDefinition index="1">
            <PeriodName>Tutor Time</PeriodName>
            <PeriodTime>08:45</PeriodTime>
        </PeriodDefinition>
        <PeriodDefinition index="2">
            <PeriodName>Period 1</PeriodName>
            <PeriodTime>09:00</PeriodTime>
        </PeriodDefinition>

        [...]

    </PeriodDefinitions>
</GlobalsResults>
```
`PeriodDefinitions` defines the names, start times, and duration of each period. This is useful to combine with the Timetable, as the timetable does not give period names.

# 4. Fetch files from the server

## List of Commands that can be issued

Placeholders:      
  `{ID}` = Student ID, e.g. `15999` or `j.doe`    
  `{year}` = current year, e.g. `2016`    

> Note that with a teacher or admin key, data about any student can be fetched, by supplying that student's `ID` and the teacher/admin's `Key`.

> Obviouly, for all commands which require authentication, a suistable key must also be provided in the `Key` parameter.
### `GetCalendar`
```
  FileName = "Calendar_{year}"
  Year = "{year}"
```
The calendar file is useful to combine with the timetable, to see what type of day it it (for example, wether the school is `Open` or if it's a `Holiday`).

### `GetEvents`

```
  DateStart = "1/6/2016"
  DateFinish = "30/6/2016"
  FileName = "Events_1_6_2016_30_6_2016_NO"
  ShowAll = "NO"
```
This is the data for the "events" section in the KAMAR portal. `DateStart` and `DateFinish` specify the range of events to download, and the FileName must coresponde with those values.
The example is abopve is for events in June 2016, between (and including) `2016-06-01` and `2016-06-30`.

### `GetNotices`
```
  Date = "16/6/2016"
  FileName = "Notices_16_6_2016_NO"
  ShowAll = "NO"
```
Notices can only be fetched for one day per request, unlike `Events` above.     
It is unclear as to what the purpose of the `ShowAll` parameter is.

### `GetStudentAbsenceStats`
```
  FileName = "StudentAbsStats_{year}TT_{ID}"
  FileStudentID = "{ID}"
  Grid = "{year}TT"
```
These are the statistics about a students absences, not the actual data.     
See the [#GetStudentAttendance](#GetStudentAttendance) for general info about absences.

### `GetStudentAttendance`
```
  FileName = "StudentAttendance_0_{year}TT_{ID}"
  FileStudentID = "{ID}"
  Grid = "{year}TT"
```
Student atttendance is classified with the "JULOP." system: 
| Code | Meaning |
| ---- | ------- |
| J | Justified Absence |
| U | Unjustified Absence |
| L | Present, but was late to class |
| O | Absent, Overseas |
| P | Present to Class |
| . | Attendance not marked |   

> Note: This data is meaningless to users if displayed as a large table, it should instead be combined with `Timetable` and `Calendar` so that the user can make sense of the infomation.

### `GetStudentDetails`
```
  FileName = "StudentDetails_{ID}_"
  FileStudentID = "{ID}"
  PastoralNotes = ""
```
Personal infomation about students. The trailing underscore in the `FileName` is deliberate.


### `GetStudentNCEASummary`
```
  FileName = "GetStudentNCEASummary_{ID}"
  FileStudentID = "{ID}"
```
A Summary of the student's NCEA results in the past 5 years. Should/could be combined with `GetStudentOfficialResults`.

### `GetStudentOfficialResults`
```
  FileName = "StudentOfficialResults_{ID}"
  FileStudentID = "{ID}"
```
Official NCEA results, double-checked or directly provided by NZQA. 


### `GetStudentResults`
```
  FileName = "GetStudentResults_{ID}"
  FileStudentID = "{ID}"
```
Results for non-NCEA assignments. For juniors, this is the only file which has their results.

### `GetStudentTimetable`
```
  FileName = "StudentTimetable_{year}TT_{ID}"
  FileStudentID = "{ID}"
  Grid = "{year}TT"
```
The student's timetable. 
Needs to be combined with `GetGlobals` to find out the names of the periods, and how many are used. (could be up to 10 periods per day.)    
Can be combined with `GetCalendar` to find out more infomation about a paticular day, such as if the school was even open on a certain.    
To find out the current day, lookup the day in `GetCalendar` and use the week-index.    

> The `Grid` specifies a "Timetable Grid". The main-year grid is by defualt the `year` + `"TT"` (e.g. `2016TT`). Other grids may just be the name sufixed with a `T`, for example class `10WG`'s grid is `10WGT`. To properly understand grids, visit [KAMAR.nz](KAMAR.nz).

### `GetStudentGroups`
```
  FileName = "StudentGroups_{ID}"
  StudentID = "{ID}"
  Tchr = 0
```
This returns the co-curricular actvities which the student is part of.    
As of writing, there is little support in the API for student-led groups.

### `GetStudentPastoral`
```
  FileName	= "StudentPastoral_{ID}"
  A		= 1
  C		= 1
  D		= 1
  G		= 1
  O		= 1
  StudentID	= "{ID}"
  Tchr		= 0
  U		= 1
```
Pastrol Infomation about students. 

### `SearchStudents` (Teacher/admin only)
```
  Criteria = "Mr. search criteria"
```
This command can only be run by teachers, admin staff, or the superadmin.     
It searches the database of students by `FirstName`, `LastName`, `YearLevel`, or `Tutor` and returns an array of students with those four values included. 
To find out more infomation about student(s), use the other methods (such as `GetStudentDetails`), once you have their student ID.

### `GetTeacherTimetable` (Teacher only)

```
  Grid = "{year}TT"
  Tchr = "XY"
```
The `Tchr` parameter is the teacher's code, which is like a student ID.   
Note: there is no `FileName` attribute for this command.

### `GetTeacherAbsLog` (Teacher only)
```
  Grid = "{year}TT"
  Tchr = "XY"
```
The `Tchr` parameter is the teacher's code, which is like a student ID.   

### `GetUserDetails` (Teacher only)
```
  Tchr = "XY"
```
The `Tchr` parameter is the teacher's code, which is like a student ID.   

## Other things

### Notifications
The "Notifications" section in the KAMAR app does not interface directly with the specified portal, instead the portal is converted into a hash, and sent to KAMAR's own API (`api.school.kiwi`).

The KAMAR mobile app polls 
```handlebars
  https://api.school.kiwi/MOBILE/1.0/Notification/all/{{hash/-of_portal_URL}}
```
to see if there are notifcation for the students. For there to be notifications, the school must have paid for, and enabled KAMAR's "school.kiwi" feature.    
If this has been done, then the school can manually or automaticly send notifications to individual or groups of students, via the `api.school.kiwi` service.   
It is unclear as to why the `school.kiwi` server needs to be in the middle between the school's server and the user's device.    

The original version of `school.kiwi` used SMS to send messages to the students personal mobile phone number, which had to be entered into the `GetStudentDetails` file.
To register for those alerts, you need to POST to `https://api.school.kiwi/MOBILE/1.0/Register/apn/` with the hash of the school's portal-url, and the student's phone number (no country code prefix)


# ID Photo

HTTP `GET` Request to `/api/img.php` with `Stuid` & `Key` parameters.   

> Note: for teachers, use the `Code` parameter instead of `Stuid`. The KAMAR app usually sends the `Stuid` paramter as well, but with no value.

## Example
```handlebars
https://{{portal_url}}/api/img.php?Key=s{{Key}}&Stuid={{ID}}
OR
https://{{portal_url}}/api/img.php?Key=s{{Key}}&Code={{TeacherCode}}
```   

# Availability Report
> Last updated on March 19th, 2017    

These files are available via the API. unchecked files can only be viewed on the online portal, not via the API.

 - [x] Notices
 - [x] Calendar
 - [x] Details
 - [x] Timetable
 - [x] Attendance
 - [x] Ncea Summary
 - [ ] Current Year Results
 - [x] All Results
 - [x] Groups
 - [x] Pastoral
 - [x] Awards
 - [ ] Reports
 - [ ] Profile
 - [ ] Library
 - [ ] Course Selection
 - [ ] Pathways
 - [ ] Fees
 - [ ] Fees With Flo2cash
 - [ ] Fees With Dps
 - [ ] Fees With Paypal

# Errors

Errors from the API typically contain the `ErrorCode` and `Error` parameters.
They are explained below: 

 - `0` success.
 - `-2` missing the `key` parameter.
 - `-3` invalid `key` - mostly likely an invalid character in key.
 - `-4` Unknown Command - returned when you try to use `SearchStudents` with a key which may not accses that infomation.
 - `-6` Search returned multiple records when only one expected. 
 - `-22` [internal] database connection error - see https://www.kamar.nz/105645.

# Examples

[Example Responses](Examples)

You can fake the official KAMAR API, and trick the app [like this](https://github.com/TGS-App/API/blob/d439d20b0f1203dc6cda14f250da38b3db048aa3/server.js#L38-L63).