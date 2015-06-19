Asyncplify.prototype.tap = function (options) {
    return new Asyncplify(Tap, options, this);
};

function Tap(options, on, source) {
    this._emit = options && options.emit || typeof options === 'function' && options || noop;
    this.isSubscriberError = false;
    this.on = on;
    this.options = options;
    this.source = null;
    on.source = this;

    if (options && options.subscribe) options.subscribe({ on: on, source: source });
    source._subscribe(this);
}

Tap.prototype = {
    emit: function (value) {
        this.isSubscriberError = true;
        this._emit(value);
        this.on.emit(value);
        this.isSubscriberError = false;
    },
    end: function (err) {
        if (this.options && this.options.end) this.options.end(err, this.isSubscriberError);
        this.on.end(err);
    },
    setState: function (state) {
        if (this.options && this.options.setState) this.options.setState(state);
        this.source.setState(state);
    }
};