function SyncItem(context, action) {
    this.action = action;
    this.context = context;
}

SyncItem.prototype = {
    cancel: function () {
        return this;
    },
    close: noop,
    schedule: function () {
        var err = null;

        try {
            this.action();
        } catch (ex) {
            err = ex;
        }

        this.context.itemDone(err);
    }
}
