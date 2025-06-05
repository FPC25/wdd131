function displayList(item) {
    // Support both input element and string
    const value = typeof item === "string" ? item.trim() : item.value.trim();
    if (value === "") {
        if (typeof item !== "string") item.focus();
        return;
    } else {

        const li = document.createElement("li");
        li.textContent = value;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "❌";
        li.appendChild(deleteButton);
        list.appendChild(li);

        // Only clear and focus input if item is an input element
        if (typeof item !== "string") {
            item.value = "";
            item.focus();
        }

        deleteButton.addEventListener("click", function () {
            list.removeChild(li);
            deleteChapter(li.textContent);
            input.focus();
        })
    }
}


function setChapterList() {
    localStorage.setItem("favBOMList", JSON.stringify(chaptersArray));
}

function getChapterList() {
    return JSON.parse(localStorage.getItem("favBOMList"));
}

function deleteChapter(chapter) {
    // Remove the last character (the delete button) from the chapter string
    chapter = chapter.slice(0, chapter.length - 1);

    // this filter will make an array without the chapter that was deleted
    chaptersArray = chaptersArray.filter(item => item !== chapter);
    setChapterList();
}

const input = document.getElementById("favchap");
const addButton = document.querySelector("button");
const list = document.getElementById("list");

let chaptersArray = getChapterList() || [];

chaptersArray.forEach(chapter => {
    displayList(chapter);
});

addButton.addEventListener("click", function () {
    if (input.value.trim() === "") {
        input.focus();
    } else {
        displayList(input.value);
        chaptersArray.push(input.value);
        setChapterList();
        input.value = "";
        input.focus();
    }
});

input.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        displayList(input);
    }
});




