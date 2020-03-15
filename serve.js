
// 如果使用 pm2 管理进程，则忽略此文件
const cluster = require("cluster");
const os = require("os");

function fork() {
    const work = cluster.fork();
    let missedPing = 0;
    let inter = setInterval(() => {
        work.send("ping");
        missedPing++;
        if (missedPing >= 3) {
            clear();
            process.kill(work.process.pid);
        };
    }, 3000);
    function clear() {
        clearInterval(inter);
        inter = null;
        missedPing = null;
    }
    work.on("message", msg => {
        if (msg == "pong") {
            missedPing--;
        };
    });
    work.on("exit", (code, signal) => {
        clear();
    });
};

if (cluster.isMaster) {
    const len = os.cpus().length / 2;
    let idx = 0;
    for (idx; idx < len; idx++) fork();
    cluster.on("exit", () => {
        fork();
    });
} else {
    require("./index.js");
    process.on("message", msg => {
        if (msg == "ping") {
            process.send("pong");
        };
    });
    process.on("uncaughtException", (err) => {
        console.error("uncaughtException", err);
        process.exit(1);
    });
    let inter = setInterval(() => {
        console.log(process.memoryUsage().rss);
        if (process.memoryUsage().rss > 30797824) {
            clearInterval(inter);
            inter = null;
            process.exit(1);
        };
    }, 1000);
};