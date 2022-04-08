# Dialer App 

Go to the app directory `cd app`

Install Dependencies `npm install`

Start the local server `npm start`

# Extension
Go to the app directory `cd extension`

Install Dependencies `npm install`

Start the local server `npm start`

## Load extension in Chrome

Goto `chrome://extensions/` click `Load unpacked` and choose the `dist` folder created by `npm start` or `npm build`


## Local Tunnel

Extension loads the app as iframe in the webpages so localhost frame can be loaded in an http page only.

To test in project in https use [localtunnel](https://localtunnel.github.io/www/) or [ngrok](https://ngrok.com/) and configure the https url in config.js in extension source.