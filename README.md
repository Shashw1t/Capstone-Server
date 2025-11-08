# GeeksforGeeks Clone - Backend API

Backend server for the GeeksforGeeks Clone project. Handles code execution, problem management, and test case validation for 45+ coding problems.

## 🚀 Features

- **Code Execution**: Supports C++, Java, and Python
- **Problem Management**: 45 curated coding problems with test cases
- **Template Generation**: Language-specific code templates
- **Test Case Validation**: Comprehensive test suites for each problem
- **CORS Enabled**: Supports cross-origin requests from frontend

## 📋 Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **child_process** - Code execution
- **UUID** - Unique session IDs

## 🛠️ Installation

```bash
npm install
```

## 🏃 Running Locally

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:3001`

## 📡 API Endpoints

### 1. Compile Code
```
POST /compile
```

**Request Body:**
```json
{
  "code": "your code here",
  "language": "cpp|java|python",
  "input": "test input"
}
```

**Response:**
```json
{
  "output": "program output",
  "error": "error message if any"
}
```

### 2. Get Template
```
POST /template
```

**Request Body:**
```json
{
  "language": "cpp|java|python",
  "problemId": "1-45"
}
```

**Response:**
```json
{
  "template": "code template with function signature"
}
```

### 3. Get Test Cases
```
GET /api/test-cases/:problemId
```

**Response:**
```json
{
  "name": "Problem Name",
  "cases": [
    {
      "input": {},
      "expected": "expected output"
    }
  ]
}
```

## 🗂️ Project Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .gitignore         # Git ignore rules
└── temp/              # Temporary code execution files
```

## 🔒 Security Notes

**⚠️ Warning**: This backend executes user-submitted code using `child_process.exec()`. This is **NOT SECURE** for production use.

**For Production:**
- Use sandboxed environments (Docker containers)
- Use external API services (Judge0, Piston API)
- Implement rate limiting
- Add authentication
- Validate and sanitize all inputs

## 🌐 Deployment

### Render.com (Recommended for Basic Deployment)
1. Create account on Render.com
2. New Web Service → Connect this repository
3. Settings:
   - Runtime: Node
   - Build: `npm install`
   - Start: `npm start`
   - Port: Auto-detected

**Note:** Free tier doesn't support code execution. Consider:
- Judge0 API for code execution
- Railway.app for better support
- VPS for full control

### Environment Variables
```
PORT=3001              # Server port (auto-set by hosting)
NODE_ENV=production    # Environment mode
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License

## 🔗 Related

- Frontend Repository: [Link to frontend repo]
- Live Demo: [Link to deployed app]

## 📞 Contact

For issues or questions, please open an issue in the repository.
