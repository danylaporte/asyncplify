Asyncplify.merge = function (options) {
    return new Asyncplify(Merge, options);
};

function Merge(options, sink) {
    this.concurrency = 0;
    this.index = 0;
    this.items = options.items || options || [];
    this.maxConcurrency = options.maxConcurrency || 0;
    this.sink = sink;
    this.sink.source = this;
    this.subscriptions = [];

    while (this.index < this.items.length && (this.maxConcurrency < 1 || this.concurrency < this.maxConcurrency))
        new MergeItem(this.items[this.index++], this);

    if (!this.items.length) this.sink.end(null);
}

Merge.prototype.close = function () {
    this.sink = NoopSink.instance;
    
    for (var i = 0; i < this.subscriptions.length; i++)
        this.subscriptions[i].close();

    this.subscriptions.length = 0;
};

function MergeItem(item, parent) {
    this.parent = parent;
    this.source = null;

    parent.concurrency++;
    parent.subscriptions.push(this);
    item._subscribe(this);
}

MergeItem.prototype = {
    close: function () {
        if (this.source) this.source.close();
        this.source = null;
    },
    emit: function (v) {
        this.parent.sink.emit(v);
    },
    end: function (err) {
        if (this.source) {
            this.source = null;
            this.parent.concurrency--;
            removeItem(this.parent.subscriptions, this);

            if (err || this.parent.index >= this.parent.items.length) {
                var sink = this.parent.sink;
                this.parent.close();
                sink.end(err);
            } else if (this.parent.maxConcurrency < 1 || this.parent.concurrency < this.parent.maxConcurrency) {
                new MergeItem(this.parent.items[this.parent.index++], this.parent);
            }
        }
    }
};