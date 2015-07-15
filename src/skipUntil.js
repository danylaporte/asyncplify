Asyncplify.prototype.skipUntil = function (trigger) {
    return new Asyncplify(SkipUntil, trigger, this);
};

function SkipUntil(trigger, sink, source) {
    this.can = false;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    this.trigger = null;

    new Trigger(trigger, this);
    source._subscribe(this);
}

SkipUntil.prototype = {
    emit: function (value) {
        if (this.can) this.sink.emit(value);
    },
    end: function (err) {
        if (this.trigger) this.trigger.setState(Asyncplify.states.CLOSED);
        this.trigger = this.source = null;
        this.sink.end(err);
    },
    setState: function (state) {
        if (this.trigger) this.trigger.setState(state);
        if (this.source) this.source.setState(state);  
    },
    triggerEmit: function () {
        this.trigger.setState(Asyncplify.states.CLOSED);
        this.trigger = null;
        this.can = true;
    }
};