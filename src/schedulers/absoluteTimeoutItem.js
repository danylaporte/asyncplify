function AbsoluteTimeoutItem(context, action, dueTime) {
    this.action = action;
    this.context = context;
    this.dueTime = dueTime;
    this.handle = null;
}

AbsoluteTimeoutItem.prototype = {
    cancel: function () {
        cancelTimeout(this.handle);
        return this;
    },
    close: function () {
        cancelTimeout(this.handle);
    },
    execute: function () {
        var err = null;
        try {
            this.action();
        } catch (ex) {
            err = ex;
        }

        this.context.itemDone(err);
    },
    schedule: function () {
        this.handle = setTimeout(this.execute.bind(this), Math.max(this.dueTime - new Date(), 0));
    }
}
