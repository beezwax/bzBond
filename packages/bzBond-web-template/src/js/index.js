import bzBond from "@beezwax/bzbond-js";
import "../scss/app.scss";

/** Test live development by editing the variable declaration below **
⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄⌄*/
const HEY_DEV_EDIT_THIS = "Hi dev, how are you?";

const subheading = document.querySelector("h2");
subheading.innerText = typeof bzBond === "function" ? "is up and running" : "is having issues";
const showoff = document.querySelector(".showoff");
showoff.innerText = HEY_DEV_EDIT_THIS;

if(window.location.hostname === "localhost") {
  const main = document.querySelector("main");
  const vsCodeButton = document.createElement("button");
  vsCodeButton.innerText = "Open Project in VS Code";
  const instruction = document.createElement("p");
  instruction.classList.add("instruction");
  const indexFilePath = document.createElement("p");
  indexFilePath.classList.add("index-path");
  fetch(document.location)
    .then((response) => {
      instruction.innerHTML = `Don't have <a href="https://code.visualstudio.com/">VS Code</a>? To update this page edit and save`;
      indexFilePath.textContent = `${response.headers.get("projectPath")}/src/js/index.js`;
      vsCodeButton.addEventListener("click", () => {
        window.open(`vscode://file/${response.headers.get("projectPath")}/`, '_blank');
        window.open(`vscode://file/${response.headers.get("projectPath")}/src/js/index.js`, '_blank');
      });
    });
  main.appendChild(vsCodeButton);
  main.appendChild(instruction);
  main.appendChild(indexFilePath);
}