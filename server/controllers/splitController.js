import Split from '../models/Split.js';
import { allSplitsData } from '../seed/splitsData.js';

// Helper: Seed default templates if missing
const ensureTemplatesSeeded = async (userId) => {
  const templateCount = await Split.countDocuments({ isTemplate: true });
  if (templateCount === 0) {
    console.log('No split templates found in database. Auto-seeding 10 default splits...');
    for (let i = 0; i < allSplitsData.length; i++) {
      const s = allSplitsData[i];
      await Split.create({
        user: userId || null,
        name: s.name,
        description: s.description,
        isActive: false,
        isTemplate: true,
        days: s.days,
      });
    }
  }
};

// @desc    Get user splits & templates
// @route   GET /api/splits
export const getSplits = async (req, res, next) => {
  try {
    await ensureTemplatesSeeded(req.user?._id);

    const splits = await Split.find({
      $or: [{ user: req.user._id }, { isTemplate: true }],
    }).sort({ isActive: -1, isTemplate: 1, createdAt: -1 });

    // Check if user has an active split
    const userActiveSplit = splits.find(
      (s) => s.isActive && s.user && s.user.toString() === req.user._id.toString()
    );

    // If user has an active split, format response so only user's active split is marked active
    const formattedSplits = splits.map((s) => {
      const splitObj = s.toObject();
      if (userActiveSplit) {
        splitObj.isActive = s._id.toString() === userActiveSplit._id.toString();
      }
      return splitObj;
    });

    res.status(200).json({
      success: true,
      data: formattedSplits,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single split
// @route   GET /api/splits/:id
export const getSplitById = async (req, res, next) => {
  try {
    const split = await Split.findById(req.params.id);

    if (!split) {
      return res.status(404).json({ success: false, message: 'Split not found' });
    }

    res.status(200).json({
      success: true,
      data: split,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new custom split
// @route   POST /api/splits
export const createSplit = async (req, res, next) => {
  try {
    const { name, description, days, isActive } = req.body;

    if (!name || !days || !days.length) {
      return res.status(400).json({ success: false, message: 'Please provide split name and day schedule' });
    }

    if (isActive) {
      // Deactivate other active splits for this user
      await Split.updateMany({ user: req.user._id }, { isActive: false });
    }

    const split = await Split.create({
      user: req.user._id,
      name,
      description: description || '',
      isActive: isActive !== undefined ? isActive : true,
      days,
    });

    res.status(201).json({
      success: true,
      data: split,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update split
// @route   PUT /api/splits/:id
export const updateSplit = async (req, res, next) => {
  try {
    let split = await Split.findById(req.params.id);

    if (!split) {
      return res.status(404).json({ success: false, message: 'Split not found' });
    }

    // If trying to modify a template, create a user-owned copy instead
    if (split.isTemplate && (!split.user || split.user.toString() !== req.user._id.toString())) {
      if (req.body.isActive) {
        await Split.updateMany({ user: req.user._id }, { isActive: false });
      }

      const userCopy = await Split.create({
        user: req.user._id,
        name: req.body.name || split.name,
        description: req.body.description !== undefined ? req.body.description : split.description,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        days: req.body.days || split.days,
        isTemplate: false,
      });

      return res.status(201).json({
        success: true,
        data: userCopy,
      });
    }

    if (split.user && split.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this split' });
    }

    if (req.body.isActive) {
      await Split.updateMany({ user: req.user._id }, { isActive: false });
    }

    split = await Split.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: split,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete split
// @route   DELETE /api/splits/:id
export const deleteSplit = async (req, res, next) => {
  try {
    const split = await Split.findById(req.params.id);

    if (!split) {
      return res.status(404).json({ success: false, message: 'Split not found' });
    }

    if (split.isTemplate) {
      return res.status(400).json({ success: false, message: 'Default templates cannot be deleted.' });
    }

    if (split.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this split' });
    }

    await split.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Split deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Activate a split (handles templates and user splits)
// @route   PUT /api/splits/:id/activate
export const activateSplit = async (req, res, next) => {
  try {
    // Deactivate existing active splits for this user
    await Split.updateMany({ user: req.user._id }, { isActive: false });

    let targetSplit = await Split.findById(req.params.id);

    if (!targetSplit) {
      return res.status(404).json({ success: false, message: 'Split not found' });
    }

    // If activating a template, check if user already has a local copy or create one
    if (targetSplit.isTemplate && (!targetSplit.user || targetSplit.user.toString() !== req.user._id.toString())) {
      let existingCopy = await Split.findOne({ user: req.user._id, name: targetSplit.name });

      if (existingCopy) {
        existingCopy.isActive = true;
        await existingCopy.save();
        return res.status(200).json({
          success: true,
          message: `${existingCopy.name} is now your active weekly split`,
          data: existingCopy,
        });
      }

      // Clone template to user's account and activate
      const clonedSplit = await Split.create({
        user: req.user._id,
        name: targetSplit.name,
        description: targetSplit.description,
        isActive: true,
        isTemplate: false,
        days: targetSplit.days,
      });

      return res.status(200).json({
        success: true,
        message: `${clonedSplit.name} is now your active weekly split`,
        data: clonedSplit,
      });
    }

    // User's own split
    targetSplit.isActive = true;
    await targetSplit.save();

    res.status(200).json({
      success: true,
      message: `${targetSplit.name} is now your active weekly split`,
      data: targetSplit,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Seed or reset default split templates
// @route   POST /api/splits/seed-templates
export const seedTemplates = async (req, res, next) => {
  try {
    await Split.deleteMany({ isTemplate: true });

    const inserted = [];
    for (const s of allSplitsData) {
      const created = await Split.create({
        user: req.user?._id || null,
        name: s.name,
        description: s.description,
        isActive: false,
        isTemplate: true,
        days: s.days,
      });
      inserted.push(created);
    }

    res.status(200).json({
      success: true,
      message: `Successfully seeded all ${inserted.length} split templates`,
      data: inserted,
    });
  } catch (err) {
    next(err);
  }
};

