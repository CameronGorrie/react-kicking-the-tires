autoscale: true
build-lists: true
theme: Simple, 3

# It’s just JavaScript:<br>kicking the tires of React

## Cameron Gorrie

^ This talk is going to focus on web development, so it's going to be renderer centric (ReactDOM heavy)

^ But I hope from the renderer perspective you'll get some good insight into Reactive programming concepts that will be relevant in the subsequent talks

---

^ I find learning really difficult, it can take me a long time to wrap my head around a concept but when I do feels great and I want to share it with others. I've found that analogy doesn't give me the a-ha! moment that I'm craving when learning something new

^ I'm going to try and avoid broader analogies and instead take the perspective of React as a programming runtime and dig into some of the internals; invariably I am going to be hypocritical (i.e. describing data as a tree structure)

Analogies can be useful for conceptualizing complexity

- Closures are like mailing a package
- Reducers are like a coffee maker
- Generators are like running a restaurant

---

# A-HA! moments

^ Execution model, mapping features of the execution context to places in the codebase

^ Reading JavaScript as the engine would interpret it

^ 1: `createCounter` and `increment` are declared and created in the global execution context
^ 2: `createCounter` is called and it's return value is assigned to `increment`
^ 3: calling `createCounter` creates a local execution context
^ 4: counter variable is assigned and the `innerFunc` is created in the local execution context
^ 5: local execution context is deleted, control is returned to the calling context, `createCounter` returns the `innerFunc` function which has access to the variables that were in scope when it was called
^ 6: calling `increment` creates a local execution context, retrieves the count variable from it's closure, sets it's value to one, and returns it before local execution context is deleted

```js
function createCounter() {
  let counter = 0;

  return function innerFunc() {
    counter = counter + 1;
    return counter;
  }
}

const increment = createCounter();
const plusOne = increment(); // 1
const plusTwo = increment(); // 2
```

---

# Why React?

^ To understand that we need to understand the DOM, and the historical challenges web developers have faced

---

# What is the DOM?

^ Note: while an HTML Abstract Syntax Tree is not equivalent to the DOM representation it's illustrative

- The DOM is an in memory abstraction of structured text
- Provides an interface for traversing and modifying nodes
- Nodes have their own properties and may also contain child nodes

```js
document.createElement("div");

// Naive DOM representation
{
  "name": "div",
  "children": [],
}
```

---

# The DOM has historically been used to store state

^ And this has caused all sorts of problems

---

# Why React @Shopify?

^ Admin Next problems with load performance, interaction performance, conventions, and developer experience

- Lots of DOM interactions to be reflected immediately in the UI
- Frequent data changing over time
- User interaction that affect many other components in the UI

[.footer: [Foundational problems with Admin Next architecture](https://docs.google.com/document/d/1Z2lYsfX3oxytG4QNGaW6X83Z52Zz-jsrUFXp1zRGVpA)]

---

^ Low level DOM operations are stateful and are written in an imperative manner

^ Our program needs to keep track of preceding events

^ Having state in your program is never simple. Anytime we want to dynamically change the content of the page we modify the DOM. To keep application state in both your program and the DOM adds complexity

Best practices for dealing with DOM state:

- Have a default application state that matches the default DOM conditions
- Interactions that mutate state should be applied to the DOM immediately from a single piece of code in the application
- Observe state in the application and not in the DOM
- Centralize application state (observers, state machines)
- Preserve state uniformly; i.e. a single save operation that updates the default DOM conditions

---

# What is the Virtual DOM?

^ We should think of it as more of a pattern than a specific technology

^ Conceptually it is a tree of objects representing the user interface

^ Valuable because it allows you to build apps without thinking about state

^ For now we'll think of the Virtual DOM as being a tree of React elements but also be aware that React has it's own internal objects called fibers to hold additional information about the component tree that are considered part of the virtual dom implementation

The Virtual DOM is an abstraction of the HTML DOM with the following characteristics:

- Detached from the browser-specific implementation details
- Allows you to build apps without thinking about state transitions

[.footer: [Attribute differences between DOM & VDOM in React](https://reactjs.org/docs/dom-elements.html#differences-in-attributes)]

---

^ A `ReactElement` is a light, immutable, virtual representation of a DOM Element

^ Stateless objects are easy to compare and update, and are meant to be thrown away when we want to render something different later

In React the Virtual DOM nodes are `ReactElement`s, plain JavaScript objects that function as atomic building blocks

```js
{
  type: 'Card', // function type denotes a React component
  props: {
    title: 'Hello world'
    children: [{
      type: 'button', // string type denotes a DOM node (props correspond to attributes)
      props: {
        className: 'primary',
        children: 'Click me',
      }
    }]
  }
}
```

---

# A brief foray into JSX

^ JSX is syntatic sugar that once compiled becomes a regular JavaScript function call that evaluates to a JavaScript object

```html
<Card title="Hello world">
  <button className="primary">Click me</button>
</Card>
```

```js
// compiles to
React.createElement(Card, {
  title: "Hello world"
},
React.createElement("button", {
  className: "primary"
}, "Click me"));
```

[.footer: [Try it out for yourself using the Babel REPL](https://babeljs.io/repl)]

---

^ Components take one argument — an object hash containing props

^ Components are pure in respect to their props; local mutation is fine

`ReactComponent`'s are small, reusable pieces of code that return `ReactElement`'s

```js
function Card({showTitle, children}) {
  let title = null;

  if (showTitle) {
    title = <h1>Hello world</h1>;
  }

  return (
    <div>
      {title}
      {children}
    </div>
  );
}
```

---

# Constructing the Virtual DOM

^ When React encounters a function type, it inspects that component to determine what `ReactElement` it renders, given the corresponding props

^ React repeats this process until it has a representation of the underlying DOM tag elements for every component on the page

^ Objects are for illustrative purpose, there are other properties and symbols `$$typeof` (JSON can't include `Symbol()`, stops XSS attacks)

Components encapsulate element trees:

```js
{
  type: PolarisButton, // ReactComponent type: evaluate the returned ReactElement
  props: {color: 'primary', children: 'Click me'}
}

// Resultant element tree
{
  type: 'button',
  props: {
    className: 'button button-primary',
    children: {type: 'span', props: { children: 'Click me' }}
  }
}
```

[.footer: [Components, instances, and elements oh my!](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html)]

---

# Renderer entry point

^ We've established that React programs construct a virtual DOM tree that may change over time

^ We want to output our virtual DOM somewhere, in the case of React DOM we want to inject our virtual DOM into the real one

```html
<div id="app"></div>
```

```js
ReactDOM.render(
  <PolarisButton color="primary" />,
  document.getElementById('app')
);
```

```js
// ReactDOM renderer is effectively doing this
let domNode = document.createElement('button');
domNode.className = 'button-primary';

domContainer.appendChild(domNode);
```

---

# How do we make changes in our application?

^ When a component receives props as an input, it is because a particular parent component returned an element with its type and props

^ Props flow one way in React: from parents to children

^ A component cannot change its props, but it can change its state

^ Changes to props i.e. fetching from network and passing data as props to child component

^ Changes to state i.e. checkbox is checked

---

^ In our case the host instance tree is the DOM

^ State and/or prop changes in your component function will return a different tree of React elements

^ A simplified version of React could blow away the existing tree and re-create it from scratch. This is slow and would lose DOM state (focus, selection)

> The process of figuring out what to do to the host instance tree in response to new information is sometimes called reconciliation.
-- Dan Abramov

---

^ Efficiency one: For DOM nodes we only need to update the changed attributes
^ Efficiency two: the instance stays the same when the component updates (state is maintained across renders)

# Efficiencies

```js
// doesn't destroy this instance when props change
function PolarisButton({color}) {
  const className = `button button-${color}`;

  // doesn't destroy this DOM node when attributes change
  return <button className={className}>Click me</button>;
}

let domNode = document.createElement('button');
domNode.className = 'button button-primary';
domContainer.appendChild(domNode);

domNode.className = 'button button-secondary';
domContainer.appendChild(domNode);
```

---

^ Efficiency three: recursing on children

^ Keys help React identify which items have changed, added, or removed

^ Without keys updating the order of component children will cause React to mutate every child

# Efficiencies cont'd

```js
function Card({title, buttons}) {
  const eachButton = buttons.map(({id, content, color}) => {
    return (
      <PolarisButton key={id} color={color}>
        {content}
      </PolarisButton>
    );
  });

  ...
}
```

---

^ So now that we understand a little bit about JSX,

# Demo: stepping through `ReactChildReconciler`

---

# The end... well kind of

- [Thinking in React](https://reactjs.org/docs/thinking-in-react.html)
- [Hooks API Reference](https://reactjs.org/docs/hooks-reference.html)
- [Inversion of control: letting React call your functions](https://overreacted.io/react-as-a-ui-runtime/#inversion-of-control)
- [Batching state updates](https://overreacted.io/react-as-a-ui-runtime/#batching)
- [Fiber: the render phase work loop and the commit phase](https://medium.com/react-in-depth/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react-e1c04700ef6e)
