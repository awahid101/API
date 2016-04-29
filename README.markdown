# API
:school: The API for the TGS notices

```sh
git clone git://github.com/TGS-App/API.git
cd API
npm install && npm start
```

# Get a specified date's notices
```handlebars
http://{{base_url}}/database/{{yyyy-mm-dd}}/?callback={{function_name}}
```   
Example: `http://klmn.azurewebsites.net/database/2016-04-29?callback=notices_function`
