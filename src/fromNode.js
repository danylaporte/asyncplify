Asyncplify.fromNode = function (func) {
    var args = [];

    for (var i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
    }

    return new Asyncplify(FromNode, { func: func, args: args, self: this });
}

function FromNode(options, on) {
    this.err = null;
    this.on = on;
    this.state = RUNNING;
    this.step = 0;
    this.value = null;

    on.source = this;
    options.func.apply(options.self, options.args.concat(this.cb.bind(this)));
}

FromNode.prototype = {
    cb: function (err, value) {
        this.err = err;
        this.step = 1;
        this.value = value;
        this.state === RUNNING && this.do();
    },
    do: function () {
        if (this.step !== 0) {
            if (this.err) {
                this.state = CLOSED;
                this.on.end(this.err);
                return;
            }

            if (this.step === 1) {
                this.step = 2;
                this.on.emit(this.value);
            }

            if (this.step === 2) {
                this.state = CLOSED;
                this.on.end(this.err);
            }
        }
    },
    setState: setState
}
