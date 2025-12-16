import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameLogStore = defineStore('gameLog', () => {
    const logs = ref([])

    function addLog(message, type = 'info') {
        logs.value.push({
            id: Date.now() + Math.random(),
            message,
            type, // 'info', 'combat', 'gain', 'danger', 'adventure', 'quest', 'loss', 'warning', 'error'
            timestamp: new Date()
        })

        // Keep log size manageable
        if (logs.value.length > 100) {
            logs.value.shift()
        }
    }

    function clearLogs() {
        logs.value = []
    }

    return { logs, addLog, clearLogs }
})
