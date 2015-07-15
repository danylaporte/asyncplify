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
    emit: function (value) {
        this.sink.emit(value);
    },
    end: function (err) {
        this.parent = null;
        this.sink.end(err);
    },
    setState: function (state) {
        if (state === Asyncplify.states.CLOSED && this.parent) {
            removeItem(this.parent.subjects, this);
            this.parent = null;
        }
    }
};