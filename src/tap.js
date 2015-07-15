Asyncplify.prototype.tap = function (options) {
    return new Asyncplify(Tap, options, this);
};

function Tap(options, sink, source) {
    this._emit = options && options.emit || typeof options === 'function' && options || noop;
    this._end = options && options.end || noop;
    this._setState = options && options.setState || noop;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;

    if (options && options.subscribe) options.subscribe({ sink: sink, source: source });
    source._subscribe(this);
}

Tap.prototype = {
    emit: function (value) {
        this._emit(value);
        this.sink.emit(value);
    },
    end: function (err) {
        this.source = null;
        this._end(err);
        this.sink.end(err);
    },
    setState: function (state) {
        this._setState(state);
        if (this.source) this.source.setState(state);
    }
};