Asyncplify.fromArray = function (array) {
    return new Asyncplify(FromArray, array);
};

function FromArray(array, sink) {
    this.array = array;
    this.i = 0;
    this.isProcessing = false;
    this.sink = sink;
    this.sink.source = this;
    this.state = Asyncplify.states.RUNNING;
    
    this.emitItems();
}

FromArray.prototype = {
    emitItems: function () {
        this.isProcessing = true;
        
        while (this.i < this.array.length && this.state === Asyncplify.states.RUNNING)
            this.sink.emit(this.array[this.i++]);
            
        if (this.state === Asyncplify.states.RUNNING) {
            this.array = [];
            this.state = Asyncplify.states.CLOSED;
            this.sink.end(null);
        }
        
        this.isProcessing = false;
    },
    setState: function (state) {
        if (this.state !== Asyncplify.states.CLOSED && this.state !== state) {
            this.state = state;
            if (state === Asyncplify.states.RUNNING && !this.isProcessing) this.emitItems();
        }
    }
};