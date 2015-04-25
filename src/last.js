Asyncplify.prototype.last = function (count) {
    return new Asyncplify(Last, count, this);
}

function Last(count, on, source) {
    this.count = count;
    this.on = on;
    this.source = null;
    this.items = [];
    this.state = RUNNING;
    this.endCalled = false;

    on.source = this;
    source._subscribe(this);
}

Last.prototype = {
    do: function () {
        for (var i = 0; i < this.items.length && this.state === RUNNING; i++) {
            this.on.emit(this.items[i]);
        }

        this.state === RUNNING && this.on.end(null);
    },
    emit: function (value) {
        this.items.push(value);
        this.items.length > this.count && this.items.splice(0, 1);
    },
    end: function (err) {
        err ? this.end(err) : this.do();
    },
    setState: function (state) {
        if (this.state !== state && this.state != CLOSED) {
            this.state = state;
            this.source.setState(state);
            this.state === RUNNING && this.do();
        }
    }
}
