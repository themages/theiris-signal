const cluster = require("cluster");
const os = require("os");

if (cluster.isMaster) {
    const len = os.cpus().length / 2;
    let idx = 0;
    for (idx; idx < len; idx++) cluster.fork();
} else {
    require("./index.js");
};