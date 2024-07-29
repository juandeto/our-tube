"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDateValid = void 0;
function isDateValid(dateStr) {
    const d = new Date(dateStr);
    return d instanceof Date && !isNaN(d.getTime());
}
exports.isDateValid = isDateValid;
