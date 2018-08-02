# concurrency-limit

Limit the number of concurrent executions of a CPS function

## Usage

```
// Require / setup
var concurrencyLimit = require('concurrency-limit');

var tenAtATime = concurrencyLimit(10);

// Wrap a function

var limitedReadFile = tenAtATime(fs.readFile);

// Call the wrapped function however you want:

for(var i = 0; i < 100; i++){
    limitedReadFile('myFilePath.txt', 'utf8', function(error, file){

    })
}

```