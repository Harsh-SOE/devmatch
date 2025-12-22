import validator from "validator";

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error(
      "Email is not valid attacker will know if the email is present in db so instead use INVALID CREDENTIALS!"
    );
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a storng Password");
  }
};

const validateEditProfileData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) => {
    return allowedEditFields.includes(field);
  });

  return isEditAllowed;
};

export { validateSignUpData, validateEditProfileData };
