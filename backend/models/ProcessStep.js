const { pool } = require('../config/database');

class ProcessStep {
  // Get all process steps
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT 
          id,
          job_code,
          job_name,
          date_recorded,
          worker_count,
          process_number,
          process_description
        FROM process_steps
      `;
      
      const params = [];
      const conditions = [];
      
      if (filters.job_code) {
        conditions.push('job_code = ?');
        params.push(filters.job_code);
      }
      
      if (filters.date_recorded) {
        conditions.push('date_recorded = ?');
        params.push(filters.date_recorded);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY job_code, process_number';
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching process steps: ${error.message}`);
    }
  }

  // Get process steps by job code
  static async getByJobCode(jobCode) {
    try {
      const query = `
        SELECT 
          id,
          job_code,
          job_name,
          date_recorded,
          worker_count,
          process_number,
          process_description
        FROM process_steps
        WHERE job_code = ?
        ORDER BY process_number
      `;
      
      const [rows] = await pool.execute(query, [jobCode]);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching process steps for job code: ${error.message}`);
    }
  }

  // Get process step by ID
  static async getById(id) {
    try {
      const query = `
        SELECT 
          id,
          job_code,
          job_name,
          date_recorded,
          worker_count,
          process_number,
          process_description
        FROM process_steps
        WHERE id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error fetching process step: ${error.message}`);
    }
  }

  // Create new process step
  static async create(processStepData) {
    try {
      const { job_code, job_name, date_recorded, worker_count, process_number, process_description } = processStepData;
      
      const query = `
        INSERT INTO process_steps (job_code, job_name, date_recorded, worker_count, process_number, process_description)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        job_code, job_name, date_recorded, worker_count, process_number, process_description
      ]);
      
      return { id: result.insertId, ...processStepData };
    } catch (error) {
      throw new Error(`Error creating process step: ${error.message}`);
    }
  }

  // Update process step
  static async update(id, processStepData) {
    try {
      const { job_code, job_name, date_recorded, worker_count, process_number, process_description } = processStepData;
      
      const query = `
        UPDATE process_steps 
        SET job_code = ?, job_name = ?, date_recorded = ?, worker_count = ?, process_number = ?, process_description = ?
        WHERE id = ?
      `;
      
      const [result] = await pool.execute(query, [
        job_code, job_name, date_recorded, worker_count, process_number, process_description, id
      ]);
      
      return result.affectedRows > 0 ? { id, ...processStepData } : null;
    } catch (error) {
      throw new Error(`Error updating process step: ${error.message}`);
    }
  }

  // Delete process step
  static async delete(id) {
    try {
      const query = 'DELETE FROM process_steps WHERE id = ?';
      const [result] = await pool.execute(query, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting process step: ${error.message}`);
    }
  }

  // Get unique job codes
  static async getJobCodes() {
    try {
      const query = `
        SELECT DISTINCT job_code, job_name
        FROM process_steps
        ORDER BY job_code
      `;
      
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching job codes: ${error.message}`);
    }
  }

  // Create multiple process steps for a job
  static async createBulk(jobCode, jobName, dateRecorded, processSteps) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const query = `
        INSERT INTO process_steps (job_code, job_name, date_recorded, worker_count, process_number, process_description)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const createdSteps = [];
      
      for (const step of processSteps) {
        const [result] = await connection.execute(query, [
          jobCode,
          jobName,
          dateRecorded,
          step.worker_count,
          step.process_number,
          step.process_description
        ]);
        
        createdSteps.push({
          id: result.insertId,
          job_code: jobCode,
          job_name: jobName,
          date_recorded: dateRecorded,
          ...step
        });
      }
      
      await connection.commit();
      return createdSteps;
    } catch (error) {
      await connection.rollback();
      throw new Error(`Error creating bulk process steps: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = ProcessStep; 