function SyncItem(context, item) {
    this.context = context;
    this.item = item;
}

SyncItem.prototype = {
    close: noop,
    schedule: schedulerExecute
};