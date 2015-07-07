Asyncplify.fromRx = function (obs) {
    return new Asyncplify(FromRx, obs);
};

function FromRx(obs, sink) {
    sink.source = this;

	function next(value) { sink.emit(value); }
	function error(err) { sink.end(err); }
	function completed() { sink.end(null); }

	this.subscription = obs.subscribe(next, error, completed);
}

FromRx.prototype.close = function () {
	this.subscription.dispose();
};