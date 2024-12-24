const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email: string): boolean | { error: string } {
  if (!email) {
    return { error: "Email не может быть пустым." };
  }

  if (!emailRegex.test(email)) {
    return { error: "Невалидный формат email." };
  }

  return true;
}
