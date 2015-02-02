var dgram = require('dgram')

var acIp = '10.0.1.9'
var acPort = 9996

var HANDSHAKE = 0,
    SUBSCRIBE_UPDATE = 1,
    SUBSCRIBE_SPOT = 3,
    DISMISS = 3

var state = 0

var client = dgram.createSocket('udp4')
client.on("message", function(msg, rinfo) {
    if (state == 0) { // initial handshake not yet received
        var carName = readString(msg, 0, 100)
        var driverName = readString(msg, 100, 100)

        //console.log("Welcome, " + driverName)
        //console.log("Handshake received")

        send(SUBSCRIBE_UPDATE)

        state = 1
    } else if (state == 1) { // initial handshake received
        var offset = 8 // why?
        var speedKmh = msg.readFloatLE(offset)
        var speedMph = msg.readFloatLE(offset + 4)
        var speedMs = msg.readFloatLE(offset + 8)

        console.log(offset, speedKmh, speedMph, speedMs)
    }
})

function readString(buf, start, length) {
    var str = buf.toString('binary', start, start+length)
    var parts = str.split('%')
    return parts[0]
}

function send(op) {
    var msg = new Buffer(12)
    msg.writeInt32LE(1, 0) // identifier, 0 = eIPhoneDevice
    msg.writeInt32LE(1, 4) // version
    msg.writeInt32LE(op, 8) // operation

    client.send(msg, 0, msg.length, acPort, acIp)
}

send(HANDSHAKE)
