import smtp from 'k6/x/smtp';
import { sleep } from 'k6';

// Note: in order to run this, you must compile k6 with the SMTP extension

export const options = {
  // vus: 100, // 100 parallel requests
  // duration: '5s', // for 5 seconds
  // see sleep below for the delay between requests
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 20,
      maxVUs: 100,
    },
  },
};


const OUTGOER_HOST = 'localhost';
const OUTGOER_PORT = '2525';

// Sends a basic email to outgoer
// see: https://github.com/gpiechnik2/xk6-smtp
export default function () {
  const mailOptions = {
    subject: 'Test subject',
    message: 'Test message',
    udw: ['udwRecipient@localhost'],
  };

  sleep(0.01);

  smtp.sendMail(
    OUTGOER_HOST,
    OUTGOER_PORT,
    'your-email@test.com',
    'your-email-password',
    'recipient@localhost',
    mailOptions,
  );
};
