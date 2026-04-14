export function getChurchName() {
  return (
    process.env.NEXT_PUBLIC_CHURCH_NAME ||
    process.env.NEXT_PUBLIC_APP_NAME ||
    "Nyanza SDA Church"
  );
}
