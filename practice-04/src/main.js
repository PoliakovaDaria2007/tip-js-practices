"use strict";

import { addTask, updateTask, setTaskCompleted, removeTask } from "./task-service.js";
import { renderTaskList, renderSummary, renderEmptyState } from "./task-view.js";
import { getVisibleTasks } from "./task-selectors.js";
import { validateTaskDraft } from "./form-validation.js";
import { loadTasks, saveTasks, removeSavedTasks } from "./task-storage.js";

const STORAGE_KEY = "tip-js-practice-04:demo";
const initialTasks = [
    { id: 1, title: "Проверить почту", completed: true, priority: "low" },
    { id: 4, title: "Написать отчет", completed: false, priority: "high" },
    { id: 7, title: "Сделать созвон", completed: true, priority: "medium" },
    { id: 10, title: "Изучить JavaScript", completed: false, priority: "medium" }
];
const storage = window.localStorage;

let currentTasks;
let currentFilter = "all";
let editingId = null;

// DOM-элементы (убедитесь, что они существуют в вашем index.html!)
const taskListElement = document.querySelector("#task-list");
const formElement = document.querySelector("#task-form");
const idInput = document.querySelector("#task-id");
const titleInput = document.querySelector("#task-title");
const priorityInput = document.querySelector("#task-priority");
const formTitle = document.querySelector("#form-title");
const submitBtn = document.querySelector("#submit-btn");
const cancelBtn = document.querySelector("#cancel-btn");

function setFormMode(id) {
    editingId = id;
    if (id === null) {
        formElement.reset();
        idInput.disabled = false;
        formTitle.textContent = "Добавление задачи";
        submitBtn.textContent = "Добавить задачу";
        if(cancelBtn) cancelBtn.hidden = true;
        idInput.focus();
    } else {
        const task = currentTasks.find(t => t.id === id);
        if (!task) {
            alert("Задача не найдена");
            return;
        }
        idInput.value = task.id;
        titleInput.value = task.title;
        priorityInput.value = task.priority;
        idInput.disabled = true;
        formTitle.textContent = "Редактирование задачи";
        submitBtn.textContent = "Сохранить изменения";
        if(cancelBtn) cancelBtn.hidden = false;
        titleInput.focus();
    }
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const draft = {
        id: idInput.value,
        title: titleInput.value,
        priority: priorityInput.value
    };
    
    document.querySelectorAll(".error-message").forEach(el => el.textContent = "");

    const validation = validateTaskDraft(draft, currentTasks, editingId);
    
    if (!validation.ok) {
        if (validation.errors.id) document.querySelector("#error-id").textContent = validation.errors.id;
        if (validation.errors.title) document.querySelector("#error-title").textContent = validation.errors.title;
        if (validation.errors.priority) document.querySelector("#error-priority").textContent = validation.errors.priority;
        return;
    }

    let result;
    if (editingId === null) {
        result = addTask(currentTasks, validation.data.id, validation.data.title, validation.data.priority);
    } else {
        result = updateTask(currentTasks, editingId, validation.data.title, validation.data.priority);
    }

    if (result.ok) {
        currentTasks = result.tasks;
        saveTasks(storage, STORAGE_KEY, currentTasks);
        setFormMode(null);
        renderApp();
    } else {
        alert(result.error);
    }
}

function handleTaskListClick(event) {
    const btn = event.target.closest('button[data-action]');
    if (!btn || !taskListElement.contains(btn)) return;
    
    const action = btn.dataset.action;
    const card = btn.closest('li[data-task-id]');
    if (!card) return;
    const id = Number(card.dataset.taskId);
    
    const task = currentTasks.find(t => t.id === id);
    if (!task) return;

    if (action === 'edit') {
        setFormMode(id);
        return;
    }

    let result;
    if (action === 'toggle') {
        result = setTaskCompleted(currentTasks, id, !task.completed);
    } else if (action === 'delete') {
        result = removeTask(currentTasks, id);
        if (editingId === id) setFormMode(null);
    }

    if (result && result.ok) {
        currentTasks = result.tasks;
        saveTasks(storage, STORAGE_KEY, currentTasks);
        renderApp();
    } else if (result) {
        alert(result.error);
    }
}

function handleFilterClick(event) {
    const btn = event.target.closest('button[data-filter]');
    if (!btn) return;
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('button[data-filter]').forEach(b => {
        const active = b.dataset.filter === currentFilter;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
    });
    renderApp();
}

function renderApp() {
    const visibleTasks = getVisibleTasks(currentTasks, currentFilter);
    renderTaskList(taskListElement, visibleTasks);
    renderSummary(currentTasks, visibleTasks.length);
    renderEmptyState(currentTasks.length, visibleTasks.length);
}

function handleReset() {
    removeSavedTasks(storage, STORAGE_KEY);
    currentTasks = JSON.parse(JSON.stringify(initialTasks));
    currentFilter = "all";
    setFormMode(null);
    
    document.querySelectorAll('button[data-filter]').forEach(b => {
        const active = b.dataset.filter === "all";
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
    });
    
    renderApp();
}

function initApp() {
    const loaded = loadTasks(storage, STORAGE_KEY, initialTasks);
    currentTasks = loaded.tasks;
    if (loaded.error) console.warn(loaded.error);
    
    renderApp();

    formElement.addEventListener("submit", handleFormSubmit);
    taskListElement.addEventListener("click", handleTaskListClick);
    
    const filterContainer = document.querySelector("#filters");
    if (filterContainer) filterContainer.addEventListener("click", handleFilterClick);
    
    const resetBtn = document.querySelector("#reset-btn");
    if (resetBtn) resetBtn.addEventListener("click", handleReset);
    
    if (cancelBtn) cancelBtn.addEventListener("click", () => setFormMode(null));

    document.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("input", () => {
            const field = el.id.replace("task-", "");
            const errEl = document.querySelector(`#error-${field}`);
            if (errEl) errEl.textContent = "";
        });
    });
}

initApp();