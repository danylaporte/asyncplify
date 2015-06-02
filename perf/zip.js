var asyncplify = require('../dist/asyncplify');
var rx = require('rx');

function noop() { }

suite('zip', function () {
    test('asyncplify', function (done) {
        var r1 = asyncplify.range(10);
		var r2 = asyncplify.range(10);

		asyncplify
			.zip([r1, r2], function (a, b) { return a + b; })
			.subscribe({ end: done });
    });

    test('rx', function (done) {
		var r1 = rx.Observable.range(0, 10);
		var r2 = rx.Observable.range(0, 10);

		rx.Observable
			.zip(r1, r2, function (a, b) { return a + b; })
			.subscribe(noop, noop, done);
    });
});