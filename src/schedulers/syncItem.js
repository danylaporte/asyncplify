function SyncItem(context, item) {
    this.context = context;
    this.schedule = item.error ? schedulerExecuteSafe : schedulerExecuteUnsafe;
    this.item = item;
}

SyncItem.prototype.close = noop;