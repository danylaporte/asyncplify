Asyncplify.fromPromise = function (promise, cb) {
    return new Asyncplify(FromPromise, promise);
};

function FromPromise(promise, on) {
    this.on = on;
    this.resolved = 0;
    this.state = RUNNING;
    this.value = null;

    on.source = this;
    
    var self = this;
    
    function resolve(v) {
        if (self.state === RUNNING) {
            self.state = CLOSED;
            self.on.emit(v);
            self.on.end(null);
        } else {
            self.resolved = 1;
            self.value = v;
        }
    }
    
    function rejected(err) {
        if (self.state === RUNNING) {
            self.state = CLOSED;
            self.on.end(err);
        } else {
            self.resolved = 2;
            self.value = err;
        }
    }

    promise.then(resolve, rejected);
}

FromPromise.prototype = {
    do: function () {
        if (this.resolved === 1) {
            this.state = CLOSED;
            this.on.emit(this.value);
            this.on.end(null);
        } else if (this.resolved === 2) {
            this.state = CLOSED;
            this.on.end(this.value);
        }
    },
    setState: setState
};