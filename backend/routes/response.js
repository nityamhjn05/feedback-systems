// routes/response.js
const express = require("express");
const { auth } = require("../middleware/auth");
const Response = require("../models/Response");
const Assignment = require("../models/Assignment");

const router = express.Router();

// Employee submits responses
router.post("/submit/:formId", auth, async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body;  // [{ questionId: "...", answer: "..." }]

    // Save response
    const response = await Response.create({
      form: formId,
      employee: req.user.id,
      answers
    });

    // Update assignment status
    await Assignment.findOneAndUpdate(
      { form: formId, employee: req.user.id },
      { submitted: true }
    );

    // ============================================
    // SEND EMAIL NOTIFICATION TO ADMIN (NEW)
    // ============================================
    const Form = require("../models/Form");
    const Employee = require("../models/Employee");
    const { sendEmail } = require("../config/email");
    const { responseNotificationEmail } = require("../utils/emailTemplates");

    // Fetch form to get creator
    const form = await Form.findById(formId);

    if (form && form.createdBy) {
      // Fetch creator (admin) details
      const admin = await Employee.findById(form.createdBy);

      // Fetch submitter (employee) details for Reply-To
      const submitter = await Employee.findById(req.user.id);

      if (admin && admin.email) {
        // Send email asynchronously
        const responseLink = `${process.env.FRONTEND_URL}/admin/forms/${formId}/responses`;
        const emailTemplate = responseNotificationEmail(
          admin.name,
          req.user.name, // Submitter name (from auth middleware)
          form.title,
          responseLink
        );

        sendEmail({
          to: admin.email,
          replyTo: submitter ? submitter.email : undefined, // 👈 Allow admin to reply to Submitter
          subject: emailTemplate.subject,
          html: emailTemplate.html
        }).then(() => {
          console.log(`✅ Notification sent to admin ${admin.name} (${admin.email})`);
        }).catch(err => {
          console.error("❌ Failed to send admin notification:", err.message);
        });
      }
    }

    res.status(201).json({
      message: "Response submitted successfully",
      response
    });
  } catch (err) {
    console.error("Error submitting response:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
