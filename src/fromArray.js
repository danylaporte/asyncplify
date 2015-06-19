Asyncplify.fromArray = function (array) {
    return new Asyncplify(FromArray, array);
};

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
        try {
            this.doEmit();
        } catch (ex) {
            this.doEnd(ex);
            return;
        }
        
        this.doEnd(null);
    },
    doEmit: function () {
        while (this.i < this.array.length && this.state === RUNNING) {
            this.on.emit(this.array[this.i++]);
        }
    },
    doEnd: function (error) {
        if (this.state === RUNNING) {
            this.state = CLOSED;
            this.on.end(error);
        }
    },
    setState: setState
};