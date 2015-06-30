Asyncplify.prototype.subscribe = function (options) {
    return new Subscribe(options, this);
};

function Subscribe(options, source) {
    if (options && options.emit)
        this.emit = options.emit;
    else if (typeof options === 'function')
        this.emit = options;
        
    if (options && options.end)
        this.end = options.end;
        
    this.source = null;
    source._subscribe(this);
}

Subscribe.prototype = {
    close: function () {
        if (this.source) {
            this.source.close();
            this.source = null;
        }
    },
    emit: function () {
    },
    end: function () {
    }
};