export interface Tag {
  text: string;
  tiClasses?: string[];
}

export interface Validation {
  classes: string;
  rule(tag: Tag): boolean;
}
