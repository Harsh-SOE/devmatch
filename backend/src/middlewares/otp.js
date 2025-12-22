import nodemailer from "nodemailer";

const mailTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "harshcppdsa23@gmail.com",
      pass: "qsdqakirycxljqta",
    },
  });
  return transporter;
};

export default mailTransporter;
