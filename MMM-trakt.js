/* global Module */

Module.register("MMM-trakt", {
	defaults: {
			updateInterval: 60 * 60 * 1000, //every 60 minutes
			initialLoadDelay: 0,
			days: 1,
			debug: false,
		  styling : {
		  	moduleSize: "small",
				daysUntil: false,
				daysUntilFormat: "hh:mm",
				dateFormat: "D.M hh:mm",
				showEpisodeTitle: true,
				showHeader: false,
				headerText: undefined
			},
	},
	getTranslations() {
		return {
			en: 'translations/en.json',
			de: 'translations/de.json',
			kr: 'translations/kr.json',
			pt: 'translations/pt.json'
		};
	},
	getStyles: function () {
		return ["MMM-trakt.css"];
	},
	getScripts: function() {
		return ["moment.js"];
	},
	start: function() {
		Log.info("Starting module: " + this.name);
		moment.locale(config.language);
		this.traktData = {};
		this.traktCode;
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);
	},
	getDom: function() {
    var wrapper = document.createElement('div')

    // Header
    if (this.config.styling.showHeader) {
      var header = document.createElement('header')
      if (this.config.styling.headerText === undefined) {
        header.innerHTML = this.translate('HEADER')
      } else {
        header.innerHTML = this.config.styling.headerText
      }
      wrapper.appendChild(header)
    }

    if (Object.keys(this.traktData).length === 0 && this.traktCode !== undefined) {
      wrapper.innerHTML = 'Error loading module. Please check the logs.'
    } else if (Object.keys(this.traktData).length === 0) {
      wrapper.innerHTML = 'Please enter the following on https://trakt.tv/activate: ' + this.traktCode
    } else {
      var table = document.createElement('table')
      table.className = this.config.styling.moduleSize + " traktHeader"
      for (var show in this.traktData) {
        var tableRow = table.insertRow(-1)
        tableRow.className = 'normal'

        // Name
        let showTitleCell = tableRow.insertCell()
        showTitleCell.innerHTML = this.traktData[show].show.title
        showTitleCell.className = 'bright traktShowTitle'

        // Episode
        let seasonNo = (this.traktData[show].episode.season).toLocaleString(undefined, { minimumIntegerDigits: 2 })
        let episode = (this.traktData[show].episode.number).toLocaleString(undefined, { minimumIntegerDigits: 2 })
        let episodeCell = tableRow.insertCell()
        episodeCell.innerHTML = 'S' + seasonNo + 'E' + episode
        episodeCell.className = 'traktEpisode';

        // Title
        if (this.config.styling.showEpisodeTitle) {
          let titleCell = tableRow.insertCell()
          titleCell.innerHTML = '\'' + this.traktData[show].episode.title + '\''
          titleCell.className = "traktTitle";
        }
        // Airtime
        var airtime
        if (this.config.styling.daysUntil) {
          airtime = moment.utc(this.traktData[show].episode.first_aired).local().calendar(moment.utc().local(), {
            sameDay: '[' + this.translate('TODAY') + '] ' + this.config.styling.daysUntilFormat,
            nextDay: '[' + this.translate('TOMORROW') + '] ' + this.config.styling.daysUntilFormat,
            nextWeek: this.config.styling.dateFormat,
            sameElse: this.config.styling.dateFormat
          })
        } else {
          airtime = moment.utc(this.traktData[show].episode.first_aired).local().format(this.config.styling.dateFormat)
        }
        let airtimeCell = tableRow.insertCell()
        airtimeCell.innerHTML = airtime
        airtimeCell.className = 'light traktAirtime';
      }
      wrapper.appendChild(table)
    }
    return wrapper
	},
	updateTrakt: function() {
		if (this.config.client_id === "") {
			this.log("ERROR - Trakt: client_id not set");
			return;
		}
		if (this.config.client_secret === "") {
			this.log("ERROR - Trakt: client_secret not set");
			return;
		}
		this.sendSocketNotification("PULL", {
			client_id: this.config.client_id,
			client_secret: this.config.client_secret,
			days: this.config.days,
			debug: this.config.debug
		});
	},
	socketNotificationReceived: function(notification, payload) {
		if (notification === "SHOWS") {
			this.debugLog(payload.shows);
			this.traktData = payload.shows;
			this.updateDom();
		}
		if (notification === "OAuth") {
			this.log(payload.code);
			this.traktCode = payload.code;
			this.updateDom();
		}
	},
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		var self = this;
		setTimeout(function() {
			self.updateTrakt();
		}, nextLoad);
	},

	log: function (msg) {
		if (this.config.debug) {
			Log.log("[" + (new Date(Date.now())).toLocaleTimeString() + "] - " + this.name + " - : ", msg);
		}
	},
	debugLog: function (msg) {
		if (this.config.debug) {
			Log.log("[" + (new Date(Date.now())).toLocaleTimeString() + "] - DEBUG - " + this.name + " - : ", msg);
		}
	}
});
