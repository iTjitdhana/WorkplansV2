const { pool } = require('../config/database');

class Log {
  // Get all logs with work plan details
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT 
          l.id,
          l.work_plan_id,
          l.process_number,
          l.status,
          l.timestamp,
          wp.job_code,
          wp.job_name,
          wp.production_date,
          ps.process_description
        FROM logs l
        LEFT JOIN work_plans wp ON l.work_plan_id = wp.id
        LEFT JOIN process_steps ps ON wp.job_code = ps.job_code AND l.process_number = ps.process_number
      `;
      
      const params = [];
      const conditions = [];
      
      if (filters.work_plan_id) {
        conditions.push('l.work_plan_id = ?');
        params.push(filters.work_plan_id);
      }
      
      if (filters.date) {
        conditions.push('DATE(l.timestamp) = ?');
        params.push(filters.date);
      }
      
      if (filters.status) {
        conditions.push('l.status = ?');
        params.push(filters.status);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY l.timestamp DESC';
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching logs: ${error.message}`);
    }
  }

  // Get logs by work plan ID
  static async getByWorkPlanId(workPlanId) {
    try {
      const query = `
        SELECT 
          l.id,
          l.work_plan_id,
          l.process_number,
          l.status,
          l.timestamp,
          ps.process_description
        FROM logs l
        LEFT JOIN work_plans wp ON l.work_plan_id = wp.id
        LEFT JOIN process_steps ps ON wp.job_code = ps.job_code AND l.process_number = ps.process_number
        WHERE l.work_plan_id = ?
        ORDER BY l.process_number, l.timestamp
      `;
      
      const [rows] = await pool.execute(query, [workPlanId]);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching logs for work plan: ${error.message}`);
    }
  }

  // Get log by ID
  static async getById(id) {
    try {
      const query = `
        SELECT 
          l.id,
          l.work_plan_id,
          l.process_number,
          l.status,
          l.timestamp,
          wp.job_code,
          wp.job_name,
          wp.production_date,
          ps.process_description
        FROM logs l
        LEFT JOIN work_plans wp ON l.work_plan_id = wp.id
        LEFT JOIN process_steps ps ON wp.job_code = ps.job_code AND l.process_number = ps.process_number
        WHERE l.id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error fetching log: ${error.message}`);
    }
  }

  // Create new log
  static async create(logData) {
    try {
      const { work_plan_id, process_number, status, timestamp } = logData;
      
      const query = `
        INSERT INTO logs (work_plan_id, process_number, status, timestamp)
        VALUES (?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        work_plan_id, process_number, status, timestamp || new Date()
      ]);
      
      return { id: result.insertId, ...logData };
    } catch (error) {
      throw new Error(`Error creating log: ${error.message}`);
    }
  }

  // Update log
  static async update(id, logData) {
    try {
      const { work_plan_id, process_number, status, timestamp } = logData;
      
      const query = `
        UPDATE logs 
        SET work_plan_id = ?, process_number = ?, status = ?, timestamp = ?
        WHERE id = ?
      `;
      
      const [result] = await pool.execute(query, [
        work_plan_id, process_number, status, timestamp, id
      ]);
      
      return result.affectedRows > 0 ? { id, ...logData } : null;
    } catch (error) {
      throw new Error(`Error updating log: ${error.message}`);
    }
  }

  // Delete log
  static async delete(id) {
    try {
      const query = 'DELETE FROM logs WHERE id = ?';
      const [result] = await pool.execute(query, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting log: ${error.message}`);
    }
  }

  // Start process
  static async startProcess(workPlanId, processNumber) {
    try {
      const query = `
        INSERT INTO logs (work_plan_id, process_number, status, timestamp)
        VALUES (?, ?, 'start', NOW())
      `;
      
      const [result] = await pool.execute(query, [workPlanId, processNumber]);
      
      return { 
        id: result.insertId, 
        work_plan_id: workPlanId, 
        process_number: processNumber, 
        status: 'start',
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Error starting process: ${error.message}`);
    }
  }

  // Stop process
  static async stopProcess(workPlanId, processNumber) {
    try {
      const query = `
        INSERT INTO logs (work_plan_id, process_number, status, timestamp)
        VALUES (?, ?, 'stop', NOW())
      `;
      
      const [result] = await pool.execute(query, [workPlanId, processNumber]);
      
      return { 
        id: result.insertId, 
        work_plan_id: workPlanId, 
        process_number: processNumber, 
        status: 'stop',
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Error stopping process: ${error.message}`);
    }
  }

  // Get process status for work plan
  static async getProcessStatus(workPlanId) {
    try {
      const query = `
        SELECT 
          l.process_number,
          l.status,
          l.timestamp,
          ps.process_description
        FROM logs l
        LEFT JOIN work_plans wp ON l.work_plan_id = wp.id
        LEFT JOIN process_steps ps ON wp.job_code = ps.job_code AND l.process_number = ps.process_number
        WHERE l.work_plan_id = ? AND l.id IN (
          SELECT MAX(id) FROM logs 
          WHERE work_plan_id = ? 
          GROUP BY process_number
        )
        ORDER BY l.process_number
      `;
      
      const [rows] = await pool.execute(query, [workPlanId, workPlanId]);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching process status: ${error.message}`);
    }
  }

  // Get production summary by date
  static async getProductionSummary(date) {
    try {
      const query = `
        SELECT 
          wp.job_code,
          wp.job_name,
          COUNT(DISTINCT l.process_number) as processes_started,
          SUM(CASE WHEN l.status = 'start' THEN 1 ELSE 0 END) as total_starts,
          SUM(CASE WHEN l.status = 'stop' THEN 1 ELSE 0 END) as total_stops,
          MIN(l.timestamp) as first_start,
          MAX(l.timestamp) as last_activity
        FROM logs l
        JOIN work_plans wp ON l.work_plan_id = wp.id
        WHERE DATE(l.timestamp) = ?
        GROUP BY wp.job_code, wp.job_name
        ORDER BY wp.job_code
      `;
      
      const [rows] = await pool.execute(query, [date]);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching production summary: ${error.message}`);
    }
  }
}

module.exports = Log; 