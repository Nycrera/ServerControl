var request = require('request');
const CONFIG = require("../config.json");
var sinusModule = {};
sinusModule.main = function (app) {
    app.get("/sinusbot/initData", function (req, res) {
        sinusModule.initData().then((initData) => {
            res.end(initData);
        });
    });

    app.post("/sinusbot/reboot/:instanceId", function (req, res) {
        login((token) => {
            request.get(CONFIG.SinusBot.apiUrl + "/i/" + req.params.instanceId + '/respawn', {
                auth: {
                    'bearer': token
                },
                json: {
                    instanceId: req.params.instanceId,
                }
            }, (err, resp, body) => {
                if (!err && resp.statusCode == 200) {
                    res.end(200);
                } else {
                    log("Error in line 28. Module: Sinusbot");
                    res.end(504);
                }
            });
        });
    });

    app.post("/sinusbot/boot/:instanceId", function (req, res) {
        login((token) => {
            request.get(CONFIG.SinusBot.apiUrl + "/i/" + req.params.instanceId + '/spawn', {
                auth: {
                    'bearer': token
                },
                json: {
                    instanceId: req.params.instanceId,
                }
            }, (err, res, body) => {
                if (!err && res.statusCode == 200) {
                    res.end(200);
                } else {
                    log("Error in line 28. Module: Sinusbot");
                    res.end(504);
                }
            });
        });
    });
    app.post("/sinusbot/stop/:instanceId", function (req, res) {
        login((token) => {
            request.get(CONFIG.SinusBot.apiUrl + "/i/" + req.params.instanceId + '/kill', {
                auth: {
                    'bearer': token
                },
                json: {
                    instanceId: req.params.instanceId,
                }
            }, (err, res, body) => {
                if (!err && res.statusCode == 200) {
                    res.end(200);
                } else {
                    log("Error in line 28. Module: Sinusbot");
                    res.end(504);
                }
            });
        });
    });
}

sinusModule.initData = function () {
    return new Promise((resolve, reject) => {
        var data = {}
        data.module = "sinusbot";
        login(function (token, err) {
            if (err) {
                data.online = false;
                data.statusCode = err;
                resolve(data);
                return;
            } else {
                getGeneralInfo(token, (generalInfo) => {
                    data.memory = generalInfo.usageMemory.toFixed(2).toString() + " MB";
                    getInstanceInfo(token, (instanceInfo) => {
                        data.bots = [];
                        instanceInfo.forEach((bot) => {
                            data.bots.push({ name: bot.name, id: bot.uuid, online: bot.running });
                        });
                        resolve(data);
                    });
                });
            }
        });
    });
}

function getGeneralInfo(token, cb) {
    request.get(CONFIG.SinusBot.apiUrl + '/info', {   //+CONFIG.SinusBot.bots[1].instanceId+'/'+args[2], {
        auth: {
            'bearer': token
        }/*,
        json: {
            instanceId: CONFIG.SinusBot.bots[1].instanceId,
        }*/
    }, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            cb(body);
        } else {
            log("Error in line 28. Module: Sinusbot")
        }
    });
}

function getInstanceInfo(token, cb) {
    request.get(CONFIG.SinusBot.apiUrl + '/instances', {
        auth: {
            'bearer': token
        }
    }, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            cb(body);
        } else {
            log("Error in line 28. Module: Sinusbot")
        }
    });
}

function login(cb) {
    request.post(CONFIG.SinusBot.apiUrl + "/login", {
        json: {
            username: CONFIG.SinusBot.apiUsername,
            password: CONFIG.SinusBot.apiPassword,
            botId: CONFIG.SinusBot.botid
        }
    }, function (error, response, body) {
        if (error || response.statusCode != 200) {
            cb(null, response.statusCode);
        } else {
            cb(body.token);
        }

    });
}

module.exports = sinusModule;