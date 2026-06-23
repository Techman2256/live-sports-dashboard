output "api_endpoint" {
  value = aws_apigatewayv2_api.sports_api.api_endpoint
  description = "The URL your React frontend will call"
}
