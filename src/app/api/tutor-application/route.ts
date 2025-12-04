import { NextResponse } from 'next/server';
// 1. Import nodemailer (make sure to install it with npm install nodemailer)
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const applicationPayload = await request.json();

    /* --- START: EMAIL CONFIGURATION --- */

    // 2. Configure the transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    
    // The admin email where notifications will be sent
    const ADMIN_EMAIL = process.env.GMAIL_USER || "caneteivan9214@gmail.com"; 

    // 3. Format the email content
    const isScholar = applicationPayload.isScholar;

    // -- LOGIC: Handle Grades Proof Display --
    // If a link exists, we make a nice button. If not (Scholar), we show text.
    const gradesDisplayHtml = applicationPayload.gradesProofUrl 
      ? `
        <div style="margin-top: 20px; text-align: center;">
          <p style="margin-bottom: 10px; font-size: 14px; color: #555;">Proof of Grades:</p>
          <a href="${applicationPayload.gradesProofUrl}" 
             style="background-color: #800000; color: #EFBF04; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-family: sans-serif; display: inline-block;">
             View Grades Attachment
          </a>
        </div>
        `
      : `<p style="color: #2e7d32; font-weight: bold; text-align: center; background: #e8f5e9; padding: 10px; border-radius: 4px;">✔ Scholar - No proof required</p>`;

    const emailSubject = `PLC Tutor Application: ${applicationPayload.fullName}`;
    
    // -- THEME COLORS (Based on your App) --
    // Maroon: #800000 / #8B0E0E
    // Gold: #EFBF04 / #FFD700
    
    // -- HTML EMAIL BODY --
    const emailBodyHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        /* Resets to ensure consistency across clients */
        body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #800000 0%, #5c0000 100%); padding: 35px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; text-transform: uppercase; }
        .header-accent { display: block; width: 60px; height: 4px; background-color: #EFBF04; margin: 15px auto 0; border-radius: 2px; }
        .content { padding: 30px; }
        .info-group { margin-bottom: 20px; border-bottom: 1px solid #eeeeee; padding-bottom: 15px; }
        .info-group:last-child { border-bottom: none; }
        .label { font-size: 12px; color: #800000; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; display: block; margin-bottom: 5px; }
        .value { font-size: 16px; color: #333333; font-weight: 500; }
        .scholar-badge { display: inline-block; background-color: #EFBF04; color: #800000; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .footer { background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        
        <div class="header">
          <h1>Tutor Application</h1>
          <div class="header-accent"></div>
          <p style="color: #EFBF04; margin-top: 10px; font-size: 14px; font-weight: 500;">Katipunan Hub PLC</p>
        </div>

        <div class="content">
          
          <div class="info-group">
            <span class="label">Applicant Name</span>
            <div class="value">${applicationPayload.fullName}</div>
          </div>

          <div class="info-group">
            <span class="label">Student ID</span>
            <div class="value" style="font-family: monospace; font-size: 18px;">${applicationPayload.applicantId}</div>
          </div>

          <div style="display: flex; gap: 20px;">
            <div class="info-group" style="flex: 1;">
              <span class="label">Course</span>
              <div class="value">${applicationPayload.course}</div>
            </div>
            <div class="info-group" style="flex: 1;">
              <span class="label">Year Level</span>
              <div class="value">${applicationPayload.year}</div>
            </div>
          </div>

          <div class="info-group">
            <span class="label">Email Contact</span>
            <div class="value">
              <a href="mailto:${applicationPayload.email}" style="color: #800000; text-decoration: none;">${applicationPayload.email}</a>
            </div>
          </div>

          <div class="info-group">
            <span class="label">Subject Expertise</span>
            <div class="value">${applicationPayload.subject || 'Not specified'}</div>
          </div>

          <div class="info-group">
            <span class="label">Scholar Status</span>
            <div class="value">
              ${isScholar ? '<span class="scholar-badge">CIT-U SCHOLAR</span>' : 'Non-Scholar'}
            </div>
          </div>

          ${gradesDisplayHtml}

        </div>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Katipunan Hub. Automated System Message.</p>
        </div>

      </div>
    </body>
    </html>
    `;
    
    // Fallback plain text version (in case HTML fails on some client)
    const emailBodyText = `
    PLC TUTOR APPLICATION
    ---------------------
    Applicant: ${applicationPayload.fullName}
    ID: ${applicationPayload.applicantId}
    Course/Year: ${applicationPayload.course} - ${applicationPayload.year}
    Subject: ${applicationPayload.subject}
    Status: ${isScholar ? 'Scholar' : 'Non-Scholar'}
    `;

    // 4. --- ACTUAL EMAIL SENDING CODE ---
    await transporter.sendMail({
      from: `"Katipunan Hub PLC" <${process.env.GMAIL_USER}>`, 
      to: ADMIN_EMAIL, 
      subject: emailSubject,
      text: emailBodyText, // Plain text fallback
      html: emailBodyHtml, // THE BEAUTIFIED VERSION
    });
    
    console.log(`✅ EMAIL SENT SUCCESSFULLY to ADMIN: ${ADMIN_EMAIL}`);
    
    /* --- END: EMAIL CONFIGURATION --- */

    return NextResponse.json({ success: true, message: "Application submitted and admin notified." });
  } catch (error) {
    console.error("API Error during application submission:", error);
    // If Nodemailer fails, this logs the error and sends a 500 response
    return NextResponse.json({ success: false, message: "Internal server error. Check server logs." }, { status: 500 });
  }
}