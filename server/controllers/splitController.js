import Split from '../models/Split.js';

// @desc    Get user splits
// @route   GET /api/splits
export const getSplits = async (req, res, next) => {
  try {
    const splits = await Split.find({
      $or: [{ user: req.user._id }, { isTemplate: true }],
    }).sort({ isActive: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: splits,
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

    if (split.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

// @desc    Activate a split
// @route   PUT /api/splits/:id/activate
export const activateSplit = async (req, res, next) => {
  try {
    await Split.updateMany({ user: req.user._id }, { isActive: false });

    const split = await Split.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: true },
      { new: true }
    );

    if (!split) {
      return res.status(404).json({ success: false, message: 'Split not found' });
    }

    res.status(200).json({
      success: true,
      message: `${split.name} is now your active weekly split`,
      data: split,
    });
  } catch (err) {
    next(err);
  }
};
