Complete Guide: AWS Setup and Next.js Static Deployment
This comprehensive guide covers AWS account setup, IAM user creation, VPC configuration, and deploying a Next.js 16 static app to S3.
Part 1: AWS Root Account Login
Console Instructions

Navigate to AWS Console

Go to https://aws.amazon.com
Click "Sign In to the Console" (top right)


Sign in as Root User

Select "Root user"
Enter your root account email address
Click "Next"
Enter your password
Complete MFA if enabled (highly recommended)


Enable MFA for Root Account (if not already done)

Click your account name (top right) → "Security credentials"
Scroll to "Multi-factor authentication (MFA)"
Click "Assign MFA device"
Follow the setup wizard (recommended: virtual MFA app like Google Authenticator)



Part 2: Create IAM User
Console Instructions

Navigate to IAM

In the AWS Console search bar, type "IAM"
Click "IAM" service


Create New User

Click "Users" in the left sidebar
Click "Create user"
Enter username (e.g., "admin-user" or your name)
Click "Next"


Set Permissions

Select "Attach policies directly"
Search and select "AdministratorAccess" (for full access)
Alternatively, for more restricted access, select specific policies:

AmazonVPCFullAccess
AmazonS3FullAccess
AmazonEC2FullAccess


Click "Next"


Review and Create

Review the configuration
Click "Create user"


Create Access Keys for CLI

Click on the newly created user
Go to "Security credentials" tab
Scroll to "Access keys"
Click "Create access key"
Select "Command Line Interface (CLI)"
Check the confirmation box
Click "Next"
Add description tag (optional): "CLI access"
Click "Create access key"
IMPORTANT: Download the CSV file or copy both:

Access Key ID
Secret Access Key


Store these securely (you won't see the secret key again)


Enable Console Access (optional)

In the user details page, go to "Security credentials"
Under "Console sign-in", click "Enable console access"
Set a password (auto-generated or custom)
Optionally require password reset on first login
Save the console sign-in URL (format: https://YOUR-ACCOUNT-ID.signin.aws.amazon.com/console)



Part 3: Configure AWS CLI
Install AWS CLI
macOS:
bashcurl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
Linux:
bashcurl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
Windows:
Download and run the AWS CLI MSI installer from: https://awscli.amazonaws.com/AWSCLIV2.msi
Configure AWS CLI with IAM User Credentials
bashaws configure
You'll be prompted for:

AWS Access Key ID: [Enter your IAM user's access key]
AWS Secret Access Key: [Enter your IAM user's secret key]
Default region name: us-east-1 (or your preferred region)
Default output format: json (recommended)

Verify Configuration:
bashaws sts get-caller-identity
This should return your IAM user details.
Configure Named Profiles (Optional)
If you need multiple profiles:
bashaws configure --profile myprofile
To use a profile:
bashaws s3 ls --profile myprofile
Part 4: Create VPC
Console Instructions

Navigate to VPC Dashboard

Search for "VPC" in the console
Click "VPC"


Create VPC

Click "Create VPC"
Select "VPC and more" (this creates VPC with subnets, route tables, and internet gateway automatically)
Configure:

Name tag: my-app-vpc
IPv4 CIDR block: 10.0.0.0/16
Number of Availability Zones: 2
Number of public subnets: 2
Number of private subnets: 2
NAT gateways: 1 per AZ (or None to save costs)
VPC endpoints: None (or S3 gateway if needed)


Click "Create VPC"



CLI Instructions
Create VPC:
bashaws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=my-app-vpc}]'
Save the VPC ID from the output (e.g., vpc-0abcd1234efgh5678).
Create Internet Gateway:
bashaws ec2 create-internet-gateway \
    --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=my-app-igw}]'
Save the IGW ID (e.g., igw-0abcd1234efgh5678).
Attach Internet Gateway to VPC:
bashaws ec2 attach-internet-gateway \
    --vpc-id vpc-0abcd1234efgh5678 \
    --internet-gateway-id igw-0abcd1234efgh5678
Create Public Subnet:
bashaws ec2 create-subnet \
    --vpc-id vpc-0abcd1234efgh5678 \
    --cidr-block 10.0.1.0/24 \
    --availability-zone us-east-1a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=public-subnet-1}]'
Save the Subnet ID (e.g., subnet-0abcd1234efgh5678).
Create Route Table:
bashaws ec2 create-route-table \
    --vpc-id vpc-0abcd1234efgh5678 \
    --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=public-rt}]'
Save the Route Table ID (e.g., rtb-0abcd1234efgh5678).
Create Route to Internet Gateway:
bashaws ec2 create-route \
    --route-table-id rtb-0abcd1234efgh5678 \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id igw-0abcd1234efgh5678
Associate Route Table with Subnet:
bashaws ec2 associate-route-table \
    --route-table-id rtb-0abcd1234efgh5678 \
    --subnet-id subnet-0abcd1234efgh5678
Enable Auto-assign Public IP:
bashaws ec2 modify-subnet-attribute \
    --subnet-id subnet-0abcd1234efgh5678 \
    --map-public-ip-on-launch
Part 5: Create S3 Buckets
Console Instructions

Navigate to S3

Search for "S3" in the console
Click "Create bucket"


Configure Bucket

Bucket name: my-nextjs-app-bucket (must be globally unique)
Region: us-east-1 (or match your VPC region)
Object Ownership: ACLs disabled (recommended)
Block Public Access: Uncheck "Block all public access" (for static website hosting)
Check the acknowledgment box
Bucket Versioning: Enable (optional, for version control)
Tags: Add tags if desired
Click "Create bucket"


Enable Static Website Hosting

Click on your bucket name
Go to "Properties" tab
Scroll to "Static website hosting"
Click "Edit"
Select "Enable"
Index document: index.html
Error document: 404.html (optional)
Click "Save changes"


Configure Bucket Policy for Public Access

Go to "Permissions" tab
Scroll to "Bucket policy"
Click "Edit"
Add this policy (replace YOUR-BUCKET-NAME):



json{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
CLI Instructions
Create S3 Bucket:
bashaws s3 mb s3://my-nextjs-app-bucket --region us-east-1
Disable Block Public Access:
bashaws s3api put-public-access-block \
    --bucket my-nextjs-app-bucket \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
Enable Static Website Hosting:
bashaws s3 website s3://my-nextjs-app-bucket/ \
    --index-document index.html \
    --error-document 404.html
Add Bucket Policy:
bashaws s3api put-bucket-policy \
    --bucket my-nextjs-app-bucket \
    --policy '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::my-nextjs-app-bucket/*"
        }
    ]
}'
Part 6: Launch Internet-Facing EC2 Instances
Console Instructions

Navigate to EC2

Search for "EC2" in the console
Click "Launch instance"


Configure Instance

Name: my-web-server
AMI: Amazon Linux 2023 (or Ubuntu Server)
Instance type: t2.micro (free tier eligible)
Key pair: Create new or select existing

Click "Create new key pair" if needed
Name: my-keypair
Type: RSA
Format: .pem (for Mac/Linux) or .ppk (for PuTTY)
Download and save securely




Network Settings

Click "Edit"
VPC: Select your created VPC (my-app-vpc)
Subnet: Select public subnet
Auto-assign public IP: Enable
Firewall (security groups): Create new

Security group name: web-server-sg
Add rules:

SSH: Port 22, Source: My IP (for SSH access)
HTTP: Port 80, Source: 0.0.0.0/0 (public web access)
HTTPS: Port 443, Source: 0.0.0.0/0






Configure Storage

Default 8 GB gp3 (or adjust as needed)


Launch Instance

Click "Launch instance"



CLI Instructions
Create Security Group:
bashaws ec2 create-security-group \
    --group-name web-server-sg \
    --description "Security group for web server" \
    --vpc-id vpc-0abcd1234efgh5678
Save the Security Group ID (e.g., sg-0abcd1234efgh5678).
Add Security Group Rules:
bash# Allow SSH from your IP
aws ec2 authorize-security-group-ingress \
    --group-id sg-0abcd1234efgh5678 \
    --protocol tcp \
    --port 22 \
    --cidr YOUR-IP-ADDRESS/32

# Allow HTTP from anywhere
aws ec2 authorize-security-group-ingress \
    --group-id sg-0abcd1234efgh5678 \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# Allow HTTPS from anywhere
aws ec2 authorize-security-group-ingress \
    --group-id sg-0abcd1234efgh5678 \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0
Create Key Pair:
bashaws ec2 create-key-pair \
    --key-name my-keypair \
    --query 'KeyMaterial' \
    --output text > my-keypair.pem

chmod 400 my-keypair.pem
Launch EC2 Instance:
bashaws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1f0 \
    --instance-type t2.micro \
    --key-name my-keypair \
    --security-group-ids sg-0abcd1234efgh5678 \
    --subnet-id subnet-0abcd1234efgh5678 \
    --associate-public-ip-address \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=my-web-server}]'
Get Instance Public IP:
bashaws ec2 describe-instances \
    --filters "Name=tag:Name,Values=my-web-server" \
    --query 'Reservations[*].Instances[*].[PublicIpAddress]' \
    --output text
Connect to Instance:
bashssh -i my-keypair.pem ec2-user@YOUR-INSTANCE-PUBLIC-IP
Part 7: Deploy Next.js 16 Static App to S3
Step 1: Set Up Next.js 16 Project
Create New Next.js 16 App:
bashnpx create-next-app@latest my-nextjs-app
cd my-nextjs-app
During setup, choose:

TypeScript: Yes/No (your preference)
ESLint: Yes
Tailwind CSS: Yes/No (your preference)
src/ directory: Yes/No
App Router: Yes
Customize default import alias: No

Or use existing Next.js project:
bashcd your-existing-nextjs-project
Step 2: Configure Next.js for Static Export
Update next.config.js:
javascript/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
Important notes for static export:

Cannot use Image Optimization (set unoptimized: true)
Cannot use Internationalized Routing
Cannot use API Routes (use external API or serverless functions)
Cannot use Server Actions
Cannot use Incremental Static Regeneration
trailingSlash: true helps with S3 routing

Step 3: Install Necessary Dependencies
Your Next.js 16 app comes with core dependencies. For a typical app, you might add:
bash# Core dependencies (usually already included)
npm install react react-dom next

# Additional common dependencies
npm install --save \
  @types/node \
  @types/react \
  @types/react-dom \
  typescript \
  eslint \
  eslint-config-next

# Optional: UI libraries
npm install --save \
  tailwindcss \
  postcss \
  autoprefixer

# Optional: For enhanced functionality
npm install --save \
  next-seo \
  gray-matter \
  remark \
  remark-html
For AWS deployment, install AWS SDK (optional):
bashnpm install --save-dev @aws-sdk/client-s3
Step 4: Build Static Site
Update package.json scripts:
json{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build"
  }
}
Build the static site:
bashnpm run build
This creates an out directory with your static files.
Verify the build:
bashls -la out/
You should see index.html, _next/, and other static assets.
Step 5: Deploy to S3 - Console Method

Navigate to Your S3 Bucket

Go to S3 console
Click on your bucket (my-nextjs-app-bucket)


Upload Files

Click "Upload"
Click "Add files" or "Add folder"
Select all files from the out directory
Click "Upload"


Verify Deployment

Go to "Properties" tab
Scroll to "Static website hosting"
Click the "Bucket website endpoint" URL
Your site should be live!



Step 6: Deploy to S3 - CLI Method
Sync the out directory to S3:
bashaws s3 sync out/ s3://my-nextjs-app-bucket/ --delete
The --delete flag removes files from S3 that aren't in your local out directory.
Set proper content types (important for proper rendering):
bash# Set HTML content type
aws s3 cp out/ s3://my-nextjs-app-bucket/ \
    --recursive \
    --exclude "*" \
    --include "*.html" \
    --content-type "text/html"

# Set CSS content type
aws s3 cp out/ s3://my-nextjs-app-bucket/ \
    --recursive \
    --exclude "*" \
    --include "*.css" \
    --content-type "text/css"

# Set JS content type
aws s3 cp out/ s3://my-nextjs-app-bucket/ \
    --recursive \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript"
Get website URL:
bashaws s3api get-bucket-website \
    --bucket my-nextjs-app-bucket
Your site URL format: http://my-nextjs-app-bucket.s3-website-us-east-1.amazonaws.com
Step 7: Automate Deployment with Script
Create a deployment script deploy.sh:
bash#!/bin/bash

# Build the Next.js app
echo "Building Next.js app..."
npm run build

# Sync to S3
echo "Deploying to S3..."
aws s3 sync out/ s3://my-nextjs-app-bucket/ \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "*.html" \
    --exclude "*.json"

# Upload HTML and JSON with shorter cache
aws s3 sync out/ s3://my-nextjs-app-bucket/ \
    --cache-control "public, max-age=0, must-revalidate" \
    --exclude "*" \
    --include "*.html" \
    --include "*.json" \
    --content-type "text/html"

echo "Deployment complete!"
echo "Visit: http://my-nextjs-app-bucket.s3-website-us-east-1.amazonaws.com"
Make executable and run:
bashchmod +x deploy.sh
./deploy.sh
Part 8: Enhanced Setup with CloudFront (Optional)
For better performance and HTTPS support, add CloudFront CDN:
Console Instructions

Navigate to CloudFront

Search for "CloudFront"
Click "Create distribution"


Configure Distribution

Origin domain: Select your S3 bucket website endpoint (not the bucket itself)
Origin path: Leave empty
Name: my-nextjs-cdn
Viewer protocol policy: Redirect HTTP to HTTPS
Allowed HTTP methods: GET, HEAD
Cache policy: CachingOptimized
Price class: Use all edge locations (or select regions)
Alternate domain name (CNAME): your-domain.com (if you have one)
SSL Certificate: Default CloudFront certificate (or custom)
Click "Create distribution"


Wait for Deployment

Status will change from "In Progress" to "Deployed" (takes 10-15 minutes)
Note the distribution domain name (e.g., d1234abcd.cloudfront.net)



CLI Instructions
bashaws cloudfront create-distribution \
    --origin-domain-name my-nextjs-app-bucket.s3-website-us-east-1.amazonaws.com \
    --default-root-object index.html
```

## Part 9: Environment Variables and Secrets

For Next.js apps with environment variables:

**Create `.env.local`:**
```
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GA_ID=UA-XXXXXXXXX-X
Build with environment variables:
bashNEXT_PUBLIC_API_URL=https://api.example.com npm run build
Note: Environment variables with NEXT_PUBLIC_ prefix are embedded in the build and exposed to the browser.
Part 10: Troubleshooting Common Issues
Issue: 403 Forbidden

Check bucket policy allows public read access
Verify static website hosting is enabled
Ensure files are in the root of the bucket

Issue: 404 Not Found for Routes

Add error document in static hosting settings: 404.html
For SPA routing, set error document to index.html
Ensure trailingSlash: true in next.config.js

Issue: Styles Not Loading

Check content-type headers are correct
Verify images: { unoptimized: true } in config
Clear browser cache

Issue: API Routes Not Working

Static export doesn't support API routes
Move API logic to external serverless functions (Lambda)
Or use API Gateway with Lambda

Summary
You've now completed:

✅ Logged in as AWS root user
✅ Created IAM user with appropriate permissions
✅ Configured AWS CLI with IAM credentials
✅ Created VPC with public subnets and internet gateway
✅ Created S3 bucket for static hosting
✅ Launched internet-facing EC2 instances
✅ Deployed Next.js 16 static app to S3

Your Next.js app is now live on S3! The website URL follows the format: http://[bucket-name].s3-website-[region].amazonaws.com
For production use, consider adding CloudFront for HTTPS, custom domain with Route 53, and CI/CD pipeline with GitHub Actions or AWS CodePipeline.Claude is AI and can make mistakes. Please double-check responses. 

