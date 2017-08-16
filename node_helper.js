const NodeHelper = require("node_helper");
const Trakt = require("trakt.tv");

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
        trakt.get_codes().then(function(poll) {
            console.log('Trakt Access Code: ' + poll.user_code);
            self.sendSocketNotification("OAuth", {
                code: poll.user_code
            });
            return trakt.poll_access(poll);
        }).then(function() {
            trakt.calendars.my.shows({
                start_date: '2017-08-15',
                days: days,
                extended: 'full'
            }).then(shows => {
                self.sendSocketNotification("SHOWS", {
                    shows: shows
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
