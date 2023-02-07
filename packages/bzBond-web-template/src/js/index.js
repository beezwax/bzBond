import bzBond from "@beezwax/bzbond-js";
import "../scss/app.scss";

const main = document.createElement("main");
const footer = document.createElement("footer");

const heading = document.createElement("h1");
heading.className = "logo";

const subheading = document.createElement("h2");
subheading.innerText = typeof bzBond === "function" ? "is up and running" : "is having issues";

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

const learn = document.createElement("p");
const learnLink = document.createElement("a");
learnLink.setAttribute("href", "https://github.com/beezwax/bzBond");
learnLink.setAttribute("target", "_blank");
learnLink.innerText = `Learn bzBond`;
learn.appendChild(learnLink);
learn.className = "learn";

const cornerGraphic = document.createElement("div");
cornerGraphic.className = "corner-graphic";

main.appendChild(heading);
main.appendChild(subheading);
if(window.location.hostname === "localhost") {
  main.appendChild(vsCodeButton);
  main.appendChild(instruction);
  main.appendChild(indexFilePath);
}
footer.appendChild(learn);


document.body.appendChild(main);
document.body.appendChild(footer);
document.body.appendChild(cornerGraphic);