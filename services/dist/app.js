"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const envs_1 = require("./config/envs");
const routes_1 = require("./presentation/routes");
const server_1 = require("./presentation/server");
const wss_services_1 = require("./presentation/services/wss.services");
(() => __awaiter(void 0, void 0, void 0, function* () {
    main();
}))();
function main() {
    const server = new server_1.Server({
        port: envs_1.envs.PORT,
    });
    const httpServer = (0, http_1.createServer)(server.app);
    wss_services_1.WssService.initWss({ server: httpServer });
    server.setRoutes(routes_1.AppRoutes.routes);
    httpServer.listen(envs_1.envs.PORT, () => {
        console.log(`Server running on port: ${envs_1.envs.PORT}`);
    });
}
