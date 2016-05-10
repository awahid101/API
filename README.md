# API
:school: The API for the TGS Daily Notices and News.   

This server only downloads and saves the daily notices & news,
then periodicly syncs with [tgs.kyle.cf](http://tgs.kyle.cf)

```sh
git clone git://github.com/TGS-App/API.git
cd API
npm install && npm start
```

# Get all the saved notices
```handlebars
http://{{base_url}}/database/all
```   

# Update an entry
```handlebars
http://{{base_url}}/database/update/{{yyyy-mm-dd}}/?value={{new_value}}
```   

# Delete an entry
```handlebars
http://{{base_url}}/database/delete/{{yyyy-mm-dd}}
```   

# Download & update the database
```handlebars
http://{{base_url}}/download
```   
this command is run every day at 7 a.m.

# Sync to [tgs.kyle.cf](http://tgs.kyle.cf)
```handlebars
http://{{base_url}}/sync
```   
this command is run every hour.

<hr />