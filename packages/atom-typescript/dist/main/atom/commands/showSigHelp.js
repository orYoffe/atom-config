"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("./registry");
registry_1.addCommand("atom-text-editor", "typescript:show-signature-help", deps => ({
    description: "Show signature help tooltip at current text cursor position",
    async didDispatch(ed) {
        return deps.showSigHelpAt(ed);
    },
}));
//# sourceMappingURL=showSigHelp.js.map