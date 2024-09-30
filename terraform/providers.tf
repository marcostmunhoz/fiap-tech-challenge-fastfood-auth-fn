terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 6.4.0"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 6.4.0"
    }
  }
}

provider "google" {
  project = local.google.project
  region  = local.google.region
}
