const pool = require('../config/database');

async function initDatabaseTables() {
  try {
    console.log('开始初始化数据库表...');
    
    // 1. 创建投票记录表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS votes (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        flower_place_id INT UNSIGNED NOT NULL,
        vote_status ENUM('dormant','budding','blooming','withering') NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_flower_place (user_id, flower_place_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (flower_place_id) REFERENCES flower_places(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ 投票记录表 (votes) 创建成功');
    
    // 2. 创建系统配置表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS system_configs (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        config_key VARCHAR(50) NOT NULL UNIQUE,
        config_value TEXT,
        description VARCHAR(200),
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ 系统配置表 (system_configs) 创建成功');
    
    // 3. 创建操作日志表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS operation_logs (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED,
        action VARCHAR(50) NOT NULL,
        resource_type VARCHAR(50),
        resource_id INT UNSIGNED,
        ip_address VARCHAR(45),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ 操作日志表 (operation_logs) 创建成功');
    
    console.log('🎉 所有数据库表初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库表初始化失败:', error);
    process.exit(1);
  }
}

initDatabaseTables();
