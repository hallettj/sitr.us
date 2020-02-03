% Flow: <br> type-checked JavaScript
% Jesse Hallett
% February 13, 2015


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

Pottier, Francois. 1998  
Synthése de types en présence de sous-typage: de la théorie á la pratique  
Ph.D. thesis, Université Paris 7

. . .

Information flow inference for free, 2000

Information flow inference in ML, 2002

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

    number                mixed                 MyClass

    string                any                   Array<T>

    boolean               ?T                    [T, U, V]

    void                  T | U                 { x: T; y: U; z: Z }

    "foo"                 T & U                 { [key:string]: T }

                                                (x: T) => U
. . .

    type ?T = T | null | undefined

---

    x                     x.prop

    x == null             typeof x === 'type'

    x && y                x instanceof Constructor

    x || y                Array.isArray(x)

    !x


    (* predicate_of_condition, type_inference_js.ml *)

---

~~~~ {.javascript}
typeof true         === 'boolean'

typeof 3            === 'number'

typeof 'foo'        === 'string'

typeof undefined    === 'undefined'

typeof (x => x + 1) === 'function'

typeof { foo: 1 }   === 'object'

typeof null         === 'object'
~~~~~~~~~~~~~~~~~~~~~~

---

    (* This module is the entry point of the typechecker. It sets up subtyping
       constraints for every expression, statement, and declaration form in a
       JavaScript AST; the subtyping constraints are themselves solved in module
       Flow_js. It also manages environments, including not only the maintenance of
       scope information for every function (pushing/popping scopes, looking up
       variables) but also flow-sensitive information about local variables at every
       point inside a function (and when to narrow or widen their types). *)

    (* type_inference_js.ml *)

---

    (* This module describes the subtyping algorithm that forms the core of
       typechecking. The algorithm (in its basic form) is described in Francois
       Pottier's thesis. The main data structures maintained by the algorithm are:
       (1) for every type variable, which type variables form its lower and upper
       bounds (i.e., flow in and out of the type variable); and (2) for every type
       variable, which concrete types form its lower and upper bounds. Every new
       subtyping constraint added to the system is deconstructed into its subparts,
       until basic flows between type variables and other type variables or concrete
       types remain; these flows are then viewed as links in a chain, bringing
       together further concrete types and type variables to participate in
       subtyping. This process continues till a fixpoint is reached---which itself
       is guaranteed to exist, and is usually reached in very few steps. *)

    (* flow_js.ml *)

---

~~~~ {.ocaml}
  (* expr op null *)
  | _, Binary { Binary.operator;
      left;
      right = _, Literal { Literal.value = Literal.Null; _ }
    } ->
      null_test operator left
~~~~~~~~~~~~~~~~~~~~~~

~~~~ {.ocaml}
  (* inspect a null equality test *)
  let null_test op e =
    let refinement = match refinable_lvalue e with
    | None, t -> None
    | Some name, t ->
        match op with
        | Binary.Equal | Binary.NotEqual ->
            Some (name, t, IsP "maybe", op = Binary.Equal)
        | Binary.StrictEqual | Binary.StrictNotEqual ->
            Some (name, t, IsP "null", op = Binary.StrictEqual)
        | _ -> None
    in
    match refinement with
    | Some (name, t, p, sense) -> result BoolT.t name t p sense
    | None -> empty_result BoolT.t
~~~~~~~~~~~~~~~~~~~~~~

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

~~~~ {.javascript}
type Point = { x: number; y: number; [key:string]: any }
type HasSize = { size: number; [key:string]: any }

function translate_x(d: number, p: Point): Point {
  return _.assign({ x: p.x + d }, p)
}

function scale(x: number, s: HasSize): HasSize {
  return _.assign({ size: s.size * x }, s)
}

type Circle = Point & HasSize

function zoom(d: number, x: number, obj: Circle): Circle {
  return translate_x(d, scale(x, obj))
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
type Tree<T> = Node<T> | EmptyTree

type Node<T> = { tag: 'Node'; value: T; left: Tree<T>; right: Tree<T> }

type EmptyTree = { tag: 'EmptyTree' }

function find<T>(pred: (v: T) => boolean, tree: Tree<T>): T | void {
  if (tree.tag === 'Node') {
    // ...
  }
  else if (tree.tag === 'EmptyTree') {
    // ...
  }
}
~~~~~~~~~~~~~~~~~~~~~~

---

~~~~ {.javascript}
type Functor<F<_>> = {
  map<A,B>: (f: (x: A) => U, F<A>) => F<B>
}

var ArrayFunctor: Functor<Array<_>> = {
  map = (f, xs) => xs.map(f)
}

var PromiseFunctor: Functor<Promise<_>> = {
  map = (f, promise) => promise.then(f)
}

function myFunc<T,A,B>(F: Functor<T<_>>, f: (x: A) => B): T<B> {
  var xs: T<A> = getSomething()
  return F.map(f, xs)
}
~~~~~~~~~~~~~~~~~~~~~~

---

Flow
  : http://flowtype.org/
slides
  : https://sitr.us/talks/flow/
