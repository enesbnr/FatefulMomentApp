export const validationMessages = {
  invalidEmail: 'Please enter a valid email address.',
  invalidFullName: 'Enter at least 3 characters.',
  invalidCredentials: 'Your password is wrong. Please try again.',
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type PasswordRequirement = {
  id: 'minimumLength' | 'uppercase' | 'lowercase' | 'digit';
  label: string;
  met: boolean;
};

export type Credentials = {
  email: string;
  password: string;
};

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return emailPattern.test(value.trim());
}

export function getEmailError(value: string) {
  return value.length > 0 && !isValidEmail(value)
    ? validationMessages.invalidEmail
    : undefined;
}

export function isValidFullName(value: string) {
  return value.replace(/\s/g, '').length >= 3;
}

export function getFullNameError(value: string) {
  return value.length > 0 && !isValidFullName(value)
    ? validationMessages.invalidFullName
    : undefined;
}

export function getPasswordRequirements(
  password: string,
): PasswordRequirement[] {
  return [
    {
      id: 'minimumLength',
      label: 'Must be at least 8 characters long',
      met: password.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'Must contain at least 1 uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'Must contain at least 1 lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      id: 'digit',
      label: 'Must contain at least 1 digit',
      met: /\d/.test(password),
    },
  ];
}

export function meetsPasswordRequirements(password: string) {
  return getPasswordRequirements(password).every(requirement => requirement.met);
}

export function canSubmitSignIn(email: string, password: string) {
  return isValidEmail(email) && password.length > 0;
}

export function canSubmitCreateAccount(
  fullName: string,
  email: string,
  password: string,
) {
  return (
    isValidFullName(fullName) &&
    isValidEmail(email) &&
    meetsPasswordRequirements(password)
  );
}

export function credentialsMatch(
  account: Credentials | null,
  email: string,
  password: string,
) {
  return (
    account != null &&
    normalizeEmail(account.email) === normalizeEmail(email) &&
    account.password === password
  );
}
