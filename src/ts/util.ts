import { v4 as uuid } from "uuid";

export { uuid };

export function identicon(email: string | null, size: number = 40): string {
  if (email === null) {
    email = "null";
  }
  const svg = window.jdenticon.toSvg(email, size);
  const base64 = window.btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}
