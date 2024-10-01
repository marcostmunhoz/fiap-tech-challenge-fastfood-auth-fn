data "terraform_remote_state" "sql_instance" {
  backend = "gcs"
  config = {
    bucket         = local.monorepo.bucket
    prefix         = local.monorepo.prefix
    encryption_key = var.monorepo_state_encryption_key
  }
}

resource "null_resource" "zip_source" {
  triggers = {
    always_run = "${timestamp()}"
  }

  provisioner "local-exec" {
    command = <<EOT
            cd ..
            zip -r -u source.zip src index.js package.json yarn.lock
            mv ./source.zip ${path.cwd}/source.zip
        EOT
  }
}

resource "google_storage_bucket_object" "function_zip" {
  name         = "sources/${local.google.application_name}/source.zip"
  bucket       = "${local.google.project}-bucket"
  source       = "${path.module}/source.zip"
  content_type = "application/zip"
}

resource "google_service_account" "function_invoker_sa" {
  account_id   = "function-invoker-sa"
  display_name = "Function Invoker Service Account"
}

resource "google_project_iam_custom_role" "function_invoker_role" {
  role_id     = "function_invoker_role"
  title       = "Function Invoker Role"
  description = "Role to invoke functions"
  permissions = [
    "run.jobs.run",
    "run.routes.invoke",
  ]
}

resource "google_project_iam_binding" "function_invoker_binding" {
  project = local.google.project
  role    = google_project_iam_custom_role.function_invoker_role.name
  members = [
    "serviceAccount:${google_service_account.function_invoker_sa.email}",
  ]
}

resource "google_cloudfunctions2_function" "function" {
  name     = local.google.application_name
  location = local.google.location

  build_config {
    runtime     = "nodejs20"
    entry_point = "handler"
    source {
      storage_source {
        bucket = google_storage_bucket_object.function_zip.bucket
        object = google_storage_bucket_object.function_zip.name
      }
    }
  }

  service_config {
    available_cpu         = "0.167"
    available_memory      = "128Mi"
    service_account_email = google_service_account.function_invoker_sa.email
    environment_variables = {
      "MYSQL_DATABASE_HOST"     = data.terraform_remote_state.sql_instance.outputs.cloud_sql_instance_ip
      "MYSQL_DATABASE_USERNAME" = var.db_username
      "MYSQL_DATABASE_PASSWORD" = var.db_password
      "MYSQL_DATABASE_NAME"     = var.db_name
      "JWT_SECRET"              = var.jwt_secret
    }
  }
}

data "template_file" "openapi_spec" {
  template = file("${path.module}/openapi.template.yaml")

  vars = {
    function_url = google_cloudfunctions2_function.function.url
  }
}

resource "local_file" "openapi_spec" {
  content  = data.template_file.openapi_spec.rendered
  filename = "${path.module}/openapi.yaml"
}

resource "google_api_gateway_api_config" "api_config" {
  provider     = google-beta
  project      = local.google.project
  api          = "${local.google.project}-api"
  display_name = "${local.google.application_name}-config"

  openapi_documents {
    document {
      path     = "openapi.yaml"
      contents = base64encode(local_file.openapi_spec.content)
    }
  }
}

resource "google_api_gateway_gateway" "gateway" {
  provider   = google-beta
  project    = local.google.project
  region     = local.google.gateway_region
  gateway_id = "${local.google.application_name}-gateway"
  api_config = google_api_gateway_api_config.api_config.id
}
