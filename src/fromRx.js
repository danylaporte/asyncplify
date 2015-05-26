Asyncplify.fromRx = function (obs) {
    return new Asyncplify(FromRx, obs);
};

function FromRx(obs, on) {
    on.source = this;

	function next(value) { on.emit(value); }
	function error(err) { on.end(err); }
	function completed() { on.end(null); }

	this.subscription = obs.subscribe(next, error, completed);
}

FromRx.prototype.setState = function (state) {
	if (state === CLOSED) this.subscription.dispose();
};