Robinet.prototype.takeUntil = function (trigger) {
    return new Robinet(TakeUntil, trigger, this)
}

function TakeUntil(trigger, on, source) {
    this.on = on;
    this.source = null;
    this.trigger = null;
    on.source = this;

    new Trigger(trigger, this);
    this.trigger && source._subscribe(this);
}

TakeUntil.prototype = {
    emit: emitThru,
    end: function (err) {
        if (this.trigger) {
            this.trigger.setState(CLOSED);
            this.trigger = null;
        }

        this.on.end(err);
    },
    setState: function (state) {
        this.trigger && this.trigger.setState(state);
        this.source && this.source.setState(CLOSED);

        if (state === CLOSED) {
            this.trigger = null;
        }
    },
    triggerEmit: function () {
        this.setState(CLOSED);
        this.on.end(null);
    }
}
