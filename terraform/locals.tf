locals {
  google = {
    application_name = "auth-fn"
    project          = "fiap-pos-graduacao"
    region           = "southamerica-east1"
    location         = "southamerica-east1"
    gateway_region   = "us-central1"
  }

  monorepo = {
    bucket = "fiap-pos-graduacao-terraform-state"
    prefix = "tech-challenge-monorepo"
  }
}
