import * as types from "./types";
export default class Push implements types.IPush {
    targets: types.IDB[];
    constructor();
    hook(target: types.IDB): void;
    publish(updates: types.IUpdate | types.IUpdate[], callback: types.IMultipleErrorsCallback): void;
}
