const mongoose = require("mongoose");

async function main() {
  try {
    await mongoose.connect("mongodb+srv://deveshdanderwal:BGdYeCag9yW4xVcG@cluster0.t5kkik8.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0");
    console.log("✅ MongoDB Atlas connected successfully!");

    const userSchema = new mongoose.Schema({
      name: String,
      age: Number
    });

    const User = mongoose.model("User", userSchema);

    const newUser = new User({ name: "Devesh", age: 21 });
    await newUser.save();

    console.log("✅ Data inserted successfully!");
    process.exit(0); // script finish karne ke liye
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

main();
