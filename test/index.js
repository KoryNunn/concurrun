var test = require('tape');
var concurrencyLimit = require('../');

function asyncTask(state, result, callback){
    if(typeof result === 'function'){
        callback = result;
        result = null;
    }

    state.count = state.count || 0;
    state.count++;

    setTimeout(function(){
        state.count--;
        if(result instanceof Error){
            return callback(result);
        }
        callback(null, result);
    }, 10);
}

async function asyncPromiseTask(state, result){
    state.count = state.count || 0;
    state.count++;

    return new Promise((resolve, reject) => 
        setTimeout(function(){
            state.count--;
            if(result instanceof Error){
                return reject(result);
            }
            resolve(result);
        }, 10)
    );
}

test('1 task 1 at a time', function(t){
    t.plan(1);

    var state = { count: 0 };
    var limit = concurrencyLimit(1);

    limit(asyncTask)(state, function(){
        t.pass();
    });
});

test('Promises - 1 task 1 at a time', function(t){
    t.plan(1);

    var state = { count: 0 };
    var limit = concurrencyLimit(1);

    limit.promise(asyncPromiseTask)(state).then(function(){
        t.pass();
    });
});

test('10 tasks 1 at a time', function(t){
    t.plan(20);

    var state = { count: 0 };
    var limit = concurrencyLimit(1);

    for(var i = 0; i < 10; i++){
        limit(asyncTask)(state, function(){
            t.pass();
        });

        t.equal(state.count, 1);
    }
});

test('Promises - 10 tasks 1 at a time', function(t){
    t.plan(20);

    var state = { count: 0 };
    var limit = concurrencyLimit(1);

    for(var i = 0; i < 10; i++){
        limit.promise(asyncPromiseTask)(state).then(function(){
            t.pass();
        });

        t.equal(state.count, 1);
    }
});

test('10 tasks 5 at a time', function(t){
    t.plan(20);

    var state = { count: 0 };
    var limit = concurrencyLimit(5);

    for(var i = 0; i < 10; i++){
        limit(asyncTask)(state, function(){
            t.pass();
        });

        t.equal(state.count, Math.min(i + 1, 5));
    }
});

test('10 tasks Infinit concurrency', function(t){
    t.plan(20);

    var state = { count: 0 };
    var limit = concurrencyLimit(Infinity);

    for(var i = 0; i < 10; i++){
        limit(asyncTask)(state, function(){
            t.pass();
        });

        t.equal(state.count, i + 1);
    }
});

test('Invalid rate (NaN) throws', function(t){
    t.plan(1);

    t.throws(function(){
        concurrencyLimit(NaN);
    });
});

test('Invalid rate (non Number) throws', function(t){
    t.plan(1);

    t.throws(function(){
        concurrencyLimit('foo');
    });
});

test('passes results correctly', function(t){
    t.plan(2);

    var state = { count: 0 };
    var limit = concurrencyLimit(1);

    limit(asyncTask)(state, 'success', function(error, result){
        t.notOk(error);
        t.equal(result, 'success');
    });
});

test('Promises - passes results correctly', function(t){
    t.plan(1);

    var state = { count: 0 };
    var limit = concurrencyLimit(1);

    limit.promise(asyncPromiseTask)(state, 'success').then(function(result){
        t.equal(result, 'success');
    });
});

test('passes errors correctly', function(t){
    t.plan(2);

    var state = { count: 0 };
    var limit = concurrencyLimit(1);

    limit(asyncTask)(state, new Error('fail'), function(error, result){
        t.equal(error.message, 'fail');
        t.notOk(result);
    });
});

test('passes errors correctly- promise', function(t){
    t.plan(1);

    var state = { count: 0 };
    var limit = concurrencyLimit(1);

    limit.promise(asyncPromiseTask)(state, new Error('fail')).catch(error => {
        t.equal(error.message, 'fail');
    });
});

test('dynamic limit', function(t){
    t.plan(100);

    var state = { count: 0 };

    var limit = concurrencyLimit(function(info, callback){
        callback(null, Math.max(info.complete, 1));
    });

    function addTask(count){
        if(count > 0){
            limit(asyncTask)(state, function(){
                t.pass();
            });

            addTask(count - 1);
        }
    }

    addTask(100);
});

test('Promises - dynamic limit', function(t){
    t.plan(100);

    var state = { count: 0 };

    var limit = concurrencyLimit(function(info, callback){
        callback(null, Math.max(info.complete, 1));
    });

    function addTask(count){
        if(count > 0){
            limit.promise(asyncPromiseTask)(state).then(function(){
                t.pass();
            });

            addTask(count - 1);
        }
    }

    addTask(100);
});