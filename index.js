const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSantize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const testRouter = require('./routes/testRoutes');
const resultRouter = require('./routes/resultRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const Test = require('./models/testModel');
const Result = require('./models/resultModel');
const catchAsync = require('./utils/catchAsync');

const app = express();

// Global midlewares
app.use(cors());

// Set security HTTP headers
app.use(helmet());
function removeSpecialEscapeSequences(str) {
  str = str.replaceAll('&lt;', '<');
  return str;
}

// Limit requests from same IP
const limiter = rateLimit({
  max: 1000,
  WindowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour!',
});
app.use('/api', limiter);

app.use(express.json());

// Data sanitize against NoSQL query injection attacks
app.use(mongoSantize());

//Data sanitize against xss
app.use(xss());

app.use(cookieParser());

const evaluateCode = async (req, res) => {
  try {
    const test = await Test.findById(req.body.testId);
    const func = eval(removeSpecialEscapeSequences(req.body.code));
    const testCase = test.Question.find((ele) => {
      return ele._id.toHexString() === req.body.questionId;
    }).testcases.reduce((t, c) => {
      return [
        ...t,
        c.input.map((a) => {
          if (isNaN(parseFloat(a))) {
            return a;
          } else {
            return parseFloat(a);
          }
        }),
      ];
    }, []);
    const CorrectResults = test.Question.find((ele) => {
      return ele._id.toHexString() === req.body.questionId;
    }).testcases.reduce((t, c) => {
      return [...t, c.output];
    }, []);
    const userResults = CorrectResults.map((e, i) => {
      if (func(testCase[i]) == e) return true;
      return false;
    });
    if (!res) {
      return userResults;
    }
    res.status(200).json({
      message: 'Evaluation Done!',
      data: userResults,
    });
  } catch (err) {
    let errorMessage = '';
    if (err instanceof SyntaxError) {
      errorMessage =
        'Syntax Error: Please check your code syntax and try again.';
    } else if (err instanceof TypeError) {
      errorMessage =
        'Syntax Error: Please check your code syntax and try again.';
    } else if (err.message && err.message.includes('timed out')) {
      errorMessage =
        'Syntax Error: Please check your code syntax and try again.';
    } else {
      errorMessage =
        'Syntax Error: Please check your code syntax and try again.';
    }
    if (res) {
      res.status(500).json({
        message: errorMessage,
      });
    }
  }
};

// routes
app.post('/js', async (req, res, next) => {
  await evaluateCode(req, res);
});

app.post(
  '/submit/test',
  catchAsync(async (req, res) => {
    const candidate = await Result.findOne({
      testID: req.body.testID,
      'candidate.email': req.body.user.email,
    });

    if (candidate) {
      res.status(400).json({
        status: 'fail',
        message: 'You have already submitted the test',
      });
      return;
    }
    const result = req.body.code.map(async (code) => {
      return await evaluateCode({
        body: {
          testId: req.body.testID,
          questionId: code.questionID,
          code: code.code,
        },
      });
    });
    let evaluatedResult = [];
    await Promise.all(result).then((values) => {
      evaluatedResult = values;
    });
    let userResult = req.body.user;
    let correctAns = 0;
    evaluatedResult.forEach((each) => {
      if (!each.includes(false)) {
        correctAns = correctAns + 1;
      }
    });
    let score = (correctAns / evaluatedResult.length) * 100;

    userResult.score = score;
    const newResult = await Result.updateOne(
      { testID: req.body.testID },
      { $push: { candidate: userResult } }
    );
    res.status(200).json({
      status: 'success',
      message: 'Your Test Submitted Successfully',
      data: {
        newResult,
      },
    });
  })
);

app.use('/tests', testRouter);
app.use('/results', resultRouter);
app.use('/users', userRouter);
app.get('/', (req, res) => {
  res.status(200).send('Hello Server is Up and fine!');
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
