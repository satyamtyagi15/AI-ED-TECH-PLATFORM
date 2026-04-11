const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is not defined in .env file");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are no longer strictly needed in Mongoose 7+
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
