const selectedCodeOwnerCode: string[] = [];
const allOwnersText = {};

/**
 * will find the closest element who has `js-file` on the class
 * @param node
 * @returns
 */
function getFileContainer(node: Element) {
  if (node.classList.contains("js-file")) {
    return node;
  }

  if (node.parentElement === null) {
    return null;
  }

  return getFileContainer(node.parentElement);
}

/**
 * Logic to hide or show by codeowners
 */
function showHideCodeOwners() {
  if (selectedCodeOwnerCode.length === 0) {
    document
      .querySelectorAll(".js-file")
      .forEach((node) => node.setAttribute("style", "opacity: 1;"));
  } else {
    document
      .querySelectorAll(".js-file")
      .forEach((node) => node.setAttribute("style", "opacity: 0.2;"));

    selectedCodeOwnerCode.forEach((owner) => {
      allOwnersText[owner].forEach((codeOwnerGithubEntry) => {
        document
          .querySelectorAll(`[aria-label="${codeOwnerGithubEntry}"]`)
          .forEach((node) => {
            const fileNode = getFileContainer(node);

            if (fileNode) {
              fileNode.setAttribute("style", "opacity: 1;;");
            }
          });
      });
    });
  }
}

/**
 * Will get call on every line when a user click on the input
 * @param this
 * @param ev
 */
function onClickInput(this: HTMLInputElement, ev: MouseEvent): any {
  const index = this.dataset.index;
  const isChecked = this.checked;
  const ownerName = this.value;

  if (!isChecked) {
    selectedCodeOwnerCode.splice(selectedCodeOwnerCode.indexOf(ownerName), 1);
  } else {
    selectedCodeOwnerCode.push(ownerName);
  }

  showHideCodeOwners();
}

function main() {
  const container = document.querySelector(".pr-review-tools");

  const detailsContainer = document.createElement("details");
  detailsContainer.classList.add("diffbar-item");
  detailsContainer.classList.add("details-reset");
  detailsContainer.classList.add("details-overlay");
  detailsContainer.classList.add("select-menu");
  detailsContainer.classList.add("d-inline-block");
  detailsContainer.classList.add("position-relative");
  detailsContainer.classList.add("hide-sm");
  detailsContainer.classList.add("js-menu-codeowners");
  detailsContainer.setAttribute("style", "margin-top: 5px;");

  document.querySelectorAll(".octicon-shield-lock").forEach((element) => {
    const selectorValue = element.parentElement.attributes["aria-label"].value;
    const firstIndex = selectorValue.indexOf("@");
    const lastIndex = selectorValue.indexOf("(");
    const codeOwnerName: string = selectorValue.substring(
      firstIndex,
      lastIndex - 1
    );

    if (allOwnersText[codeOwnerName]) {
      if (allOwnersText[codeOwnerName].indexOf(selectorValue) === -1) {
        allOwnersText[codeOwnerName].push(selectorValue);
      }
    } else {
      allOwnersText[codeOwnerName] = [selectorValue];
    }
  });

  if (Object.keys(allOwnersText).length > 0) {
    const summaryContainer = `
		<summary class="select-menu-button" role="button">
			<span class="select-menu-title">
			<strong class="js-file-filter-text css-truncate css-truncate-target">
				Code Owners
			</strong>
			</span>
		</summary>
	`;

    const detailsMenu = `
		<details-menu class="select-menu-modal position-absolute left-0" style="z-index: 99;">
			<div class="select-menu-header d-flex flex-justify-between">
				<span class="select-menu-title">Code Owners</span>
			</div>
			<div class="select-menu-list" role="menu">
			<div class="p-2 js-list-codeowners">
				
			</div>
		</details-menu>
	`;

    // @ts-ignore
    detailsContainer.insertAdjacentHTML("beforeend", summaryContainer);
    detailsContainer.insertAdjacentHTML("beforeend", detailsMenu);

    container.prepend(detailsContainer);

    Object.keys(allOwnersText).forEach((owner, index) => {
      const exists = selectedCodeOwnerCode.indexOf(owner) >= 0;

      const label = document.createElement("label");
      const input = document.createElement("input");
      const span = document.createElement("span");

      input.setAttribute("style", "cursor: pointer;");
      input.setAttribute("type", "checkbox");
      input.value = owner;

      if (exists) {
        input.checked = true;
      }

      input.onclick = onClickInput;
      input.dataset.index = String(index);

      span.innerText = owner;
      span.setAttribute("style", "padding-left: 10px;");

      label.setAttribute("class", "pl-1 mb-1 d-block");
      label.appendChild(input);
      label.appendChild(span);

      document.querySelector(".js-list-codeowners").appendChild(label);
    });
  }
}

chrome.runtime.sendMessage({}, (response) => {
  var checkReady = setInterval(() => {
    if (document.readyState === "complete") {
      clearInterval(checkReady);

      main();
    }
  });
});
