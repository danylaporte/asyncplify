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
    },
    schedule: function () {
        var self = this;
        this.handle = setTimeout(function () { self.execute(); }, this.delay);
    }
};