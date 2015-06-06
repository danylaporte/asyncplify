var asyncplify = require('../dist/asyncplify');
var rx = require('rx');

function noop() { }

suite('merge', function () {
    test('asyncplify', function (done) {
        var r1 = asyncplify.range(100);
		var r2 = asyncplify.range(50);

		asyncplify
			.merge([r1, r2])
			.subscribe({ end: done });
    });

    test('rx', function (done) {
		var r1 = rx.Observable.range(0, 100);
		var r2 = rx.Observable.range(0, 50);

		rx.Observable
			.merge(r1, r2)
			.subscribe(noop, noop, done);
    });
});