Asyncplify.prototype.catch = function (options) {
    return new Asyncplify(Catch, options, this);
};

function Catch(options, on, source) {
    this.i = 0;
    this.isSubscriberError = false;
    this.on = on;
    this.options = options;
    this.source = null;

    if (typeof options === 'function') this.mapper = options;

    on.source = this;
    source._subscribe(this);
}

Catch.prototype = {
    emit: function (value) {
        this.isSubscriberError = true;
        this.on.emit(value);
        this.isSubscriberError = false;
    },
    end: function (err) {
        if (err && !this.isSubscriberError) {
            var source = this.mapper(err);
            if (source) return source._subscribe(this);
        }

        this.on.end(err);
    },
    mapper: function () {
        return this.i < this.options.length && this.options[this.i++];
    },
    setState: setStateThru
};