function ScheduleContext(factory) {
    this.factory = factory;
    this.items = [];
    this.state = Asyncplify.states.RUNNING;
}

ScheduleContext.prototype = {
    reset: function () {
        for (var i = 0; i < this.items.length; i++)
            this.items[i].close();

        this.items.length = 0;
    },
    schedule: function (item) {
        if (this.state !== Asyncplify.states.CLOSED) {
            var scheduleItem = this.factory(item);
            this.items.push(scheduleItem);

            if (this.state === Asyncplify.states.RUNNING)
                scheduleItem.schedule();
        }
    },
    setState: function (state) {
        var i;

        if (this.state !== state && this.state !== Asyncplify.states.CLOSED) {
            this.state = state;

            if (state === Asyncplify.states.RUNNING) {
                for (i = 0; i < this.items.length; i++)
                    this.items[i].schedule();
            } else {
                for (i = 0; i < this.items.length; i++)
                    this.items[i].close();

                if (state === Asyncplify.states.CLOSED)
                    this.items.length = 0;
            }
        }
    }
};