function immediateNextTickFactory(item) {
    return item.dueTime && item.dueTime > new Date()
        ? new AbsoluteTimeoutItem(this, item.action, item.dueTime)
        : item.delay && item.delay > 0
        ? new RelativeTimeoutItem(this, item.action, item.delay)
        : new NextTickItem(this, item.action);
}

function syncFactory(item) {
    return item.dueTime && item.dueTime > new Date()
        ? new AbsoluteTimeoutItem(this, item.action, item.dueTime)
        : item.delay && item.delay > 0
        ? new RelativeTimeoutItem(this, item.action, item.delay)
        : new SyncItem(this, item.action);
}

var immediateFactory = typeof process !== 'undefined' && process.nextTick
    ? immediateNextTickFactory
    : timeoutFactory;

function timeoutFactory(item) {
    return item.dueTime
        ? new AbsoluteTimeoutItem(this, item.action, item.dueTime)
        : new RelativeTimeoutItem(this, item.action, item.delay);
}

var schedulers = Robinet.schedulers = {
    immediate: function () {
        return new ScheduleContext(immediateFactory);
    },
    sync: function () {
        return new ScheduleContext(syncFactory);
    },
    timeout: function () {
        return new ScheduleContext(timeoutFactory);
    }
}
