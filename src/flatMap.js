Asyncplify.prototype.flatMap = function(options) {
    return new Asyncplify(FlatMap, options, this)
}

function FlatMap(options, on, source) {
    this.items = [];
    this.mapper = options.mapper || options;
    this.maxConcurrency = Math.max(options.maxConcurrency || 0, 0);
    this.on = on;
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

FlatMap.prototype = {
    childEnd: function (err, item) {
        var count = this.items.length;
        removeItem(this.items, item);

        if (err) {
            this.setState(CLOSED);
            this.on.end(err);
        } else if (!this.items.length && !this.source) {
            this.on.end(null);
        } else if (this.source && this.maxConcurrency && count === this.maxConcurrency) {
            this.source.setState(RUNNING);
        }
    },
    emit: function (v) {
        var item = this.mapper(v);
        if (item) {
            var flatMapItem = new FlatMapItem(this);
            this.items.push(flatMapItem);
            this.maxConcurrency && this.items.length === this.maxConcurrency && this.source.setState(PAUSED);
            item._subscribe(flatMapItem);
        }
    },
    end: function (err) {
        this.source = null;
        err && this.setState(CLOSED);
        (err || !this.items.length) && this.on.end(err);
    },
    setState: function (state) {        
        this.source &&
            (state !== RUNNING || !this.maxConcurrency || this.items.length < this.maxConcurrency) &&
            this.source.setState(state);

        for (var i = 0; i < this.items.length; i++) {
            this.items[i].setState(state);
        }
    }
}

function FlatMapItem(on) {
    this.on = on;
    this.source = null;
}

FlatMapItem.prototype = {
    emit: function (v) {
        this.on.on.emit(v);
    },
    end: function (err) {
        this.on.childEnd(err, this);
    },
    setState: setStateThru
}