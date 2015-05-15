#Performance
Stats are provided by [arewefaster](https://github.com/danylaporte/arewefaster)


###combineLatest

|name|time ± error margin|
|---|-----|
|asyncplify|0.0106ms ± 4.99%|
|rx|0.2568ms ± 4.99%|
asyncplify is 24.23x faster than rx

###count

|name|time ± error margin|
|---|-----|
|asyncplify|0.0027ms ± 4.99%|

###fromNode

|name|time ± error margin|
|---|-----|
|asyncplify|0.0075ms ± 4.99%|
|bluebird|0.0109ms ± 4.99%|
|rx|0.0307ms ± 11.23%|
asyncplify is 1.45x faster than bluebird

###sum

|name|time ± error margin|
|---|-----|
|asyncplify|0.0027ms ± 8.02%|
|rx|0.1692ms ± 4.99%|
asyncplify is 62.67x faster than rx

###toArray

|name|time ± error margin|
|---|-----|
|asyncplify|0.0024ms ± 4.99%|
|rx|0.0144ms ± 4.99%|
asyncplify is 6x faster than rx

###value

|name|time ± error margin|
|---|-----|
|asyncplify|0.002ms ± 4.99%|
|rx|0.0048ms ± 4.99%|
asyncplify is 2.4x faster than rx
