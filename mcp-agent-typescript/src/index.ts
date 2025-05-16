// src/index.ts
import { queryCustomData } from './services/queryServiceClient.js';
import { parseNaturalLanguageQuery } from './services/nlpService.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// Create interface for command line input
const rl = readline.createInterface({ input, output }) as readline.Interface & {
  question(query: string): Promise<string>;
};

async function processQuery(query: string) {
  console.log(`\n📝 Processing query: "${query}"`);
  
  // Convert natural language to structured filters
  console.log("🤖 Converting to structured query...");
  const filters = await parseNaturalLanguageQuery(query);
  
  console.log("🔍 Executing query with filters:", JSON.stringify(filters, null, 2));
  
  // Execute the query with the generated filters
  const results = await queryCustomData(filters);
  
  console.log("\n📊 Results:");
  if (results.success) {
    if (results.data.length > 0) {
      console.table(results.data);
    } else {
      console.log("No matching records found.");
    }
  } else {
    console.error("❌ Error:", results.error);
  }
}

async function main() {
  console.log("🚀 Custom Data Query Agent with Natural Language Processing 🚀");
  console.log("Type your query or 'exit' to quit\n");
  
  // Start the REPL loop
  const askQuestion = async () => {
    try {
      const query = await rl.question('> ');
      
      if (query.toLowerCase() === 'exit') {
        console.log("👋 Goodbye!");
        rl.close();
        return;
      }
      
      try {
        await processQuery(query);
      } catch (error) {
        console.error("Error processing query:", error);
      }
      
      // Ask the next question
      await askQuestion();
    } catch (error) {
      if (error !== 'close') {
        console.error("Error in readline:", error);
      }
    }
  };
  
  // Start the first question
  askQuestion();
}

// Handle process termination
process.on('SIGINT', () => {
  console.log("\n👋 Goodbye!");
  process.exit(0);
});

// Start the application
main().catch(error => {
  console.error("Unhandled error in main execution:", error);
  process.exit(1);
});