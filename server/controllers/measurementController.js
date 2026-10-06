import Measurement from '../models/Measurement.js';

// @desc    Get user body measurements
// @route   GET /api/measurements
export const getMeasurements = async (req, res, next) => {
  try {
    const measurements = await Measurement.find({ user: req.user._id }).sort({ date: -1 });

    // Chart trend data (chronological)
    const chartData = [...measurements].reverse().map((m) => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: m.weightKg,
      chest: m.chestCm,
      arms: m.armsCm,
      waist: m.waistCm,
      thighs: m.thighsCm,
      calves: m.calvesCm,
      shoulders: m.shouldersCm,
    }));

    res.status(200).json({
      success: true,
      count: measurements.length,
      data: measurements,
      chartData,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add body measurement (Strictly NO body fat %)
// @route   POST /api/measurements
export const addMeasurement = async (req, res, next) => {
  try {
    const { weightKg, chestCm, armsCm, waistCm, thighsCm, calvesCm, shouldersCm, date, notes } = req.body;

    if (!weightKg) {
      return res.status(400).json({ success: false, message: 'Body weight (KG) is required.' });
    }

    const measurement = await Measurement.create({
      user: req.user._id,
      date: date ? new Date(date) : new Date(),
      weightKg: Number(weightKg),
      chestCm: chestCm ? Number(chestCm) : null,
      armsCm: armsCm ? Number(armsCm) : null,
      waistCm: waistCm ? Number(waistCm) : null,
      thighsCm: thighsCm ? Number(thighsCm) : null,
      calvesCm: calvesCm ? Number(calvesCm) : null,
      shouldersCm: shouldersCm ? Number(shouldersCm) : null,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Measurement logged successfully',
      data: measurement,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update measurement
// @route   PUT /api/measurements/:id
export const updateMeasurement = async (req, res, next) => {
  try {
    let measurement = await Measurement.findById(req.params.id);

    if (!measurement) {
      return res.status(404).json({ success: false, message: 'Measurement record not found' });
    }

    if (measurement.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this record' });
    }

    // Sanitize any accidental body fat field if sent
    delete req.body.bodyFat;
    delete req.body.bodyFatPercentage;

    measurement = await Measurement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: measurement,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete measurement
// @route   DELETE /api/measurements/:id
export const deleteMeasurement = async (req, res, next) => {
  try {
    const measurement = await Measurement.findById(req.params.id);

    if (!measurement) {
      return res.status(404).json({ success: false, message: 'Measurement record not found' });
    }

    if (measurement.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this record' });
    }

    await measurement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Measurement record deleted',
    });
  } catch (err) {
    next(err);
  }
};
