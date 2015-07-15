Asyncplify.prototype.scan = function (options) {
    return new Asyncplify(Scan, options, this);
};

function scanIdentity(acc, v) {
    return (acc || 0) + (v || 0);
}

function Scan(options, sink, source) {
    this.acc = options && options.initial || 0;
    this.mapper = typeof options === 'function' ? options : (options && options.mapper || scanIdentity);
    this.sink = sink;
    this.sink.source = this;
    this.source = null;

    source._subscribe(this);
}

Scan.prototype = {
    emit: function (value) {
        this.acc = this.mapper(this.acc, value);
        this.sink.emit(this.acc);
    },
    end: function (err) {
        this.mapper = noop;
        this.source = null;
        this.sink.end(err);
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};