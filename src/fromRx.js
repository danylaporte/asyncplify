Asyncplify.fromRx = function (obs) {
    return new Asyncplify(FromRx, obs);
}

function FromRx(obs, on) {
    this.on = on;
    on.source = this;
	this.subscription = obs.subscribe(this.next.bind(this), this.error.bind(this), this.completed.bind(this));
}

FromRx.prototype = {
	completed: function () {
		this.on.end(null);	
	},
	error: function (err) {
		this.on.end(err);	
	},
	next: function (v) {
		this.on.emit(v);
	},
    setState: function (state) {
		if (state === CLOSED) {
			this.subscription.dispose();
		}
	}
}