const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

//START
const app = express();

//ENVIRONMENT
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

//STATIC ARCHIVES
app.use('/public', express.static(__dirname + '/public/images'));
app.use('/public/images', express.static(__dirname + '/public/images'));

//SETUP MONGODB
const dbs = require('./config/database');
const dbURI = isProduction ? dbs.dbProduction : dbs.dbTest;
mongoose
  .connect(dbURI,  {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
  .then(() => {
    console.log('Conectado ao banco mongodb');
  })
  .catch((err) => console.log(err));

//SETUP
app.set('view engine', 'ejs');

//CONFIGURATIONS
if (!isProduction) app.use(morgan('dev'));
app.use(cors());
app.disable('x-powered-by');
app.use(compression());

//SETUP BODY PARSER
app.use(bodyParser.urlencoded({ extended: false, limit: 1.5 * 1024 * 1024 }));
app.use(bodyParser.json({ limit: 1.5 * 1024 * 1024 }));

//MODELS
require('./models');

//ROUTES
app.use('/', require('./routes'));

//404 - ROUTE
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//OTHERS ERRORS - ROUTE
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  if (err.status !== 400) console.warn('Error: ', err.message, new Date());
  console.log(err);
  res.send(err);
});

//LISTEN
app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Rodando na //localhost:${PORT}`);
});

process.on('warning', (warning) => {
  console.log(warning.stack);
});
