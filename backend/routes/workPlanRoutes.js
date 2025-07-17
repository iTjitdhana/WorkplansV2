const express = require('express');
const { body } = require('express-validator');
const WorkPlanController = require('../controllers/workPlanController');

const router = express.Router();

// Validation middleware
const workPlanValidation = [
  body('production_date')
    .isISO8601()
    .toDate()
    .withMessage('Production date must be a valid date'),
  body('job_code')
    .notEmpty()
    .withMessage('Job code is required')
    .isLength({ max: 50 })
    .withMessage('Job code must not exceed 50 characters'),
  body('job_name')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Job name must not exceed 255 characters'),
  body('start_time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM:SS format'),
  body('end_time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM:SS format'),
  body('operators')
    .optional()
    .isArray()
    .withMessage('Operators must be an array')
];

// Routes
router.get('/', WorkPlanController.getAll);
router.get('/:id', WorkPlanController.getById);
router.post('/', workPlanValidation, WorkPlanController.create);
router.put('/:id', workPlanValidation, WorkPlanController.update);
router.delete('/:id', WorkPlanController.delete);
router.patch('/:id/finish', WorkPlanController.markAsFinished);
router.patch('/:id/unfinish', WorkPlanController.markAsUnfinished);

module.exports = router; 