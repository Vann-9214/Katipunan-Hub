// src/app/api/tutor-application/route.ts

import { NextResponse } from 'next/server';
// 1. Import nodemailer (make sure to install it with npm install nodemailer)
import nodemailer from 'nodemailer';

// 2. Configure the transporter to use your Gmail account and App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'caneteivan9214@gmail.com', // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // The secure App Password from .env.local
  },
});

export async function POST(request: Request) {
  try {
    const applicationPayload = await request.json();
    
    /* --- START: EMAIL CONFIGURATION --- */
    
    const ADMIN_EMAIL = "caneteivan9214@gmail.com"; 

    // 2. Format the email content
    const isScholar = applicationPayload.isScholar;
    const gradesAttachment = applicationPayload.gradesProofUrl 
      ? `Link to Grades Proof: ${applicationPayload.gradesProofUrl}`
      : "No external grades proof required (Scholar).";
    
    const emailSubject = `PLC Tutor Application: ${applicationPayload.fullName}`;
    
    const emailBody = `
===============================================
NEW PLC TUTOR APPLICATION SUBMITTED!
===============================================

Applicant: ${applicationPayload.fullName}
Email: ${applicationPayload.email}
Student ID: ${applicationPayload.applicantId}
Course: ${applicationPayload.course}
Year: ${applicationPayload.year}
Subject Expertise: ${applicationPayload.subject || 'Not specified'}
Scholar Status: ${isScholar ? 'Scholar' : 'Non-Scholar'}

--- GRADES PROOF ---
${gradesAttachment}

--- ACTION REQUIRED ---
Please log in to the admin panel to review and process this application.
    `;
    
    // 3. --- ACTUAL EMAIL SENDING CODE ---
    await transporter.sendMail({
      from: '"Katipunan Hub PLC" <caneteivan9214@gmail.com>',
      to: ADMIN_EMAIL, // Sends to your configured Gmail
      subject: emailSubject,
      text: emailBody,
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