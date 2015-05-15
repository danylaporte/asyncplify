var asyncplify = require('../dist/asyncplify');
var rx = require('rx');

suite('sum', function () {
    test('asyncplify', function (done) {
        asyncplify.range(100).sum().subscribe(done);
    });

    test('rx', function (done) {
        rx.Observable.range(0, 100).sum().subscribe(done);
    });
});