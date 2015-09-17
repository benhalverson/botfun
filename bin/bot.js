'use strict';
var NorrisBot = require('../lib/norrisbot');
var config = require('config3');
var token = config.token || process.env.BOT_API_KEY;
var dbPath = config.dbPath || process.env.BOT_DB_PATH;
var name = config.name || process.env.BOT_NAME;

var norrisbot = new NorrisBot({
  token: token,
  dbPath: dbPath,
  name: name
});

norrisbot.run();
