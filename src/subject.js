Asyncplify.subject = function () {
    var r = new Asyncplify(Subject);
    r.subjects = [];
    r.emit = subjectEmit;
    r.end = subjectEnd;
    r._src = r;
    return r;
};

function subjectEmit(value) {
    for (var i = 0; i < this.subjects.length; i++)
        this.subjects[i].emit(value);
}

function subjectEnd(err) {
    var subjects = this.subjects;
    
    this.subjects = [];
    
    for (var i = 0; i < subjects.length; i++)
         subjects[i].end(err);
}

function Subject(_, sink, parent) {
    this.parent = parent;
    this.sink = sink;
    this.sink.source = this;

    parent.subjects.push(this);
}

Subject.prototype = {
    close: function () {
        if (this.parent) removeItem(this.parent.subjects, this);
        this.parent = null;
    },
    emit: function (value) {
        this.sink.emit(value);
    },
    end: function (err) {
        this.parent = null;
        
        var sink = this.sink;
        this.sink = NoopSink.instance;
        sink.end(err);
    }
};