const express = require('express');

const cors = require('../middleware/cors');

module.exports = (app) => {
    app.use(express.json());
    app.use(cors());
}