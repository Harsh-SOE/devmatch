import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "harshcppdsa23@gmail.com",
    pass: "qsdqakirycxljqta",
  },
});

export default transporter;
