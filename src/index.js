import React, {useState} from "react";
import ReactDOM from "react-dom";

function PolarisButton({ children, color, count }) {
  return <button className={`button button-${color}`} onClick={count}>{children}</button>;
}

function Card({ title, button: {content, color}}) {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>{title}</h1>
      <PolarisButton color={color} count={() => {
        return setCount(count + 1)
      }}>
        <span>{content} {count}</span>
      </PolarisButton>
    </>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <Card
    title="Hello world"
    button={{ content: "Clicked:", color: "primary" }}
  />,
  rootElement
);
