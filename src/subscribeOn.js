Asyncplify.prototype.subscribeOn = function (options) {
    return new Asyncplify(SubscribeOn, options, this)
}

function SubscribeOn(options, on, source) {
    this.origin = source;
    this.on = on;
    this.scheduler = (typeof options === 'function' ? options : (options && options.scheduler || schedulers.immediate))();
    this.scheduler.itemDone = noop;
    this.source = null;

    on.source = this;
	this.scheduler.schedule(this);
}

SubscribeOn.prototype = {
    action: function () {
        this.origin._subscribe(this);  
    },
    emit: emitThru,
    end: endThru,
    setState: function (state) {
		this.source ? this.source.setState(state) : this.scheduler.setState(state);
    }
}