function Trigger(source, target) {
    this.target = target;
    this.source = null;
    target.trigger = this;
    source._subscribe(this);
}

Trigger.prototype = {
    emit: function (value) {
        this.target.triggerEmit(value);
    },
    end: noop,
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};