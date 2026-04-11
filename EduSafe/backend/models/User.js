// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    // ADD PHONE FIELD
    phone: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits"]
    },
    role: {
      type: String,
      enum: ["director", "teacher", "student", "parent"],
      required: [true, "Role is required"],
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant is required"],
    },

    // For students
    grade: {
      type: String,
      required: function () {
        return this.role === "student";
      },
    },

    // For parents - link to student (optional)
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Additional field for school/organization
    school: {
      type: String,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);