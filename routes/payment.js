// backend/routes/payment.js
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const path = require("path");
const router = express.Router();
const generateReceipt = require("../helpers/generateReceipt");
const { sendReceiptEmailDonor, sendReceiptEmailNgo } = require("../helpers/emailService");
const activityEmitter = require("../helpers/activityEmitter");
const auth = require("../helpers/authMiddleware");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // store in .env
  key_secret: process.env.RAZORPAY_KEY_SECRET, // store in .env
});

router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  try {
    const options = {
      amount: amount * 100, // amount in paise (INR)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (err) {
    res.status(500).json({ message: "Order creation failed", error: err });
  }
});

router.post("/verify", async (req, res) => {
  const { orderId, paymentId, signature } =
    req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(orderId + "|" + paymentId)
    .digest("hex");
  // console.log(signature, generatedSignature)

  if (generatedSignature === signature) {
    // Payment is verified
    // Save to DB or return success
    try {
      // Proceed to email step next
      return res.status(200).json({
        status: "success",
        message: "Payment verified successfully. Proceed to receipt generation.",
      });
    } catch (err) {
      return res
        .status(500)
        .json({ status: "failure", message: "Internal error" });
    }
  } else {
    return res
      .status(400)
      .json({ status: "failure", message: "Payment verification failed" });
  }
});

router.post("/generate-receipt", auth, async (req, res) => {
  const { name, email, amount, paymentId, ngoName, ngoEmail } = req.body;

  try {
    const receiptPath = await generateReceipt({
      name,
      email,
      amount,
      paymentId,
      ngoName,
    });

    await sendReceiptEmailDonor(email, receiptPath, name, amount);
    await sendReceiptEmailNgo(ngoEmail, receiptPath, ngoName, amount, name)

    const receiptName = path.basename(receiptPath);
    console.log(receiptName)

    activityEmitter.emit("user-donate", {
      userId: req.user.userId,
      amount,
      ngoName
    });

    return res.status(200).json({ status: "success", receiptName });
  } catch (err) {
    console.error("Error in receipt generation or email:", err);
    return res.status(500).json({
      status: "failure",
      message: "Receipt generation or email failed",
    });
  }
});

module.exports = router;
