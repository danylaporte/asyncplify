function RelativeTimeoutItem(context, item, delay) {
    this.context = context;
    this.delay = delay || 0;
    this.execute = item.error ? schedulerExecuteSafe : schedulerExecuteUnsafe;
    this.handle = null;
    this.item = item;
}

RelativeTimeoutItem.prototype = {
    close: function () {
        clearTimeout(this.handle);
        this.handle = null;
        this.delay = Math.max(this.delay - (Date.now() - this.scheduleTime));
    },
    schedule: function () {
        var self = this;
        this.scheduleTime = Date.now();
        this.handle = setTimeout(function handleRelativeTimeout() { self.execute(); }, this.delay);

    }
};