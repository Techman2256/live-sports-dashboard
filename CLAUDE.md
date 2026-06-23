# Live Sports Dashboard

## Stack
- AWS Lambda (Node.js 20)
- React 18 frontend
- Claude API for summaries (claude-sonnet-4-6)
- Terraform for IaC
- GitHub Actions for CI/CD

## Conventions
- All Lambda handlers in /backend/functions/
- Use async/await, not callbacks
- Never commit API keys — use AWS Secrets Manager

## APIs
- ESPN scoreboard: https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard
