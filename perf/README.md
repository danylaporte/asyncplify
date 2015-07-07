#Performance
Stats are provided by [arewefaster](https://github.com/danylaporte/arewefaster)


###combineLatest

|name|time ± error margin|
|---|-----|
|asyncplify|74,888 ops ± 4.99%|
|rx|7,699 ops ± 4.99%|
asyncplify is 9.73x faster than rx

###count

|name|time ± error margin|
|---|-----|
|asyncplify|736,607 ops ± 4.99%|
|rx|14,406 ops ± 4.99%|
asyncplify is 51.13x faster than rx

###filter/map

|name|time ± error margin|
|---|-----|
|asyncplify|917,300 ops ± 4.99%|
|transducers-js|403,254 ops ± 4.99%|
|rx|83,091 ops ± 4.99%|
asyncplify is 2.27x faster than transducers-js

###flatMap

|name|time ± error margin|
|---|-----|
|asyncplify|265,916 ops ± 4.99%|
|rx|33,940 ops ± 4.99%|
asyncplify is 7.83x faster than rx

###fromNode

|name|time ± error margin|
|---|-----|
|asyncplify|449,013 ops ± 4.99%|
|bluebird|211,672 ops ± 4.99%|
|rx|55,729 ops ± 11.02%|
asyncplify is 2.12x faster than bluebird

###merge

|name|time ± error margin|
|---|-----|
|asyncplify|455,834 ops ± 7.35%|
|rx|7,235 ops ± 4.99%|
asyncplify is 63.01x faster than rx

###sum

|name|time ± error margin|
|---|-----|
|asyncplify|674,116 ops ± 4.99%|
|rx|12,099 ops ± 4.99%|
asyncplify is 55.72x faster than rx

###toArray

|name|time ± error margin|
|---|-----|
|asyncplify|831,230 ops ± 4.99%|
|rx|151,680 ops ± 4.99%|
asyncplify is 5.48x faster than rx

###value

|name|time ± error margin|
|---|-----|
|asyncplify|1,045,377 ops ± 4.99%|
|rx|516,433 ops ± 4.99%|
asyncplify is 2.02x faster than rx

###zip

|name|time ± error margin|
|---|-----|
|asyncplify|165,731 ops ± 4.99%|
|rx|25,120 ops ± 4.99%|
asyncplify is 6.6x faster than rx
