Asyncplify.prototype.defaultIfEmpty = function (value) {
    return new Asyncplify(DefaultIfEmpty, value, this);
}

function DefaultIfEmpty(value, on, source) {
    this.hasValue = false;
    this.on = on;
    this.source = null;
	this.value = value;

    on.source = this;
    source._subscribe(this);
}

DefaultIfEmpty.prototype = {
    emit: function (value) {
		this.hasValue = true;
        this.on.emit(value);
    },
    end: function (err) {
		!err && !this.hasValue && this.on.emit(this.value);
		this.on.end(err);
	},
    setState: setStateThru
}