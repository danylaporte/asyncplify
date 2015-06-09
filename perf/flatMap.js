var asyncplify = require('../dist/asyncplify');
var rx = require('rx');

function noop() { }

suite('flatMap', function () {
    test('asyncplify', function (done) {
        asyncplify
            .range(10)
            .flatMap(function (v) { return asyncplify.value(v + 1); })
			.subscribe({ end: done });
    });

    test('rx', function (done) {
        rx.Observable
            .range(0, 10)
            .flatMap(function (v) { return rx.Observable.return(v + 1); })
			.subscribe(noop, noop, done);
    });
});