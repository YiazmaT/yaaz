export function flexGenerator(key: string): Record<string, any> {
  if (!key) return {};
  const split = key.split(".");
  if (split.length < 1) return {};
  let object = {
    display: "flex",
    flexDirection: split[0] === "r" ? "row" : "column",
    ...(split[1] && {alignItems: split[1]}),
    ...(split[2] && {justifyContent: split[2]}),
  };

  return object;
}
