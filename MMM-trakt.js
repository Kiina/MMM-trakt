/* global Module */

Module.register("MMM-trakt", {
	defaults: {
			updateInterval: 60 * 60 * 1000, //every 60 minutes
			initialLoadDelay: 0,
			days: 1,
			debug: false,
		    moduleSize: "small"
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
		var wrapper = document.createElement("div");
		var header = document.createElement("header");
		header.innerHTML =  this.translate("HEADER");
		// header.style = "margin-bottom: 5px;text-align: center;";
		wrapper.appendChild(header);

		if(Object.keys(this.traktData).length === 0 && this.traktCode !== undefined){
			wrapper.innerHTML = "Error loading module. Please check the logs.";
		}
		else if(Object.keys(this.traktData).length === 0){
			wrapper.innerHTML = "Please enter the following on https://trakt.tv/activate: " + this.traktCode;
		}
		else {
			var table = document.createElement("table");
			table.className = this.config.moduleSize;
			/*var heading = table.insertRow(0);
			heading.insertCell(0).outerHTML = '<th style="text-align: left;">' + this.translate('TITLE') + '</th>';
			heading.insertCell(1).outerHTML = '<th style="text-align: left;"> ' + this.translate('NUMBER') + '</th>';
			heading.insertCell(2).outerHTML = '<th style="text-align: left;">' + this.translate('EPTITLE') + '</th>';
			heading.insertCell(3).outerHTML = '<th style="text-align: left;">' + this.translate('TIME') + '</th>';*/
			for(var show in this.traktData){
				var tableRow = table.insertRow(-1);
				tableRow.className = "normal";

				// Name
				let nameCell = tableRow.insertCell(0);
				nameCell.innerHTML = this.traktData[show].show.title;
				nameCell.className = "bright";

				// Episode
				let seasonNo = (this.traktData[show].episode.season).toLocaleString(undefined, {minimumIntegerDigits: 2});
				let episode = (this.traktData[show].episode.number).toLocaleString(undefined, {minimumIntegerDigits: 2});
				let episodeCell = tableRow.insertCell(1);
				episodeCell.innerHTML = "S" + seasonNo + "E" + episode;
				episodeCell.style = "padding-left: 6px;padding-right: 6px;";

				// Title
				tableRow.insertCell(2).innerHTML = "'" + this.traktData[show].episode.title + "'";

				// Airtime
				var airtime = moment.utc(this.traktData[show].episode.first_aired).local().format("D.M hh:mm");
				let airtimeCell = tableRow.insertCell(3);
				airtimeCell.innerHTML = airtime;
				airtimeCell.className = "light";
				airtimeCell.style = "padding-left: 6px;";
			}
			wrapper.appendChild(table)
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
