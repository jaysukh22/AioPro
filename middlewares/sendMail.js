import nodemailer from "nodemailer"
import dotenv from "dotenv";
import path from "path"
dotenv.config()
import ejs from 'ejs'

export const sendMail = async (templateName,data) => {
  
  try {

    const templatePath = path.join(__dirname, 'email-templates', `${templateName}.ejs`);
    const template = await ejs.renderFile(templatePath, data);

    // Create a Nodemailer transport
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vaibhav.specscale@gmail.com',
        pass: 'btwtfowownkmtdvt'
      }
    });

    // Define the email options
    let mailOptions = {
      from: 'vaibhav.specscale@gmail.com',
      to: `${data.email}`,
      subject:templateName === 'forgot_Password_Template' ? ' Password Change Confirmation' : '',
      html: template
    };

    // Send the email
    let info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }

};