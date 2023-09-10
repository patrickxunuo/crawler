export interface Action {
  id: string;
  type: "CLICK" | "SELECT" | "GET_OPTIONS" | "LOOP";
  value?: string;
  targetId: string;
  addDelay: boolean;
  delay?: number;
  optionName?: string;
  targetOption?: string;
}

export interface LogItem {
  timestamp: string;
  detail: string;
}
