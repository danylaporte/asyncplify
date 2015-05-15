var asyncplify = require('../dist/asyncplify');
var rx = require('rx');

suite('value', function () {

    test('asyncplify', function (done) {
        asyncplify.value(10).subscribe(done);
    });

    test('rx', function (done) {
        rx.Observable.return(10).subscribe(done);
    });
});