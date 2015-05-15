var asyncplify = require('../dist/asyncplify');
var common = require('./common');

describe('defaultIfEmpty', function () {
    var source = asyncplify
        .empty()
        .defaultIfEmpty(1);

    common.itShouldClose(source);
    common.itShouldNotProduceAnError(source);
    common.itShouldEndOnce(source);
    common.itShouldEndSync(source);
    common.itShouldEmitValues(source, [1], 'should emit default value on empty');
	
	source = asyncplify
        .range(3)
        .defaultIfEmpty(1);
		
	common.itShouldEmitValues(source, [0, 1, 2], 'should not emit default value on non-empty');
})
