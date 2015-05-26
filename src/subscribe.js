Asyncplify.prototype.subscribe = function (options) {
    return new Subscribe(options || {}, this)
}

function Subscribe(options, source) {
    this.emit = options.emit || (typeof options === 'function' && options) || noop;
    this.end = options.end || noop;
    this.source = null;
    source._subscribe(this);
}

Subscribe.prototype = {
    close: function () {
        this.source.setState(CLOSED);
    },
    pause: function () {
        this.source.setState(PAUSED);
    },
    resume: function () {
        this.source.setState(RUNNING);
    }
}
