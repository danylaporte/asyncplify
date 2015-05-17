function RelativeTimeoutItem(context, item, delay) {
    this.context = context;
    this.delay = delay || 0;
    this.handle = null;
    this.item = item;
    this.scheduleTime = null;
    this.accurate = null;
}

RelativeTimeoutItem.prototype = {
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
        this.delay = Math.max(this.delay - (Date.now() - this.scheduleTime), 0);
        return this;
    },
    schedule: function () {
        this.scheduleTime = Date.now();
        this.accurate = process.hrtime();
        this.handle = setTimeout(this.execute.bind(this), this.delay);
    }
}
