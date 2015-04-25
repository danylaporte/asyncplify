Asyncplify.prototype.last = function (options) {
    return new Asyncplify(Last, options, this);
}

function Last(options, on, source) {
    this.count = 1;
    this.cond = condTrue;
    this.items = [];
    this.on = on;
    this.source = null;
    this.state = RUNNING;

    setCountAndCond(this, options);

    if (!this.count) {
        this.state = CLOSED;
        on.end(null);
    } else {
        on.source = this;
        source._subscribe(this);
    }
}

Last.prototype = {
    do: function () {
        while (this.items.length && this.state === RUNNING) {
            this.on.emit(this.items.pop());
        }

        if (this.state === RUNNING) {
            this.state = CLOSED;
            this.on.end(null);
        }
    },
    emit: function (value) {
        if (this.cond(value)) {
            this.items.unshift(value);
            this.count > 0 && this.items.length > this.count && this.items.pop();
        }
    },
    end: function (err) {
        this.source = null;

        if (err) {
            this.state = CLOSED;
            this.end(err);
        } else {
            this.do();
        }
    },
    setState: function (state) {
        if (this.state !== state && this.state != CLOSED) {
            this.state = state;
            this.source && this.source.setState(state);
            this.state === RUNNING && !this.source && this.do();
        }
    }
}
