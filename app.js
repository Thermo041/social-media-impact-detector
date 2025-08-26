const mongoose = require("mongoose");

async function main() {
  try {
    await mongoose.connect("mongodb+srv://deveshdanderwal:BGdYeCag9yW4xVcG@cluster0.t5kkik8.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0");

    console.log("✅ MongoDB Atlas connected successfully!");
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

main();
