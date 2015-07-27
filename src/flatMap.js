Asyncplify.prototype.flatMap = function (options) {
    return new Asyncplify(FlatMap, options, this);
};

var flatMapDebug = debug('asyncplify:flatMap');

function FlatMap(options, sink, source) {
    this.isPaused = false;
    this.items = [];
    this.mapper = options.mapper || options || identity;
    this.maxConcurrency = Math.max(options.maxConcurrency || 0, 0);
    this.sink = sink;
    this.sink.source = this;
    this.state = Asyncplify.states.RUNNING;
    this.source = null;

    flatMapDebug('subscribe');
    source._subscribe(this);
}

FlatMap.prototype = {
    childEnd: function (err, item) {
        var count = this.items.length;
        removeItem(this.items, item);

        if (err) {
            this.setState(Asyncplify.states.CLOSED);
            this.sink.end(err);
        } else if (!this.items.length && !this.source) {
            flatMapDebug('end');
            this.sink.end(null);
        } else if (this.source && this.maxConcurrency && count === this.maxConcurrency && this.isPaused) {
            this.isPaused = false;
            if (this.state === Asyncplify.states.RUNNING) {
                flatMapDebug('resuming source');
                this.source.setState(Asyncplify.states.RUNNING);
            }
        }
    },
    emit: function (v) {
        flatMapDebug('receive %j', v);
        
        var item = this.mapper(v);
        if (item) {
            var flatMapItem = new FlatMapItem(this, flatMapDebug);
            this.items.push(flatMapItem);

            if (this.maxConcurrency && this.items.length >= this.maxConcurrency && !this.isPaused) {
                this.isPaused = true;
                flatMapDebug('pausing source because of max concurrency.');
                this.source.setState(Asyncplify.states.PAUSED);
            }

            flatMapDebug('subscribe to item.');
            item._subscribe(flatMapItem);
        }
    },
    end: function (err) {
        flatMapDebug('source completed');
        this.source = null;
        
        if (err) this.setState(Asyncplify.states.CLOSED);
        
        if (err || !this.items.length) {
            err ? flatMapDebug('error', err) : flatMapDebug('end');
            this.sink.end(err);
        }
    },
    setState: function (state) {
        if (this.state !== state && this.state !== Asyncplify.states.CLOSED) {
            this.state = state;

            if (this.source && (!this.isPaused || state === Asyncplify.states.CLOSED))
                this.source.setState(state);

            for (var i = 0; i < this.items.length && this.state === state; i++)
                this.items[i].setState(state);
        }
    }
};