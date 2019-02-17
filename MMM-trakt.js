/* global Module */

Module.register("MMM-trakt", {
	defaults: {
			updateInterval: 60 * 60 * 1000, //every 60 minutes
			initialLoadDelay: 0,
			days: 1,
			debug: false
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
		if(Object.keys(this.traktData).length === 0){
			var wrapper = document.createElement("div");
			wrapper.innerHTML = "Please enter the following on https://trakt.tv/activate: " + this.traktCode;
		}
		else {
			var wrapper = document.createElement("table");
			var heading = wrapper.insertRow(0);
			heading.insertCell(0).outerHTML = '<th>' + this.translate('TITLE') + '</th>';
			heading.insertCell(1).outerHTML = '<th>' + this.translate('SEASON') + '</th>';
			heading.insertCell(2).outerHTML = '<th>' + this.translate('NUMBER') + '</th>';
			heading.insertCell(3).outerHTML = '<th>' + this.translate('EPTITLE') + '</th>';
			heading.insertCell(4).outerHTML = '<th>' + this.translate('TIME') + '</th>';
			for(var show in this.traktData){
				var tableHeader = wrapper.insertRow(-1);
				var airtime = moment.utc(this.traktData[show].episode.first_aired).local().format("D.M hh:mm");
				tableHeader.insertCell(0).innerHTML = this.traktData[show].show.title;
				tableHeader.insertCell(1).innerHTML = this.traktData[show].episode.season;
				tableHeader.insertCell(2).innerHTML = this.traktData[show].episode.number;
				tableHeader.insertCell(3).innerHTML = this.traktData[show].episode.title;
				tableHeader.insertCell(4).innerHTML = airtime;
			}
		}
		return wrapper;
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
