// models/Form.js
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["mcq", "short", "long"],
      required: true
    },
    options: [
      {
        type: String,
        trim: true
      }
    ], // only used for mcq
    isRequired: {
      type: Boolean,
      default: false
    }
  },
  { _id: true } // keep _id for each question to reference in answers
);

const formSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    questions: [questionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Form", formSchema);
