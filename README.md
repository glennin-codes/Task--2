# Microservices API Project

A Node.js microservices API with Redis and MongoDB integration, complete with Docker support and CI/CD pipeline.

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- Git
- A Docker Hub account (for CI/CD)

## Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/glennin-codes/Task--2.git
cd Task--2
```

2. Install dependencies:
```bash
npm install
```

3. Start the services using Docker Compose:
```bash
docker-compose up -d
```

This will start:
- Redis on port 6379
- MongoDB on port 27017
- API service on port 8080

4. Run tests:
```bash
NODE_ENV=test npm test
```

## API Endpoints

- `GET /` - Health check endpoint
- `POST /redis` - Add key-value pair to Redis
- `GET /redis/:key` - Get value by key from Redis
- `POST /mongodb` - Add document to MongoDB
- `GET /mongodb/:id` - Get document by ID from MongoDB
- `GET /mongodb` - Get all documents from MongoDB

## Environment Variables

```env
PORT=8080
REDIS_HOST=localhost
REDIS_PORT=6379
MONGO_URI=mongodb://admin:password@localhost:27017/microservices?authSource=admin
```

## Setting up CI/CD Pipeline

The project includes a GitHub Actions workflow for CI/CD. To set it up:

1. Fork/push the project to GitHub

2. Add GitHub Secrets:
   - Go to your repository on GitHub
   - Navigate to Settings > Secrets and Variables > Actions
   - Add the following secrets:
     - `DOCKERHUB_USERNAME`: Your Docker Hub username
     - `DOCKERHUB_TOKEN`: Your Docker Hub access token

3. Get Docker Hub Access Token:
   - Log in to Docker Hub
   - Go to Account Settings > Security
   - Click "New Access Token"
   - Give it a name and copy the token
   - Save this token as `DOCKERHUB_TOKEN` in GitHub secrets

4. The CI/CD pipeline will:
   - Run on every push to main/master
   - Execute all tests
   - Build and push Docker image to Docker Hub (on successful push to main/master)

## Docker Commands

Build and run locally:
```bash
# Build the API image
docker build -t microservices-api .

# Run the entire stack
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f api
```

## Testing

The project uses Jest for testing with:
- `redis-mock` for Redis testing
- `mongodb-memory-server` for MongoDB testing

Run tests:
```bash
# Run all tests
NODE_ENV=test npm test

# Run tests with coverage
NODE_ENV=test npm test -- --coverage
```

## Project Structure

```
.
├── src/
│   └── index.ts          # Main application file
├── __tests__/
│   ├── setup.ts          # Test setup and mocks
│   ├── redis.test.ts     # Redis route tests
│   ├── mongodb.test.ts   # MongoDB route tests
│   └── health.test.ts    # Health check tests
├── .github/
│   └── workflows/        # GitHub Actions workflows
├── Dockerfile           # Docker image definition
├── docker-compose.yml   # Local development services
├── package.json        
└── README.md
```

## Troubleshooting

1. If tests fail in CI:
   - Check if all environment variables are set correctly
   - Verify that Node.js version matches the project requirements
   - Check test logs for specific errors

2. If Docker build fails:
   - Verify Dockerfile syntax
   - Check if all required files are present
   - Ensure Docker Hub credentials are correct

3. If local development issues:
   - Ensure all required ports are available
   - Check if Docker services are running
   - Verify environment variables are set correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[MIT License](LICENSE) 
