// models/Assignment.js
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    submitted: {
      type: Boolean,
      default: false   // will become true when user submits response later
    }
  },
  { timestamps: true }
);

// prevent duplicate (same form, same employee) assignment
assignmentSchema.index({ form: 1, employee: 1 }, { unique: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
