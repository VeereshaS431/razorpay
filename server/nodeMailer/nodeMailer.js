const nodemailer = require("nodemailer");
require("dotenv").config()

console.log(process.env.MAIL_PASSWORD,"process.env.MAIL_PASSWORD") 

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_PORT === 466, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});



const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP


const htmlTemplate = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>OTP Verification</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-width:320px;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 18px rgba(16,24,40,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:#4f46e5;padding:20px 24px;text-align:center;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;">Your Verification Code</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px;">
              <p style="margin:0 0 16px;font-size:15px;">
                Hi,<br/>
                Use the verification code below to continue. This code will expire in <strong>10 minutes</strong>.
              </p>

              <div style="text-align:center;margin:20px 0;">
                <span style="display:inline-block;padding:18px 28px;border-radius:10px;background:#111827;color:#ffffff;font-size:28px;letter-spacing:6px;font-weight:700;">
                  ${otp}
                </span>
              </div>

              <p style="margin:0 0 12px;font-size:13px;color:#6b7280;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:14px 20px;text-align:center;color:#9ca3af;font-size:12px;">
              &copy; ${new Date().getFullYear()} MyApp — All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// (async () => {
//     const info = await transporter.sendMail({
//         from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
//         to: "veereshas.431@gmail.com",
//         subject: "Your OTP Code",
//         html: htmlTemplate,
//     });

//     console.log("Message sent:", info);
// })();
















