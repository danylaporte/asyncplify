Asyncplify.prototype.debounce = function (options) {
    return new Asyncplify(Debounce, options, this);
}

function Debounce(options, on, source) {
    this.endCalled = false;
    this.itemPending = false;
    this.on = on;
    this.scheduler = (options && options.scheduler || schedulers.timeout)();
    this.source = null;
    this.state = RUNNING;
    this.value = null;

    var self = this;

    this.item = {
        action: function () { self.action(); },
        delay: options && options.delay || typeof options === 'number' && options || 0,
    };

    on.source = this;
    this.scheduler.itemDone = function (err) { self.scheduledItemDone(err); };
    source._subscribe(this);
}

Debounce.prototype = {
    action: function () {
        var v = this.value;
        this.itemPending = false;
        this.value = undefined;
        this.on.emit(v);
    },
    emit: function (value) {
        this.itemPending = true;
        this.value = value;
        this.scheduler.cancel(this.item);
        this.scheduler.schedule(this.item);
    },
    end: function (err) {
        this.endCalled = true;

        if (err || !this.itemPending) {
            this.state = CLOSED;
            this.scheduler.close();
            this.on.end(err);
        }
    },
    scheduledItemDone: function (err) {
        if (err || (this.endCalled && this.state === RUNNING)) {
            this.state = CLOSED;
            this.on.end(err);
        }
    },
    setState: function (state) {
        if (this.state !== state && this.state !== CLOSED) {
            this.state = state;
            this.source.setState(state);

            if (state === RUNNING) {
                if (this.itemPending)
                    this.scheduler.setState(state);
                else if (this.endCalled) {
                    this.state = CLOSED;
                    this.on.end(null);
                }
            }
        }
    }
}