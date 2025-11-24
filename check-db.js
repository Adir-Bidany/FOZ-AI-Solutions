
const uri =
    "mongodb+srv://admin:eUdhbWbfIQcxO8XH@cluster0.v8rcmbx.mongodb.net/?appName=Cluster0"; 

const mongoose = require('mongoose');

console.log("🔌 Connecting to MongoDB...");

mongoose.connect(uri)
  .then(() => {
    console.log("✅ SUCCESS! Connected to the database.");
    console.log("🚀 We are ready to build the AI Business Team.");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  });