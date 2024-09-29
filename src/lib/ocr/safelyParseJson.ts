export default function safelyParseJson<T>(input: string) {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}
