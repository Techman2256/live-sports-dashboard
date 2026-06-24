terraform {
  backend "s3" {
    bucket = "sports-dashboard-tfstate-941089721707"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}
