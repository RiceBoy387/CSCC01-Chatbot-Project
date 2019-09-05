const path = require('path');
const server = require('./server.js');
const request = require('request');

module.exports = function(app, cookie) {
  // home page
  app.get('/*', function(req, res, next) {
    res.sendFile(path.join(__dirname + '/../../dist/proj1/index.html'));
  });

  app.get('/signout/', function (req, res, next) {
    req.session.destroy();
    res.setHeader('Set-Cookie', cookie.serialize('user', '', {
      path : '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    return res.json("user signed out");
  });

  app.get('/api/message/', function (req, res, next) {
    var userMessage = req.body.message;
    // Grab info from the database here ...
    request.get({
      headers: {'content-type': 'application/json'},
      url: '25.39.154.107:1021/search',
      form: {message: userMessage} //If crash on receiving use JSON.stringify({message: userMessage})
    }, function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for body.
      let res = "Sent message: " + userMessage + "|" + error + "|"+ response + "|"+ body + "|";
      return res.json();
    });
  });
};
