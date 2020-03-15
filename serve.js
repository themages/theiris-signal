const cluster = require("cluster");
const os = require("os");

if (cluster.isMaster) {
    const len = os.cpus().length / 2;
    let idx = 0;
    for (idx; idx < len; idx++) cluster.fork();
} else {
    require("./index.js");
    // 如果使用 pm2 ，则忽略下面的代码
    // process.on("uncaughtException", (err) => {
    //     console.error(err);
    //     process.exit(1);
    // });
    // 内存阀值/泄漏
    // if (process.memoryUsage().rss > 734003200) {
    //     process.exit(1);
    // }
};