/* global Module */

Module.register("MMM-trakt", {
    defaults: {
        updateInterval: 15 * 60 * 1000, //every 60 minutes
        initialLoadDelay: 0,
        days: 1
    },
    getScripts: function () {
        return ["moment.js"];
    },
    start: function () {
        Log.info("Starting module: " + this.name);
        moment.locale(config.language);
        this.traktData = {};
        this.traktxCode;
        this.dados = {};
        this.loaded = false;
        this.scheduleUpdate(this.config.initialLoadDelay);
        //asd
    },
    getDom: function () {
        if (Object.keys(this.dados).length === 0) {
            var wrapper = document.createElement("div");
            wrapper.innerHTML = "Please enter the following on https://trakt.tv/activate: " + this.traktCode;
            wrapper.className = "small";
        } else {
            var wrapper = document.createElement("table");
            var heading = wrapper.insertRow(0);
            wrapper.className = "small tableTrakt";
            heading.insertCell(0).outerHTML = '<th class="ColLeft">Série</th>';
            heading.insertCell(1).outerHTML = '<th class="ColCenter">Proximos</th>';
            heading.insertCell(2).outerHTML = '<th class="ColRight">Nome Episódio</th>';
            this.dados.sort(function (a, b) {
                return parseFloat(a.dif) - parseFloat(b.dif);
            });
            var aux = [];
            for (var i = 0; i < this.dados.length; i++) {
                if (this.dados[i].dif != 0) {
                    aux.push(this.dados[i]);
                }
            }

            for (var i = 0; i < 8; i++) {
                var tableHeader = wrapper.insertRow(-1);

                title = this.shorten(aux[i].nextEp, 20);

                tableHeader.insertCell(0).outerHTML = '<td class="ColLeft">' +aux[i].nome +'</td>';
                tableHeader.insertCell(1).outerHTML = '<td class="ColCenter">'+ aux[i].dif + '</td>';
                tableHeader.insertCell(2).outerHTML = '<td class="ColRight">'+ title + '</td>';

            }

        }
        return wrapper;
    },

    shorten: function (string, maxLength) {
        if (string.length > maxLength) {
            return string.slice(0, maxLength) + "&hellip;";
        }

        return string;
    },

    updateTrakt: function () {
        if (this.config.client_id === "") {
            Log.error("Trakt: client_id not set");
            return;
        }
        if (this.config.client_secret === "") {
            Log.error("Trakt: client_secret not set");
            return;
        }
        this.sendSocketNotification("PULL", {
            client_id: this.config.client_id,
            client_secret: this.config.client_secret,
            days: this.config.days,
            username: this.config.username,
            id_lista: this.config.id_lista,
            type: this.config.type

        });
    },
    socketNotificationReceived: function (notification, payload) {
        if (notification === "SHOWS") {
            // console.log(payload.shows);
            this.traktData = payload.shows;
            this.updateDom();
        }
        if (notification === "UNWATCHED") {
            //console.log(payload.eps);
            this.dados = payload.eps;
            this.updateDom();
        }
        if (notification === "OAuth") {
            //console.log(payload.code);
            this.traktCode = payload.code;
            this.updateDom();
        }
    },
    scheduleUpdate: function (delay) {
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }
        var self = this;
        setTimeout(function () {
            self.updateTrakt();
        }, nextLoad);
    }
});
