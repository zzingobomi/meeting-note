import { DateTime } from "luxon";
import { atom } from "recoil";

export const fbUserState = atom({
  key: "firebaseUser",
  default: null,
});

export const enterTimeState = atom({
  key: "enterTime",
  default: DateTime.now(),
});

export const roomUsersState = atom({
  key: "roomUser",
  default: [],
});
