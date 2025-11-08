const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'https://your-vercel-url.vercel.app']
}));
app.use(express.json());

// Create temp directory for code files
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Comprehensive test cases for all problems
const testCases = {
  '1': { name: 'Two Sum', cases: [
    { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
    { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
    { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
    { input: { nums: [1, 5, 3, 7, 9], target: 8 }, expected: [0, 3] }
  ]},
  '2': { name: 'Binary Tree Traversal', cases: [
    { input: { arr: [1, null, 2, 3] }, expected: [1, 3, 2] },
    { input: { arr: [1] }, expected: [1] },
    { input: { arr: [] }, expected: [] }
  ]},
  '3': { name: 'Maximum Subarray', cases: [
    { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expected: 6 },
    { input: { nums: [1] }, expected: 1 },
    { input: { nums: [5, 4, -1, 7, 8] }, expected: 23 },
    { input: { nums: [-1, -2, -3, -4] }, expected: -1 }
  ]},
  '4': { name: 'Valid Parentheses', cases: [
    { input: { s: '()' }, expected: true },
    { input: { s: '()[]{}' }, expected: true },
    { input: { s: '(]' }, expected: false },
    { input: { s: '{[]}' }, expected: true }
  ]},
  '5': { name: 'Reverse Linked List', cases: [
    { input: { arr: [1, 2, 3, 4, 5] }, expected: [5, 4, 3, 2, 1] },
    { input: { arr: [1, 2] }, expected: [2, 1] },
    { input: { arr: [1] }, expected: [1] }
  ]},
  '6': { name: 'Merge Two Sorted Lists', cases: [
    { input: { l1: [1, 2, 4], l2: [1, 3, 4] }, expected: [1, 1, 2, 3, 4, 4] },
    { input: { l1: [], l2: [] }, expected: [] },
    { input: { l1: [], l2: [0] }, expected: [0] }
  ]},
  '7': { name: 'Best Time to Buy and Sell Stock', cases: [
    { input: { prices: [7, 1, 5, 3, 6, 4] }, expected: 5 },
    { input: { prices: [7, 6, 4, 3, 1] }, expected: 0 },
    { input: { prices: [1, 2] }, expected: 1 }
  ]},
  '8': { name: 'Longest Substring Without Repeating', cases: [
    { input: { s: 'abcabcbb' }, expected: 3 },
    { input: { s: 'bbbbb' }, expected: 1 },
    { input: { s: 'pwwkew' }, expected: 3 }
  ]},
  '9': { name: 'Container With Most Water', cases: [
    { input: { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] }, expected: 49 },
    { input: { height: [1, 1] }, expected: 1 },
    { input: { height: [4, 3, 2, 1, 4] }, expected: 16 }
  ]},
  '10': { name: '3Sum', cases: [
    { input: { nums: [-1, 0, 1, 2, -1, -4] }, expected: [[-1, -1, 2], [-1, 0, 1]] },
    { input: { nums: [0, 1, 1] }, expected: [] },
    { input: { nums: [0, 0, 0] }, expected: [[0, 0, 0]] }
  ]},
  '11': { name: 'Letter Combinations Phone Number', cases: [
    { input: { digits: '23' }, expected: ['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf'] },
    { input: { digits: '' }, expected: [] },
    { input: { digits: '2' }, expected: ['a', 'b', 'c'] }
  ]},
  '12': { name: 'Generate Parentheses', cases: [
    { input: { n: 3 }, expected: ['((()))', '(()())', '(())()', '()(())', '()()()'] },
    { input: { n: 1 }, expected: ['()'] },
    { input: { n: 2 }, expected: ['(())', '()()'] }
  ]},
  '13': { name: 'Merge K Sorted Lists', cases: [
    { input: { lists: [[1, 4, 5], [1, 3, 4], [2, 6]] }, expected: [1, 1, 2, 3, 4, 4, 5, 6] },
    { input: { lists: [] }, expected: [] },
    { input: { lists: [[]] }, expected: [] }
  ]},
  '14': { name: 'Valid Sudoku', cases: [
    { input: { board: [['5', '3', '.', '.', '7', '.', '.', '.', '.'], ['6', '.', '.', '1', '9', '5', '.', '.', '.'], ['.', '9', '8', '.', '.', '.', '.', '6', '.'], ['8', '.', '.', '.', '6', '.', '.', '.', '3'], ['4', '.', '.', '8', '.', '3', '.', '.', '1'], ['7', '.', '.', '.', '2', '.', '.', '.', '6'], ['.', '6', '.', '.', '.', '.', '2', '8', '.'], ['.', '.', '.', '4', '1', '9', '.', '.', '5'], ['.', '.', '.', '.', '8', '.', '.', '7', '9']] }, expected: true },
    { input: { board: [['8', '3', '.', '.', '7', '.', '.', '.', '.'], ['6', '.', '.', '1', '9', '5', '.', '.', '.'], ['.', '9', '8', '.', '.', '.', '.', '6', '.'], ['8', '.', '.', '.', '6', '.', '.', '.', '3'], ['4', '.', '.', '8', '.', '3', '.', '.', '1'], ['7', '.', '.', '.', '2', '.', '.', '.', '6'], ['.', '6', '.', '.', '.', '.', '2', '8', '.'], ['.', '.', '.', '4', '1', '9', '.', '.', '5'], ['.', '.', '.', '.', '8', '.', '.', '7', '9']] }, expected: false }
  ]},
  '15': { name: 'Climbing Stairs', cases: [
    { input: { n: 2 }, expected: 2 },
    { input: { n: 3 }, expected: 3 },
    { input: { n: 5 }, expected: 8 }
  ]},
  '16': { name: 'House Robber', cases: [
    { input: { nums: [1, 2, 3, 1] }, expected: 4 },
    { input: { nums: [2, 7, 9, 3, 1] }, expected: 12 },
    { input: { nums: [2, 1, 1, 2] }, expected: 4 }
  ]},
  '17': { name: 'Coin Change', cases: [
    { input: { coins: [1, 2, 5], amount: 11 }, expected: 3 },
    { input: { coins: [2], amount: 3 }, expected: -1 },
    { input: { coins: [1], amount: 0 }, expected: 0 }
  ]},
  '18': { name: 'Longest Common Subsequence', cases: [
    { input: { text1: 'abcde', text2: 'ace' }, expected: 3 },
    { input: { text1: 'abc', text2: 'abc' }, expected: 3 },
    { input: { text1: 'abc', text2: 'def' }, expected: 0 }
  ]},
  '19': { name: 'Word Break', cases: [
    { input: { s: 'leetcode', wordDict: ['leet', 'code'] }, expected: true },
    { input: { s: 'applepenapple', wordDict: ['apple', 'pen'] }, expected: true },
    { input: { s: 'catsandog', wordDict: ['cats', 'dog', 'sand', 'and', 'cat'] }, expected: false }
  ]},
  '20': { name: 'Number of Islands', cases: [
    { input: { grid: [['1', '1', '1', '1', '0'], ['1', '1', '0', '1', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '0', '0', '0']] }, expected: 1 },
    { input: { grid: [['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']] }, expected: 3 }
  ]},
  '21': { name: 'Course Schedule', cases: [
    { input: { numCourses: 2, prerequisites: [[1, 0]] }, expected: true },
    { input: { numCourses: 2, prerequisites: [[1, 0], [0, 1]] }, expected: false }
  ]},
  '22': { name: 'Binary Tree Level Order Traversal', cases: [
    { input: { arr: [3, 9, 20, null, null, 15, 7] }, expected: [[3], [9, 20], [15, 7]] },
    { input: { arr: [1] }, expected: [[1]] },
    { input: { arr: [] }, expected: [] }
  ]},
  '23': { name: 'Lowest Common Ancestor', cases: [
    { input: { arr: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p: 2, q: 8 }, expected: 6 },
    { input: { arr: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], p: 2, q: 4 }, expected: 2 }
  ]},
  '24': { name: 'Serialize and Deserialize Binary Tree', cases: [
    { input: { arr: [1, 2, 3, null, null, 4, 5] }, expected: [1, 2, 3, null, null, 4, 5] },
    { input: { arr: [] }, expected: [] }
  ]},
  '25': { name: 'Implement Trie', cases: [
    { input: { ops: ['insert', 'search', 'search', 'startsWith', 'insert', 'search'], vals: ['apple', 'apple', 'app', 'app', 'app', 'app'] }, expected: [null, true, false, true, null, true] }
  ]},
  '26': { name: 'Find Median from Data Stream', cases: [
    { input: { ops: ['addNum', 'addNum', 'findMedian', 'addNum', 'findMedian'], vals: [1, 2, null, 3, null] }, expected: [null, null, 1.5, null, 2] }
  ]},
  '27': { name: 'Longest Palindromic Substring', cases: [
    { input: { s: 'babad' }, expected: 'bab' },
    { input: { s: 'cbbd' }, expected: 'bb' },
    { input: { s: 'a' }, expected: 'a' }
  ]},
  '28': { name: 'Regular Expression Matching', cases: [
    { input: { s: 'aa', p: 'a' }, expected: false },
    { input: { s: 'aa', p: 'a*' }, expected: true },
    { input: { s: 'ab', p: '.*' }, expected: true }
  ]},
  '29': { name: 'Edit Distance', cases: [
    { input: { word1: 'horse', word2: 'ros' }, expected: 3 },
    { input: { word1: 'intention', word2: 'execution' }, expected: 5 }
  ]},
  '30': { name: 'Trapping Rain Water', cases: [
    { input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, expected: 6 },
    { input: { height: [4, 2, 0, 3, 2, 5] }, expected: 9 }
  ]},
  '31': { name: 'Sliding Window Maximum', cases: [
    { input: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 }, expected: [3, 3, 5, 5, 6, 7] },
    { input: { nums: [1], k: 1 }, expected: [1] }
  ]},
  '32': { name: 'Merge Intervals', cases: [
    { input: { intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] }, expected: [[1, 6], [8, 10], [15, 18]] },
    { input: { intervals: [[1, 4], [4, 5]] }, expected: [[1, 5]] }
  ]},
  '33': { name: 'Rotate Image', cases: [
    { input: { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }, expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
    { input: { matrix: [[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]] }, expected: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]] }
  ]},
  '34': { name: 'Group Anagrams', cases: [
    { input: { strs: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] }, expected: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']] },
    { input: { strs: [''] }, expected: [['']] },
    { input: { strs: ['a'] }, expected: [['a']] }
  ]},
  '35': { name: 'Permutations', cases: [
    { input: { nums: [1, 2, 3] }, expected: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
    { input: { nums: [0, 1] }, expected: [[0, 1], [1, 0]] },
    { input: { nums: [1] }, expected: [[1]] }
  ]},
  '36': { name: 'Subsets', cases: [
    { input: { nums: [1, 2, 3] }, expected: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]] },
    { input: { nums: [0] }, expected: [[], [0]] }
  ]},
  '37': { name: 'N-Queens', cases: [
    { input: { n: 4 }, expected: [['.Q..', '...Q', 'Q...', '..Q.'], ['..Q.', 'Q...', '...Q', '.Q..']] },
    { input: { n: 1 }, expected: [['Q']] }
  ]},
  '38': { name: 'Word Search', cases: [
    { input: { board: [['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], word: 'ABCCED' }, expected: true },
    { input: { board: [['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], word: 'SEE' }, expected: true },
    { input: { board: [['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], word: 'ABCB' }, expected: false }
  ]},
  '39': { name: 'Palindrome Partitioning', cases: [
    { input: { s: 'aab' }, expected: [['a', 'a', 'b'], ['aa', 'b']] },
    { input: { s: 'a' }, expected: [['a']] }
  ]},
  '40': { name: 'Kth Largest Element', cases: [
    { input: { nums: [3, 2, 1, 5, 6, 4], k: 2 }, expected: 5 },
    { input: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 }, expected: 4 }
  ]},
  '41': { name: 'Top K Frequent Elements', cases: [
    { input: { nums: [1, 1, 1, 2, 2, 3], k: 2 }, expected: [1, 2] },
    { input: { nums: [1], k: 1 }, expected: [1] }
  ]},
  '42': { name: 'Meeting Rooms II', cases: [
    { input: { intervals: [[0, 30], [5, 10], [15, 20]] }, expected: 2 },
    { input: { intervals: [[7, 10], [2, 4]] }, expected: 1 }
  ]},
  '43': { name: 'Binary Search', cases: [
    { input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expected: 4 },
    { input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 }, expected: -1 }
  ]},
  '44': { name: 'Search in Rotated Array', cases: [
    { input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 }, expected: 4 },
    { input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 3 }, expected: -1 },
    { input: { nums: [1], target: 0 }, expected: -1 }
  ]},
  '45': { name: 'Find Peak Element', cases: [
    { input: { nums: [1, 2, 3, 1] }, expected: 2 },
    { input: { nums: [1, 2, 1, 3, 5, 6, 4] }, expected: 5 }
  ]}
};

// Language configurations
const languageConfig = {
  javascript: {
    extension: '.js',
    compile: null,
    run: (filename) => `node "${filename}"`
  },
  python: {
    extension: '.py',
    compile: null,
    run: (filename) => `python "${filename}"`
  },
  java: {
    extension: '.java',
    compile: (filename) => `javac "${filename}"`,
    run: (filename) => {
      const className = path.basename(filename, '.java');
      return `java -cp "${path.dirname(filename)}" ${className}`;
    },
    extractClassName: (code) => {
      // Extract public class name from Java code
      const match = code.match(/public\s+class\s+(\w+)/);
      return match ? match[1] : 'Solution';
    }
  },
  cpp: {
    extension: '.cpp',
    compile: (filename) => `g++ "${filename}" -o "${filename.replace('.cpp', '.exe')}"`,
    run: (filename) => `"${filename.replace('.cpp', '.exe')}"`
  }
};

// Get test case inputs endpoint
app.get('/api/test-cases/:problemId', (req, res) => {
  const { problemId } = req.params;
  const testCase = testCases[problemId];
  
  if (!testCase) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  
  // Return only the inputs, not the expected outputs
  const inputs = testCase.cases.map(c => c.input);
  
  res.json({
    success: true,
    inputs: inputs
  });
});

// Execute code endpoint
app.post('/api/execute', async (req, res) => {
  const { code, language, input = '' } = req.body;
  
  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  if (!languageConfig[language]) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  const config = languageConfig[language];
  let filename;
  let submissionDir = tempDir;
  
  // For Java, use the class name as filename to avoid compilation errors
  if (language === 'java' && config.extractClassName) {
    const className = config.extractClassName(code);
    const fileId = uuidv4();
    // Create unique directory for this submission to avoid conflicts
    submissionDir = path.join(tempDir, fileId);
    if (!fs.existsSync(submissionDir)) {
      fs.mkdirSync(submissionDir, { recursive: true });
    }
    filename = path.join(submissionDir, className + config.extension);
  } else {
    const fileId = uuidv4();
    filename = path.join(tempDir, fileId + config.extension);
  }
  
  try {
    // Write code to file
    fs.writeFileSync(filename, code);
    
    const startTime = Date.now();
    
    // Compile if needed
    if (config.compile) {
      const compileCommand = config.compile(filename);
      
      await new Promise((resolve, reject) => {
        exec(compileCommand, { timeout: 10000 }, (error, stdout, stderr) => {
          if (error) {
            reject(new Error(`Compilation failed: ${stderr || error.message}`));
          } else {
            resolve();
          }
        });
      });
    }
    
    // Run the code
    const runCommand = config.run(filename);
    
    exec(runCommand, { timeout: 5000 }, (error, stdout, stderr) => {
      const executionTime = Date.now() - startTime;
      
      // Clean up files
      cleanup(filename, language);
      
      if (error) {
        if (error.signal === 'SIGTERM') {
          return res.json({
            success: false,
            output: '',
            error: 'Time Limit Exceeded (5 seconds)',
            executionTime
          });
        }
        
        return res.json({
          success: false,
          output: stdout || '',
          error: stderr || error.message,
          executionTime
        });
      }
      
      res.json({
        success: true,
        output: stdout,
        error: stderr,
        executionTime
      });
    });
    
  } catch (error) {
    // Clean up on error
    try {
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
    
    res.json({
      success: false,
      output: '',
      error: error.message,
      executionTime: 0
    });
  }
});

// Validate solution endpoint
app.post('/api/validate', async (req, res) => {
  const { code, language, problemId } = req.body;
  
  if (!code || !language || !problemId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Code, language, and problemId are required' 
    });
  }

  if (!languageConfig[language]) {
    return res.status(400).json({ 
      success: false, 
      error: 'Unsupported language' 
    });
  }

  const problemTestCases = testCases[problemId];
  if (!problemTestCases) {
    return res.status(400).json({
      success: false,
      error: 'Invalid problem ID'
    });
  }

  const config = languageConfig[language];
  let filename;
  let submissionDir = tempDir;
  
  // For Java, use the class name as filename to avoid compilation errors
  if (language === 'java' && config.extractClassName) {
    const className = config.extractClassName(code);
    const fileId = uuidv4();
    // Create unique directory for this submission to avoid conflicts
    submissionDir = path.join(tempDir, fileId);
    if (!fs.existsSync(submissionDir)) {
      fs.mkdirSync(submissionDir, { recursive: true });
    }
    filename = path.join(submissionDir, className + config.extension);
  } else {
    const fileId = uuidv4();
    filename = path.join(tempDir, fileId + config.extension);
  }
  
  try {
    // Write code to file
    fs.writeFileSync(filename, code);
    
    const startTime = Date.now();
    
    // Compile if needed
    if (config.compile) {
      const compileCommand = config.compile(filename);
      
      await new Promise((resolve, reject) => {
        exec(compileCommand, { timeout: 10000 }, (error, stdout, stderr) => {
          if (error) {
            reject(new Error(`Compilation failed: ${stderr || error.message}`));
          } else {
            resolve();
          }
        });
      });
    }
    
    // Run the code
    const runCommand = config.run(filename);
    
    exec(runCommand, { timeout: 10000 }, (error, stdout, stderr) => {
      const executionTime = Date.now() - startTime;
      
      // Clean up files
      cleanup(filename, language);
      
      if (error) {
        return res.json({
          success: false,
          output: stderr || error.message,
          testResults: [],
          allTestsPassed: false,
          totalTests: 0,
          passedTests: 0,
          executionTime
        });
      }
      
      // Parse test outputs and validate
      const outputs = stdout.trim().split('\n');
      const results = parseTestResults(outputs, problemTestCases.cases);
      
      res.json({
        success: true,
        output: stdout,
        testResults: results,
        allTestsPassed: results.every(r => r.passed),
        totalTests: results.length,
        passedTests: results.filter(r => r.passed).length,
        executionTime
      });
    });
    
  } catch (error) {
    cleanup(filename, language);
    
    res.json({
      success: false,
      output: '',
      error: error.message,
      testResults: [],
      allTestsPassed: false,
      totalTests: 0,
      passedTests: 0,
      executionTime: 0
    });
  }
});

function parseTestResults(outputs, expectedResults) {
  const results = [];
  
  outputs.forEach((output, index) => {
    if (output && output.startsWith('Test ')) {
      const parts = output.split(': ');
      if (parts.length < 2) {
        // Invalid format, skip this output
        return;
      }
      
      const testOutput = parts[1];
      const expected = expectedResults[index]?.expected;
      
      let actual;
      try {
        actual = JSON.parse(testOutput);
      } catch (parseError) {
        // Handle non-JSON outputs (like numbers or strings)
        if (testOutput) {
          actual = testOutput.trim();
          if (!isNaN(actual)) {
            actual = Number(actual);
          }
        } else {
          actual = null;
        }
      }
      
      const passed = JSON.stringify(actual) === JSON.stringify(expected);
      
      results.push({
        testCase: index + 1,
        expected: expected,
        actual: actual,
        passed: passed
      });
    }
  });
  
  return results;
}

function cleanup(filename, language) {
  try {
    const fileDir = path.dirname(filename);
    
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
    }
    
    if (language === 'java') {
      const classFile = filename.replace('.java', '.class');
      if (fs.existsSync(classFile)) {
        fs.unlinkSync(classFile);
      }
      
      // Clean up the submission directory if it exists and is different from tempDir
      if (fileDir !== tempDir && fs.existsSync(fileDir)) {
        const files = fs.readdirSync(fileDir);
        // Delete all remaining files in the directory
        files.forEach(file => {
          const filePath = path.join(fileDir, file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
        // Delete the directory itself
        fs.rmdirSync(fileDir);
      }
    }
    
    if (language === 'cpp') {
      const exeFile = filename.replace('.cpp', '.exe');
      if (fs.existsSync(exeFile)) {
        fs.unlinkSync(exeFile);
      }
    }
  } catch (cleanupError) {
    console.error('Cleanup error:', cleanupError);
  }
}

// Submit solution with full test case validation
app.post('/api/submit', async (req, res) => {
  const { code, language, problemId } = req.body;
  
  if (!code || !language || !problemId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Code, language, and problemId are required',
      verdict: 'ERROR'
    });
  }

  if (!languageConfig[language]) {
    return res.status(400).json({ 
      success: false, 
      error: 'Unsupported language',
      verdict: 'ERROR'
    });
  }

  const problemTestCases = testCases[problemId];
  if (!problemTestCases) {
    return res.status(400).json({
      success: false,
      error: 'Invalid problem ID',
      verdict: 'ERROR'
    });
  }

  const config = languageConfig[language];
  let filename;
  let submissionDir = tempDir;
  
  // For Java, use the class name as filename to avoid compilation errors
  if (language === 'java' && config.extractClassName) {
    const className = config.extractClassName(code);
    const fileId = uuidv4();
    // Create unique directory for this submission to avoid conflicts
    submissionDir = path.join(tempDir, fileId);
    if (!fs.existsSync(submissionDir)) {
      fs.mkdirSync(submissionDir, { recursive: true });
    }
    filename = path.join(submissionDir, className + config.extension);
  } else {
    const fileId = uuidv4();
    filename = path.join(tempDir, fileId + config.extension);
  }
  
  try {
    // Write code to file
    fs.writeFileSync(filename, code);
    
    const startTime = Date.now();
    let compilationTime = 0;
    
    // Compile if needed
    if (config.compile) {
      const compileStart = Date.now();
      const compileCommand = config.compile(filename);
      
      try {
        await new Promise((resolve, reject) => {
          exec(compileCommand, { timeout: 10000 }, (error, stdout, stderr) => {
            if (error) {
              reject(new Error(`Compilation Error: ${stderr || error.message}`));
            } else {
              resolve();
            }
          });
        });
        compilationTime = Date.now() - compileStart;
      } catch (compileError) {
        cleanup(filename, language);
        return res.json({
          success: false,
          verdict: 'COMPILATION ERROR',
          error: compileError.message,
          testResults: [],
          passedTests: 0,
          totalTests: problemTestCases.cases.length,
          executionTime: 0,
          compilationTime: Date.now() - compileStart
        });
      }
    }
    
    // Run the code
    const runCommand = config.run(filename);
    
    exec(runCommand, { timeout: 15000 }, (error, stdout, stderr) => {
      const totalExecutionTime = Date.now() - startTime - compilationTime;
      
      // Clean up files
      cleanup(filename, language);
      
      if (error) {
        let verdict = 'RUNTIME ERROR';
        if (error.signal === 'SIGTERM' || error.killed) {
          verdict = 'TIME LIMIT EXCEEDED';
        }
        
        return res.json({
          success: false,
          verdict: verdict,
          error: stderr || error.message,
          testResults: [],
          passedTests: 0,
          totalTests: problemTestCases.cases.length,
          executionTime: totalExecutionTime,
          compilationTime
        });
      }
      
      // Parse test outputs and validate
      try {
        const outputs = stdout.trim().split('\n').filter(line => line.trim());
        const testResults = [];
        let passedCount = 0;
        
        outputs.forEach((output, index) => {
          if (index < problemTestCases.cases.length) {
            const testCase = problemTestCases.cases[index];
            
            // Extract actual output from "Test N: <value>" format
            let actualOutput = output;
            if (output.includes(': ')) {
              actualOutput = output.split(': ').slice(1).join(': ');
            }
            
            // Parse the output
            let actual;
            try {
              actual = JSON.parse(actualOutput);
            } catch {
              // Handle non-JSON outputs
              actualOutput = actualOutput.trim();
              if (actualOutput === 'true') actual = true;
              else if (actualOutput === 'false') actual = false;
              else if (!isNaN(actualOutput) && actualOutput !== '') actual = Number(actualOutput);
              else actual = actualOutput;
            }
            
            // Compare with expected
            const expected = testCase.expected;
            const passed = JSON.stringify(actual) === JSON.stringify(expected);
            
            if (passed) passedCount++;
            
            testResults.push({
              testCase: index + 1,
              input: testCase.input,
              expected: expected,
              actual: actual,
              passed: passed,
              status: passed ? 'PASSED' : 'FAILED'
            });
          }
        });
        
        // Determine final verdict
        let verdict;
        if (passedCount === 0) {
          verdict = 'WRONG ANSWER';
        } else if (passedCount === problemTestCases.cases.length) {
          verdict = 'ACCEPTED';
        } else {
          verdict = 'PARTIAL';
        }
        
        res.json({
          success: true,
          verdict: verdict,
          testResults: testResults,
          passedTests: passedCount,
          totalTests: problemTestCases.cases.length,
          executionTime: totalExecutionTime,
          compilationTime,
          output: stdout,
          score: Math.round((passedCount / problemTestCases.cases.length) * 100)
        });
        
      } catch (parseError) {
        res.json({
          success: false,
          verdict: 'OUTPUT FORMAT ERROR',
          error: 'Could not parse test output. Make sure your code prints results in the correct format.',
          testResults: [],
          passedTests: 0,
          totalTests: problemTestCases.cases.length,
          executionTime: totalExecutionTime,
          compilationTime,
          output: stdout
        });
      }
    });
    
  } catch (error) {
    cleanup(filename, language);
    
    res.json({
      success: false,
      verdict: 'ERROR',
      error: error.message,
      testResults: [],
      passedTests: 0,
      totalTests: 0,
      executionTime: 0,
      compilationTime: 0
    });
  }
});

// Get test cases for a problem
app.get('/api/testcases/:problemId', (req, res) => {
  const { problemId } = req.params;
  const problemTestCases = testCases[problemId];
  
  if (!problemTestCases) {
    return res.status(404).json({
      success: false,
      error: 'Problem not found'
    });
  }
  
  // Return only sample test cases (first 2-3), hide the rest
  const sampleCases = problemTestCases.cases.slice(0, 2).map((testCase, index) => ({
    testCase: index + 1,
    input: testCase.input,
    expected: testCase.expected,
    isSample: true
  }));
  
  res.json({
    success: true,
    problemName: problemTestCases.name,
    totalTestCases: problemTestCases.cases.length,
    sampleTestCases: sampleCases,
    hiddenTestCases: problemTestCases.cases.length - sampleCases.length
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Code execution server is running' });
});

// Test endpoint for supported languages
app.get('/api/languages', (req, res) => {
  res.json({
    supported: Object.keys(languageConfig),
    languages: Object.entries(languageConfig).map(([key, config]) => ({
      key,
      extension: config.extension,
      requiresCompilation: !!config.compile
    }))
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Code execution server running on http://localhost:${PORT}`);
  console.log(`📋 Supported languages: ${Object.keys(languageConfig).join(', ')}`);
  console.log(`📝 Test cases loaded for ${Object.keys(testCases).length} problems`);
});