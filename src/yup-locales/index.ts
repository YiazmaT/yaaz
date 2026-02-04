export const pt_BR = {
  mixed: {
    default: "${path} é inválido.",
    required: "${path} é obrigatório",
    defined: "${path} não deve ser indefinido",
    notNull: "${path} não pode ser vazio",
    oneOf: "${path} deve ter um dos seguintes valores: ${values}",
    notOneOf: "${path} não deve ter nenhum dos seguintes valores: ${values}",
  },
  string: {
    matches: '${path} deve corresponder ao padrão: "${regex}"',
    email: "${path} deve ser um e-mail válido",
    url: "${path} deve ser uma URL válida",
    uuid: "${path} deve ser um UUID válido",
    trim: "${path} não deve conter espaços no início nem no fim",
    lowercase: "${path} deve estar em letras minúsculas",
    uppercase: "${path} deve estar em letras maiúsculas",
  },
  number: {
    min: "${path} deve ser maior ou igual a ${min}",
    max: "${path} deve ser menor ou igual a ${max}",
    lessThan: "${path} deve ser menor que ${less}",
    moreThan: "${path} deve ser maior que ${more}",
    positive: "${path} deve ser um número positivo",
    negative: "${path} deve ser um número negativo",
    integer: "${path} deve ser um número inteiro",
  },
  date: {
    min: "${path} deve ser posterior a ${min}",
    max: "${path} deve ser anterior a ${max}",
  },
  object: {
    noUnknown: "${path} tem chaves desconhecidas: ${unknown}",
  },
  array: {},
  boolean: {
    isValue: "${path} deve ser ${value}",
  },
};

export const en_US = {
  mixed: {
    default: "${path} is invalid",
    required: "${path} is a required field",
    defined: "${path} must be defined",
    notNull: "${path} cannot be null",
    oneOf: "${path} must be one of the following values: ${values}",
    notOneOf: "${path} must not be one of the following values: ${values}",
  },
  string: {
    length: "${path} must be exactly ${length} characters",
    min: "${path} must be at least ${min} characters",
    max: "${path} must be at most ${max} characters",
    matches: '${path} must match the following: "${regex}"',
    email: "${path} must be a valid email",
    url: "${path} must be a valid URL",
    uuid: "${path} must be a valid UUID",
    trim: "${path} must be a trimmed string",
    lowercase: "${path} must be a lowercase string",
    uppercase: "${path} must be a upper case string",
  },
  number: {
    min: "${path} must be greater than or equal to ${min}",
    max: "${path} must be less than or equal to ${max}",
    lessThan: "${path} must be less than ${less}",
    moreThan: "${path} must be greater than ${more}",
    positive: "${path} must be a positive number",
    negative: "${path} must be a negative number",
    integer: "${path} must be an integer",
  },
  date: {
    min: "${path} field must be later than ${min}",
    max: "${path} field must be at earlier than ${max}",
  },
  object: {
    noUnknown: "${path} field has unspecified keys: ${unknown}",
  },
  array: {
    min: "${path} field must have at least ${min} items",
    max: "${path} field must have less than or equal to ${max} items",
    length: "${path} must have ${length} items",
  },
  boolean: {
    isValue: "${path} field must be ${value}",
  },
};

export const es_ES = {
  mixed: {
    default: "${path} no es válido.",
    required: "${path} es un campo requerido",
    defined: "${path} debe definirse",
    notNull: "${path} no puede ser nulo",
    oneOf: "${path} debe ser uno de los siguientes valores: ${values}",
    notOneOf: "${path} no debe ser uno de los siguientes valores: ${values}",
  },
  string: {
    length: "${path} debe ser exactamente ${length} caracteres",
    min: "${path} debe ser al menos ${min} caracteres",
    max: "${path} debe ser como máximo ${max} caracteres",
    matches: '${path} debe coincidir con lo siguiente: "${regex}"',
    email: "${path} debe ser un correo electrónico válido",
    url: "${path} debe ser una URL válida",
    uuid: "${path} debe ser un UUID válido",
    trim: "${path} debe ser una cadena recortada",
    lowercase: "${path} debe ser una cadena en minúscula",
    uppercase: "${path} debe ser una cadena de casos superiores",
  },
  number: {
    min: "${path} debe ser mayor o igual a ${min}",
    max: "${path} debe ser menor o igual a ${max}",
    lessThan: "${path} debe ser menor que ${less}",
    moreThan: "${path} debe ser mayor que ${more}",
    positive: "${path} debe ser un número positivo",
    negative: "${path} debe ser un número negativo",
    integer: "${path} debe ser un entero",
  },
  date: {
    min: "${path} El campo debe ser más tarde que ${min}",
    max: "${path} El campo debe estar antes de ${max}",
  },
  object: {
    noUnknown: "${path} el campo no puede tener claves no especificadas en la forma del objeto",
  },
  array: {
    min: "${path} el campo debe tener al menos ${min} elementos",
    max: "${path} El campo debe tener menos o igual a los elementos ${max}",
    length: "${path} debe tener ${length} elementos",
  },
  boolean: {
    isValue: "${path} El campo debe ser ${value}",
  },
};
