import {
  canSubmitCreateAccount,
  canSubmitSignIn,
  credentialsMatch,
  getEmailError,
  getFullNameError,
  getPasswordRequirements,
  isValidEmail,
  normalizeEmail,
  validationMessages,
} from '../src/features/auth/validation/authValidation';

describe('auth validation', () => {
  test('normalizes and validates email consistently', () => {
    expect(normalizeEmail(' Person@Example.COM ')).toBe('person@example.com');
    expect(isValidEmail('person@example.com')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
    expect(getEmailError('')).toBeUndefined();
    expect(getEmailError('invalid')).toBe(validationMessages.invalidEmail);
  });

  test('validates full name without counting whitespace', () => {
    expect(getFullNameError('')).toBeUndefined();
    expect(getFullNameError('J o')).toBe(validationMessages.invalidFullName);
    expect(getFullNameError('Jo Doe')).toBeUndefined();
  });

  test('reports each password requirement independently', () => {
    const unmet = getPasswordRequirements('short');
    expect(unmet.map(requirement => requirement.id)).toEqual([
      'minimumLength',
      'uppercase',
      'lowercase',
      'digit',
    ]);
    expect(unmet.find(requirement => requirement.id === 'lowercase')?.met).toBe(
      true,
    );
    expect(getPasswordRequirements('aA1bcdef').every(item => item.met)).toBe(
      true,
    );
  });

  test('builds form eligibility from shared rules', () => {
    expect(canSubmitSignIn('person@example.com', 'x')).toBe(true);
    expect(canSubmitSignIn('invalid', 'x')).toBe(false);
    expect(
      canSubmitCreateAccount('John Doe', 'person@example.com', 'aA1bcdef'),
    ).toBe(true);
    expect(canSubmitCreateAccount('Jo', 'person@example.com', 'aA1bcdef')).toBe(
      false,
    );
  });

  test('matches local credentials with normalized email only', () => {
    const account = { email: 'Person@Example.com', password: 'secret' };
    expect(credentialsMatch(account, ' person@example.COM ', 'secret')).toBe(true);
    expect(credentialsMatch(account, 'person@example.com', 'wrong')).toBe(false);
    expect(credentialsMatch(null, 'person@example.com', 'secret')).toBe(false);
  });
});
