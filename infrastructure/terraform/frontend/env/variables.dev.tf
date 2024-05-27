terraform {
  backend "http" {
    lock_method   = "POST"
    unlock_method = "DELETE"
  }
}


variable "env" {
  default = "dev"
}

variable "app" {
  default = "ocp"
}

variable "cdn_price_class" {
  default = "PriceClass_100"
}

variable "cdn_ttl" {
  default = 86400 // 24 hours
}

####################################
############### AWS ################
####################################

variable "aws_access_key" {
  type  = string
}

variable "aws_secret_key" {
  type  = string
}

variable "region" {
  default = "eu-west-3"
}

####################################
############### ENV ################
####################################

variable "folder_tmp" {
  default = "/tmp"
}
