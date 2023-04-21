const mongoose = require('mongoose');
const validator = require('validator');

const testSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a Test name'],
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  company: {
    type: String,
    required: [true, 'Please enter your organisation name'],
  },
  key: {
    type: String,
    unique: true,
  },
  Question: {
    type: [
      {
        name: {
          type: String,
          required: [true, 'Please enter question name'],
        },
        statement: {
          type: String,
          required: [true, 'Please enter question description'],
        },
        constraints: {
          type: String,
          required: [true, 'Please enter constraints for the question'],
        },
        testcases: {
          type: [
            {
              input: {
                type: [String],
                required: [true, 'Please enter input for the test case'],
              },
              output: {
                type: [String],
                required: [true, 'Please enter output for the test case'],
              },
            },
          ],
          validate: {
            validator: function () {
              if (this.testcases.length === 0) return false;
              else return true;
            },
            message: 'Please enter a test case',
          },
        },
      },
    ],
    validate: {
      validator: function () {
        if (this.Question.length === 0) return false;
        else return true;
      },
      message: 'Please enter a question set',
    },
  },
  startTime: {
    type: Date,
    required: [true, 'Please enter test start time'],
  },
  endTime: {
    type: Date,
    required: [true, 'Please enter test end time'],
  },
  duration: {
    type: Number,
    required: [true, 'Please enter test duration'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please enter user id'],
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

testSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

const Test = mongoose.model('Test', testSchema);
module.exports = Test;
