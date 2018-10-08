"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Push {
    constructor() {
        this.targets = [];
    }
    hook(target) {
        this.targets.push(target);
    }
    publish(updates, callback) {
        const errors = [];
        var self = this;
        next(0);
        function next(i) {
            if (i >= self.targets.length) {
                callback(errors.length ? errors : undefined);
                return;
            }
            self.targets[i].pull.receive(updates, err => {
                if (err) {
                    errors.push(err);
                }
                next(i + 1);
            });
        }
    }
}
exports.default = Push;
