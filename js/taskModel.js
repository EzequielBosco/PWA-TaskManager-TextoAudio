export const taskStatus = {
    notStarted: 'Sin empezar',
    progress: 'En progreso',
    finished: 'Finalizada'
}

export class Task {
    constructor(id, title, description, endDate = null, status = taskStatus.notStarted) {
        this.id = id
        this.title = title
        this.description = description
        this.startDate = new Date().toLocaleString()
        this.dueDate = endDate
        this.status = status
    }

    updateStatus(newStatus) {
        if (!Object.values(taskStatus).includes(newStatus)) {
            throw new Error(`Estado inválido: ${newStatus}`)
        }
        this.status = newStatus

        if (newStatus === taskStatus.finished) {
            this.endDate = new Date().toLocaleString()
        } else {
            this.endDate = null
        }
    }
}