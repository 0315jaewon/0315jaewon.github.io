const storageKey = "website-todo-tasks";
const form = document.getElementById("task-form");
const taskList = document.getElementById("tasks");
const status = document.getElementById("status");
let tasks = [];

async function loadTasks() {
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved !== null) {
            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed) || !parsed.every((task) => typeof task === "string")) {
                throw new Error("Invalid saved tasks");
            }
            tasks = parsed;
        } else {
            const response = await fetch("tasks.txt");
            if (response.ok) {
                tasks = (await response.text()).split(/\r?\n/).filter(Boolean);
            }
        }
    } catch {
        status.textContent = "Could not load saved tasks. New tasks will be shown below.";
    }
    taskList.textContent = tasks.join("\n");
    form.querySelector("button").disabled = false;
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.elements.namedItem("task");
    const task = input.value.trim();
    if (!task) return;
    tasks.push(task);
    taskList.textContent = tasks.join("\n");
    try {
        localStorage.setItem(storageKey, JSON.stringify(tasks));
        status.textContent = "Task saved in this browser.";
    } catch {
        status.textContent = "Browser storage is unavailable. Tasks will be lost when this page closes.";
    }
    form.reset();
    input.focus();
});

loadTasks();
