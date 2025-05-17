function addToList() {
    if (input.value.trim() === "") {
        input.focus();
        return;
    } else {

        const item = document.createElement("li");
        item.textContent = input.value;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        deleteButton.setAttribute("aria-label", "Delete item");

        item.appendChild(deleteButton);
        list.appendChild(item);

        input.value = "";
        input.focus();

        deleteButton.addEventListener("click", function () {
            list.removeChild(item);
        })
    }
}

const input = document.getElementById("favchap");
const addButton = document.querySelector("button");
const list = document.getElementById("list");

addButton.addEventListener("click", addToList);
input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        addToList();
    }
});

