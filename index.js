const express = require('express');
const cors=require("cors");

const app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const connectDB = require('./config/db');
connectDB();

// Routes
const testRoute = require('./routes/testRoute');
app.use('/api', testRoute);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

