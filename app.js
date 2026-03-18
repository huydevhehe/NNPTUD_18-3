var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// ❌ BỎ MONGODB
// let mongoose = require('mongoose')

// ✅ DÙNG POSTGRESQL
require('./utils/db'); // file bạn đã tạo

var app = express();

// ================= MIDDLEWARE =================
app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ================= ROUTES =================

// index
app.use('/', require('./routes/index'));

// API
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/products', require('./routes/products'));
app.use('/api/v1/categories', require('./routes/categories'));

// 🔥 AUTH (QUAN TRỌNG)
app.use('/auth', require('./routes/auth'));


// ================= 404 =================
app.use(function (req, res, next) {
  res.status(404).json({
    message: "API Not Found"
  });
});


// ================= ERROR HANDLER =================
app.use(function (err, req, res, next) {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Server error"
  });
});

module.exports = app;