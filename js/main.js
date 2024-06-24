import { Task, taskStatus } from "./taskModel.js"

const tasks = []
const taskList = document.getElementById('taskList')

const URLTasks = "https://66388ba94253a866a24e2e86.mockapi.io/api/parcial/tasks"

/* Card */

function crearCardHTML(task) {
    const taskId = `task-${task.id}`
    let date = task.status === taskStatus.finished ? task.endDate : task.startDate
    
    let taskStatusMessage = ''
    switch (task.status) {
        case taskStatus.finished:
            taskStatusMessage = 'Marcar como sin empezar'
            break
        case taskStatus.progress:
            taskStatusMessage = 'Marcar como completada'
            break
        case taskStatus.notStarted:
            taskStatusMessage = 'Marcar como en progreso'
            break
        default:
            taskStatusMessage = 'Actualizar estado'
    }

    let statusClass = ''
    switch (task.status) {
        case taskStatus.finished:
            statusClass = 'finished'
            break
        case taskStatus.progress:
            statusClass = 'in-progress'
            break
        case taskStatus.notStarted:
            statusClass = 'not-started'
            break
    }
    
    return  `
            <article class="task-item ${statusClass}" id="${taskId}">
                <div>
                    <h3>${task.title}</h3>
                    <time class="task-meta">${date}</time>
                </div>
                <button class="btn-delete" id="btnDelete-${task.id}" title="Borrar tarea">
                    <box-icon name='trash'></box-icon>
                </button>
                <button class="btn-status" id="btnStatus-${task.id}" title="${taskStatusMessage}">
                    <box-icon name='task' id="icon"></box-icon> 
                    <box-icon name='task-x' id="icon-x"></box-icon>
                    <br> ${task.status}
                </button>
            </article>        
            `
}


/* Metodos ------------------------------------------------------------------- */

/* Add task */
document.getElementById('addTaskBtn').addEventListener('click', function(e) {
    e.preventDefault()
    addTask()
})

const taskStatusInput = document.getElementById('taskStatus')

Object.keys(taskStatus).forEach(key => {
    const option = document.createElement('option')
    option.value = key
    option.textContent = taskStatus[key]
    taskStatusInput.appendChild(option)
})

function addTask() {
    const taskTitleInput = document.getElementById('taskTitle')
    const taskDescriptionInput = document.getElementById('taskDescription')
    const taskStatusInput = document.getElementById('taskStatus')

    const taskTitle = taskTitleInput.value.trim()
    const taskDescription = taskDescriptionInput.value.trim()
    const taskStatusValue = taskStatusInput.value

    if (taskTitle === '' || taskDescription === '') {
        ToastIt.now({
            message: "Por favor, completa todos los campos",
            style: 'error',
            timer: 3000
        })
        return
    }

    const newTask = new Task(tasks.length + 1, taskTitle, taskDescription, new Date().toLocaleString(), null, taskStatus[taskStatusValue])

    const opciones = {
        method: 'POST',
        headers: { "content-type": "application/json" },
        body: JSON.stringify(newTask)
    }

    fetch(URLTasks, opciones)
    .then((response)=> {
        if (!response.ok) {
            throw new Error("No se puede crear la tarea.")
        }
        return response.json()
    })
    .then(()=> {
        ToastIt.now({
            message: 'Tarea creada correctamente!',
            style: 'success',
            timer: 2500,
        })
        setTimeout(() => {
            window.location.href = 'index.html'
        }, 2000)
    })
    .catch((error)=> {
        ToastIt.now({
            message: error.message,
            style: 'error',
            timer: 3700,
            close: true
        })
    })

    setTimeout(()=> {
        taskTitleInput.value = ''
        taskDescriptionInput.value = ''
        taskStatusInput.value = ''
    }, 2000)
}

/* Estados update y delete */

function handleTaskAction(event) {
    const target = event.target
    const taskId = target.closest('article').id.split('-')[1]
    const taskItem = document.getElementById(`task-${taskId}`)

    if (target.classList.contains('btn-delete') || target.closest('.btn-delete')) {
        event.stopPropagation()
        if (taskItem) {
            taskItem.remove()
            deleteTaskFromServer(taskId)
            ToastIt.now({
                message: "Tarea eliminada con éxito",
                style: 'success',
                timer: 3500,
                close: true
            })
        }
    } else if (target.classList.contains('btn-status') || target.closest('.btn-status')) {
        const task = tasks.find(t => t.id == taskId)
        if (task) {
            let newStatus
            switch (task.status) {
                case taskStatus.notStarted:
                    newStatus = taskStatus.progress
                    break
                case taskStatus.progress:
                    newStatus = taskStatus.finished
                    break
                case taskStatus.finished:
                    newStatus = taskStatus.notStarted
                    break
            }

            updateTaskStatus(taskId, newStatus)

            ToastIt.now({
                message: "Estado actualizado con éxito",
                style: 'success',
                timer: 3000
            })

            taskItem.classList.remove('not-started', 'in-progress', 'finished')
            switch (newStatus) {
                case taskStatus.notStarted:
                    taskItem.classList.add('not-started')
                    break
                case taskStatus.progress:
                    taskItem.classList.add('in-progress')
                    break
                case taskStatus.finished:
                    taskItem.classList.add('finished')
                    break
            }
        }
    }
}

function addEventListenersToTask(taskId) {
    document.getElementById(`btnDelete-${taskId}`).addEventListener('click', handleTaskAction)
    document.getElementById(`btnStatus-${taskId}`).addEventListener('click', handleTaskAction)
}

/* GetById */

async function getById(taskId) {
    try {
        const response = await fetch(`${URLTasks}/${taskId}`)
        if (!response.ok) {
            throw new Error("No se puede obtener la tarea.")
        }
        const taskData = await response.json()
        return taskData
    } catch (error) {
        ToastIt.now({
            message: error.message,
            style: 'error',
            timer: 3500,
            close: true
        })
        return null
    }
}

/* Cargar */

async function cargarTasks() {
    try {
        const response = await fetch(URLTasks)
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

        if (tasks.length > 0) {
            taskList.innerHTML = ""
            tasks.forEach(taskData => {
                const task = new Task(taskData.id, taskData.title, taskData.description, taskData.startDate, taskData.endDate, taskData.status)
                const cardHTML = crearCardHTML(task)

                const taskItem = document.createElement('div')
                taskItem.innerHTML = cardHTML

                taskList.appendChild(taskItem.firstElementChild)
                addEventListenersToTask(taskData.id)
        })
        } else {
            taskList.innerHTML = retornarError()
        }
    } catch (error) {
        taskList.innerHTML = retornarError()
    }
}

cargarTasks()

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
            timer: 3500,
            close: true
        })
    }
})

function retornarError() {
    return `
            <p><b>No se pudieron cargar las tareas</b> <br> Intenta nuevamente en unos segundos...</p>
    `
}

/* Delete */

function deleteTaskFromServer(taskId) {
    fetch(`${URLTasks}/${taskId}`, {
        method: 'DELETE'
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("No se puede eliminar la tarea.")
        }

        cargarTasks()
    })
    .catch((error) => {
        ToastIt.now({
            message: error.message,
            style: 'error',
            timer: 3500,
            close: true
        })
    })
}

/* Update */

async function updateTaskStatus(taskId, newStatus) {
    const taskData = await getById(taskId)
    if (!taskData) {
        return
    }

    const task = new Task(taskData.id, taskData.title, taskData.description, taskData.startDate, taskData.endDate, taskData.status)
    task.updateStatus(newStatus)

    try {
        const response = await fetch(`${URLTasks}/${taskId}`, {
            method: 'PUT',
            headers: { "content-type": "application/json" },
            body: JSON.stringify(task)
        })

        if (!response.ok) {
            throw new Error("No se puede actualizar la tarea.")
        }

        cargarTasks()
    } catch (error) {
        ToastIt.now({
            message: error.message,
            style: 'error',
            timer: 3500,
            close: true
        })
    }
}

/* Idiomas ------------------------------------------------------------------- */

const languages = ['English', 'Español', 'Français', 'Deutsch', 'Italiano', 'Português']
const languageSelect = document.getElementById('taskLanguage')

languages.forEach(language => {
    const option = document.createElement('option')
    option.value = language
    option.textContent = language
    languageSelect.appendChild(option)
})

document.getElementById('saveConfigApp').addEventListener('click', function(e) {
    e.preventDefault()
    changeLanguage()
})

function changeLanguage() {
    const selectedLanguage = document.getElementById('taskLanguage').value
    
    console.log('Idioma seleccionado:', selectedLanguage)
}

/* Menu ------------------------------------------------------------------- */
document.getElementById('menuToggle').addEventListener('click', () => {
    const menu = document.getElementById('menu')
    menu.classList.toggle('show')
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

document.getElementById('menuConfigApp').addEventListener('click', () => {
    openModal('modalConfigApp')
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
