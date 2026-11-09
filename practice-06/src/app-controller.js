"use strict";

import { validateTaskDraft } from "./form-validation.js";

export function createAppController({ api, view }) {
    let currentTasks = [];
    let currentCategories = [];
    let currentFilters = {};
    let editingId = null;
    
    let activeController = null;
    let loadCounter = 0;

    // Загрузка списка задач (с защитой от гонки)
    async function loadCurrentTasks() {
        if (activeController) activeController.abort();
        activeController = new AbortController();
        const requestId = ++loadCounter;
        
        view.setLoading(true);
        try {
            const res = await api.getTasks(currentFilters, { signal: activeController.signal });
            if (requestId !== loadCounter) return; // Устаревший ответ

            if (!res.ok) {
                if (res.kind === "aborted") return; // Игнорируем отмену
                throw new Error(res.message || "Ошибка загрузки");
            }

            currentTasks = res.tasks;
            view.renderTasks(currentTasks, currentCategories);
            view.setState(currentTasks.length > 0 ? "ready" : "empty");
        } catch (err) {
            if (requestId !== loadCounter) return;
            view.setState("error", err.message);
        } finally {
            if (requestId === loadCounter) view.setLoading(false);
        }
    }

    // Общий метод для изменяющих операций (мутаций)
    async function executeMutation(mutationFn, successMessage) {
        view.setMutationPending(true);
        try {
            const res = await mutationFn();
            if (!res.ok) throw new Error(res.message || "Ошибка операции");
            view.notify(successMessage, "success");
            await loadCurrentTasks(); // Перезапрос после изменения
        } catch (err) {
            view.notify(err.message, "error");
        } finally {
            view.setMutationPending(false);
        }
    }

    return {
        async start(filters = {}) {
            currentFilters = filters;
            view.setLoading(true);
            try {
                const res = await api.loadInitialData(filters);
                if (!res.ok) throw new Error(res.message);
                currentTasks = res.tasks;
                currentCategories = res.categories;
                view.renderCategories(currentCategories);
                view.renderTasks(currentTasks, currentCategories);
                view.setState(currentTasks.length > 0 ? "ready" : "empty");
            } catch (err) {
                view.setState("error", err.message);
            } finally {
                view.setLoading(false);
            }
        },

        applyFilters(filters) {
            currentFilters = filters;
            loadCurrentTasks();
        },

        refresh() {
            loadCurrentTasks();
        },

        async submit(draft) {
            const validation = validateTaskDraft(draft, currentCategories);
            if (!validation.valid) {
                view.showFormErrors(validation.errors);
                return;
            }
            view.clearFormErrors();

            if (editingId) {
                // Редактирование
                await executeMutation(
                    () => api.updateTask(editingId, validation.value),
                    "Задача обновлена"
                );
                this.cancelEdit();
            } else {
                // Создание
                await executeMutation(
                    () => api.createTask(validation.value),
                    "Задача создана"
                );
            }
            view.resetForm();
        },

        beginEdit(id) {
            const task = currentTasks.find(t => t.id === id);
            if (!task) return;
            editingId = id;
            view.fillForm(task);
        },

        cancelEdit() {
            editingId = null;
            view.resetForm();
        },

        async toggleTask(id) {
            const task = currentTasks.find(t => t.id === id);
            if (!task) return;
            await executeMutation(
                () => api.setTaskCompleted(id, !task.completed),
                "Статус изменен"
            );
        },

        async deleteTask(id) {
            await executeMutation(
                () => api.deleteTask(id),
                "Задача удалена"
            );
            if (editingId === id) this.cancelEdit();
        },

        async resetData() {
            view.setMutationPending(true);
            try {
                await api.resetDemoData();
                view.notify("Данные сброшены", "success");
                await loadCurrentTasks();
            } catch (err) {
                view.notify(err.message, "error");
            } finally {
                view.setMutationPending(false);
            }
        },

        destroy() {
            if (activeController) activeController.abort();
        }
    };
}