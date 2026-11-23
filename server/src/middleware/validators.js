import { body, validationResult } from 'express-validator';

/**
 * Common validation result inspector middleware.
 * Returns 400 Bad Request with formatted validation errors if validation fails.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      success: false,
      message: firstError.msg,
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  validateRequest,
];

/**
 * Validation rules for user login
 */
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest,
];

/**
 * Validation rules for password update
 */
export const updatePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  validateRequest,
];

/**
 * Validation rules for pickup request creation
 */
export const createPickupValidator = [
  body('wasteType')
    .trim()
    .notEmpty()
    .withMessage('Waste type is required')
    .isIn(['wet', 'dry', 'recyclable', 'e-waste', 'hazardous'])
    .withMessage('Invalid waste category. Allowed: wet, dry, recyclable, e-waste, hazardous'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Pickup address is required'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),
  body('location.coordinates.*')
    .isNumeric()
    .withMessage('Coordinates values must be numbers'),
  validateRequest,
];

/**
 * Validation rules for doorstep pickup verification
 */
export const verifyPickupValidator = [
  body('segregation')
    .trim()
    .notEmpty()
    .withMessage('Segregation assessment is required')
    .isIn(['correct', 'partial', 'none'])
    .withMessage('Segregation must be correct, partial, or none'),
  validateRequest,
];

/**
 * Validation rules for dump hotspot reporting
 */
export const reportDumpValidator = [
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description of the garbage hotspot is required'),
  body('photoBefore')
    .trim()
    .notEmpty()
    .withMessage('Photo of the garbage hotspot is required'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),
  body('location.coordinates.*')
    .isNumeric()
    .withMessage('Coordinates values must be numbers'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Severity must be low, medium, or high'),
  validateRequest,
];
