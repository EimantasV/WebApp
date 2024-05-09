class Robot {
    static {

    }
    // codes: "on" "off" - turn on/off main engine,
    // "s {num1} {num2} {num3}" "s 5000 4000 3000" - move all 3 servos to specified angles.

    // MIN 1140
    // MAX 8620
    // MID 4950
    // 0 deg from mid 1700
    // 180 ded -      8260
    static sendState(data) {
        WebSocketConnection.WS.send(JSON.stringify({ "type": "com", data: data }));
    }
}