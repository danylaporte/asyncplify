Asyncplify.prototype.flatMapLatest = function (options) {
    return new Asyncplify(FlatMapLatest, options, this);
};

function FlatMapLatest(options, sink, source) {
    this.mapper = options || identity;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    this.subscription = null;

    source._subscribe(this);
}

FlatMapLatest.prototype = {
    childEnd: function (err, item) {
        this.subscription = null;

        if (err && this.source) {
            this.source.close();
            this.source = null;
            this.mapper = noop;
        }

        if (err || !this.source) this.sink.end(err);
    },
    close: function () {
        if (this.source) this.source.close();
        if (this.subscription) this.subscription.close();
        this.source = this.subscription = null;
    },
    emit: function (v) {
        var item = this.mapper(v);
        if (item) {
            if (this.subscription) this.subscription.close();
            this.subscription = new FlatMapItem(this);
            item._subscribe(this.subscription);
        }
    },
    end: function (err) {
        this.mapper = noop;
        this.source = null;

        if (err && this.subscription) {
            this.subscription.close();
            this.subscription = null;
        }

        if (err || !this.subscription) this.sink.end(err);
    }
};