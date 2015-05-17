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
    execute: function () {
        var err = null;
        try {
            this.item.action();
        } catch (ex) {
            err = ex;
        }

        this.context.itemDone(err);
    },
    pause: function () {
        clearTimeout(this.handle);
        return this;
    },
    schedule: function () {
        this.handle = setTimeout(this.execute.bind(this), Math.max(this.dueTime - Date.now(), 0));
    }
}
