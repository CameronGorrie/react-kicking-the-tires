## Intro

- hi I'm Cameron
- learning doesn't come easy to me, conceptual metaphors are confusing (generators w/milk)
- zen and the art of motorcycle maintenance
- my a-ha moments come from looking under the hood, it's time consuming but it sticks
- closures example (compiler perspective)
- importance of perspectives

## React @Shopify

- why did we choose React (focus on the reasons relevant to the talk)
- react is a very small library, and the base abstraction that renderers consume (react-dom, react-native, so many more...)
- the fact that there are so many renderers is an indication that the reactive programming paradigm solves a common problem
- abstraction is not about hiding away complexity, it's about intentionally limiting the range of concepts we as programmers need to be aware of

## Problem: stateful programming

### Intro to the DOM

- the DOM is an in memory abstraction of structured text (HTML elements are represented as DOM nodes) that provides us with an interface for traversing and modifying those nodes
- anytime we want to dynamically change the content of the page we modify the DOM
- low level DOM operations are stateful and are written in an imperative manner
- having state in your program is never simple, and the DOM is mutable, so our program needs to keep track of preceding events
- code example

### Virtual DOM

- the Virtual DOM is an abstraction of the HTML DOM (an abstraction of an abstraction). It is lightweight and detached from the browser-specific implementation details with a [few minor differences](https://reactjs.org/docs/dom-elements.html#differences-in-attributes)
- in React the Virtual DOM nodes (vnodes) are of two types ReactElement or ReactComponent
- a `ReactElement` is a light, stateless, immutable, virtual representation of a DOM Element [](https://reactjs.org/docs/glossary.html#elements), stateless objects are easy to compare and update
- writing a stateless program isn't going be very much fun to work on
- a `ReactComponent` is a small, reusable piece of code that returns a React element. Components are defined as plain JavaScript functions. Those functions can be pure, or stateful. `ReactComponent`'s don't have access to the Virtual DOM
- thinking of react in terms of a programming runtime
- live demo: show the diffing

### Immutability

-

## Problem: syntax & conventions

- JSX is
- vigorous separation of concerns
