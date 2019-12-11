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

interface Node<T> {
  parent: T | null;
  children?: T[];
}

export function setParent<T extends Node<T>>(parent: T, children?: T[]): T {
  if (children) {
    children.forEach((node: T) => {
      if (parent) {
        node.parent = parent;
      }
      if (node.children && node.children.length !== 0) {
        setParent(node, node.children);
      }
    });
  }
  return parent;
}
