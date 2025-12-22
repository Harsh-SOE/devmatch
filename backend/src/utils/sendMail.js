const sendMailAsync = async (options, mailTransporter) => {
  return new Promise((resolve, reject) => {
    mailTransporter.sendMail(options, (err, info) => {
      if (err) return reject(err);
      return resolve(info);
    });
  });
};

export default sendMailAsync;
