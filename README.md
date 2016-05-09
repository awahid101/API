# API
:school: The API for the TGS daily notices and news.   
This server only downloads and saves the daily notices/news, then periodicly syncs with [tgs.kyle.cf](http://tgs.kyle.cf)

```sh
git clone git://github.com/TGS-App/API.git
cd API
npm install && npm start
```

# Get a specified date's notices
```handlebars
http://{{base_url}}/database/{{yyyy-mm-dd}}/
```   
Example: `http://klmn.azurewebsites.net/database/2016-04-29?callback=notices_function`

# Update an entry
```handlebars
http://{{base_url}}/database/update/{{yyyy-mm-dd}}/?auth={{token}}&value={{new_value}}
```   
# Delete an entry
```handlebars
http://{{base_url}}/database/delete/{{yyyy-mm-dd}}/?auth={{token}}
```   
# Get all the saved dates
```handlebars
http://{{base_url}}/database[.js[on]]
```   
<hr />
All the routes have `JSONP` support, just add a `callback` parameter with the function name.
Example:
```html
<script src="{{base_url}}/database.js?callback=bacon"></script>
<script>
    function bacon(APIResponse) {
        for (var notice in APIResponse)
            console.log(notice);
    }
</script>
```
