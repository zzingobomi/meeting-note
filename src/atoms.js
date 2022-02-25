import { DateTime } from "luxon";
import { atom } from "recoil";

export const userState = atom({
  key: "firebaseUser",
  default: null,
});

export const enterTimeState = atom({
  key: "enterTime",
  default: DateTime.now(),
});
