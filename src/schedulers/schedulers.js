function immediateNextTickFactory(item) {
    return item.dueTime && item.dueTime > new Date()
        ? new AbsoluteTimeoutItem(this, item.action.bind(item), item.dueTime)
        : item.delay && item.delay > 0
        ? new RelativeTimeoutItem(this, item.action.bind(item), item.delay)
        : new NextTickItem(this, item.action.bind(item));
}

function syncFactory(item) {
    return item.dueTime && item.dueTime > new Date()
        ? new AbsoluteTimeoutItem(this, item.action.bind(item), item.dueTime)
        : item.delay && item.delay > 0
        ? new RelativeTimeoutItem(this, item.action.bind(item), item.delay)
        : new SyncItem(this, item.action.bind(item));
}

var immediateFactory = typeof process !== 'undefined' && process.nextTick
    ? immediateNextTickFactory
    : timeoutFactory;

function timeoutFactory(item) {
    return item.dueTime
        ? new AbsoluteTimeoutItem(this, item.action.bind(item), item.dueTime)
        : new RelativeTimeoutItem(this, item.action.bind(item), item.delay);
}

var schedulers = Asyncplify.schedulers = {
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