function NextTickItem(context, action) {
    this.action = action;
    this.canExecute = true;
    this.context = context;
}

NextTickItem.prototype = {
    cancel: function () {
        this.canExecute = false;
        return new NextTickItem(this.context, this.do);
    },
    close: function () {
        this.canExecute = false;
    },
    execute: function () {
        if (this.canExecute) {
            var err = null;

            try {
                this.action();
            } catch (ex) {
                err = ex;
            }

            this.context.itemDone(err);
        }
    },
    schedule: function () {
        process.nextTick(this.execute.bind(this));
    }
}
