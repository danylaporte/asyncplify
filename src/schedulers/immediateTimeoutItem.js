function ImmediateTimeoutItem(context, item) {
    this.context = context;
    this.execute = item.error ? schedulerExecuteSafe : schedulerExecuteUnsafe;
    this.handle = null;
    this.item = item;
}

ImmediateTimeoutItem.prototype = {
    close: function () {
        clearImmediate(this.handle);
    },
    schedule: function () {
        var self = this;
        this.handle = setImmediate(function handleImmediate() { self.execute(); });
    }
};