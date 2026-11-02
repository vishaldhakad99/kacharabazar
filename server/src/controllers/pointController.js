import { EcoPointTransaction } from '../models/index.js';
import { calculateCitizenImpact } from '../services/pointsService.js';
import { ECO_RULES } from '../config/ecoRules.js';

// @desc    Get current user's eco-points summary & environmental impact
// @route   GET /api/points/summary
// @access  Private/Citizen
export const getPointsSummary = async (req, res, next) => {
  try {
    const impact = await calculateCitizenImpact(req.user.id);

    res.status(200).json({
      success: true,
      summary: impact,
      rules: ECO_RULES,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's points ledger history
// @route   GET /api/points/history
// @access  Private/Citizen
export const getPointsHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const query = { user: req.user.id };

    if (type) query.type = type;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await EcoPointTransaction.countDocuments(query);

    const history = await EcoPointTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      history,
    });
  } catch (err) {
    next(err);
  }
};
