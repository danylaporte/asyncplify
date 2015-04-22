function RelativeTimeoutItem(context, action, delay) {
    this.action = action;
    this.context = context;
    this.delay = delay || 0;
    this.handle = null;
    this.scheduleTime = 0;
}

RelativeTimeoutItem.prototype = {
    cancel: function () {
        cancelTimeout(this.handle);
        this.delay = Math.max(this.delay - new Date().valueOf() - this.scheduleTime, 0);
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
        this.scheduleTime = new Date().valueOf();
        this.handle = setTimeout(this.execute.bind(this), this.delay);
    }
}
