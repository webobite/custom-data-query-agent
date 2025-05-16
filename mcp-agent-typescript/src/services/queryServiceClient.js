"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.queryCustomData = queryCustomData;
// src/services/queryServiceClient.ts
const axios_1 = __importStar(require("axios"));
// The URL of our Python MCP server
const SERVER_URL = 'http://localhost:8000/query';
function queryCustomData(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            console.log(`[Client] Sending query to ${SERVER_URL} with filters:`, filters || {});
            const requestBody = {
                filters: filters || {}
            };
            const response = yield axios_1.default.post(SERVER_URL, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('[Client] Received response from server.');
            return { success: true, data: response.data.data };
        }
        catch (error) {
            console.error('[Client] Error querying data:', error);
            if ((0, axios_1.isAxiosError)(error)) {
                const errorResponse = {
                    error: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Network error occurred',
                    details: error.message
                };
                return { success: false, error: errorResponse };
            }
            return {
                success: false,
                error: {
                    error: 'Unknown error occurred',
                    details: error instanceof Error ? error.message : String(error)
                }
            };
        }
    });
}
