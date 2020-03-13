const ws = require("ws");
const wss = new ws.Server({ port: 8888});

const code2ws = new Map();
wss.on("connection", function connection (ws, request) {
    let code = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    code2ws.set(code, ws);
    ws.sendData = (event, data) => {
        ws.send(JSON.stringify({event, data}));
    }
    ws.sendError = msg => {
        ws.sendData('error', {msg})
    };

    let ip = request.connection.remoteAddress.replace('::ffff:', '');
    console.info('ip is connected', ip)

    ws.on("message", function incoming(message) {
        let parsetMessage = {};
        try {
            parsetMessage = JSON.parse(message);
        } catch (err) {
            ws.sendError("error", "message invalid");
            return
        }
        let {event, data} = parsetMessage;
        switch (event) {
            case "login":
                ws.sendData("logined", {code});
                break;
            case "control":
                let remote = +data.remote;
                if (code2ws.has(remote)) {
                    ws.sendData("controlled", {remote});
                    ws.sendRemote = code2ws.get(remote).sendData;
                    ws.sendRemote("be-controlled", {remote: code});
                } else {
                    ws.sendError('user not found')
                }
                break;
            case "forward":
                ws.sendRemote(data.event, data.data);
                break;
            // case "control":
            //     break;
            default:
                ws.sendError('message not handle', message)
                break;
        }
    });
    ws.on('close', () => {
        code2ws.delete(code);
        delete ws.sendRemote;
        clearTimeout(ws._closeTimeout);
    })

    ws._closeTimeout = setTimeout(() => {
        ws.terminate();
    }, 600000);
})