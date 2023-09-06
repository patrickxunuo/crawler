export interface Action {
  id: string;
  type: "CLICK" | "SELECT";
  value?: string;
  targetId: string;
  addDelay: boolean;
  delay?: number;
}

export interface LogItem {
  timestamp: string;
  detail: string;
}
