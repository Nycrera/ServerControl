const { TeamSpeak } = require("ts3-nodejs-library");
const config = require("../config.json");

var tsModule = {};
tsModule.main = function (app) {
    app.get("/teamspeak/initData", function (req, res) {
        tsModule.initData().then((initData) => {
            res.end(initData);
        });
    });
    app.post("/teamspeak/reboot/", function (req, res) {
        connect(teamspeak => {
            teamspeak.serverStop().then(() => {
                teamspeak.serverStart().then(() => {
                    res.end();
                });
            })
        });
    });
    app.post("/teamspeak/boot/", function (req, res) {
        connect(teamspeak => {
            teamspeak.serverStart().then(() => {
                res.end();
            });
        });
    });
    app.post("/teamspeak/stop/", function (req, res) {
        connect(teamspeak => {
            teamspeak.serverStop().then(() => {
                res.end();
            });
        });
    });
}

tsModule.initData = function () {
    return new Promise((resolve, reject) => {
        var data = {}
        data.module = "teamspeak";
        TeamSpeak.connect({
            host: config.Query.host,
            queryport: config.Query.port, //optional
            //serverport: 9987,   //Commented out because of useBySid line: 12
            username: config.Query.username,
            password: config.Query.password,
            nickname: "test" // Doesn't work anyways
        }).then(async teamspeak => {
            data.online = true;
            teamspeak.useBySid(config.Query.sid).then(async () => {
                teamspeak.serverInfo().then(serverInfo => {
                    if (serverInfo.virtualserverStatus != 'online') {
                        data.online = false;
                        teamspeak.quit();
                        resolve(data);
                    } else {
                        data.client = (serverInfo.virtualserverClientsonline - serverInfo.virtualserverQueryclientsonline) + "+" + serverInfo.virtualserverQueryclientsonline + "/" + serverInfo.virtualserverMaxclients;
                        data.uptime = secondsToString(serverInfo.virtualserverUptime);
                        resolve(data);
                        teamspeak.quit();
                    }
                });
                teamspeak.quit();
            });
        }).catch(e => {
            data.online = false;
            teamspeak.quit();
            resolve(data);
        });
    });
}

function connect(cb) {
    TeamSpeak.connect({
        host: config.Query.host,
        queryport: config.Query.port, //optional
        //serverport: 9987,   //Commented out because of useBySid line: 12
        username: config.Query.username,
        password: config.Query.password,
        nickname: "test" // Doesn't work anyways
    }).then(async teamspeak => {
        teamspeak.useBySid(config.Query.sid).then(async () => {
            cb(teamspeak);
        });
    });
}


function secondsToString(seconds) {
    var numdays = Math.floor((seconds % 31536000) / 86400);
    var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
    return numdays + "D " + numhours + "H " + numminutes + "M " + numseconds + "S";
}
module.exports = tsModule;