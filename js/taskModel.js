export const taskStatus = {
    notStarted: 'Sin empezar',
    progress: 'En progreso',
    finished: 'Finalizada'
}

export class Task {
    constructor(id, title, description, startDate = new Date().toLocaleString(), endDate = null, status = taskStatus.notStarted) {
        this.id = id
        this.title = title
        this.description = description
        this.startDate = startDate 
        this.endDate = status === taskStatus.finished ? new Date().toLocaleString() : endDate
        this.status = status
    }

    updateStatus(newStatus) {
        if (!Object.values(taskStatus).includes(newStatus)) {
            throw new Error(`Estado inválido: ${newStatus}`)
        }

        if (this.status !== taskStatus.finished && newStatus === taskStatus.finished) {
            this.endDate = new Date().toLocaleString()
        } 
        this.status = newStatus
        
        if (newStatus !== taskStatus.finished) {
            this.endDate = null
        }
    }
}