function AbsoluteTimeoutItem(context, item, dueTime) {
    this.context = context;
    this.dueTime = dueTime;
    this.execute = item.error ? schedulerExecuteSafe : schedulerExecuteUnsafe;
    this.handle = null;
    this.item = item;
}

AbsoluteTimeoutItem.prototype = {
    close: function () {
        clearTimeout(this.handle);
    },
    schedule: function () {
        var self = this;
        this.handle = setTimeout(function handleAbsoluteTimeout() { self.execute(); }, Math.max(this.dueTime - Date.now(), 0));
    }
};