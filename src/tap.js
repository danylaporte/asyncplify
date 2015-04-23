Asyncplify.prototype.tap = function (options) {
    return new Asyncplify(Tap, options, this)
}

function Tap(options, on, source) {
    this._emit = options && options.emit || typeof options === 'function' && options || noop;
    this._end = options && options.end || noop;
    this._setState = options && options.setState || noop;
    this.on = on;
    this.source = null;
    on.source = this;

    options && options.subscribe && options.subscribe({on: on, source: source});
    source._subscribe(this);
}

Tap.prototype = {
    emit: function (value) {
        this._emit(value);
        this.on.emit(value);
    },
    end: function (err) {
        this._end(err);
        this.on.end(err);
    },
    setState: function (state) {
        this._setState(state);
        this.source.setState(state);
    }
}
