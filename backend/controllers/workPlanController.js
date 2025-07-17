const WorkPlan = require('../models/WorkPlan');
const { validationResult } = require('express-validator');

class WorkPlanController {
  // Get all work plans
  static async getAll(req, res) {
    try {
      const { date } = req.query;
      console.log('Requested date:', date);
      console.log('Date type:', typeof date);
      
      const workPlans = await WorkPlan.getAll(date);
      console.log('Found work plans:', workPlans.length);
      console.log('Work plans data:', workPlans);
      
      res.json({
        success: true,
        data: workPlans
      });
    } catch (error) {
      console.error('Error in getAll:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get work plan by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const workPlan = await WorkPlan.getById(id);
      
      if (!workPlan) {
        return res.status(404).json({
          success: false,
          message: 'Work plan not found'
        });
      }
      
      res.json({
        success: true,
        data: workPlan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new work plan
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

      console.log('📝 Creating work plan with data:', req.body);
      console.log('📅 Production date from request:', req.body.production_date);
      console.log('📅 Production date type:', typeof req.body.production_date);

      const workPlan = await WorkPlan.create(req.body);
      
      res.status(201).json({
        success: true,
        data: workPlan,
        message: 'Work plan created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update work plan
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
      const workPlan = await WorkPlan.update(id, req.body);
      
      if (!workPlan) {
        return res.status(404).json({
          success: false,
          message: 'Work plan not found'
        });
      }
      
      res.json({
        success: true,
        data: workPlan,
        message: 'Work plan updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete work plan
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await WorkPlan.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Work plan not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Work plan deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mark work plan as finished
  static async markAsFinished(req, res) {
    try {
      const { id } = req.params;
      await WorkPlan.markAsFinished(id);
      
      res.json({
        success: true,
        message: 'Work plan marked as finished'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Mark work plan as unfinished
  static async markAsUnfinished(req, res) {
    try {
      const { id } = req.params;
      await WorkPlan.markAsUnfinished(id);
      
      res.json({
        success: true,
        message: 'Work plan marked as unfinished'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = WorkPlanController; 