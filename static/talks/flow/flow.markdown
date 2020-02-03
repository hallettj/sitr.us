% Flow: <br> type-checked JavaScript
% Jesse Hallett
% January 28, 2015


~~~~ {.javascript}
/* @flow */
function foo(x) {
  return x * 10;
}
foo('Hello, world!');
~~~~~~~~~~~~~~~~~~~~~~

. . .

    $ flow

    hello.js:5:5,19: string
    This type is incompatible with
      hello.js:3:10,15: number

---

~~~~ {.javascript}
function length(x) {
  return x.length;
}
~~~~~~~~~~~~~~~~~~~~~~

. . .

~~~~ {.javascript}
var total = length('Hello') + length(null);
~~~~~~~~~~~~~~~~~~~~~~

. . .

    Type error: x might be null

---

~~~~ {.javascript}
var fs = require('fs');

fs.write('log.txt', 'an event occurred');
~~~~~~~~~~~~~~~~~~~~~~

</section>
<section class="slide level6" data-transition="none">

~~~~ {.javascript}
var fs = require('fs');

fs.write('log.txt', 'an event occurred');
//       ^          ^ should be a buffer
//       |
//       | should be a file descriptor
~~~~~~~~~~~~~~~~~~~~~~

</section>
<section class="slide level6" data-transition="none">

~~~~ {.javascript}
var fs = require('fs');

fs.open('log.txt', 'a', function(err, fd) {
  fs.write(fd, new Buffer('an event occurred'));
});
~~~~~~~~~~~~~~~~~~~~~~

---

> ...underlying the design of Flow is the assumption that most JavaScript code
> is implicitly statically typed; even though types may not appear anywhere in
> the code, they are in the developer’s mind as a way to reason about the
> correctness of the code. Flow infers those types automatically wherever
> possible, which means that it can find type errors without needing any changes
> to the code at all.

---

> This makes Flow fundamentally different than existing JavaScript type systems
> (such as TypeScript), which make the weaker assumption that most JavaScript
> code is dynamically typed, and that it is up to the developer to express which
> code may be amenable to static typing.

---

~~~~ {.javascript}
function length(x) {
  return x.length;
}

var total = length('Hello') + length(null);
~~~~~~~~~~~~~~~~~~~~~~

    Type error: x might be null

</section>
<section class="slide level6" data-transition="none">

~~~~ {.javascript}
function length(x) {
  if (x) {
    return x.length;
  } else {
    return 0;
  }
}

var total = length('Hello') + length(null);
~~~~~~~~~~~~~~~~~~~~~~

</section>
<section class="slide level6" data-transition="none">

~~~~ {.javascript}
function length(x) {  // x might or might not be null
  if (x) {  // true iff x is not null
    return x.length;  // x is definitely not null here
  } else {
    return 0;
  }
}

var total = length('Hello') + length(null);
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
var o = null;
if (o == null) {
  o = 'hello';
}
print(o.length);
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
function foo(b) { if (b) { return 21; } else { return ''; } }

function bar(b) {
  var x = foo(b);
  var y = foo(b);
  if (typeof x == 'number' && typeof y == 'number') { return x + y; }
  return 0;
}

var n = bar(1) * bar(2);
~~~~~~~~~~~~~~~~~~~~~~

</section>
<section class="slide level6" data-transition="none">

~~~~ {.javascript}
function foo(b) { if (b) { return 21; } else { return ''; } }

function bar(b) {
  var x = foo(b);  // Did we get a number back?  Maybe?
  var y = foo(b);
  if (typeof x == 'number' && typeof y == 'number') { return x + y; }
  return 0;                  // x and y must be numbers here ^   ^
}

var n = bar(1) * bar(2);  // bar() always returns a number
~~~~~~~~~~~~~~~~~~~~~~

</section>
<section class="slide level6" data-transition="none">

~~~~ {.javascript}
function foo(b) { if (b) { return 21; } else { return ''; } }

function bar(b) {
  var x = foo(b);  // Did we get a number back?  Maybe?
  var y = foo(b);
  if (typeof x == 'number' && typeof y == 'number') { return x + y; }
  return 0;                  // x and y must be numbers here ^   ^
}

var n = bar(1) * bar(2);  // bar() always returns a number
~~~~~~~~~~~~~~~~~~~~~~

    foo: (b: number) => string | number

    bar: (b: number) => number

---

![string|number](string-union-number.svg)

---

    number                mixed                 MyClass

    string                any                   Array<T>

    boolean               ?T                    [T, U, V]

    void                  T | U                 { x: T; y: U; z: Z }

    "foo"                 T & U                 { [key:string]: T }

										        (x: T) => U
---

~~~~ {.javascript}
type Point = { x: number; y: number }

function mkPoint(x, y): Point {
  return { x: x, y: y }
}

var p = mkPoint('2', '3')
// Type error: string is incompatible with number

var q = mkPoint(2, 3)
q.z = 4
// Type error: property `z` not found in object type

var r: Point = { x: 5 }
// Type error: property y not found in object literal
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
var n: Object = null;
// Type error: null is incompatible with object type

var m: ?Object = null;
// this is ok

var o = null;
// this is ok too
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~~~~~~~~~~~~~~~~~~~
?T
~~~~~~~~~~~~~~~~~~~~~~

~~~~~~~~~~~~~~~~~~~~~~
T | null | undefined
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
type Foo = { x: number; y: string; [key:string]: any }
type Bar = { z: boolean }

type FooBar = Foo & Bar

var a: FooBar = { x: 1, y: 'two', z: true, zz: false }

var b = a.x  // number
var c = a.z  // boolean
var d = a.zz // boolean
var e = a.w  // (unknown)
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
type Tree<T> = Node<T> | EmptyTree

class Node<T> {
  value: T;
  left:  Tree<T>;
  right: Tree<T>;
  constructor(value, left, right) {
    this.value = value
    this.left  = left
    this.right = right
  };
}

class EmptyTree {}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
function find<T>(pred: (v: T) => boolean, tree: Tree<T>): T | void {
  var leftResult

  if (tree instanceof Node) {
    leftResult = find(pred, tree.left)
    if (typeof leftResult !== 'undefined') { return leftResult }
    else if (pred(tree.value))             { return tree.value }
    else                                   { return find(pred, tree.right) }
  }

  else if (tree instanceof EmptyTree) {
    return undefined;
  }
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
declare class UnderscoreStatic {
  findWhere<T>(list: Array<T>, properties: {}): T;
}

declare var _: UnderscoreStatic;
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~~~~~~~~~~~~~~~~~~~
$ npm install -g react-tools
~~~~~~~~~~~~~~~~~~~~~~

~~~~~~~~~~~~~~~~~~~~~~
$ jsx --strip-types --harmony --watch src/ build/
~~~~~~~~~~~~~~~~~~~~~~

---

Flow
  : http://flowtype.org/
slides
  : https://sitr.us/talks/flow/
