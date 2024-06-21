import { Task, taskStatus } from "./taskModel.js"

const tasks = []
const tareita = new Task(5, "aasd", "asddd")
tasks.push(tareita)

const URLposts = ""

function crearCardHTML(task) {
    const taskId = `task-${task.id}`
    const statusId = `status-${task.id}`

    return  `
            <article class="task-item" id="${taskId}">
                <h1>${task.id}</h1>
                <div>
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <time class="task-meta">${task.startDate}</time>
                </div>
                <p id="${statusId}">${task.status}</p>

                <button onclick="removeTask(this)">Delete</button>
                <button onclick="completeTask(this)">Complete</button>   
            </article>        
            `
}

document.getElementById('addTaskBtn').addEventListener('click', function(e) {
    e.preventDefault()
    addTask()
})

function addTask() {
    const taskTitleInput = document.getElementById('taskTitle')
    const taskDescriptionInput = document.getElementById('taskDescription')
    const taskTitle = taskTitleInput.value.trim()
    const taskDescription = taskDescriptionInput.value.trim()

    if (taskTitle === '' || taskDescription === '') {
        ToastIt.now({
            message: "Por favor, completa todos los campos",
            style: 'error',
            timer: 3000
        })
        return
    }

    const taskList = document.getElementById('taskList')
    const newTask = new Task(tasks.length + 1, taskTitle, taskDescription)

    tasks.push(newTask)

    const taskItemHTML = new crearCardHTML(newTask)
    const taskItem = document.createElement('div')
    taskItem.className = 'task-item'
    taskItem.innerHTML = taskItemHTML

    taskList.insertBefore(taskItem, taskList.firstChild)

    taskTitleInput.value = ''
    taskDescriptionInput.value = ''
}

function removeTask(button) {
    const taskItem = button.closest('.taskList')
    taskItem.remove()
}

function completeTask(button) {
    const taskItem = button.closest('.taskList')
    taskItem.classList.add('completed')
}

async function cargarTasks() {
    try {
        const response = await fetch(URLtasks)
        if (!response.ok) {
            throw new Error("No se pueden obtener las tareas del servidor.")
        }

        const data = await response.json()
        tasks.length = 0
        tasks.push(...data)

        tasks.sort((a, b) => {
            if (a.status === taskStatus.finished && b.status !== taskStatus.finished) {
                return 1
            }
            if (a.status !== taskStatus.finished && b.status === taskStatus.finished) {
                return -1
            }
            return new Date(b.startDate) - new Date(a.startDate)
        })

        const taskList = document.getElementById('taskList')
        if (tasks.length > 0) {
            taskList.innerHTML = ""
            tasks.forEach(taskData => {
                const task = new Task(taskData.id, taskData.title, taskData.description, taskData.dueDate, taskData.status)
                const cardHTML = crearCardHTML(task)
                const taskItem = document.createElement('div')
                taskItem.className = 'task-item'
                taskItem.innerHTML = cardHTML
                taskList.appendChild(taskItem)
        })
        } else {
            taskList.innerHTML = retornarError()
        }
    } catch (error) {
        const taskList = document.getElementById('taskList')
        taskList.innerHTML = retornarError()
    }
}

console.log(tasks)

cargarTasks(tasks)

const btnCargar = document.getElementById("btnCargar")
btnCargar.addEventListener('click', function() {
    cargarTasks()
    if(tasks.length > 0) {
        ToastIt.now({
            message: "Tareas actualizadas",
            style: 'success',
            timer: 3000
        })
    } else {
        ToastIt.now({
            message: "Error al obtener las tareas",
            style: 'error',
            timer: 3700,
            close: true
        })
    }
})

function retornarError() {
    return `
            <p><b>No se pudieron cargar las tareas</b> <br> Intenta nuevamente en unos segundos...</p>
    `
}

/* Menu */
document.getElementById('menuToggle').addEventListener('click', () => {
    const menu = document.getElementById('menu')
    menu.classList.toggle('show')
})

document.getElementById('addTaskBtn').addEventListener('click', (e) => {
    e.preventDefault()
    addTask()
})

/* Modal */

const openModal = (modalId) => {
    document.getElementById(modalId).style.display = 'flex'
}

const closeModal = (modalId) => {
    document.getElementById(modalId).style.display = 'none'
}

document.getElementById('menuCreateTask').addEventListener('click', () => {
    openModal('modalCreateTask')
})

document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', (event) => {
        const modalId = event.target.dataset.modalId
        closeModal(modalId)
    })
})

window.onclick = function(event) {
    document.querySelectorAll('.modal').forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none'
        }
    })
}

