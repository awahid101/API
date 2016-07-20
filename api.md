# KAMAR API docs (unofficial)

:school_satchel: POST to `/api/api.php` with `application/x-www-form-urlencoded`.     

UserAgent: `KAMAR/1455 CFNetwork/758.4.3 Darwin/15.5.0`

To convert responses to JSON, see [this](https://github.com/TGS-App/API/blob/42bd30754cbaed9d0863d36025fb3c21ce370697/jade/timetable.jade#L41-L77) function.
# 1. Get `ServerSettings` (optional)


```
Command:	GetSettings
FileName:	ServerSettings
Key:	    vtku
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
# 2. Authenticate

```handlebars
Command:    Logon
FileName:   Logon
Key:        vtku
Username:   {{Username}}
Password:   {{Password}}
```

This should return: 
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

# 3. Get the globals (optional)

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
    <NumberRecords>1</NumberRecords>
    <PeriodDefinitions>
        <PeriodDefinition index="1">
            <PeriodName>Tutor Time</PeriodName>
            <PeriodTime>08:45</PeriodTime>
        </PeriodDefinition>

        [...]

    </PeriodDefinitions>
</GlobalsResults>
```

# 4. Get more stuff

```handlebars

Command:	Get{{thing}}
FileName:	{{thing}}
Key:    	{{key returned by step #2}}

[...]
```

Commands (`{ID}`: `15999`, `{year}`: `2016`):
```toml
[GetCalendar]
  FileName = "Calendar_{year}"
  Year = "{year}"

[GetEvents]
  DateFinish = "30/6/2016"
  DateStart = "1/6/2016"
  FileName = "Events_1_6_2016_30_6_2016_NO"
  ShowAll = "NO"

[GetNotices]
  Date = "16/6/2016"
  FileName = "Notices_16_6_2016_NO"
  ShowAll = "NO"

[GetStudentAbsenceStats]
  FileName = "StudentAbsStats_{year}TT_{ID}"
  FileStudentID = "{ID}"
  Grid = "{year}TT"

[GetStudentAttendance]
  FileName = "StudentAttendance_0_{year}TT_{ID}"
  FileStudentID = "{ID}"
  Grid = "{year}TT"

[GetStudentDetails]
  FileName = "StudentDetails_{ID}_"
  FileStudentID = "{ID}"
  PastoralNotes = ""

[GetStudentNCEASummary]
  FileName = "GetStudentNCEASummary_{ID}"
  FileStudentID = "{ID}"

[GetStudentOfficialResults]
  FileName = "StudentOfficialResults_{ID}"
  FileStudentID = "{ID}"

[GetStudentResults]
  FileName = "GetStudentResults_{ID}"
  FileStudentID = "{ID}"

[GetStudentTimetable]
  FileName = "StudentTimetable_{year}TT_{ID}"
  FileStudentID = "{ID}"
  Grid = "{year}TT"

[GetStudentGroups]
  FileName = "StudentGroups_{ID}"
  StudentID = "{ID}"
  Tchr = 0

[GetStudentPastoral]
  FileName = "StudentPastoral_{ID}"
  A = 1
  C	= 1
  D	= 1
  G = 1
  O = 1
  StudentID = "{ID}"
  Tchr = 0
  U = 1
```

# ID Photo

HTTP `GET` Request to `/api/img.php` with `Stuid` & `Key`   

Example:
```handlebars
http://{{base_url}}/api/img.php?Key=s{{Key}}&Stuid={{ID}}
```   

# Availability Report
> Last updated on July 20, 2016    

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
> WARNING: [...] Fees with PayPal is still in development

# Examples

[Examples Folder](Examples)

You can fake the KAMAR mobile app [like this](https://github.com/TGS-App/API/blob/d439d20b0f1203dc6cda14f250da38b3db048aa3/server.js#L38-L63).