provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "terraform_state" {
  bucket = "sports-dashboard-tfstate-${var.account_id}"
}

data "archive_file" "fetch_scores" {
  type        = "zip"
  source_dir  = "../backend/functions/fetch-scores"
  output_path = "../backend/functions/fetch-scores.zip"
}

data "archive_file" "summarize" {
  type        = "zip"
  source_dir  = "../backend/functions/summarize"
  output_path = "../backend/functions/summarize.zip"
}

resource "aws_iam_role" "lambda_role" {
  name = "sports-dashboard-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "fetch_scores" {
  filename         = "../backend/functions/fetch-scores.zip"
  function_name    = "fetch-scores"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  source_code_hash = data.archive_file.fetch_scores.output_base64sha256
}

resource "aws_lambda_function" "summarize" {
  filename         = "../backend/functions/summarize.zip"
  function_name    = "summarize-game"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  source_code_hash = data.archive_file.summarize.output_base64sha256
  environment {
    variables = {
      ANTHROPIC_API_KEY = var.anthropic_api_key
    }
  }
}

resource "aws_apigatewayv2_api" "sports_api" {
  name          = "sports-dashboard-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST"]
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.sports_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "fetch_scores" {
  api_id             = aws_apigatewayv2_api.sports_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.fetch_scores.invoke_arn
}

resource "aws_apigatewayv2_route" "fetch_scores" {
  api_id    = aws_apigatewayv2_api.sports_api.id
  route_key = "GET /scores"
  target    = "integrations/${aws_apigatewayv2_integration.fetch_scores.id}"
}

resource "aws_apigatewayv2_integration" "summarize" {
  api_id             = aws_apigatewayv2_api.sports_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.summarize.invoke_arn
}

resource "aws_apigatewayv2_route" "summarize" {
  api_id    = aws_apigatewayv2_api.sports_api.id
  route_key = "POST /summarize"
  target    = "integrations/${aws_apigatewayv2_integration.summarize.id}"
}

resource "aws_lambda_permission" "fetch_scores" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fetch_scores.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.sports_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "summarize" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.summarize.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.sports_api.execution_arn}/*/*"
}
