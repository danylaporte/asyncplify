Asyncplify.prototype.finally = function (action) {
    return action ? new Asyncplify(Finally, action, this) : this;
}

function Finally(action, on, source) {
    this.action = action;
    this.on = on;
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

Finally.prototype = {
    emit: emitThru,
    end: function (err) {
        this.action();
        this.on.end(err);
    },
    setState: function (state) {
        this.source.setState(state);
        this.action();
    }
}
