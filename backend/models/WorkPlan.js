const { pool } = require('../config/database');

class WorkPlan {
  // Get all work plans with operators
  static async getAll(date = null) {
    try {
      let query = `
        SELECT 
          wp.id,
          DATE_FORMAT(wp.production_date, '%Y-%m-%d') as production_date,
          wp.job_code,
          wp.job_name,
          wp.start_time,
          wp.end_time,
          ff.is_finished,
          ff.updated_at as finished_at,
          GROUP_CONCAT(DISTINCT u.name ORDER BY u.name) as operators,
          GROUP_CONCAT(DISTINCT wpo.id_code ORDER BY wpo.id_code) as operator_codes
        FROM work_plans wp
        LEFT JOIN finished_flags ff ON wp.id = ff.work_plan_id
        LEFT JOIN work_plan_operators wpo ON wp.id = wpo.work_plan_id
        LEFT JOIN users u ON wpo.user_id = u.id OR wpo.id_code = u.id_code
      `;
      
      const params = [];
      if (date) {
        // แก้ไขการเปรียบเทียบวันที่ให้ถูกต้อง
        query += ' WHERE DATE(wp.production_date) = ?';
        params.push(date);
        console.log('🔍 Query date:', date);
        console.log('🔍 SQL Query:', query);
        console.log('🔍 Params:', params);
      }
      
      query += ' GROUP BY wp.id ORDER BY wp.production_date DESC, wp.start_time ASC';
      
      const [rows] = await pool.execute(query, params);
      console.log('📊 Raw database results:', rows.length, 'rows');
      return rows;
    } catch (error) {
      throw new Error(`Error fetching work plans: ${error.message}`);
    }
  }

  // Get work plan by ID
  static async getById(id) {
    try {
      const query = `
        SELECT 
          wp.id,
          DATE_FORMAT(wp.production_date, '%Y-%m-%d') as production_date,
          wp.job_code,
          wp.job_name,
          wp.start_time,
          wp.end_time,
          ff.is_finished,
          ff.updated_at as finished_at
        FROM work_plans wp
        LEFT JOIN finished_flags ff ON wp.id = ff.work_plan_id
        WHERE wp.id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const workPlan = rows[0];
      
      // Get operators
      const operatorQuery = `
        SELECT 
          wpo.id,
          wpo.user_id,
          wpo.id_code,
          u.name
        FROM work_plan_operators wpo
        LEFT JOIN users u ON wpo.user_id = u.id OR wpo.id_code = u.id_code
        WHERE wpo.work_plan_id = ?
      `;
      
      const [operators] = await pool.execute(operatorQuery, [id]);
      workPlan.operators = operators;
      
      return workPlan;
    } catch (error) {
      throw new Error(`Error fetching work plan: ${error.message}`);
    }
  }

  // Create new work plan
  static async create(workPlanData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const { production_date, job_code, job_name, start_time, end_time, operators } = workPlanData;
      
      console.log('🗄️ Database insert - production_date:', production_date);
      console.log('🗄️ Database insert - production_date type:', typeof production_date);
      
      // แปลงวันที่ให้เป็นรูปแบบที่ถูกต้อง
      let formattedDate = production_date;
      if (production_date instanceof Date) {
        formattedDate = production_date.toISOString().split('T')[0];
      } else if (typeof production_date === 'string') {
        // ถ้าเป็น string ให้ตรวจสอบรูปแบบ
        if (production_date.includes('T')) {
          formattedDate = production_date.split('T')[0];
        }
      }
      console.log('🗄️ Formatted date for database:', formattedDate);
      
      // Insert work plan
      const insertQuery = `
        INSERT INTO work_plans (production_date, job_code, job_name, start_time, end_time)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const [result] = await connection.execute(insertQuery, [
        formattedDate, job_code, job_name, start_time, end_time
      ]);
      
      const workPlanId = result.insertId;
      
      // Insert operators if provided
      if (operators && operators.length > 0) {
        const operatorQuery = `
          INSERT INTO work_plan_operators (work_plan_id, user_id, id_code)
          VALUES (?, ?, ?)
        `;
        
        for (const operator of operators) {
          await connection.execute(operatorQuery, [
            workPlanId,
            operator.user_id || null,
            operator.id_code || null
          ]);
        }
      }
      
      await connection.commit();
      return { id: workPlanId, ...workPlanData };
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating work plan: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Update work plan
  static async update(id, workPlanData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const { production_date, job_code, job_name, start_time, end_time, operators } = workPlanData;
      
      // แปลงวันที่ให้เป็นรูปแบบที่ถูกต้อง
      let formattedDate = production_date;
      if (production_date instanceof Date) {
        formattedDate = production_date.toISOString().split('T')[0];
      } else if (typeof production_date === 'string') {
        if (production_date.includes('T')) {
          formattedDate = production_date.split('T')[0];
        }
      }
      
      // Update work plan
      const updateQuery = `
        UPDATE work_plans 
        SET production_date = ?, job_code = ?, job_name = ?, start_time = ?, end_time = ?
        WHERE id = ?
      `;
      
      await connection.execute(updateQuery, [
        formattedDate, job_code, job_name, start_time, end_time, id
      ]);
      
      // Update operators
      if (operators !== undefined) {
        // Delete existing operators
        await connection.execute('DELETE FROM work_plan_operators WHERE work_plan_id = ?', [id]);
        
        // Insert new operators
        if (operators.length > 0) {
          const operatorQuery = `
            INSERT INTO work_plan_operators (work_plan_id, user_id, id_code)
            VALUES (?, ?, ?)
          `;
          
          for (const operator of operators) {
            await connection.execute(operatorQuery, [
              id,
              operator.user_id || null,
              operator.id_code || null
            ]);
          }
        }
      }
      
      await connection.commit();
      return { id, ...workPlanData };
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error updating work plan: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Delete work plan
  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Delete related data first (foreign key constraints)
      await connection.execute('DELETE FROM finished_flags WHERE work_plan_id = ?', [id]);
      await connection.execute('DELETE FROM work_plan_operators WHERE work_plan_id = ?', [id]);
      
      // Delete the work plan
      const query = 'DELETE FROM work_plans WHERE id = ?';
      const [result] = await connection.execute(query, [id]);
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error deleting work plan: ${error.message}`);
    } finally {
      connection.release();
    }
  }

  // Mark work plan as finished
  static async markAsFinished(id) {
    try {
      const query = `
        INSERT INTO finished_flags (work_plan_id, is_finished, updated_at)
        VALUES (?, 1, NOW())
        ON DUPLICATE KEY UPDATE is_finished = 1, updated_at = NOW()
      `;
      
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      throw new Error(`Error marking work plan as finished: ${error.message}`);
    }
  }

  // Mark work plan as unfinished
  static async markAsUnfinished(id) {
    try {
      const query = `
        INSERT INTO finished_flags (work_plan_id, is_finished, updated_at)
        VALUES (?, 0, NOW())
        ON DUPLICATE KEY UPDATE is_finished = 0, updated_at = NOW()
      `;
      
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      throw new Error(`Error marking work plan as unfinished: ${error.message}`);
    }
  }
}

module.exports = WorkPlan; 