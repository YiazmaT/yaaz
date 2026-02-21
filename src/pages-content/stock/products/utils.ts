export function buildName(entity: {code: number; name: string}): string {
  return `(#${entity.code}) ${entity.name}`;
}
