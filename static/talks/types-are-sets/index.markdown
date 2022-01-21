# Types Are Sets

Jesse Hallett &lt;jesse@sitr.us&gt;

Sr Software Engineer at Originate, Inc.

TypeScript, NYC - April 17, 2019

---

<!-- .slide: class="noborder" -->
![a portion of the interface hierarchy in Immutable.js](./interface-hierarchy.svg)

---

<!-- .slide: class="noborder" -->
![Immutable.js interfaces represented as nested sets](./interface-hierarchy-as-sets.svg)

---

<!-- .slide: class="noborder" data-transition="none" -->
![List and Seq, a pair of disjoint types](./list-and-seq.svg)

--

<!-- .slide: class="noborder" data-transition="none" -->
![union of List and Seq](./list-union-seq.svg)

---

<!-- .slide: class="noborder" -->
![an intersection type that contains sized collections](./collection-intersect-size.svg)

---

<!-- .slide: class="noborder" data-transition="none" -->
![unit types in string, number, and boolean](./unit-types.svg)

--

<!-- .slide: class="noborder" data-transition="none" -->
![null and undefined are unit types](./all-unit-types.svg)

---

<!-- .slide: class="noborder" data-transition="none" -->
![empty intersection](./empty-intersection.svg)

--

<!-- .slide: class="noborder" data-transition="none" -->
![empty intersection is never](./empty-intersection-is-never.svg)

---

<!-- .slide: class="noborder" -->
![never fits in every other set](./never-is-everywhere.svg)

---

<!-- .slide: data-transition="none" -->
```ts
function matchBoolean(x: boolean): string {
  switch(x) {
    case true:
      return "got true"
    case false:
      return "got false"
    default:
      return "what did we get?"
  }
}
```

. <!-- .element: class="fragment" data-code-focus="8" style="display:none" -->

--

<!-- .slide: data-transition="none" -->
```ts
function matchBoolean(x: boolean): string {
  switch(x) {
    case true:
      return "got true"
    case false:
      return "got false"
    default:
      x.someProp // ✘ 'someProp' does not exist on type 'never'.
      return "what did we get?"
  }
}
```

. <!-- .element: class="fragment" data-code-focus="8" style="display:none" -->

---

<!-- .slide: class="noborder" -->
![never is identity wrt union](./union-with-never.svg)

---

```ts
function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout elapsed")), ms)
  )
}
```

---

```ts
async function fetchPriceWithTimeout(
  tickerSymbol: string
): Promise<number> {
  const stock = await Promise.race([
    fetchStock(tickerSymbol), // `Promise<{ price: number }>`
    timeout(3000)             // `Promise<never>`
  ])
  return stock.price // { price: number } | never
                     //   => { price: number }
}
```

---

<!-- .slide: class="noborder" -->
![all the types](./all-the-types.svg)
