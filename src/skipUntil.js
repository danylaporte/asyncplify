Asyncplify.prototype.skipUntil = function (trigger) {
    return new Asyncplify(SkipUntil, trigger, this)
}

function SkipUntil(trigger, on, source) {
    this.can = false;
    this.on = on;
    this.source = null;
    this.trigger = null;

    on.source = this;
    new Trigger(trigger, this);
    source._subscribe(this);
}

SkipUntil.prototype = {
    emit: function (value) {
        this.can && this.on.emit(value);
    },
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
        this.trigger && this.trigger.setState(CLOSED);
        this.trigger = null;
        this.can = true;
    }
}
