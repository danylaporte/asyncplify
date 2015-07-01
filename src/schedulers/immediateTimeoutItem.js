function ImmediateTimeoutItem(context, item) {
    this.context = context;
    this.handle = null;
    this.item = item;
}

ImmediateTimeoutItem.prototype = {
    close: function () {
        clearImmediate(this.handle);
    },
    execute: schedulerExecute,
    schedule: function () {
        var self = this;
        this.handle = setImmediate(function () { self.execute(); });
    }
};