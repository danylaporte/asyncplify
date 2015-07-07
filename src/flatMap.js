Asyncplify.prototype.flatMap = function (options) {
    return new Asyncplify(FlatMap, options, this);
};

function FlatMap(options, sink, source) {
    this.isSubscribing = false;
    this.mapper = options.mapper || options;
    this.maxConcurrency = Math.max(options.maxConcurrency || 0, 0);
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    this.sources = [];
    this.subscriptions = [];

    source._subscribe(this);
}

FlatMap.prototype = {
    childEnd: function (err, item) {
        removeItem(this.subscriptions, item);
        this.subscribe(err);
    },
    close: function () {
        if (this.source) this.source.close();

        for (var i = 0; i < this.subscriptions.length; i++)
            this.subscriptions[i].close();

        this.mapper = noop;
        this.sink = NoopSink.instance;
        this.source = null;
        this.sources.length = 0;
        this.subscriptions.length = 0;
    },
    emit: function (v) {
        var item = this.mapper(v);
        if (item) {
            this.sources.push(item);
            this.subscribe(null);
        }
    },
    end: function (err) {
        this.source = null;
        this.subscribe(err);
    },
    subscribe: function (err) {
        var sink = this.sink;

        if (err) {
            this.close();
            sink.end(err);
        } else if (!this.isSubscribing) {
            this.isSubscribing = true;

            while (this.sources.length && (this.maxConcurrency < 1 || (this.source ? 1 : 0) + this.subscriptions.length < this.maxConcurrency)) {
                var item = new FlatMapItem(this);
                this.subscriptions.push(item);
                this.sources.shift()._subscribe(item);
            }

            this.isSubscribing = false;

            if (!this.sources.length && !this.subscriptions.length && !this.source) {
                this.mapper = noop;
                this.sink = NoopSink.instance;
                sink.end(null);
            }
        }
    }
};