// Webpack allows us to import our styles here and extracts them and converts them to plain CSS for us
import "./styles/index.scss";

function initApp() {
  const root = document.getElementById("home");
  const node = document.createElement("div");
  node.innerHTML = "<p>Stuff and more stuff</p>";
  root.appendChild(node);
}

initApp();
