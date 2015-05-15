var asyncplify = require('../dist/asyncplify');
var rx = require('rx');

function noop() { }

suite('combineLatest', function () {
    test('asyncplify', function (done) {
        var r1 = asyncplify.range(100);
		var r2 = asyncplify.range(50);

		asyncplify
			.combineLatest({
				items: [r1, r2],
				mapper: function (a, b) {
					return { a: a, b: b };
				}
			})
			.subscribe({
				end: done
			});
    });

    test('rx', function (done) {
		var r1 = rx.Observable.range(0, 100);
		var r2 = rx.Observable.range(0, 50);

		rx.Observable
			.combineLatest(
				[r1, r2],
				function (a, b) {
					return { a: a, b: b };
				}
			)
			.subscribe(noop, noop, done);
    });
});