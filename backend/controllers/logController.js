const Log = require('../models/Log');
const { validationResult } = require('express-validator');

class LogController {
  // Get all logs
  static async getAll(req, res) {
    try {
      const { work_plan_id, date, status } = req.query;
      const filters = {};
      
      if (work_plan_id) filters.work_plan_id = work_plan_id;
      if (date) filters.date = date;
      if (status) filters.status = status;
      
      const logs = await Log.getAll(filters);
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get logs by work plan ID
  static async getByWorkPlanId(req, res) {
    try {
      const { workPlanId } = req.params;
      const logs = await Log.getByWorkPlanId(workPlanId);
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get log by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const log = await Log.getById(id);
      
      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Log not found'
        });
      }
      
      res.json({
        success: true,
        data: log
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new log
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const log = await Log.create(req.body);
      
      res.status(201).json({
        success: true,
        data: log,
        message: 'Log created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update log
  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const log = await Log.update(id, req.body);
      
      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Log not found'
        });
      }
      
      res.json({
        success: true,
        data: log,
        message: 'Log updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete log
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Log.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Log not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Log deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Start process
  static async startProcess(req, res) {
    try {
      const { workPlanId, processNumber } = req.body;
      
      if (!workPlanId || !processNumber) {
        return res.status(400).json({
          success: false,
          message: 'Work plan ID and process number are required'
        });
      }
      
      const log = await Log.startProcess(workPlanId, processNumber);
      
      res.status(201).json({
        success: true,
        data: log,
        message: 'Process started successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Stop process
  static async stopProcess(req, res) {
    try {
      const { workPlanId, processNumber } = req.body;
      
      if (!workPlanId || !processNumber) {
        return res.status(400).json({
          success: false,
          message: 'Work plan ID and process number are required'
        });
      }
      
      const log = await Log.stopProcess(workPlanId, processNumber);
      
      res.status(201).json({
        success: true,
        data: log,
        message: 'Process stopped successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get process status
  static async getProcessStatus(req, res) {
    try {
      const { workPlanId } = req.params;
      const status = await Log.getProcessStatus(workPlanId);
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get production summary
  static async getProductionSummary(req, res) {
    try {
      const { date } = req.params;
      const summary = await Log.getProductionSummary(date);
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = LogController; 