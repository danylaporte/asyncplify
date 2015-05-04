Asyncplify.prototype.scan = function (options, source, cb) {
    return new Asyncplify(Scan, options, this)
}

function scanIdentity(acc, v) {
    return (acc || 0) + (v || 0);
}

function Scan(options, on, source) {
    this.mapper = typeof options === 'function' ? options : (options && options.mapper || scanIdentity);
    this.acc = options && options.initial || 0;
    this.on = on;
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

Scan.prototype = {
    emit: function (value) {
        this.acc = this.mapper(this.acc, value);
        this.on.emit(this.acc);
    },
    end: endThru,
    setState: setStateThru
}