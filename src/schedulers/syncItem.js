function SyncItem(context, item) {
    this.context = context;
    this.item = item;
}

SyncItem.prototype = {
    close: noop,
    pause: function () {
        return this;
    },
    schedule: function () {
        var err = null;

        try {
            this.item.action();
        } catch (ex) {
            err = ex;
        }

        this.context.itemDone(err);
    }
}
