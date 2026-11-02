import { IssueReport } from '../models/index.js';
import { emitToAll } from '../services/socket.js';

// @desc    Worker raises an issue report
// @route   POST /api/issues
// @access  Private/Worker
export const createIssue = async (req, res, next) => {
  try {
    const { type, description, vehicleId, wardId } = req.body;

    if (!type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Issue type and description are required.',
      });
    }

    const issue = await IssueReport.create({
      worker: req.user.id,
      vehicle: vehicleId || null,
      ward: wardId || req.user.ward || null,
      type,
      description,
      status: 'open',
    });

    const populated = await IssueReport.findById(issue._id)
      .populate('worker', 'name phone email')
      .populate('vehicle', 'regNumber type')
      .populate('ward', 'name code');

    emitToAll('issue:created', populated);

    res.status(201).json({
      success: true,
      message: 'Issue report submitted to administration.',
      issue: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all issues
// @route   GET /api/issues
// @access  Private/Admin
export const getIssues = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;

    const issues = await IssueReport.find(query)
      .populate('worker', 'name phone email')
      .populate('vehicle', 'regNumber type')
      .populate('ward', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update issue status & resolution notes
// @route   PATCH /api/issues/:id
// @access  Private/Admin
export const updateIssue = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const issue = await IssueReport.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue report not found.',
      });
    }

    if (status) {
      issue.status = status;
      if (status === 'resolved') issue.resolvedAt = new Date();
    }
    if (adminNotes !== undefined) issue.adminNotes = adminNotes;

    await issue.save();

    const populated = await IssueReport.findById(issue._id)
      .populate('worker', 'name phone email')
      .populate('vehicle', 'regNumber type')
      .populate('ward', 'name code');

    res.status(200).json({
      success: true,
      message: 'Issue status updated.',
      issue: populated,
    });
  } catch (err) {
    next(err);
  }
};
