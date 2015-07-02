Asyncplify.prototype.scan = function (options, source, cb) {
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
    close: function () {
        if (this.source) this.source.close();
        this.source = null;
    },
    emit: function (value) {
        this.acc = this.mapper(this.acc, value);
        this.sink.emit(this.acc);
    },
    end: function (err) {
        this.mapper = null;
        this.source = null;
        this.sink.end(err);
    }
};