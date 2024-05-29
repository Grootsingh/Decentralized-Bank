import { atom } from "recoil";

export const ConnectionState = atom({
  key: "Error while connecting to wallet",
  default: "none",
});
export const WriteRequestErrorState = atom({
  key: "Error while Calling a write function",
  default: "",
});
export const GlobalWriteRequestState = atom({
  key: "request state when we call a write function",
  default: "idle",
});
export const GlobalWriteRequestErrorCause = atom({
  key: "Cause of Request failure (reverted message) when calling a write function",
  default: "",
});
export const GlobalReadRequestState = atom({
  key: "request state when we call a read function",
  default: "idle",
});
export const GlobalReadRequestErrorCause = atom({
  key: "Cause of Request failure (reverted message) when calling a read function",
  default: "",
});
