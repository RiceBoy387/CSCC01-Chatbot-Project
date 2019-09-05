const server = require('./server.js');
const user = require("../model/users.js");
const exec = require('child_process').exec;
const path = require('path');
const axios = require('axios');
const request = require('request');
const fs = require('fs');

module.exports = function(app, cookie) {
  let path = require('path');
  app.post('/signup/', server.checkUsername, function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    user.findOne({"username": username}, function(err, usr){
      console.log(err);
      if (err) return res.status(500).json({"error": err});
      if (usr) return res.status(409).end("username " + username + " already exists");
      let salt = server.generateSalt();
      let hash = server.generateHash(password, salt);
      const new_user = new user();
      new_user.username = username;
      new_user.salt = salt;
      new_user.hash = hash;
      new_user.isAdmin = false;
      new_user.save((err) => {
        if (err) return res.status(500).json({"error": err});
        return res.json("user " + username + " signed up");
      });
    });
  });

  app.post('/signin/', server.checkUsername, function (req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    // retrieve user from the database
    user.findOne({"username": username}, function(err, usr){
      if (err) return res.status(500).json({"error": err});
      if (!usr) return res.status(401).end("access denied");
      if (usr.hash !== server.generateHash(password, usr.salt)) return res.status(401).end("access denied"); // invalid password
      // start a session
      req.session.user = usr._id;
      req.session.isAdmin = usr.isAdmin;
      res.setHeader('Set-Cookie', cookie.serialize('user', usr._id, {
        path : '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
      }));
      return res.json(usr);
    });
  });

  app.post('/api/crawl/', function (req, res, next) {
    let url = req.body.url;
    let depth = req.body.depth;

    let cdToPath = 'cd ./crawler/src';
    let cmd = './scrapy crawl url --nolog -a url=' + url + ' -s DEPTH_LIMIT=' + (depth - 1);


    let fullCmd = cdToPath + ' && ' + cmd;
    console.log("crawling: " + fullCmd);
    exec(fullCmd, function (error, stdout, stderr) {
      if (stdout != "") {
        console.log(stdout);
        return res.json(JSON.parse(stdout));
      } else {
        console.log(stderr);
        return res.json(JSON.parse(stderr));
      }
    });
  });

  /* https://stackoverflow.com/questions/28834835/readfile-in-base64-nodejs */
  // function to create file from base64 encoded string
  function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var bitmap = Buffer.from(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, bitmap);
    console.log('File created from base64 encoded string: ' + file);
  }

  app.post('/api/updateCorpus/', function (req, res, next) {
    let fileName = req.body.name;
    let base64str = req.body.contents;
    base64_decode(base64str, '/mnt/d/samples/DFI/dfi.txt');

    // Tell indexer to update
    let options = {
      url: 'http://cscc01.duckdns.org:1021/update',
      method: 'POST'
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        return res.json(response);
      } else {
        console.log(error);
        return res.json(error);
      }
    }
    request(options, callback);
  });

  app.post('/api/startWatson/', function (req, res, next) {
    let message = req.body.text;
    let sessionUrl = 'https://apikey:v0j6_1LYBjIDKrve9SkqUo8n-zPQTZ7o07UjjHAU05JA@gateway-wdc.watsonplatform.net/assistant/api/v2/assistants/515ee7ed-346e-48d5-933b-9eda1e9e4c1a/sessions?version=2019-02-28'
    axios.post(sessionUrl, {input: message})
    .then(response => {
      console.log('~~~~~~~~~~~~~~~~~~~~RESPONSE startWatson~~~~~~~~~~~~~~~~~');
      console.log(response.data);
      return res.json(response.data);
    })
    .catch(error => {
      console.log('~~~~~~~~~~~~~~~~~~~~ERROR startWatson~~~~~~~~~~~~~~~~~');
      console.log(error.message);
      return res.json(error.message);
    });
  });

  app.post('/api/messageWatson/', function (req, res, next) {
    let message = req.body.text;
    let sessionId = req.body.sessionId;

    var headers = {
      'Content-Type': 'application/json'
    };
    var dataString = '{"input": {"text": "' + message + '"}}';
    var options = {
      url: 'https://gateway-wdc.watsonplatform.net/assistant/api/v2/assistants/515ee7ed-346e-48d5-933b-9eda1e9e4c1a/sessions/' + sessionId +'/message?version=2019-02-28',
      method: 'POST',
      headers: headers,
      body: dataString,
      auth: {
        'user': 'apikey',
        'pass': 'v0j6_1LYBjIDKrve9SkqUo8n-zPQTZ7o07UjjHAU05JA'
      }
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        return res.json(response);
      } else {
        console.log(error);
        return res.json(error);
      }
    }

    request(options, callback);
  });

  app.post('/api/messageCorpus/', function (req, res, next) {
    let message = encodeURIComponent(req.body.text.trim());

    let url = 'http://cscc01.duckdns.org:1021/search';
    let dataString = 'query=' + message + '&field=DFI&numRes=5';
    let requestUrl = url + '?' + dataString;
    console.log('Message Corpus: ' + requestUrl);


    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        return res.json(response);
      } else {
        console.log(error);
        return res.json(error);
      }
    }

    request(requestUrl, callback);
  });

  app.post('/api/messageIndexer/', function (req, res, next) {
    let message = encodeURIComponent(req.body.text.trim());

    let url = 'http://cscc01.duckdns.org:1021/search';
    let dataString = 'query=' + message + '&field=0&numRes=5';
    let requestUrl = url + '?' + dataString;
    console.log('Message Indexer: ' + requestUrl);

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        return res.json(response);
      } else {
        console.log(error);
        return res.json(error);
      }
    }

    request(requestUrl, callback);
  });
};
