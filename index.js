#!/usr/bin/env node
const { json } = require('express');
const express = require('express');
const app = express();
const port = 3000;
const {authKey} = require("./config.json")
var locked = false;
var modules = [];
app.use((req, res, next) => {
    if (locked) return;
    if (req.headers.authkey != authKey) {
        console.log("Unauthorized Access attempt detected.")
        console.log("timestamp:" + new Date.now());
        locked = true;
        res.status(401);
        res.end();
    } else {
        next();
    }
});

(function () {
    var count = 0;
    const fs = require("fs");
    var files = fs.readdirSync("./modules");
    var { extname } = require("path");
    files.forEach(file => {
        if (extname(file) != '.js') return;
        console.log("Loading module " + file);
        var module = require("./modules/" + file);
        module.main(app);
        modules.push(module);
        count++;
    })
    console.log(count + "Modules loaded")
})();

app.get('/init', (req, res) => {
    var initPromises = [];
    modules.forEach(module => {
        initPromises.push(module.initData());
    });
    Promise.all(initPromises).then((initData) => {
        res.end(JSON.stringify({initData:initData}));
    });

})



app.listen(port, () => {
    console.log(`Server Manager active at http://localhost:${port}`)
})