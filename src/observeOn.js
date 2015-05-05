Asyncplify.prototype.observeOn = function (options) {
    return new Asyncplify(ObserveOn, options, this)
}

function ObserveOn(options, on, source) {
    this.scheduler = (typeof options === 'function' ? options : (options && options.scheduler || schedulers.immediate))();
    this.scheduler.itemDone = this.scheduledItemDone.bind(this);
    this.on = on;
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

ObserveOn.prototype = {
    emit: function (v) {
        this.scheduler.schedule(new ObserveOnItem(v, true, this.on));  
    },
    end: function (err) {
        this.scheduler.schedule(new ObserveOnItem(err, false, this.on));
    },
    scheduledItemDone: function (err) {
        if (err) {
            this.scheduler.setState(CLOSED);
            this.on.end(err);
        }
    },
    setState: function (state) {
        if (this.state !== state && this.state !== CLOSED) {
            this.state = state;
            this.scheduler.setState(state);
        }
    }
}

function ObserveOnItem(value, isEmit, on) {
    this.isEmit = isEmit;
    this.on = on;
    this.value = value;
}

ObserveOnItem.prototype = {
    action: function () {
        this.isEmit ? this.on.emit(this.value) : this.on.end(this.value);
    },
    delay: 0
}
