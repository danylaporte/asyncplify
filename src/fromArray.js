Asyncplify.fromArray = function (array) {
    return new Asyncplify(FromArray, array);
};

function FromArray(array, sink) {
    this.sink = sink;
    this.sink.source = this;
    
    for (var i = 0; i < array.length && this.sink; i++)
        this.sink.emit(array[i]);
        
    if (this.sink) this.sink.end(null);
}

FromArray.prototype.close = function () {
    this.sink = null;
};