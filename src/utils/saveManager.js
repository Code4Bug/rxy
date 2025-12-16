// 游戏存档管理工具
export class SaveManager {
  static SAVE_KEY = 'rxy_game_save'
  static AUTO_SAVE_INTERVAL = 30000 // 30秒自动保存

  // 保存游戏状态
  static saveGame(stores) {
    try {
      const saveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        player: stores.player.$state,
        world: stores.world.$state,
        combat: stores.combat.$state,
        gameLog: {
          logs: stores.gameLog.logs.slice(-100) // 只保存最近100条日志
        },
        quest: stores.quest.$state,
        alchemy: stores.alchemy.$state,
        sect: stores.sect.$state,
        adventure: stores.adventure.$state
      }

      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData))
      console.log('游戏已保存', new Date().toLocaleTimeString())
      return true
    } catch (error) {
      console.error('保存游戏失败:', error)
      return false
    }
  }

  // 加载游戏状态
  static loadGame(stores) {
    try {
      const saveDataStr = localStorage.getItem(this.SAVE_KEY)
      if (!saveDataStr) {
        console.log('未找到存档数据')
        return false
      }

      const saveData = JSON.parse(saveDataStr)
      
      // 验证存档版本
      if (!saveData.version) {
        console.warn('存档版本过旧，无法加载')
        return false
      }

      // 先重置所有store到初始状态
      Object.values(stores).forEach(store => {
        if (store && typeof store.$reset === 'function') {
          store.$reset()
        }
      })

      // 恢复各个store的状态
      if (saveData.player) {
        stores.player.$patch(saveData.player)
        
        // 数据验证和修复
        const player = stores.player
        
        // 确保HP和MP不超过最大值
        if (player.status.hp > player.stats.maxHp) {
          player.status.hp = player.stats.maxHp
        }
        if (player.status.mp > player.stats.maxMp) {
          player.status.mp = player.stats.maxMp
        }
        
        // 确保经验值不超过升级所需
        if (player.status.xp >= player.baseStats.maxXp) {
          player.status.xp = player.baseStats.maxXp - 1
        }
      }

      if (saveData.world) {
        stores.world.$patch(saveData.world)
      }

      if (saveData.combat) {
        stores.combat.$patch(saveData.combat)
      }

      if (saveData.gameLog && saveData.gameLog.logs) {
        // 清理日志ID中的小数部分
        const cleanedLogs = saveData.gameLog.logs.map(log => ({
          ...log,
          id: Math.floor(log.id) // 移除小数部分
        }))
        stores.gameLog.logs = cleanedLogs
      }

      if (saveData.quest) {
        stores.quest.$patch(saveData.quest)
      }

      if (saveData.alchemy) {
        stores.alchemy.$patch(saveData.alchemy)
      }

      if (saveData.sect) {
        stores.sect.$patch(saveData.sect)
      }

      if (saveData.adventure) {
        stores.adventure.$patch(saveData.adventure)
      }

      console.log('游戏加载成功', new Date(saveData.timestamp).toLocaleString())
      return true
    } catch (error) {
      console.error('加载游戏失败:', error)
      return false
    }
  }

  // 检查是否有存档
  static hasSaveData() {
    return localStorage.getItem(this.SAVE_KEY) !== null
  }

  // 获取存档信息
  static getSaveInfo() {
    try {
      const saveDataStr = localStorage.getItem(this.SAVE_KEY)
      if (!saveDataStr) return null

      const saveData = JSON.parse(saveDataStr)
      return {
        version: saveData.version,
        timestamp: saveData.timestamp,
        playerName: saveData.player?.name || '无名',
        playerLevel: saveData.player?.baseStats?.level || 1,
        cultivation: saveData.player?.baseStats?.cultivation || '凡人',
        location: saveData.player?.location || 'cave_start'
      }
    } catch (error) {
      console.error('获取存档信息失败:', error)
      return null
    }
  }

  // 删除存档
  static deleteSave() {
    try {
      localStorage.removeItem(this.SAVE_KEY)
      console.log('存档已删除')
      return true
    } catch (error) {
      console.error('删除存档失败:', error)
      return false
    }
  }

  // 导出存档（下载文件）
  static exportSave() {
    try {
      const saveDataStr = localStorage.getItem(this.SAVE_KEY)
      if (!saveDataStr) return false

      const blob = new Blob([saveDataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rxy_save_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('导出存档失败:', error)
      return false
    }
  }

  // 导入存档（从文件）
  static importSave(file, stores) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const saveDataStr = e.target.result
          const saveData = JSON.parse(saveDataStr)
          
          // 验证存档格式
          if (!saveData.version || !saveData.player) {
            reject(new Error('无效的存档文件'))
            return
          }

          // 保存到localStorage
          localStorage.setItem(this.SAVE_KEY, saveDataStr)
          
          // 加载到游戏中
          if (this.loadGame(stores)) {
            resolve(true)
          } else {
            reject(new Error('加载存档失败'))
          }
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error('读取文件失败'))
      reader.readAsText(file)
    })
  }

  // 创建新游戏（重置所有状态）
  static newGame(stores) {
    try {
      // 删除现有存档
      this.deleteSave()
      
      // 重置所有store到初始状态
      Object.values(stores).forEach(store => {
        if (store && typeof store.$reset === 'function') {
          store.$reset()
        }
      })
      
      console.log('新游戏已开始')
      return true
    } catch (error) {
      console.error('创建新游戏失败:', error)
      return false
    }
  }
}

// 自动保存管理器
export class AutoSaveManager {
  static instance = null
  static intervalId = null

  static start(stores) {
    if (this.intervalId) {
      this.stop()
    }

    this.intervalId = setInterval(() => {
      SaveManager.saveGame(stores)
    }, SaveManager.AUTO_SAVE_INTERVAL)

    console.log('自动保存已启动')
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('自动保存已停止')
    }
  }
}