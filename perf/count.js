var asyncplify = require('../dist/asyncplify');
var rx = require('rx');

suite('count', function () {
    test('asyncplify', function (done) {
        asyncplify.range(100).count().subscribe(done);
    });

    test('rx', function (done) {
        rx.Observable.range(0, 100).count().subscribe(done);
    });
});