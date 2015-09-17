'use strict';
var NorrisBot = require('../lib/norrisbot');
var config = require('config3');
var token = process.env.BOT_API_KEY;
var dbPath = process.env.BOT_DB_PATH;
var name = process.env.BOT_NAME;

var norrisbot = new NorrisBot({
  token: config.token,
  dbPath: config.dbPath,
  name: config.name
});

norrisbot.run();
