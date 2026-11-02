import { DumpReport, User, Ward, Notification } from '../models/index.js';
import { creditPoints } from '../services/pointsService.js';
import { ECO_RULES } from '../config/ecoRules.js';
import { notifyUser, emitToAll } from '../services/socket.js';

// @desc    Report an illegal garbage dump hotspot
// @route   POST /api/dumps
// @access  Private/Citizen
export const reportDump = async (req, res, next) => {
  try {
    const { location, address, photoBefore, description, severity, ward } = req.body;

    if (!location || !location.coordinates || !photoBefore || !description) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates [lng, lat], photo, and description are required.',
      });
    }

    let reportWard = ward || req.user.ward;
    if (!reportWard) {
      const defaultWard = await Ward.findOne();
      reportWard = defaultWard?._id;
    }

    const dump = await DumpReport.create({
      reporter: req.user.id,
      ward: reportWard,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
      address: address || '',
      photoBefore,
      description,
      severity: severity || 'medium',
      status: 'open',
    });

    const populated = await DumpReport.findById(dump._id)
      .populate('reporter', 'name phone email avatar')
      .populate('ward', 'name code city');

    emitToAll('dump:created', populated);

    res.status(201).json({
      success: true,
      message: 'Garbage dump report submitted. Municipal sanitation team has been notified.',
      dump: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get public dump hotspot map data (anonymized)
// @route   GET /api/dumps/public
// @access  Public
export const getPublicDumps = async (req, res, next) => {
  try {
    const dumps = await DumpReport.find()
      .select('location address photoBefore photoAfter description severity status createdAt clearedAt')
      .populate('ward', 'name code')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: dumps.length,
      dumps,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dump reports (role-scoped)
// @route   GET /api/dumps
// @access  Private
export const getDumps = async (req, res, next) => {
  try {
    const { status, severity, ward, page = 1, limit = 15 } = req.query;
    const query = {};

    if (req.user.role === 'citizen') {
      query.reporter = req.user.id;
    } else if (req.user.role === 'worker') {
      query.$or = [
        { assignedWorker: req.user.id },
        { ward: req.user.ward, status: { $in: ['open', 'assigned'] } },
      ];
    } else if (req.user.role === 'admin') {
      if (ward) query.ward = ward;
    }

    if (status) query.status = status;
    if (severity) query.severity = severity;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await DumpReport.countDocuments(query);

    const dumps = await DumpReport.find(query)
      .populate('reporter', 'name phone email avatar')
      .populate('ward', 'name code city')
      .populate('assignedWorker', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      dumps,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign worker to clear dump
// @route   PATCH /api/dumps/:id/assign
// @access  Private/Admin
export const assignDump = async (req, res, next) => {
  try {
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({
        success: false,
        message: 'Worker ID is required for assignment.',
      });
    }

    const dump = await DumpReport.findById(req.params.id);
    if (!dump) {
      return res.status(404).json({
        success: false,
        message: 'Dump report not found.',
      });
    }

    dump.assignedWorker = workerId;
    dump.status = 'assigned';
    await dump.save();

    const populated = await DumpReport.findById(dump._id)
      .populate('reporter', 'name phone email avatar')
      .populate('ward', 'name code city')
      .populate('assignedWorker', 'name phone');

    // Notify worker
    notifyUser(workerId, {
      type: 'dump:assigned',
      dump: populated,
    });

    emitToAll('dump:updated', populated);

    res.status(200).json({
      success: true,
      message: 'Worker assigned to clear garbage hotspot.',
      dump: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear dump hotspot with after photo and reward citizen bonus points
// @route   PATCH /api/dumps/:id/clear
// @access  Private/Worker/Admin
export const clearDump = async (req, res, next) => {
  try {
    const { photoAfter, workerNotes } = req.body;

    if (!photoAfter) {
      return res.status(400).json({
        success: false,
        message: 'After photo is required to verify clearance.',
      });
    }

    const dump = await DumpReport.findById(req.params.id);
    if (!dump) {
      return res.status(404).json({
        success: false,
        message: 'Dump report not found.',
      });
    }

    if (dump.status === 'cleared') {
      return res.status(400).json({
        success: false,
        message: 'This dump report has already been marked cleared.',
      });
    }

    dump.status = 'cleared';
    dump.photoAfter = photoAfter;
    dump.clearedAt = new Date();
    if (workerNotes) dump.workerNotes = workerNotes;
    if (!dump.assignedWorker) dump.assignedWorker = req.user.id;

    // Credit +30 bonus points to citizen who reported this dump
    let bonusTransaction = null;
    if (!dump.bonusPointsCredited) {
      dump.bonusPointsCredited = true;
      bonusTransaction = await creditPoints({
        userId: dump.reporter,
        amount: ECO_RULES.POINTS.CLEARED_DUMP_REPORT, // +30
        reason: 'Valid Garbage Dump Report Cleared Bonus',
        refModel: 'DumpReport',
        refId: dump._id,
      });

      const notif = await Notification.create({
        user: dump.reporter,
        title: '🎉 Garbage Hotspot Cleared!',
        body: `The illegal dumping spot you reported at "${dump.address || 'your locality'}" has been cleaned! You earned +${ECO_RULES.POINTS.CLEARED_DUMP_REPORT} bonus eco-points.`,
        type: 'dump_update',
        link: '/dashboard/dumps',
      });

      notifyUser(dump.reporter.toString(), {
        type: 'dump:cleared',
        dumpId: dump._id,
        notification: notif,
      });
    }

    await dump.save();

    const populated = await DumpReport.findById(dump._id)
      .populate('reporter', 'name phone email avatar ecoBalance')
      .populate('ward', 'name code city')
      .populate('assignedWorker', 'name phone');

    emitToAll('dump:updated', populated);

    res.status(200).json({
      success: true,
      message: 'Dump marked cleared successfully. +30 bonus points awarded to reporter.',
      dump: populated,
      bonusTransaction,
    });
  } catch (err) {
    next(err);
  }
};
