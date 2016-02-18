# TGS Notices & News API
This reposity contains the API for the notices and news.

# Using the CDN
You can use the API from out CDN if you dont want to install it to your own server.
Make a request to `https://kyle1.azurewebsites.net/tgs/api/v1/:command/:format`, replacing `:command` with either `notices` or `news` and replacing `:format` with `JSON`, `XML` or `JSONP`. The JSONP option will add the result to a `TGS[:command]` object.

# Installing the API to your own server
```sh
git clone git://github.com/TGS-App/API.git
npm install
node server.js
````
