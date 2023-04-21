const Result = require('../models/resultModel');
const Test = require('../models/testModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllResults = catchAsync(async (req, res, next) => {
  const results = await Result.find();

  res.status(200).json({
    status: 'success',
    message: 'All Results found',
    data: {
      results,
    },
  });
});

exports.getAllMyResults = catchAsync(async (req, res, next) => {
  const results = await Result.find({ createdBy: req.user.id });

  res.status(200).json({
    status: 'success',
    message: 'All Results found',
    data: {
      results,
    },
  });
});

exports.getResult = catchAsync(async (req, res, next) => {
  const test = await Test.findById(req.params.id);
  const result = await Result.findOne({ testID: req.params.id });

  if (!result) {
    return next(new AppError('No result found with that ID ', 404));
  }

  if (test.createdBy !== req.user.id) {
    return next(new AppError('You are not allowed to view this result', 403));
  }

  res.status(200).json({
    status: 'success',
    message: 'Result found',
    data: {
      result,
    },
  });
});

exports.getMyResult = catchAsync(async (req, res, next) => {
  const result = await Result.findOne({ testID: req.params.id });

  if (!result) {
    return next(new AppError('No result found with that ID ', 404));
  }

  if (result.createdBy.toHexString() !== req.user.id) {
    return next(new AppError('You are not allowed to view this result', 403));
  }

  res.status(200).json({
    status: 'success',
    message: 'Result found',
    data: {
      result,
    },
  });
});

exports.createResult = catchAsync(async (req, res, next) => {
  const test = await Test.findById(req.body.testID);

  if (!test) {
    return next(new AppError('No test found with that ID', 404));
  }

  const result = await Result.findOne({ testID: test._id });
  if (result) {
    return next(new AppError('Result of this test already exist', 400));
  }

  const newResult = await Result.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Result created successfully',
    data: {
      newResult,
    },
  });
});

exports.updateResult = catchAsync(async (req, res, next) => {
  const result = await Result.findByIdAndUpdate(req.params, req.body, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    return next(new AppError('No result found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Result updated successfully',
    data: {
      result,
    },
  });
});

exports.deleteResult = catchAsync(async (req, res, next) => {
  const result = await Result.findByIdAndDelete(req.params.id);

  if (!result) {
    return next(new AppError('No result found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Result deleted successfully',
    data: null,
  });
});
