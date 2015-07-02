function Trigger(source, target) {
    this.target = target;
    this.source = null;
    target.trigger = this;
    source._subscribe(this);
}

Trigger.prototype = {
    close: function () {
        this.closeSource();
        this.target = null;
    },
    closeSource: closeSource,
    emit: function (value) {
        if (this.target)
            this.target.triggerEmit(value);
    },
    end: noop
};