+++
title = "Functional data structures in JavaScript with Mori"
date = 2013-11-04
updated = 2013-11-12
path = "2013/11/04/functional-data-structures.html"

[taxonomies]
tags = ["functional programming"]

[extra]
toc_ignore_pattern = "Table of Contents"
revisions = [
    { date = 2013-11-12, message = "Added section on installing Mori." }
]
+++

I have a long-standing desire for a JavaScript library that provides
good implementations of functional data structures.  Recently I found
[Mori][], and I think that it may be just the library that I have been
looking for.  Mori packages data structures from the [Clojure][]
standard library for use in JavaScript code.

<!-- more -->

## Table of Contents

<!-- toc -->

## Functional data structures

A functional data structure (also called a persistent data structure)
has two important qualities: it is immutable and it can be updated by
creating a copy with modifications (copy-on-write).  Creating copies
should be nearly as cheap as modifying a comparable mutable data
structure in place.  This is achieved with structural sharing: pointers
to unchanged portions of a structure are shared between copies so that
memory need only be allocated for changed portions of the data
structure.

A simple example is a [linked list][].  A linked list is an object,
specifically a list node, with a value and a pointer to the next list
node, which points to the next list node.  (Eventually you get to the
end of the list where there is a node that points to the empty list.)
Prepending an element to the front of such a list is a constant-time
operation: you just create a new list element with a pointer to the
start of the existing list.  When lists are immutable there is no need
to actually copy the original list.  Removing an element from the front
of a list is also a constant-time operation: you just return a pointer
to the second element of the list.  Here is [a slightly more-detailed
explanation][immutable linked list].

[linked list]: https://en.wikipedia.org/wiki/Linked_list
[immutable linked list]: http://anorwell.com/index.php?id=61

Lists are just one example.  There are functional implementations of
maps, sets, and other types of structures.

Rich Hickey, the creator Clojure, describes functional data structures
as [decoupling state and time][values and change].  (Also available in
[video form][Are We There Yet].)  The idea is that code that uses
functional data structures is easier to reason about and to verify than
code that uses mutable data structures.

[values and change]: http://clojure.org/state
[Are We There Yet]: http://www.infoq.com/presentations/Are-We-There-Yet-Rich-Hickey

## Clojure, ClojureScript, and Mori

[Clojure][] is a functional language that compiles to JVM bytecode.  It
is a Lisp dialect.  Among Clojure's innovations are implementations of
a number of functional data structures, old and new.  For example, other
Lisps tend to place prime importance on linked lists; but a lot of
Clojure code is based on `PersistentVector`, which supports efficient
random-access operations.

[ClojureScript][] is an alternative Clojure compiler that produces
JavaScript code instead of JVM bytecode.  The team behind ClojureScript
has ported Clojure collections to ClojureScript implementations - which
are therefore within reach of JavaScript code.

[Mori]: http://swannodette.github.io/mori/
[Clojure]: http://clojure.org/
[ClojureScript]: https://github.com/clojure/clojurescript

[Mori][] incorporates the ClojureScript build tool and pulls out just
the standard library data structures.  It builds a JavaScript file that
can be used as a standalone library.  Mori adds some API customizations
to make the Clojure data structures easier to use in JavaScript - such
as helpers to convert between JavaScript arrays and Clojure structures.
Mori also includes a few helpers to make functional programming easier,
like `identity`, `constant`, and `sum` functions.  These are the data
structures provided in the latest version of Mori, v0.2.4:

constructor     | Mori                         | Clojure
--------------- | ---------------------------- | -------------------------------------
`list`          | [Mori docs][list mori]       | [Clojure docs][list clojure]
`vector`        | [Mori docs][vector mori]     | [Clojure docs][vector clojure]
`range`         | [Mori docs][range mori]      | [Clojure docs][range clojure]
`hash_map`      | [Mori docs][hash_map mori]   | [Clojure docs][hash_map clojure]
`array_map`     |                              | [Clojure docs][array_map clojure]
`sorted_map`    |                              | [Clojure docs][sorted_map clojure]
`sorted_map_by` |                              | [Clojure docs][sorted_map_by clojure]
`set`           | [Mori docs][set mori]        | [Clojure docs][set clojure]
`sorted_set`    | [Mori docs][sorted_set mori] | [Clojure docs][sorted_set clojure]
`sorted_set_by` |                              | [Clojure docs][sorted_set_by clojure]

[list mori]: http://swannodette.github.io/mori/#list
[vector mori]: http://swannodette.github.io/mori/#vector
[range mori]: http://swannodette.github.io/mori/#range
[hash_map mori]: http://swannodette.github.io/mori/#hash_map
[set mori]: http://swannodette.github.io/mori/#set
[sorted_set mori]: http://swannodette.github.io/mori/#sorted_set

[list clojure]: http://clojure.org/data_structures#toc13
[vector clojure]: http://clojure.org/data_structures#toc15
[range clojure]: http://clojuredocs.org/clojure_core/clojure.core/range
[hash_map clojure]: http://clojure.org/data_structures#toc17
[sorted_map clojure]: http://clojure.org/data_structures#toc17
[sorted_map_by clojure]: http://clojure.org/data_structures#toc17
[array_map clojure]: http://clojure.org/data_structures#toc21
[set clojure]: http://clojure.org/data_structures#toc22
[sorted_set clojure]: http://clojure.org/data_structures#toc22
[sorted_set_by clojure]: http://clojure.org/data_structures#toc22

All of these data structures are immutable and can be efficiently
updated via copying and structural sharing.

The documentation for Mori is pretty good.  But it does skip over some
of the available data structures and functions.  Since most of the stuff
provided by Mori comes from Clojure, if you cannot find information that
you need in the Mori docs you can also look at the Clojure docs.
I provided links to the Clojure documentation for each data structure
where more detailed descriptions are available.


## Installing and running

To get Mori, install the [npm][] package `mori`.  Then you can require
the module `'mori'` in a [Node.js][] project; or copy the file
`mori.js` from the installed package and drop it into a web browser.

```sh
$ npm install mori
$ cp node_modules/mori/mori.js my_app/public/scripts/
```

[npm]: https://docs.nodejitsu.com/articles/getting-started/npm/what-is-npm

## Examples

Let's take a look at the particular advantages of some of these
structures.

### `vector`

A vector is an ordered, finite sequence that supports efficient
random-access lookups and updates.  Vectors are created using the
[`vector`][vector mori] function from the `'mori'` module.  Any
arguments given to the function become elements of a new vector.  In
[Node.js][] you can import Mori and create a vector like this:

```js
var mori = require('mori');
var v = mori.vector(1, 2, 3);

assert(mori.count(v) === 3);  // `count` gives the length of the vector
assert(mori.first(v) === 1);
```

Mori also works with [AMD][] implementations (such as [RequireJS][]) for
use in browser code:

```js
define(['mori'], function(mori) {
    var v = mori.vector(1, 2, 3);
});
```

[Node.js]: http://nodejs.org/
[AMD]: https://github.com/amdjs/amdjs-api/wiki/AMD
[RequireJS]: http://requirejs.org/

Idiomatic Clojure is not object-oriented.  The convention in Clojure is
that instead of putting methods on objects / values, one defines
functions that take values as arguments.  Those functions are organized
into modules to group related functions together.  This approach makes
a lot of sense when values are mostly immutable; and it avoids name
collisions that sometimes come up in object-oriented code, since names
are scoped by module instead of by object.[^1]

[^1]: You might be wondering how Clojure handles polymorphism, since the convention is to use functions instead of methods.  Clojure has a feature called [protocols][] that permit multiple implementations for functions depending on the type of a given argument.  Elsewhere in the functional world, [Haskell][] and [Scala][] provide a similar, yet more powerful feature, called [type classes][].

[protocols]: http://clojure.org/protocols
[Haskell]: http://www.haskell.org/haskellwiki/Haskell
[Scala]: http://www.scala-lang.org/
[type classes]: http://learnyouahaskell.com/types-and-typeclasses

Since Mori is an adaptation of Clojure code, it uses the same
convention.  Data structures created with Mori do not have methods.
Instead all functionality is provided by functions exported by the
`'mori'` module.  That is why the code here uses expressions like
`mori.count(v)` instead of `v.count()`.

Existing vectors can be modified:

```js
var v1 = mori.vector(1, 2, 3);
var v2 = mori.conj(v1, 4);

assert(String(v2) === '[1 2 3 4]');
assert(String(v1) === '[1 2 3]');  // The original vector is unchanged.
```

`conj` is an idiom that is particular to Clojure.  It inserts one or
more values into a collection.  It behaves differently with different
collection types, using whatever insert strategy is most efficient for
the given collection.[^2]

[^2]: When `conj` is used on a list it prepends elements (like `cons`) because prepending is much cheaper than inserting at other possible positions.  Given a vector `conj` appends values.  Appending is often desired, and appending to a vector is just as efficient as inserting at any other position.  `conj` works on sets and maps too - but in those cases the idea of insertion position is not usually meaningful.


### higher-order functions

Mori provides a number of higher-order functions.  Here is an example
that computes the sum of the even values in a collection:

```js
function even_sum(coll) {
    var evens = mori.filter(mori.is_even, coll);
    var sum   = mori.reduce(mori.sum, 0, evens);
    return sum;
}

assert(even_sum(v2) === 6);
```

Or, borrowing from [an example][group_by] in the Mori documentation, one
might compute a sum for even values and a separate sum for odd values:

[group_by]: http://swannodette.github.io/mori/#group_by

```js
function even_odd_sum(coll) {
    var groups = mori.group_by(function(n) {
        return mori.is_even(n) ? 'even' : 'odd';
    }, coll);
    var evens = mori.get(groups, 'even');
    var odds  = mori.get(groups, 'odd');
    return mori.array_map(
        'even', mori.reduce(mori.sum, 0, evens),
        'odd',  mori.reduce(mori.sum, 0, odds)
    );
}

assert(mori.get(even_odd_sum(v2), 'even') === 6);
assert(mori.get(even_odd_sum(v2), 'odd') === 4);
```

The example above returns a map created with [`array_map`][array_map clojure],
which is a map implementation that works well with a small number of
keys.


### `sorted_set_by`

JavaScript does not have its own set implementation.  (Though it looks
like [one will be introduced][ES6 Set] in ECMAScript 6.)  Sets are
a feature that I often miss.

[ES6 Set]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set

A sorted set is a heavenly blend of a sequence and a set.  Any duplicate
values that are added are ignored, and there is a specific ordering of
elements.  Unlike a list or a vector, ordering is not based on
insertion, but is determined by comparisons between elements.

One possible use for a sorted set is to implement a priority queue.
Consider an example of a calendar application.  `sorted_set_by` takes
a comparison function that is used to to maintain an ordering of added
values.  With the appropriate comparison appointments are added and are
automatically sorted by date:

```js
function Calendar(appts) {
    appts = appts || mori.sorted_set_by(compare_appts);
    var cal = {};

    cal.add = function(appt) {
        var with_appt = mori.conj(appts, appt);
        return Calendar(with_appt);
    };

    cal.upcoming = function(start, n) {
        var futureAppts = return mori.filter(function(a) {
            return a.date >= start;
        }, appts);
        return mori.take(n, futureAppts);
    };

    return cal;
}

// Returns a number that is:
// * positive, if a is larger
// *     zero, if a and b are equal
// * negative, if b is larger
function compare_appts(a, b) {
    if (a.date !== b.date) {
        return a.date - b.date;
    }
    else {
        return (a.title) .localeCompare (b.title);
    }
}
```

Like the underlying set, this calendar implementation is immutable.
When an appointment is added you get a new calendar value.

The comparison function for comparing appointments sorts appointments by
date, and uses title as a secondary sort in case there are appointments
with the same date and time.  The sorted set uses this function to
determine equality as well as ordering; so if it made comparisons using
only the date field then the calendar would not accept multiple
appointments with the same date and time.

Appointments can be added to a calendar and queried in date order:

```js
var my_cal = Calendar().add({
    title: "Portland JavaScript Admirers' Monthly Meeting",
    date:  Date.parse("2013-09-25T19:00-0700")
}).add({
    title: "Code 'n' Splode Monthly Meeting",
    date:  Date.parse("2013-09-24T19:00-0700")
}).add({
    title: "WhereCampPDX 6",
    date:  Date.parse("2013-09-28T09:00-0700")
}).add({
    title: "Synesthesia Bike Tour",
    date:  Date.parse("2013-09-22T15:00-0700")
});

var now = Date.parse("2013-09-20");  // or `new Date()` for the current time
var next_appts = my_cal.upcoming(now, 2);
mori.map(function(a) { return a.title; }, next_appts);
// ("Synesthesia Bike Tour" "Code 'n' Splode Monthly Meeting")
```

Looks good!  Now let's add an undo feature.  In case the user changes
her mind about the last appointment that was added, the undo feature
should recreate the previous state without that appointment.  The
implementation of `Calendar` is the same as before except that the
constructor takes an additional optional argument, the `add` method
passes a reference from one calendar value to the next, and there is
a new `undo` method:

```js
function Calendar(appts, prev_cal) {
    // ...

    cal.add = function(appt) {
        var with_appt = mori.conj(appts, appt);
        return Calendar(with_appt, cal);
    };

    cal.undo = function() {
        return prev_cal || Calendar();
    };

    // ...
}
```

Assuming the same set of appointments, we can use the `undo` method to
step back to a state before the fourth appointment was added:

```js
var my_prev_cal = my_cal.undo();

var next_appts_ = my_prev_cal.upcoming(now, 2);
mori.map(function(a) { return a.title; }, next_appts_);
// ("Code 'n' Splode Monthly Meeting" "Portland JavaScript Admirers' Monthly Meeting")
```

Immutability comes in handy in this scenario.  It is trivial to step
back in time.

Actually because `Calendar` is immutable, you don't necessarily need a special
method to get undo behavior:

```js
function makeCalendar() {
    var cal_0 = Calendar();
    var cal_1 = cal_0.add({
        title: "Portland JavaScript Admirers' Monthly Meeting",
        date:  Date.parse("2013-09-25T19:00-0700")
    });
    var cal_2 = cal_1.add({
        title: "Code 'n' Splode Monthly Meeting",
        date:  Date.parse("2013-09-24T19:00-0700")
    });
    var cal_3 = cal_2.add({
        title: "WhereCampPDX 6",
        date:  Date.parse("2013-09-28T09:00-0700")
    });
    var cal_4 = cal_3.add({
        title: "Synesthesia Bike Tour",
        date:  Date.parse("2013-09-22T15:00-0700")
    });

    var toReturn = cal_4;

    // No wait! Undo!!
    toReturn = cal_3;

    // That was close...
    return toReturn;
}
```

I'm sure that the Synesthesia Bike Tour is a lot of fun.  It's just that
when demonstrating an undo feature, something has to take the fall.
That's just the world that we live in, I suppose.


### `hash_map`

All JavaScript objects are maps.  But those can only use strings as
keys.[^3]  The `hash_map` provided by Mori can use any values as keys.

[^3]: It does look like ECMAScript 6 will add [a Map implementation][ES6 Map] and a [WeakMap][] to the language spec, both of which will take arbitrary objects as keys (only non-primitives in the WeakMap case).  But those implementations will not be immutable!

[ES6 Map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[WeakMap]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap

```js
var mori = require('mori');

var a = { foo: 1 };
var b = { foo: 2 };

var map = mori.hash_map(a, 'first', b, 'second');
assert(mori.get(map, b) === 'second');
```

If you use plain JavaScript objects as keys they will be compared by
reference identity.  If you use Mori data structures as keys they will
be compared by value using equality comparisons provided by
ClojureScript.

Mori maps are immutable; so there is never a need to create defensive
copies.  An update operation produces a new map.

```js
var empty = mori.hash_map();
var m1 = mori.assoc(empty, 'foo', 1);
var m2 = mori.assoc(m1, 'bar', 2, 'nao', 3);
var m3 = mori.dissoc(m2, 'foo');

assert(mori.get(m2, 'foo') === 1);
assert(mori.get(m2, 'bar') === 2);
assert(mori.get(m3, 'foo') === null);
```

The function `assoc` adds any number key-value pairs to a map; and
`dissoc` removes keys.

All of this also applies to `array_map`, `sorted_map`, and
`sorted_map_by`.  See [Different map and set implementations][impls]
below for information about those.

[impls]: #different-map-and-set-implementations

There is a common pattern in JavaScript of passing options objects to
constructors to avoid having functions that take zillions of arguments.
It is also common to have a set of default values for certain options.
So code like this is pretty typical:

```js
var opts = _.extend({}, options, defaults);
```

I usually put in an empty object as the first argument to the Underscore
[`_.extend`][extend] call so that I get a new object instead of modifying the
given options object in place.  Modifying the options object could cause
problems if it is reused somewhere outside of my constructor.  An
alternative to the defensive copy could be to use immutable Mori maps:

[extend]: http://underscorejs.org/#extend

```js
function MyFeature(options) {
    var opts = mori.into(MyFeature.defaults, mori.js_to_clj(options));

    this.getPosition = function() {
        return mori.get(opts, 'position');
    };

    this.getDestroyOnClose = function() {
        return mori.get(opts, 'destroyOnClose');
    };
}

MyFeature.defaults = mori.into(mori.hash_map(), mori.js_to_clj({
    destroyOnClose: true,
    position: 'below'
    // etc...
}));

var feat = new MyFeature({ position: 'above' });
assert(feat.getPosition() === 'above');
```

The function `mori.into(coll, from)` adds all of the members of `from`
into a copy of `coll`.  Both `from` and `coll` can by any Mori
collection.

That does still involve copying the input `options` object into a new
Mori map.  It is also possible to provide a Mori sequence as input to
start with - `js_to_clj` will accept either a plain JavaScript object or
a Mori collection:

```js
var feat_ = new MyFeature(mori.hash_map(
    'position',       'above',
    'destroyOnClose', true
));
```

There is probably no performance gain from using Mori in this situation.
It is unlikely to matter anyway, since the structures involved are
small.  In situations with larger data structures, or where data is
copied many times in a loop, Mori's ability to create copies faster
using less memory could make a difference.

But in my opinion applying immutability consistently - even where there
are no significant performance gains - can simplify things.


## Apples to apples

The transformations that are available in Mori - `map`, `filter`, etc. -
return lazy sequences no matter what the type of the input collection
is.  (See [Laziness][] below for an explanation of what laziness is).
This is advantageous because the other collection implementations are
not lazy.  But what if you want to do something like create a new set
based on an existing set?  The answer is that you feed a lazy sequence
into a new empty collection using the appropriate constructor or the
`into` function, which dumps all of the content from one collection into
another:

[Laziness]: #laziness

```js
var s_1 = mori.set([5, 4, 3, 2, 1]);
var seq = mori.map(function(e) { return Math.pow(e, 2); }, s_1);

var s_2 = mori.set(seq);
console.log(s_2);

// Outputs:
// > #{25 16 9 4 1}

var empty_s = mori.sorted_set_by(function(a, b) { return a - b; });
var s_3     = mori.into(empty_s, seq);
console.log(s_3);

// Outputs:
// > #{1 4 9 16 25}
```

Applying `map` to the first set is lazy - but building the second set
with `into` is not.  So a good practice is to avoid building non-lazy
collection until the last possible moment.

An odd quirk in Mori is that the `set` constructor takes a collection
argument, but most of the other constructors take individual values or
key-value pairs.  The `into` function behaves more consistently across
data structure implementations.

You might want to write transformations that are polymorphic - that can
operate on any type of collection and that return a collection of the
same type.  To do that use `mori.empty(coll)` to get an empty version of
a given collection.  This makes it possible to build a new collection
without having to know which constructor was used to create the
original.

Here is a function that removes `null` values from any Mori collection
and that returns a collection of the same type:

```js
function compact(coll) {
    return mori.into(mori.empty(coll), mori.filter(function(elem) {
        var value = mori.is_map(coll) ? mori.last(elem) : elem;
        return value !== null;
    }, coll));
}
```

If the collection given is a map then the value of `elem` in the filter
callback will be a key-value pair.  So `compact` includes an `is_map`
check and extracts the value from that key-value pair if a map is given.

A nice advantage of `empty` is that if you use it on a `sorted_set_by`
or on a `sorted_map_by`, the new collection will inherit the same
comparison function that the original uses.


## Mori pairs well with Bacon

In a previous post, [Functional Reactive Programming in
JavaScript][FRP], I wrote about functional reactive programming (FRP)
using [Bacon.js][] and [RxJS][].  A typical assumption in FRP code is
that values contained in events and properties will never be updated in
place.  The immutable data structures that Mori provides are a perfect
fit.

[FRP]: /2013/05/22/functional-reactive-programming-in-javascript.html
[Bacon.js]: https://github.com/raimohanska/bacon.js
[RxJS]: https://github.com/Reactive-Extensions/RxJS


## List versus Vector

Linked lists are nice and simple - but become less appealing when it
becomes desirable to access elements at arbitrary positions in
a sequence, to append elements to the end of a sequence, or to update
elements at arbitrary indexes.  The running time for all of these
operations on lists is linear, and the append and update operations
require creating a full copy of the list up to the changed position.

Clojure's PersistentVector is a sequence, like a list.  But
under-the-hood it is implemented as a tree with 32-way branching.  That
means that any vector index can be looked up in O(log_32 n) time.
Appending and updating arbitrary elements also takes place in
logarithmic time.  For more details read [Understanding Clojure's
PersistentVector implementation][PersistentVector].

[PersistentVector]: http://web.archive.org/web/20130119231848/http://blog.higher-order.net/2009/02/01/understanding-clojures-persistentvector-implementation/

Sequences that are implemented as mutable arrays of contiguous memory
support constant-time lookups and modification (not including array
resizing when array length grows).  If O(log_32 n) does not seem
appealing in comparison, consider that if you are using 32-bit integers
as keys:

```js
var max_int = Math.pow(2, 32);
var log_32  = function(n) { return Math.log(n) / Math.log(32); };
assert( log_32(max_int) < 7 );
```

Which means that your keyspace will run out before your vector's tree
becomes more than 7 layers deep.  Up to that point operations will be
O(7) or faster.

If your keys are JavaScript numbers, which are 64-bit floating point
values, the largest integer that you can count up to without skipping
any numbers is `Math.pow(2, 53)`.  The logarithm of that number is also
small:

    assert( log_32(Math.pow(2, 53)) < 11 );

The `hash_map` and `set` implementations in Mori are also implemented as
trees with 32-way branching.  The sorted map and set structures are
implemented as binary trees.


## Equality, ordering, and hashing

Map and set lookups are based on either hashing or ordering comparisons,
depending on the implementation.  JavaScript does not have built-in hash
functions - at least not that are accessible to library code.  It also
does not have defined ordering or equality for most non-primitive
values.  So Mori uses its own functions, which it gets from
ClojureScript.

### hash

Every Mori value has a hash that identifies its content:

```js
var v = mori.vector('foo', 1);
assert( mori.hash(v) === -1634041171 );
```

If a value is recreated with the same content, it has the same hash:

```js
var v2 = mori.vector('foo', 1);
assert( mori.hash(v2) === mori.hash(v) );
```

Mori's hash function delegates to a specific hash algorithm for each of
its data structures, which are ultimately based on internal algorithms
that Mori uses to compute hashes for primitive JavaScript values:

```js
assert( mori.hash(2)         === 2      );
assert( mori.hash("2")       === 50     );
assert( mori.hash("foo")     === 101574 );
assert( mori.hash(true)      === 1      );
assert( mori.hash(false)     === 0      );
assert( mori.hash(null)      === 0      );
assert( mori.hash(undefined) === 0      );
```

Since Mori also accommodates arbitrary JavaScript values as map keys and
set values, it also has a scheme for assigning hash values to other
JavaScript objects.

```js
var obj = { foo: 1 };
assert( mori.hash(obj) === 1 );
```

It seems that Mori has a monotonically increasing counter for object
hash values.  The first object that it computes a hash for gets the
value `1`; the second object gets `2`, and so on.  To keep track of
which object got which hash value, it stores the value on the object
itself:

```js
Object.keys(obj);
//> [ 'foo', 'closure_uid_335348264' ]
obj.closure_uid_335348264;
//> 1
```

There are obvious hash-collision issues between non-Mori objects,
numbers, and `true`.  But Mori data structures can handle hash
collisions.  If a collection uses all of those types as keys it could
end up with one hash bucket with three entries.

### equals

Mori has its own equals function, which also comes from ClojureScript.
As with hash, any two mori values that have the same content are
considered to be equal:

```js
assert( mori.equals(v, v2) );
```

It works on primitive JavaScript values:

```js
assert( mori.equals(2, 2) );
```

When applied to non-Mori JavaScript objects, `equals` works the same way
that the built-in `===` function does:

```js
var obj_1 = { bar: 1 };
var obj_2 = { bar: 1 };
assert( !mori.equals(obj_1, obj_2) );
assert( mori.equals(obj_1, obj_1) );
```

### compare

ClojureScript has a compare function, which Mori uses in its sorted data
structure implementations.  Mori does not export the compare function.
The function defines an ordering for Mori values and for primitive
JavaScript values - but not for other JavaScript objects.  So if you
want to put non-Mori objects into a sorted structure you will have to
use an implementation that accepts a custom comparison function.


## Different map and set implementations

`hash_map` and `set` use a hash function for lookups and have O(log_32
n) lookup times; the sorted variants use comparison functions for
lookups and have O(log_2 n) lookup times; and `array_map` is just an
array of key-value pairs, so it uses only an equality function for
lookups and has O(n) lookup times.

constructor     | insert time   | lookup time   | how keys/values are checked
--------------- | ------------: | ------------: | ---------------------------
`hash_map`      | log_32&nbsp;n | log_32&nbsp;n | `hash(key) === hash(target_key) && equals(key, target_key)`
`array_map`     | 1             | n             | `equals(key, target_key)`
`sorted_map`    | log_2&nbsp;n  | log_2&nbsp;n  | `compare(key, target_key)`
`sorted_map_by` | log_2&nbsp;n  | log_2&nbsp;n  | like `sorted_map` with a user-supplied comparison function
`set`           | log_32&nbsp;n | log_32&nbsp;n | `hash(val) === hash(target_val) && equals(val, target_val)`
`sorted_set`    | log_2&nbsp;n  | log_2&nbsp;n  | `compare(val, target_val)`
`sorted_set_by` | log_2&nbsp;n  | log_2&nbsp;n  | like `sorted_set` with a user-supplied comparison function

`hash` and `equals` are provided by Mori.  `compare` is part of
ClojureScript, but is not exported by Mori.

Note that the sorted structures do not perform `equals` checks - instead
they rely on a comparison function to determine whether values or keys
are the same.  On the other hand, the hash structures do perform
`equals` checks to handle hash collisions.

`array_map` is unique among the map and set implementations in that it
preserves the order of keys and values based on the order in which they
were inserted.  If a value is inserted into an `array_map` and then the
map is converted to a sequence (for example, using `mori.seq(m)`) then
the last key-value pair inserted appears last in the resulting sequence.
The ordering in a new `array_map` is determined by the order of
key-value pairs given to the constructor.

`array_map` is a good choice for small maps that are accessed
frequently.  The linear lookup time looks slower than other map
implementations on paper.  But there is no hashing involved and only
simple vector traversal - so each of those n steps is faster than each
of the log_32 n steps in a `hash_map` lookup.

The `array_map` implementation has an internal notion of the upper limit
on an efficient size.  Once the map reaches that threshold, inserting
another key-value pair produces a `hash_map` instead of a larger
[`array_map`][ArrayMaps].

[ArrayMaps]: https://clojure.org/reference/data_structures#ArrayMaps

The information here on implementations and running times mainly comes
from [An In-Depth Look at Clojure Collections][infoq].

[infoq]: http://www.infoq.com/articles/in-depth-look-clojure-collections


## Laziness

Many of the functions provided by Mori return what is called a lazy
sequence.  Being a sequence this is like a list and can be transformed
using functions like `map`, `filter`, and `reduce`.  What makes a
sequence lazy is that it is not actually computed right away.
Evaluation is deferred until some non-lazy function accesses one or more
elements of the transformed sequence.  At that point Mori computes and
memoizes transformations.

```js
// Sets, maps, vectors, and lists are actually not lazy.  But ranges
// are.
var s = mori.sorted_set_by(function(a, b) {
    console.log('comparing', a, b);
    return a - b;
}, 5, 4, 3, 2, 1);

// Outputs approximately n * log_2(n) lines:
// > comparing 4 5
// > comparing 3 5
// > comparing 3 4
// > comparing 2 4
// > comparing 2 3
// > comparing 1 4
// > comparing 1 3
// > comparing 1 2

// `map` returns a lazy sequence of transformed values.
var seq = mori.map(function(e) {
    console.log('processed:', e);
    return 0 - e;
}, s);

// No output yet.

// Getting the string representation of a collection or applying a
// non-lazy function like `reduce` forces evaluation.
console.log(seq);

// Outputs:
// > processed: 1
// > processed: 2
// > processed: 3
// > processed: 4
// > processed: 5
// > (-1 -2 -3 -4 -5)
```

The results of a lazy evaluation are cached.  If the same sequence is
forced again the map function will not be called a second time:

```js
console.log(seq);

// Outputs:
// > (-1 -2 -3 -4 -5)
```

Mori runs just enough deferred computation to get whatever result is
needed.  It is often not necessary to compute an entire lazy sequence:

```js
var seq_ = mori.map(function(e) {
    console.log('processed:', e);
    return e * 2;
}, s);

// `take` returns a lazy sequence of the first n members of a
// collection.
var seq__ = mori.take(2, seq_);

console.log(seq__);

// Outputs:
// > processed: 1
// > processed: 2
// > (2 4)
```

In the above case there is an intermediate lazy sequence that
theoretically contains five values: the results of doubling values in
the original set.  But only the first two values in that sequence are
needed.  The other three are never computed.

Laziness means that it is possible to create infinite sequences without
needing unlimited memory or time:

```js
// With no arguments, `range` returns a lazy sequence of all whole
// numbers from zero up.
var non_neg_ints = mori.range();

// Dropping the first element, zero, results in a sequence of all of
// the natural numbers.
var nats = mori.drop(1, non_neg_ints);

// Let's take just the powers of 2.
var log_2    = function(n) { return Math.log(n) / Math.LN2; };
var is_pow_2 = function(n) { return log_2(n) % 1 === 0; };
var pows_2   = mori.filter(is_pow_2, nats);

// What are the first 10 powers of 2?
console.log(
    mori.take(10, pows_2)
);

// Outputs:
// > (1 2 4 8 16 32 64 128 256 512)

// What is the 20th power of 2?
console.log(
    mori.nth(pows_2, 20)
);

// Outputs:
// > 1048576
```

If you try this out in a REPL, such as node, be aware that when an
expression is entered a JavaScript REPL will usually try to print the
value of that expression, which has the effect of forcing evaluation of
lazy sequences.  If you enter a lazy sequence you will end up in an
infinite loop:

```js
non_neg_ints = mori.range();

// Loops for a long time, then runs out of memory.
```

The solution to this is to be careful to assign infinite sequences in
`var` statements.  That prevents the REPL from trying to print the
sequence:

```js
var non_neg_ints = mori.range();

// Prints 'undefined', all is well.
```

Powers of two are actually a terrible example of a lazy sequence: any
element in that sequence could be calculated more quickly using
`Math.pow()`.  It just happens that powers of two are simple to
demonstrate.

Algorithms that really do benefit from infinite sequences are those
where computation of any element requires references to earlier values
in the sequence.  A good example is computing [Fibonacci numbers][].

[Fibonacci numbers]: https://en.wikipedia.org/wiki/Fibonacci_number

```js
function fibs() {
    var pairs = mori.iterate(function(pair) {
        var x = pair[0], y = pair[1];
        return [y, x + y];
    }, [0, 1]);
    return mori.map(mori.first, pairs);
}
```

This implementation uses the [`iterate`][iterate] function, which takes
a function and an initial value.  It creates an infinite sequence by
repeatedly applying the given function.  The given starting value is
`[0, 1]`, and each invocation of the given function combines the second
value in the previous pair with the sum of the values in the previous
pair; so the resulting sequence is: `([0, 1] [1, 1] [1, 2] [2, 3] [3, 5]
...)`.  The [`map`][map] function is applied to that, taking the first
value from each pair.

[iterate]: http://swannodette.github.io/mori/#iterate
[map]: http://swannodette.github.io/mori/#map

Using this sequence allows us to ask the questions:

```js
// What are the first ten values in the Fibonacci sequence?
console.log(
    mori.take(10, fibs())
);

// Outputs:
// > (0 1 1 2 3 5 8 13 21 34)

// What is the 100th number in the Fibonacci sequence?
console.log(
    mori.nth(fibs(), 100)
);

// Outputs:
// > 354224848179262000000

// What is the sum of the first 4 Fibonacci numbers that are also
// powers of 2?
console.log(
    mori.reduce(mori.sum, 0, mori.take(4, mori.filter(is_pow_2, fibs())))
);

// Outputs:
// > 12

// What is the 5th Fibonacci number that is also a power of 2?
console.log(
    mori.nth(mori.filter(is_pow_2, fibs()), 4)
);

// My computer runs for a long time with no apparent answer...
```

A lazy sequence might also contain lines from a large file or chunks of
data flowing into a network server.  At the time of this writing I was
not able to write a program that traversed a long sequence in constant
space.  But I have verified that this is possible in JavaScript.  I may
find a solution and post an update later.


### Efficiency

In procedural code running a sequence through multiple operations that
apply to every element would result in multiple iterations of the entire
sequence.  Because Mori operates lazily it can potentially collect
transformations for each element and apply them in a single pass:

```js
var seq_1 = mori.map(function(e) {
    console.log('first pass:', e);
    return e;
}, s);
var seq_2 = mori.map(function(e) {
    console.log('second pass:', e);
    return e;
}, seq_1);

console.log(
    mori.take(2, seq_2);
);

// Outputs:
// > first pass: 1
// > second pass: 1
// > first pass: 2
// > second pass: 2
// > (1 2)
```

If applying `map` to a collection twice resulted in two iterations we
would expect to see:

```js
// > first pass: 1
// > first pass: 2
// > second pass: 1
// > second pass: 2
```

The fact that the first pass and second pass are interleaved suggests
that Mori collects transformations and applies all transformations to
a value at once.  This is the advantage of lazy evaluation: it
encourages writing code in a way that makes most logical sense rather
than thinking about performance.  You can write what are logically many
iterations over a collection and the library will rearrange computations
to minimize the actual work that is done.

{{ revisions() }}
