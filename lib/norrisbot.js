'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');

var NorrisBot = function Constructor(settings) {
  this.settings = settings;
  this.settings.name = this.settings.name || 'NorrisBot';
  this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'norrisbot.db');

  this.user = null;
  this.db = null;
};
util.inherits(NorrisBot, Bot);

NorrisBot.prototype.run = function() {
  NorrisBot.super_.call(this, this.settings);

  this.on('start', this._onStart);
  this.on('message', this._onMessage);
};

NorrisBot.prototype._onStart = function() {
  this._loadBotUser();
  this._connectDb();
  this._firstRunCheck();
};

NorrisBot.prototype._loadBotUser = function(){
  var self = this;
  this.user = this.users.filter(function(user){
    return user.name === self.name;
  })[0];
};

NorrisBot.prototype._connectDb = function(){
  if(!fs.existsSync(this.dbPath)) {
    console.error('Database path ' + this.dbPath + '" does not exist or it\s not readable."');
    process.exit(1);
  }
  this.db = new SQLite.Database(this.dbPath);
  console.log('connected');
};
NorrisBot.prototype._firstRunCheck = function() {
  var self = this;
  self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function(err, record){
    if(err) {
      return console.error('DATABASE Error: ', err);
    }
    var currentTime = (new Date()).toJSON();

    if(!record) {
      self._welcomeMessage();
      return self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
      }
      self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
      console.log('Welcome message function');
  });

};

NorrisBot.prototype._welcomeMessage = function(){
  this.postMessageToChannel(this.channels[0].name, 'Hi Team, roundhouse-kickanyone?' +
  '\n I can tell jokes, but very honest ones. Jusay say `Chuck Norris` or `' + this.name + '` to invoke me', {as_user: true});
  console.log('posting welcome message to channel');
}

NorrisBot.prototype._onMessage = function(message) {
  if(this._isChatMessage(message) &&
     this._isChannelConversation(message) &&
     !this._isFromNorrisBot(message) &&
     this._isMentioningChuckNorris(message)
   ) {
     this._replyWithRandomJoke(message);
     console.log('tell me a joke');
   }
};

NorrisBot.prototype._isChatMessage = function(message) {
  return message.type === 'message' && Boolean(message.text);
};

NorrisBot.prototype._isChannelConversation = function(message) {
  return typeof message.channel === 'string' && message.channel[0] === 'C';
};

NorrisBot.prototype._isFromNorrisBot = function(message) {
  return message.user === this.user.id;
};

NorrisBot.prototype._isMentioningChuckNorris = function (message) {
  return message.text.toLowerCase().indexOf('chuck norris') > -1 ||
         message.text.toLowerCase().indexOf(this.name) > -1;
         console.log('mentioning norrisbot');
};

NorrisBot.prototype._replyWithRandomJoke = function(originalMessage) {
  var self = this;
  self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function (err, record){
    if(err) {
      return console.error('DATABASE ERROR', err);
    }
    var channel = self._getChannelByID(originalMessage.channel);
    self.postMessageToChannel(channel.name, record.joke, {as_user: true});
    self.db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);
  });
};

NorrisBot.prototype._getChannelByID = function(channelId) {
  return this.channels.filter(function (item) {
    return item.id === channelId;
  })[0];
};

module.exports = NorrisBot;
