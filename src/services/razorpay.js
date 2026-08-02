'use strict';

const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance = null;

const getRazorpay = () => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials are not configured');
    }
    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpayInstance;
};

const createOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  const razorpay = getRazorpay();
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
    notes,
  });
};

const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return expected === signature;
};

module.exports = {
  getRazorpay,
  createOrder,
  verifyPaymentSignature,
};
