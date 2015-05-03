Asyncplify.prototype.groupBy = function(options) {
    return new Asyncplify(GroupBy, options, this)
}

function GroupBy(options, on, source) {
    this.elementSelector = options && options.elementSelector || identity;
    this.keySelector = typeof options === 'function' ? options : (options && options.keySelector || identity);
    this.on = on;
    this.store = options && options.store || {};
    this.source = null;

    on.source = this;
    source._subscribe(this);
}

GroupBy.prototype = {
    emit: function (v) {
        var key = this.keySelector(v);
        var group = this.store[key];

        if (!group) {
            group = this.store[key] = Asyncplify.subject()
            group.key = key;
            this.on.emit(group);
        }

        group.emit(this.elementSelector(v));
    },
    end: function (err) {
        for (var k in this.store) {
            this.store[k].end(null);
        }

        this.on.end(err);
    }
}
