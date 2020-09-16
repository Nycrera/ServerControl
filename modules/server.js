const publicIp = require('public-ip');
const si = require('systeminformation');
var serverModule = {};
serverModule.main = function (app) {
    app.get("/server/initData", function (req, res) {
        serverModule.initData().then((initData) => {
            res.end(initData);
        });
    });

    app.post("/server/reboot", function (req, res) {
        require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg) });
    });
}

serverModule.initData = function () {
    return new Promise((resolve, reject) => {
        var data = {}
        data.module = "server";
        si.currentLoad((sys) => {
            data.cpu = "% " + sys.currentload.toFixed(2).toString();
            si.mem((mem) => {
                const pretty = require('prettysize');
                data.memory = pretty(mem.used, true) + " / " + pretty(mem.total, true);
                data.swap = pretty(mem.swapused, true) + " / " + pretty(mem.swaptotal, true);
                si.fsSize((fsdata) => {
                    fsdata.forEach((fs) => {
                        if (fs.fs == '/dev/sda2') {
                            data.disk = pretty(fs.used, true) + " / " + pretty(fs.size, true);
                        }
                    });
                    publicIp.v4().then((ip) => {
                        data.ip = ip;
                        resolve(data);
                    });
                });
            });
        });
    });
}

function log(msg) {
    if (serverModule.logger != null) {
        log = serverModule.logger.log;
        serverModule.logger.log(msg);
    } else {
        console.log(msg);
    }
}

serverModule.logger = null;
module.exports = serverModule;