var pm2 = require('pm2');
pm2.connect(()=>{});

var pm2Module = {};
pm2Module.main = function (app) {
    app.get("/pm2/initData", function (req, res) {
        serverModule.initData().then((initData) => {
            res.end(initData);
        });
    });

    app.post("/pm2/reboot/:procName", function (req, res) {
        pm2.restart(req.params.procName, (err, proc) => {
            if (!err)
                res.end();
            else {
                console.error(err);
                res.status(504);
                res.end();
            }
        });
    });
    app.post("/pm2/boot/:procName", function (req, res) {
        pm2.restart(req.params.procName, (err, proc) => {
            if (!err)
                res.end();
            else {
                console.error(err);
                res.status(504);
                res.end();
            }
        });
    });

    app.post("/pm2/stop/:procName", function (req, res) {
        pm2.stop(req.params.procName, (err, proc) => {
            if (!err)
                res.end();
            else {
                console.error(err);
                res.status(504);
                res.end();
            }
        });
    });

}

pm2Module.initData = function () {
    return new Promise((resolve, reject) => {
        var data = {}
        data.module = "pm2";
        data.proc = [];
        data.proclen = 0;
        const pretty = require('prettysize');
        pm2.list((err, list) => {
            list.forEach(proc => {
                data.proc.push({ name: proc.name, memory: pretty(proc.monit.memory, true), cpu: proc.monit.cpu+"%", pid: proc.pid });
                data.proclen++;
            });
            resolve(data);
        });
    });
}

module.exports = pm2Module;