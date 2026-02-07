export function extractFileName(url: string): string {
  const lastSegment = url.split("/").pop() || "";
  const withoutTimestamp = lastSegment.replace(/^\d+-/, "");
  return decodeURIComponent(withoutTimestamp);
}
