// 数据修复工具
export class DataFixer {
  // 修复存档数据中的异常值
  static fixSaveData() {
    try {
      const saveKey = 'rxy_game_save'
      const saveDataStr = localStorage.getItem(saveKey)
      
      if (!saveDataStr) {
        console.log('没有找到存档数据')
        return false
      }

      const saveData = JSON.parse(saveDataStr)
      let hasChanges = false

      // 修复玩家数据
      if (saveData.player) {
        const player = saveData.player

        // 修复HP超出最大值的问题
        if (player.status && player.baseStats) {
          const maxHp = player.baseStats.maxHp || 100
          const maxMp = player.baseStats.maxMp || 50

          if (player.status.hp > maxHp) {
            player.status.hp = maxHp
            hasChanges = true
            console.log(`修复HP: ${player.status.hp} -> ${maxHp}`)
          }

          if (player.status.mp > maxMp) {
            player.status.mp = maxMp
            hasChanges = true
            console.log(`修复MP: ${player.status.mp} -> ${maxMp}`)
          }

          // 修复经验值
          const maxXp = player.baseStats.maxXp || 100
          if (player.status.xp >= maxXp) {
            player.status.xp = maxXp - 1
            hasChanges = true
            console.log(`修复XP: ${player.status.xp} -> ${maxXp - 1}`)
          }
        }
      }

      // 修复游戏日志ID
      if (saveData.gameLog && saveData.gameLog.logs) {
        saveData.gameLog.logs = saveData.gameLog.logs.map(log => {
          const originalId = log.id
          const fixedId = Math.floor(log.id)
          
          if (originalId !== fixedId) {
            hasChanges = true
          }
          
          return {
            ...log,
            id: fixedId
          }
        })
        
        if (hasChanges) {
          console.log('修复了游戏日志ID中的小数部分')
        }
      }

      // 如果有修改，保存修复后的数据
      if (hasChanges) {
        localStorage.setItem(saveKey, JSON.stringify(saveData))
        console.log('存档数据已修复并保存')
        return true
      } else {
        console.log('存档数据正常，无需修复')
        return false
      }

    } catch (error) {
      console.error('修复存档数据时出错:', error)
      return false
    }
  }

  // 验证存档数据完整性
  static validateSaveData() {
    try {
      const saveKey = 'rxy_game_save'
      const saveDataStr = localStorage.getItem(saveKey)
      
      if (!saveDataStr) {
        return { valid: false, errors: ['没有找到存档数据'] }
      }

      const saveData = JSON.parse(saveDataStr)
      const errors = []

      // 检查必要的数据结构
      if (!saveData.version) {
        errors.push('缺少版本信息')
      }

      if (!saveData.player) {
        errors.push('缺少玩家数据')
      } else {
        const player = saveData.player
        
        if (!player.baseStats || !player.status) {
          errors.push('玩家数据结构不完整')
        } else {
          // 检查数值合理性
          if (player.status.hp > player.baseStats.maxHp) {
            errors.push(`HP超出最大值: ${player.status.hp} > ${player.baseStats.maxHp}`)
          }
          
          if (player.status.mp > player.baseStats.maxMp) {
            errors.push(`MP超出最大值: ${player.status.mp} > ${player.baseStats.maxMp}`)
          }
        }
      }

      // 检查游戏日志ID
      if (saveData.gameLog && saveData.gameLog.logs) {
        const hasDecimalIds = saveData.gameLog.logs.some(log => 
          log.id !== Math.floor(log.id)
        )
        
        if (hasDecimalIds) {
          errors.push('游戏日志ID包含小数部分')
        }
      }

      return {
        valid: errors.length === 0,
        errors
      }

    } catch (error) {
      return {
        valid: false,
        errors: [`数据解析错误: ${error.message}`]
      }
    }
  }
}