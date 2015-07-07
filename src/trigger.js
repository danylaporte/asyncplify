function Trigger(source, target) {
    this.target = target;
    this.source = null;
    target.trigger = this;
    source._subscribe(this);
}

Trigger.prototype = {
    close: function () {
        if (this.source) this.source.close();
        this.source = this.target = null;
    },
    emit: function (value) {
        if (this.target)
            this.target.triggerEmit(value);
    },
    end: noop
};