Asyncplify.prototype.takeUntil = function (trigger) {
    return new Asyncplify(TakeUntil, trigger, this);
};

function TakeUntil(trigger, sink, source) {
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    this.trigger = null;

    new Trigger(trigger, this);
    
    if (this.trigger) source._subscribe(this);
}

TakeUntil.prototype = {
    emit: function (value) {
        this.sink.emit(value);
    },
    end: function (err) {
        if (this.trigger) this.trigger.setState(Asyncplify.states.CLOSED);
        this.source = this.trigger = null;
        this.sink.end(err);
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
        if (this.trigger) this.trigger.setState(state);
    },
    triggerEmit: function () {
        if (this.source) this.source.setState(Asyncplify.states.CLOSED);
        this.trigger.setState(Asyncplify.states.CLOSED);
        this.source = this.trigger = null;
        this.sink.end(null);
    }
};