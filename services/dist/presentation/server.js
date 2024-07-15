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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
class Server {
    // private readonly routes: Router;
    constructor(options) {
        this.app = (0, express_1.default)();
        const { port, public_path = 'public' } = options;
        this.port = port;
        this.publicPath = public_path;
        this.configure();
    }
    configure() {
        //* Middlewares
        this.app.use(express_1.default.json()); // raw
        this.app.use(express_1.default.urlencoded({ extended: true })); // x-www-form-urlencoded
        this.app.use((0, cors_1.default)({ origin: '*' }));
        this.app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });
        //* Public Folder
        // this.app.use(express.static(this.publicPath));
        //* Routes
        // this.app.use( this.routes );
        //* SPA
        // this.app.get(/^\/(?!api).*/, (req, res) => {
        //   const indexPath = path.join(
        //     __dirname + `../../../${this.publicPath}/index.html`
        //   );
        //   res.sendFile(indexPath);
        // });
    }
    setRoutes(router) {
        this.app.use(router);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.serverListener = this.app.listen(this.port, () => {
                console.log(`Server running on port ${this.port}`);
            });
        });
    }
    close() {
        var _a;
        (_a = this.serverListener) === null || _a === void 0 ? void 0 : _a.close();
    }
}
exports.Server = Server;
