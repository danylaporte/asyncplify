function schedulerExecute() {
    removeItem(this.context.items, this);    
    //try {
        this.item.action();
    //} catch (ex) {
      //  this.item.error(ex);
    //}
}

function immediateFactory(item) {
    return item.dueTime && item.dueTime > Date.now()
        ? new AbsoluteTimeoutItem(this, item, item.dueTime)
        : item.delay && item.delay > 0
            ? new RelativeTimeoutItem(this, item, item.delay)
            : new ImmediateTimeoutItem(this, item);
}

function syncFactory(item) {
    return item.dueTime && item.dueTime > Date.now()
        ? new AbsoluteTimeoutItem(this, item, item.dueTime)
        : item.delay && item.delay > 0
            ? new RelativeTimeoutItem(this, item, item.delay)
            : new SyncItem(this, item);
}

var immediateOrTimeoutFactory = typeof setImmediate === 'function' && typeof clearImmediate === 'function'
    ? immediateFactory
    : timeoutFactory;

function timeoutFactory(item) {
    return item.dueTime
        ? new AbsoluteTimeoutItem(this, item, item.dueTime)
        : new RelativeTimeoutItem(this, item, item.delay);
}

var schedulers = Asyncplify.schedulers = {
    immediate: function () {
        return new ScheduleContext(immediateOrTimeoutFactory);
    },
    sync: function () {
        return new ScheduleContext(syncFactory);
    },
    timeout: function () {
        return new ScheduleContext(timeoutFactory);
    }
};