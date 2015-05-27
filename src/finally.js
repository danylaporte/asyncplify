Asyncplify.prototype.finally = function (action) {
    return action ? new Asyncplify(Finally, action, this) : this;
};

function Finally(action, on, source) {
    this.action = action;
    this.on = on;
    this.source = null;
    this.state = RUNNING;

    on.source = this;
    source._subscribe(this);
}

Finally.prototype = {
    emit: emitThru,
    end: function (err) {
        if (this.state !== CLOSED) {
            this.state = CLOSED;
            this.action();
            this.on.end(err);
        }
    },
    setState: function (state) {
        if (this.state !== state && this.state !== CLOSED) {
            this.state = state;
            this.source.setState(state);
            if (this.state === state && state === CLOSED) this.action();
        }
    }
};