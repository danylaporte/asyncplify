function ScheduleContext(factory) {
    this.factory = factory;
    this.items = [];
    this.itemDone = null;
}

ScheduleContext.prototype = {
    cancel: function (item) {
        for (var i = 0; i < this.items.length; i++) {
            var r = this.items[i];
            if (r.item === item) {
                this.items.splice(i, 0);
                r.close();
                break;
            }
        }
    },
    schedule: function (item) {
        var scheduleItem = this.factory(item);
        this.items.push(scheduleItem);
        scheduleItem.schedule();
    },
    setState: function (state) {
        var i;
        switch (state) {
            case CLOSED:
                for (i = 0; i < this.items.length; i++) {
                    this.items[i].close();
                }
                this.items.length = 0;
                break;

            case RUNNING:
                for (i = 0; i < this.items.length; i++) {
                    this.items[i].schedule();
                }
                break;

            case PAUSED:
                for (i = 0; i < this.items.length; i++) {
                    this.items[i] = this.items[i].pause();
                }
                break;
        }
    }
}
