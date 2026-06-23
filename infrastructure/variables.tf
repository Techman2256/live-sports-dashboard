variable "aws_region" {
  default = "us-east-1"
}

variable "account_id" {
  description = "Your AWS account ID"
  default     = "941089721707"
}

variable "anthropic_api_key" {
  description = "Claude API key"
  sensitive   = true
}
