Asyncplify.fromArray = function (array) {
    return new Asyncplify(FromArray, array);
}

function FromArray(array, on) {
    this.array = array;
    this.i = 0;
    this.state = RUNNING;
    this.on = on;

    on.source = this;
    this.do();
}

FromArray.prototype = {
    do: function () {
        while (this.i < this.array.length && this.state === RUNNING) {
            this.on.emit(this.array[this.i++]);
        }
        
        if (this.state === RUNNING) {
            this.state = CLOSED;
            this.on.end(null);
        }
    },
    setState: setState
}
