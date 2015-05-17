function ImmediateTimeoutItem(context, item) {
    this.context = context;
    this.handle = null;
    this.item = item;
}

ImmediateTimeoutItem.prototype = {
    close: function () {
        clearImmediate(this.handle);
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
        clearImmediate(this.handle);
        return this;
    },
    schedule: function () {
        this.handle = setImmediate(this.execute.bind(this));
    }
}
