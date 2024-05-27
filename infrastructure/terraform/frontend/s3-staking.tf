####################################
############### VAR ################
####################################

variable "s3StakingName" {
  default = "staking"
}

####################################
####### Create Public S3 ###########
####################################

resource "aws_s3_bucket" "s3Staking" {
  bucket = "${var.app}-${var.env}-${var.s3StakingName}"
}

resource "aws_s3_bucket_website_configuration" "s3Staking" {
  bucket = aws_s3_bucket.s3Staking.bucket

  index_document {
    suffix = "index.html"
  }
  
  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_acl" "s3Staking" {
  bucket = aws_s3_bucket.s3Staking.id
  acl    = "public-read"

  depends_on = [
    aws_s3_bucket_ownership_controls.s3Staking,
    aws_s3_bucket_public_access_block.s3Staking,
  ]
}

resource "aws_s3_bucket_ownership_controls" "s3Staking" {
  bucket = aws_s3_bucket.s3Staking.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "s3Staking" {
  bucket              = aws_s3_bucket.s3Staking.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_cloudfront_distribution" "s3Staking" {

  origin {
    domain_name = aws_s3_bucket.s3Staking.website_endpoint
    origin_id   = "S3-${aws_s3_bucket.s3Staking.bucket}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  aliases = [

  ]

  default_root_object = "index.html"
  enabled             = true
  is_ipv6_enabled     = true

  custom_error_response {
    error_caching_min_ttl = 3000
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }

  default_cache_behavior {
    allowed_methods        = ["HEAD", "GET"]
    cached_methods         = ["HEAD", "GET"]
    viewer_protocol_policy = "redirect-to-https"
    target_origin_id       = "S3-${aws_s3_bucket.s3Staking.bucket}"
    compress               = true

    forwarded_values {
      query_string = true

      cookies {
        forward = "all"
      }

      headers  = ["Cache-Control"]
    }

    default_ttl = var.cdn_ttl
    max_ttl     = var.cdn_ttl
    min_ttl     = var.cdn_ttl
  }

  price_class = var.cdn_price_class

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
#    acm_certificate_arn             = var.certificate_arn
    cloudfront_default_certificate  = true
    ssl_support_method              = "sni-only"
    minimum_protocol_version        = "TLSv1.1_2016"
  }
}

##########################
# Domain
##########################

#resource "aws_route53_record" "s3Staking" {
#  zone_id = var.domain_zone
#  name    = var.url_staking
#  type    = "CNAME"
#  ttl     = "60"
#  records = [aws_cloudfront_distribution.s3Staking.domain_name]
#}
