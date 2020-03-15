const cluster = require("cluster");
const os = require("os");

if (cluster.isMaster) {
    const len = os.cpus().length / 2;
    for (let idx = 0; idx < len; idx++) return cluster.fork();
} else {
    require("./index.js");
}