const app = require('express')();

app.use('/v1', require('./v1/index'));

module.exports = app