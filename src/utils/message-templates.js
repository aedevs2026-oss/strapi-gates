'use strict';

const SCHOOL_NAME = process.env.SCHOOL_NAME || 'Gates International School';

const otpMessage = ({ otp, expiryMinutes }) =>
  `*${SCHOOL_NAME}*\n\nYour login OTP is *${otp}*.\nValid for ${expiryMinutes} minutes.\n\nDo not share this code with anyone.`;

const notificationMessage = ({ title, message }) => {
  const lines = [`*${SCHOOL_NAME}*`, `*${title}*`];
  if (message) lines.push('', message);
  return lines.join('\n');
};

const paymentConfirmationMessage = ({ studentName, amount, receiptNumber }) =>
  [
    `*${SCHOOL_NAME}*`,
    '',
    'Fee payment received successfully.',
    '',
    `Student: ${studentName}`,
    `Amount: Rs.${amount}`,
    `Receipt: ${receiptNumber}`,
    '',
    'Thank you for your payment.',
  ].join('\n');

const feeReminderMessage = ({ studentName, amount, dueDate, feeType }) =>
  [
    `*${SCHOOL_NAME}*`,
    '',
    'Fee reminder',
    '',
    `Student: ${studentName}`,
    feeType ? `Fee type: ${feeType}` : null,
    `Pending amount: Rs.${amount}`,
    `Due date: ${dueDate}`,
    '',
    'Please pay before the due date to avoid late fees.',
  ]
    .filter(Boolean)
    .join('\n');

const attendanceAlertMessage = ({ studentName, date, status }) =>
  [
    `*${SCHOOL_NAME}*`,
    '',
    'Attendance update',
    '',
    `Student: ${studentName}`,
    `Date: ${date}`,
    `Status: ${status}`,
  ].join('\n');

const gateEntryMessage = ({ studentName, time, gateName }) =>
  [
    `*${SCHOOL_NAME}*`,
    '',
    'Gate entry alert',
    '',
    `Student: ${studentName}`,
    gateName ? `Gate: ${gateName}` : null,
    `Time: ${time}`,
  ]
    .filter(Boolean)
    .join('\n');

const gateExitMessage = ({ studentName, time, gateName }) =>
  [
    `*${SCHOOL_NAME}*`,
    '',
    'Gate exit alert',
    '',
    `Student: ${studentName}`,
    gateName ? `Gate: ${gateName}` : null,
    `Time: ${time}`,
  ]
    .filter(Boolean)
    .join('\n');

const circularMessage = ({ title, body, linkUrl }) => {
  const lines = [`*${SCHOOL_NAME}*`, '', `*${title}*`];
  if (body) lines.push('', body);
  if (linkUrl) lines.push('', `Read more: ${linkUrl}`);
  return lines.join('\n');
};

module.exports = {
  otpMessage,
  notificationMessage,
  paymentConfirmationMessage,
  feeReminderMessage,
  attendanceAlertMessage,
  gateEntryMessage,
  gateExitMessage,
  circularMessage,
};
