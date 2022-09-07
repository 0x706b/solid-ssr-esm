import { createEffect, createSignal, onMount } from "solid-js";

function Home() {
  const [color, setColor] = createSignal("blue");
  onMount(() => {
    const handle = setInterval(() => {
      setColor((color) => (color === "blue" ? "red" : "blue"));
    }, 500);
  });
  return <p style={{ color: color() }}>Homepage</p>;
}

export default Home;
