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
// src/index.ts
const queryServiceClient_1 = require("./services/queryServiceClient");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🚀 Custom Data Query Agent - Client Demo 🚀");
        // Example 1: Query for data from the "Engineering" department
        console.log("\n--- Querying for 'Engineering' department ---");
        const engineeringQueryFilters = { department: "Engineering" };
        let results = yield (0, queryServiceClient_1.queryCustomData)(engineeringQueryFilters);
        console.log("Results:", JSON.stringify(results, null, 2));
        // Example 2: Query for "Alice"
        console.log("\n--- Querying for name 'Alice' ---");
        const aliceQueryFilters = { name: "Alice" };
        results = yield (0, queryServiceClient_1.queryCustomData)(aliceQueryFilters);
        console.log("Results:", JSON.stringify(results, null, 2));
        // Example 3: Query with no filters (should return all data)
        console.log("\n--- Querying with no specific filters (all data) ---");
        results = yield (0, queryServiceClient_1.queryCustomData)(); // No filters passed
        console.log("Results:", JSON.stringify(results, null, 2));
        // Example 4: Query for a non-existent department to see handling
        console.log("\n--- Querying for 'Sales' department (should be empty or handled) ---");
        const salesQueryFilters = { department: "Sales" };
        results = yield (0, queryServiceClient_1.queryCustomData)(salesQueryFilters);
        console.log("Results:", JSON.stringify(results, null, 2));
        // Example 5: Query with an invalid filter column (if server handles it)
        // console.log("\n--- Querying with invalid filter column 'location' ---");
        // const invalidColumnFilters = { location: "Remote" };
        // results = await queryCustomData(invalidColumnFilters);
        // console.log("Results:", JSON.stringify(results, null, 2));
    });
}
main().catch(error => {
    console.error("Unhandled error in main execution:", error);
});
