Robinet.fromPromise = function (promise, cb) {
    return new Robinet(FromPromise, promise);
}

function FromPromise(promise, on) {
    this.on = on;
    this.p = promise;
    this.resolved = 0;
    this.state = RUNNING;
    this.value = null;

    on.source = this;

    promise.then(function (v) {
        this.resolved = 1;
        this.value = v;
        this.state === RUNNING && this.do();
    }, function (err) {
        this.resolved = 2;
        this.value = err;
        this.state === RUNNING && this.do();
    })
}

FromPromise.prototype = {
    do: function () {
        switch (this.resolved) {
            case 1:
                this.on.emit(this.value);
                this.on.end();
                break;
            case 2:
                this.state = CLOSED;
                this.on.end(this.value);
                break;
        }
    },
    setState: setState
}
