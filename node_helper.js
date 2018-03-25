const NodeHelper = require("node_helper");
const Trakt = require("trakt.tv");
const moment = require("moment");
const fs = require("fs");
var importtoken;

module.exports = NodeHelper.create({
    start: function() {
        var events = [];
        this.fetchers = [];
        console.log("Starting node helper for: " + this.name);
    },
    createFetcher: function(client_id, client_secret, days) {
        var self = this;
        let options = {
            client_id: client_id,
            client_secret: client_secret,
            redirect_uri: null,
            api_url: null
        };
        const trakt = new Trakt(options);

        function importoldtoken() {
          return new Promise(function (fulfill, reject){
            try {
              importtoken = require('./token.json');
              fulfill();
            } catch (ex) {
              reject(ex);
            }
          });
        }

        importoldtoken().catch(function(){
          return trakt.get_codes().then(function(poll) {
              console.log('Trakt Access Code: ' + poll.user_code);
              self.sendSocketNotification("OAuth", {
                  code: poll.user_code
              });
              return trakt.poll_access(poll);
          }).catch(error => {
            console.log(error.message);
          }).then(function(){
            importtoken = trakt.export_token();
            fs.writeFile("./modules/MMM-trakt/token.json", JSON.stringify(importtoken), "utf8", function (err,data) {
              if (err) {
                return console.log(err);
              }
            });
          });
        }).then(function(){
            trakt.import_token(importtoken).then(newTokens => {
            console.log(importtoken);
            console.log(trakt);
            trakt.calendars.my.shows({
                start_date: moment().format("YYYY-MM-DD"),
                days: days,
                extended: 'full'
            }).then(shows => {
                self.sendSocketNotification("SHOWS", {
                    shows: shows
                });
            });
          });
        });
    },
    socketNotificationReceived: function(notification, payload) {
        if (notification === "PULL") {
            this.createFetcher(payload.client_id, payload.client_secret, payload.days);
        }
    }
});
