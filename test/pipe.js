var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('pipe', function() {

    function customMapper(mapper) {
        return function (self) {
            return self.map(mapper)
        }
    }

    var source = asyncplify
        .range(3)
        .pipe(customMapper(function (v) {
            return v + 1
        }));

    common.itShouldEmitValues(source, [1, 2, 3]);
})
