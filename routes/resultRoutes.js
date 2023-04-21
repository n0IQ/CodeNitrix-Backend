const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const authController = require('../controllers/authController');

router.get(
  '/myResults',
  authController.protect,
  resultController.getAllMyResults
);

router.get(
  '/myResults/:id',
  authController.protect,
  resultController.getMyResult
);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    resultController.getAllResults
  )
  .post(authController.protect, resultController.createResult);

router
  .route('/id')
  .get(authController.protect, resultController.getResult)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    resultController.updateResult
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    resultController.deleteResult
  );

module.exports = router;
