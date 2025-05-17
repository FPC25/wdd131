const input = document.getElementById("favchap");
const button = document.querySelector("button");
const list = document.getElementById("list");

const item = document.createElement("li");
item.textContent = input.value;

const deleteButton = document.createElement("button");
deleteButton.textContent = "❌";
deleteButton.setAttribute("aria-label", "Delete item");

item.appendChild(deleteButton);
list.appendChild(item);