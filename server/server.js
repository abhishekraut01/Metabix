const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { exec } = require('child_process');
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');


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

  // Run the Python script with arguments (age, description)
  const pythonProcess = spawn('python3', [
    'path/to/your/script.py', 
    ageInt.toString(), 
    "Vega", // This could be replaced with the actual brand if dynamic
    "False", 
    description, 
    "fish" // Example allergy input, could be dynamic too
  ]);

  let output = '';
  let errorOutput = '';

  // Collect the stdout
  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  // Collect the stderr
  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  // On close, parse the output
  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python script failed with error: ${errorOutput}`);
      return res.status(500).json({ error: 'Error executing Python script' });
    }

    try {
      const result = JSON.parse(output); // Assuming JSON output
      res.json(result);
    } catch (parseError) {
      console.error(`Error parsing Python script output: ${parseError}`);
      res.status(500).json({ error: 'Error parsing Python response' });
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
