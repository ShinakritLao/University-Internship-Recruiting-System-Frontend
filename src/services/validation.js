export function isStrongPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export function passwordRequirementsMessage() {
  return "Password must be at least 8 characters long, include at least one uppercase letter and one number.";
}
