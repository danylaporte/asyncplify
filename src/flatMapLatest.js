Asyncplify.prototype.flatMapLatest = function (options) {
    return new Asyncplify(FlatMapLatest, options, this)
}

function FlatMapLatest(options, on, source) {
    this.item = null;
    this.mapper = options.mapper || options;
    this.maxConcurrency = Math.max(options.maxConcurrency || 0, 0);
    this.on = on;
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

FlatMapLatest.prototype = {
    childEnd: function (err, item) {
        this.item = null;

        if (err) {
            this.setState(CLOSED);
            this.on.end(err);
        } else if (!this.source) {
            this.on.end(null);
        }
    },
    emit: function (v) {
        var item = this.mapper(v);
        if (item) {
            this.item && this.item.setState(CLOSED);
            this.item = new FlatMapItem(this);
            item._subscribe(this.item);
        }
    },
    end: function (err) {
        this.source = null;
        err && this.setState(CLOSED);
        (err || !this.item) && this.on.end(err);
    },
    setState: function (state) {
        this.source && this.source.setState(state);
        this.item && this.item.setState(state);
    }
}