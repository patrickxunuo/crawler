import axios from "axios";
import { Action } from "./types/main";

const BACKEND_DOMAIN = "http://localhost:3001";

export async function getScreenshot(url: string) {
  return axios.get(`${BACKEND_DOMAIN}/screenshot`, {
    params: { url },
  });
}

export async function testAction(url: string, actionList: Action[]) {
  return axios.post(`${BACKEND_DOMAIN}/test-actions`, {
    body: { url, actionList },
  });
}
