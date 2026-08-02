'use strict';

const crypto = require('crypto');
const { createOrder, verifyPaymentSignature } = require('../../../services/razorpay');
const { badRequest, success, forbidden, notFound } = require('../../../utils/api-response');
const { sendPaymentConfirmationWhatsApp } = require('../../../services/whatsapp');

const generateReceiptNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `RCP-${date}-${random}`;
};

module.exports = {
  async createOrder(ctx) {
    const parent = ctx.state.parent;
    const { feeId, amount } = ctx.request.body || {};

    if (!feeId || !amount || amount <= 0) {
      return badRequest(ctx, 'feeId and valid amount are required.');
    }

    const fee = await strapi.documents('api::fee.fee').findOne({
      documentId: feeId,
      populate: ['student'],
    });

    if (!fee) {
      return notFound(ctx, 'Fee record not found.');
    }

    const studentIds = (parent.students || []).map((s) => s.documentId);
    if (!studentIds.includes(fee.student?.documentId)) {
      return forbidden(ctx, 'You cannot pay fees for this student.');
    }

    const payAmount = Math.min(parseFloat(amount), parseFloat(fee.pendingAmount));
    if (payAmount <= 0) {
      return badRequest(ctx, 'No pending amount for this fee.');
    }

    const receipt = `fee_${fee.documentId}_${Date.now()}`;
    const order = await createOrder({
      amount: payAmount,
      receipt,
      notes: {
        feeId: fee.documentId,
        studentId: fee.student.documentId,
        parentId: parent.documentId,
      },
    });

    const payment = await strapi.documents('api::fee-payment.fee-payment').create({
      data: {
        student: fee.student.documentId,
        fee: fee.documentId,
        amount: payAmount,
        razorpayOrderId: order.id,
        transactionId: order.id,
        paymentMethod: 'razorpay',
        paymentDate: new Date(),
        status: 'pending',
      },
    });

    return success(ctx, {
      orderId: order.id,
      amount: payAmount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentDocumentId: payment.documentId,
      fee: {
        documentId: fee.documentId,
        pendingAmount: fee.pendingAmount,
      },
    });
  },

  async verifyPayment(ctx) {
    const parent = ctx.state.parent;
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentDocumentId,
    } = ctx.request.body || {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return badRequest(ctx, 'Payment verification fields are required.');
    }

    const isValid = verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return badRequest(ctx, 'Payment verification failed. Invalid signature.');
    }

    let payment;
    if (paymentDocumentId) {
      payment = await strapi.documents('api::fee-payment.fee-payment').findOne({
        documentId: paymentDocumentId,
        populate: ['student', 'fee'],
      });
    } else {
      payment = await strapi.documents('api::fee-payment.fee-payment').findFirst({
        filters: { razorpayOrderId },
        populate: ['student', 'fee'],
      });
    }

    if (!payment) {
      return notFound(ctx, 'Payment record not found.');
    }

    const studentIds = (parent.students || []).map((s) => s.documentId);
    if (!studentIds.includes(payment.student?.documentId)) {
      return forbidden(ctx, 'Access denied.');
    }

    if (payment.status === 'success') {
      return success(ctx, { message: 'Payment already verified', payment });
    }

    const receiptNumber = generateReceiptNumber();

    const updatedPayment = await strapi.documents('api::fee-payment.fee-payment').update({
      documentId: payment.documentId,
      data: {
        razorpayPaymentId,
        transactionId: razorpayPaymentId,
        status: 'success',
        receiptNumber,
        paymentDate: new Date(),
      },
      populate: ['student', 'fee', 'receipt'],
    });

    if (payment.fee?.documentId) {
      const fee = await strapi.documents('api::fee.fee').findOne({
        documentId: payment.fee.documentId,
      });

      const paidAmount = parseFloat(fee.paidAmount || 0) + parseFloat(payment.amount);
      const pendingAmount = Math.max(0, parseFloat(fee.totalAmount) - parseFloat(fee.discount || 0) - paidAmount);

      let feeStatus = 'partial';
      if (pendingAmount <= 0) feeStatus = 'paid';
      else if (new Date(fee.dueDate) < new Date()) feeStatus = 'overdue';

      await strapi.documents('api::fee.fee').update({
        documentId: fee.documentId,
        data: {
          paidAmount,
          pendingAmount,
          status: feeStatus,
        },
      });
    }

    const parentRecord = await strapi.documents('api::parent.parent').findOne({
      documentId: parent.documentId,
    });

    if (parentRecord?.mobileNumber) {
      await sendPaymentConfirmationWhatsApp(
        {
          mobile: parentRecord.mobileNumber,
          studentName: updatedPayment.student?.studentName || 'Student',
          amount: updatedPayment.amount,
          receiptNumber,
        },
        strapi
      );
    }

    return success(ctx, {
      message: 'Payment verified successfully',
      payment: updatedPayment,
      receiptNumber,
    });
  },
};
