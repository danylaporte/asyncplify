function ScheduleContext(factory) {
    this.factory = factory;
    this.items = [];
}

ScheduleContext.prototype = {
    close: function (item) {
        var i;

        if (item) {
            for (i = 0; i < this.items.length; i++)
                if (this.items[i].item === item) {
                    this.items[i].close();
                    this.items.splice(i);
                    return;
                }
        } else {
            for (i = 0; i < this.items.length; i++)
                this.items[i].close();

            this.items.length = 0;
        }
    },
    schedule: function (item) {
        var scheduleItem = this.factory(item);
        this.items.push(scheduleItem);
        scheduleItem.schedule();
    }
};