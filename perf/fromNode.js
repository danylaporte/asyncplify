var asyncplify = require('../dist/asyncplify');
var bluebird = require('bluebird');
var rx = require('rx');

function work(cb) {
    process.nextTick(cb);
}

var bluebirdWork = bluebird.promisify(work);
var rxWork = rx.Observable.fromNodeCallback(work);

suite('fromNode', function () {
    test('asyncplify', function (done) {
        asyncplify.fromNode(work).subscribe(done);
    });

    test('bluebird', function (done) {
        bluebirdWork().then(done);
    });

    test('rx', function (done) {
        rxWork().subscribe(done);
    });
});