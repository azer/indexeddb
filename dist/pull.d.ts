import * as types from "./types";
export default class Pull implements types.IPull {
    receive(updates: types.IUpdate[] | types.IUpdate, callback: types.ICallback): void;
}
