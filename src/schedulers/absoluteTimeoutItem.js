function AbsoluteTimeoutItem(context, item, dueTime) {
    this.context = context;
    this.dueTime = dueTime;
    this.handle = null;
    this.item = item;
}

AbsoluteTimeoutItem.prototype = {
    close: function () {
        clearTimeout(this.handle);
    },
    execute: schedulerExecute,
    schedule: function () {
        var self = this;
        this.handle = setTimeout(function () { self.execute(); }, Math.max(this.dueTime - Date.now(), 0));
    }
};