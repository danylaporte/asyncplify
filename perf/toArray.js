var asyncplify = require('../dist/asyncplify');
var rx = require('rx');

suite('toArray', function () {
    test('asyncplify', function (done) {
        asyncplify.range(4).toArray().subscribe(done);
    });

    test('rx', function (done) {
        rx.Observable.range(0, 4).toArray().subscribe(done);
    });
});