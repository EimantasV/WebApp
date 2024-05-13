const state = { w: false, a: false, s: false, d: false, e: false, q: false, space: false };


document.addEventListener('keydown', function (event) {
    if (event.key === 'w' || event.key === 'W') {
        state.w = true;
    }
    if (event.key === 'a' || event.key === 'A') {
        state.a = true;
    }
    if (event.key === 's' || event.key === 'S') {
        state.s = true;
    }
    if (event.key === 'd' || event.key === 'D') {
        state.d = true;
    }
    if (event.key === 'q' || event.key === 'Q') {
        state.q = true;
    }
    if (event.key === 'e' || event.key === 'E') {
        state.e = true;
    }
    if (event.key === ' ') {
        Robot.sendState("on");
    }
});

document.addEventListener('keyup', function (event) {
    if (event.key === 'w' || event.key === 'W') {
        state.w = false;
    }
    if (event.key === 'a' || event.key === 'A') {
        state.a = false;
    }
    if (event.key === 's' || event.key === 'S') {
        state.s = false;
    }
    if (event.key === 'd' || event.key === 'D') {
        state.d = false;
    }
    if (event.key === 'q' || event.key === 'Q') {
        state.q = false;
    }
    if (event.key === 'e' || event.key === 'E') {
        state.e = false;
    }
    if (event.key === ' ') {
        Robot.sendState("off");
    }
});

setInterval(() => {
    let left = 4950;
    let right = 4950;
    let upper = 4950;
    if (state.a) upper = 3700;
    if (state.d) upper = 6300;
    if (state.w) {
        left = 6300;
        right = 3700;
    }
    if (state.s) {
        left = 3700;
        right = 6300;
    }
    if (state.q) {
        left = 6300;
        right = 6300;
    }
    if (state.e) {
        left = 3700;
        right = 3700;
    }
    Robot.sendState(`s ${left} ${right} ${upper}`);
}, 200);