const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { exec } = require('child_process');
const express = require('express');
const cors = require('cors');


const app = require("./app");
app.use(express.json()); 
app.use(cors());
// IMPORTED ROUTES
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const questionRoutes = require("./routes/question");

// CONFIGURATIONS
dotenv.config();

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);

app.get('/run-python/:age/:description', (req, res) => {
  // Execute the Python script
  let { age, description } = req.params;

  // Validate and convert age to integer
  let ageInt;
  try {
    ageInt = parseInt(age, 10);
    if (isNaN(ageInt)) {
      return res.status(400).json({ error: 'Age must be a valid integer.' });
    }
  } catch (error) {
    return res.status(400).json({ error: 'Invalid age parameter.' });
  }

  // Execute the Python script with age and description
  exec(`python check.py ${ageInt} "Vega" False "${description}" "fish"`, { maxBuffer: undefined }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error}`);
      return res.status(501).json({ error: 'Description is not specific enough, hence, no detection.' });
    }

    // Assuming the Python script prints a JSON result to stdout
    try {
      const result = JSON.parse(stdout);
      res.json(result);
    } catch (parseError) {
      console.error(`Error parsing Python script output: ${parseError}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});

// MONGOOSE SETUP
const PORT = process.env.PORT || 3001;
mongoose
  .connect('mongodb+srv://abhishekgajananraut:Abhishek007@cluster0.1ddax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {})
  .then(() => {
    if (process.env.NODE_ENV !== "test") {
      app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
    }
  })
  .catch((error) => console.log(`${error} did not connect`));

module.exports = app;
