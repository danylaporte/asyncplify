Robinet.subject = function () {
    var r = new Robinet(Subject);
    r.subjects = [];
    r.emit = subjectEmit;
    r.end = subjectEnd;
    r._src = r;
    return r;
}

function subjectEmit(value) {
    for (var i = 0; i < this.subjects.length; i++) {
        this.subjects[i].emit(value);
    }
}

function subjectEnd(err) {
    for (var i = 0; i < this.subjects.length; i++) {
         this.subjects[i].end(err);
    }
}

function Subject(_, on, source) {
    this.on = on;
    this.source = source;
    this.state = RUNNING;
    this.endCalled = false;
    this.err = null;

    on.source = this;
    source.subjects.push(this);
}

Subject.prototype = {
    do: function () {
        if (this.endCalled) {
            this.state = CLOSED;
            this.on.end(this.err);
        }
    },
    emit: function (value) {
        this.state === RUNNING && this.on.emit(value);
    },
    end: function (err) {
        if (this.state === RUNNING) {
            this.state = CLOSED;
            this.on.end(err);
        } else if (this.state === PAUSED) {
            this.endCalled = true;
            this.err = err;
        }
    },
    setState: function (state) {
        if (this.state !== CLOSED && this.state !== state) {
            this.state = state;
            state === CLOSED && removeItem(this.source.subjects, this);
            state === RUNNING && this.do();
        }
    }
}
