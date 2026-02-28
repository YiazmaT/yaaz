export const PASSWORD_RULES = [
  {key: "minLength", test: (p: string) => p.length >= 8},
  {key: "maxLength", test: (p: string) => p.length <= 32},
  {key: "lowercase", test: (p: string) => /[a-z]/.test(p)},
  {key: "uppercase", test: (p: string) => /[A-Z]/.test(p)},
  {key: "number", test: (p: string) => /\d/.test(p)},
  {key: "symbol", test: (p: string) => /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>\/?]/.test(p)},
] as const;

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/;
