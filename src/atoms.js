import { atom } from "recoil";

export const userState = atom({
  key: "firebaseUser",
  default: null,
});
