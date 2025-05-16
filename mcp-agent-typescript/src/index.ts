// src/index.ts
import { queryCustomData, type DataRecord } from './services/queryServiceClient.js';
import { parseNaturalLanguageQuery } from './services/nlpService.js';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { table } from 'table';
import chalk from 'chalk';

// Create interface for command line input
const rl = readline.createInterface({ 
  input, 
  output,
  prompt: chalk.blue('> ')
}) as readline.Interface & {
  question(query: string): Promise<string>;
};

// ANSI color codes for consistent styling
const colors = {
  info: (text: string) => chalk.blue(text),
  success: (text: string) => chalk.green(text),
  warning: (text: string) => chalk.yellow(text),
  error: (text: string) => chalk.red(text),
  highlight: (text: string) => chalk.cyan.bold(text),
  muted: (text: string) => chalk.gray(text),
  title: (text: string) => chalk.cyan.underline(text),
  blue: (text: string) => chalk.blue(text)
};

/**
 * Formats a data record into a display-friendly string
 */
function formatRecord(record: DataRecord): Record<string, unknown> {
  return {
    ID: record.id,
    Name: record.name,
    Department: record.department,
    Role: record.role || 'N/A',
    'Project Hours': record.project_hours,
    'Join Date': record.join_date ? new Date(record.join_date).toLocaleDateString() : 'N/A',
    Status: record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Unknown'
  };
}

/**
 * Displays query results in a formatted table
 */
function displayResults(records: DataRecord[], pagination?: { total: number; page: number; page_size: number }) {
  if (records.length === 0) {
    console.log(colors.warning('\nNo matching records found.'));
    return;
  }

  // Format all records
  const formattedRecords = records.map(formatRecord);
  
  // Get all unique keys from all records
  const allKeys = new Set<string>();
  formattedRecords.forEach(record => {
    Object.keys(record).forEach(key => allKeys.add(key));
  });
  
  // Convert to array and sort for consistent column order
  const headers = Array.from(allKeys).sort();
  
  // Prepare data for the table
  const tableData = [
    headers.map(h => colors.highlight(h)), // Header row
    ...formattedRecords.map(record => 
      headers.map(header => {
        const value = record[header] ?? 'N/A';
        return typeof value === 'string' ? value : JSON.stringify(value);
      })
    )
  ];
  
  // Generate and display the table
  const tableConfig = {
    border: {
      topBody: '─',
      topJoin: '┬',
      topLeft: '┌',
      topRight: '┐',
      bottomBody: '─',
      bottomJoin: '┴',
      bottomLeft: '└',
      bottomRight: '┘',
      bodyLeft: '│',
      bodyRight: '│',
      bodyJoin: '│',
      joinBody: '─',
      joinLeft: '├',
      joinRight: '┤',
      joinJoin: '┼'
    },
    columns: headers.map(() => ({
      alignment: 'left' as const, // Ensure type is 'left' | 'center' | 'right'
      wrapWord: true,
      paddingLeft: 1,
      paddingRight: 1
    }))
  };
  
  console.log('\n' + table(tableData, tableConfig));
  
  // Show pagination info if available
  if (pagination) {
    const { total, page, page_size } = pagination;
    const totalPages = Math.ceil(total / page_size);
    console.log(colors.muted(
      `\nShowing page ${page} of ${totalPages} ` +
      `(${records.length} of ${total} total records)`
    ));
  } else {
    console.log(colors.muted(`\nFound ${records.length} records`));
  }
}

/**
 * Processes a natural language query and displays the results
 */
async function processQuery(query: string) {
  console.log(`\n${colors.info('📝')} Processing query: ${colors.highlight(`"${query}"`)}`);
  
  try {
    // First, parse the natural language query
    console.log(colors.info('🤖 Converting to structured query...'));
    const filters = await parseNaturalLanguageQuery(query);
    
    // Log the structured query for debugging
    console.log(colors.muted('🔍 Generated query structure:'), 
      JSON.stringify(filters, null, 2)
    );
    
    // Execute the query with the parsed filters
    console.log(colors.info('🚀 Executing query...'));
    const startTime = Date.now();
    const result = await queryCustomData(filters);
    const queryTime = Date.now() - startTime;
    
    if (!result.success) {
      console.error(colors.error(`❌ Error: ${result.error.error}`));
      if (result.error.details) {
        console.error(colors.muted('Details:'), result.error.details);
      }
      return;
    }
    
    // Display results
    console.log(colors.success(`\n✅ Query completed in ${queryTime}ms`));
    displayResults(result.data, result.pagination);
    
    // Show metadata if available
    if (result.metadata) {
      console.log(colors.muted('\nQuery metadata:'), 
        JSON.stringify(result.metadata, null, 2)
      );
    }
    
  } catch (error) {
    console.error(colors.error('❌ Error processing query:'), 
      error instanceof Error ? error.message : 'Unknown error');
    if (process.env.NODE_ENV === 'development') {
      console.error(colors.muted('Stack trace:'), error);
    }
  }
}

/**
 * Displays help information
 */
function showHelp() {
  console.log(`
${colors.title('Natural Language Query Help')}
`);
  console.log('Enter queries in natural language, such as:');
  console.log(`  • ${colors.highlight('Show me all employees in Engineering')}`);
  console.log(`  • ${colors.highlight('Find people with more than 30 project hours')}`);
  console.log(`  • ${colors.highlight('List all active employees in Sales')}`);
  console.log(`  • ${colors.highlight('Show the top 5 employees by project hours')}`);
  console.log(`  • ${colors.highlight('Find people who joined after 2023')}`);
  console.log(`\nCommands:`);
  console.log(`  ${colors.highlight('help')} - Show this help`);
  console.log(`  ${colors.highlight('exit')} - Exit the application\n`);
}

/**
 * Main application entry point
 */
async function main() {
  // Clear screen and display welcome message
  console.clear();
  console.log(colors.title('\n🤖 Natural Language Query Interface'));
  console.log(colors.muted('  Type your query or \'help\' for assistance\n'));
  
  // Start the REPL loop
  const askQuestion = async () => {
    try {
      const query = (await rl.question(colors.blue('> '))).trim();
      
      // Handle commands
      if (query.toLowerCase() === 'exit') {
        console.log(colors.success("\n👋 Goodbye!"));
        rl.close();
        return;
      }
      
      if (query.toLowerCase() === 'help' || query === '?') {
        showHelp();
      } else if (query) {
        await processQuery(query);
      }
      
      // Ask the next question
      await askQuestion();
      
    } catch (error) {
      // Handle readline errors
      if (error !== 'close') {
        console.error(colors.error('\nError in readline:'), error);
      }
    }
  };
  
  // Start the first question
  await askQuestion();
}

// Handle process termination
process.on('SIGINT', () => {
  console.log(colors.success("\n👋 Goodbye!"));
  process.exit(0);
});

// Start the application
main().catch(error => {
  console.error(colors.error('Fatal error:'), error);
  console.error("Unhandled error in main execution:", error);
  process.exit(1);
});