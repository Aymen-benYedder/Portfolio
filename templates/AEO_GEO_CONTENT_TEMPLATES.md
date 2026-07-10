# AEO/GEO Content Templates

**Purpose:** Structure blog content for LLM citation, featured snippets, and zero-click answers.

---

## Template 1: FAQ Block (FAQPage Schema)

**Use Case:** DevOps, troubleshooting, conceptual posts

**HTML Structure:**
```html
<section class="faq-block">
  <h2>Frequently Asked Questions</h2>
  
  <div class="faq-item" itemscope itemtype="https://schema.org/Question">
    <h3 itemprop="name">What is CI/CD in DevOps?</h3>
    <div itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
      <p itemprop="text">
        CI/CD (Continuous Integration/Continuous Deployment) is a development practice that automates 
        code integration, testing, and deployment. CI automatically integrates code changes into a shared 
        repository multiple times daily, while CD automatically deploys validated code to production 
        environments, reducing manual intervention and deployment time.
      </p>
    </div>
  </div>
  
  <!-- Repeat for additional FAQs -->
</div>
```

**JSON-LD (Inject via script):**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is CI/CD in DevOps?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CI/CD (Continuous Integration/Continuous Deployment) is a development practice..."
      }
    }
  ]
}
```

---

## Template 2: How-To Guide (HowTo Schema)

**Use Case:** Tutorial posts, setup guides, infrastructure walkthroughs

**HTML Structure:**
```html
<section class="how-to-guide">
  <h2>How to Set Up a Multi-Cloud Deployment Pipeline</h2>
  
  <div class="step" itemscope itemtype="https://schema.org/HowToStep">
    <h3 itemprop="name">Step 1: Provision VPC Infrastructure</h3>
    <div itemprop="itemListElement" itemscope itemtype="https://schema.org/HowToDirection">
      <p itemprop="text">Create a Virtual Private Cloud (VPC) in your primary cloud provider (AWS/GCP/Azure):</p>
      <ul>
        <li>Define CIDR blocks (10.0.0.0/16 for primary, 10.1.0.0/16 for secondary)</li>
        <li>Create public subnets for NAT gateways and load balancers</li>
        <li>Create private subnets for application and database tiers</li>
        <li>Configure route tables and network ACLs for security</li>
      </ul>
    </div>
  </div>
  
  <div class="step" itemscope itemtype="https://schema.org/HowToStep">
    <h3 itemprop="name">Step 2: Deploy Kubernetes Cluster</h3>
    <!-- More steps -->
  </div>
</section>
```

**JSON-LD:**
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Set Up a Multi-Cloud Deployment Pipeline",
  "description": "Complete guide to setting up resilient multi-cloud deployments",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Step 1: Provision VPC Infrastructure",
      "text": "Create a Virtual Private Cloud..."
    }
  ]
}
```

---

## Template 3: Comparison Table (with Table Schema)

**Use Case:** Infrastructure options, tool comparisons, architecture patterns

**HTML Structure:**
```html
<section class="comparison-table">
  <h2>Terraform vs Terragrunt vs OpenTOFU</h2>
  
  <table itemscope itemtype="https://schema.org/Table">
    <thead>
      <tr>
        <th>Feature</th>
        <th>Terraform</th>
        <th>Terragrunt</th>
        <th>OpenTOFU</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Cost Management</strong></td>
        <td>❌ Not included</td>
        <td>✅ via cost_estimation hook</td>
        <td>✅ Native cost tracking (planned)</td>
      </tr>
      <tr>
        <td><strong>State Locking</strong></td>
        <td>✅ DynamoDB, Consul</td>
        <td>✅ Auto-configured</td>
        <td>✅ Full support</td>
      </tr>
      <tr>
        <td><strong>Community</strong></td>
        <td>⭐⭐⭐⭐⭐ Largest</td>
        <td>⭐⭐⭐ Growing</td>
        <td>⭐⭐⭐⭐ Open-source focus</td>
      </tr>
    </tbody>
  </table>
  
  <p><strong>Recommendation:</strong> Use Terragrunt for complex multi-environment deployments; OpenTOFU for vendor-lock-in concerns; Terraform for standard AWS/GCP/Azure workloads.</p>
</section>
```

---

## Template 4: Key Takeaways / Summary Box

**Use Case:** End of post, key learnings, best practices

**HTML Structure:**
```html
<section class="key-takeaways">
  <h2>Key Takeaways</h2>
  
  <ul class="takeaway-list">
    <li><strong>CI/CD Reduces Deployment Time:</strong> By 80-90% through automation and reduced manual gates</li>
    <li><strong>Multi-Cloud Resilience:</strong> Requires federation of identity, secrets, and state management across providers</li>
    <li><strong>IaC is Non-Negotiable:</strong> All infrastructure should be version-controlled and code-reviewed like application code</li>
    <li><strong>Monitor Golden Signals:</strong> Focus on latency, traffic, errors, and saturation; detailed metrics are secondary</li>
  </ul>
</section>
```

**JSON-LD:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "learningResourceType": "Summary",
  "hasPart": [
    {
      "@type": "Thing",
      "name": "CI/CD Reduces Deployment Time",
      "description": "By 80-90% through automation..."
    }
  ]
}
```

---

## Template 5: Definition Block (for AEO / Zero-Click Answers)

**Use Case:** Define technical terms, concepts, jargon

**HTML Structure:**
```html
<section class="definition-block">
  <h2>Core Concepts</h2>
  
  <dl>
    <dt><strong>State File (Terraform)</strong></dt>
    <dd>
      A JSON or HCL file that maps Terraform configuration to real infrastructure resources. 
      It tracks resource IDs, attributes, and metadata. <strong>Must be stored securely</strong> 
      (DynamoDB, S3 with versioning, Terraform Cloud) because it contains sensitive data.
    </dd>
    
    <dt><strong>Plan-Apply Workflow</strong></dt>
    <dd>
      Two-phase deployment: (1) <code>terraform plan</code> shows a preview of changes before 
      applying them; (2) <code>terraform apply</code> actually modifies infrastructure. This 
      prevents accidental destructive changes.
    </dd>
    
    <dt><strong>Module</strong></dt>
    <dd>
      A reusable Terraform configuration unit containing variables, outputs, and resources. 
      Modules abstract complex infrastructure into simple interfaces, promoting DRY (Don't Repeat Yourself) 
      principles and team collaboration.
    </dd>
  </dl>
</section>
```

---

## Template 6: Code Example + Explanation

**Use Case:** Architecture snippets, configuration examples, best practices

**HTML Structure:**
```html
<section class="code-example">
  <h3>Example: Multi-Cloud State Management</h3>
  
  <p>This Terragrunt configuration centralizes state locking across AWS and GCP:</p>
  
  <pre><code class="language-hcl">
# environments/prod/terragrunt.hcl
remote_state {
  backend = "s3"
  config = {
    bucket         = "terraform-state-prod"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

# Enforces all downstream configs use same state backend
</code></pre>
  
  <p>
    <strong>Why this works:</strong> DynamoDB locks prevent concurrent modifications. S3 versioning 
    provides rollback capability. Encryption ensures sensitive values (DB passwords, API keys) 
    are never stored in plaintext.
  </p>
</section>
```

---

## Implementation Checklist

For each blog post, ensure:

- [ ] **H1 + H2 Hierarchy:** Single H1, multiple H2s, no skipped levels
- [ ] **Opening Paragraph:** 2-3 sentences defining the topic for LLMs
- [ ] **FAQ Block (if applicable):** Minimum 3 FAQs structured with schema
- [ ] **Comparison Table:** If comparing tools/approaches (3+ rows)
- [ ] **Key Takeaways:** Bulleted list of 3-5 main learnings
- [ ] **Canonical URL:** Points to primary version (no duplicates)
- [ ] **Breadcrumb Schema:** BreadcrumbList injected via script or manual
- [ ] **Article Schema:** Headline, author, datePublished, description
- [ ] **Images:** `loading="lazy"`, `decoding="async"`, width/height attributes
- [ ] **Internal Links:** Minimum 2-3 links to related portfolio pages
- [ ] **External Authority Links:** Minimum 3-5 links to authoritative sources (DigitalOcean, AWS Docs, GitHub)

---

## Targeting Featured Snippets

### Paragraph Snippet (0-60 words)
```html
<p>
  <strong>Definition Answer:</strong> CI/CD is a development practice combining Continuous Integration 
  (automated testing on every commit) and Continuous Deployment (automated release to production). 
  It reduces manual handoffs, deployment time, and human error in software delivery.
</p>
```

### List Snippet (3-10 items)
```html
<ol>
  <li><strong>Terraform Plan:</strong> Preview infrastructure changes before applying</li>
  <li><strong>Terraform Apply:</strong> Execute the changes to AWS/GCP/Azure</li>
  <li><strong>Terraform Destroy:</strong> Tear down infrastructure safely</li>
</ol>
```

### Table Snippet (3+ rows, 3+ columns)
```html
<table>
  <tr>
    <th>Tool</th>
    <th>Use Case</th>
    <th>Best For</th>
  </tr>
  <tr>
    <td>Terraform</td>
    <td>Multi-cloud IaC</td>
    <td>Teams needing vendor flexibility</td>
  </tr>
</table>
```

---

## LLM Citation Best Practices

To maximize LLM citation and ingestion:

1. **Entity Density:** Use specific names (AWS Lambda, PostgreSQL 15, OpenTofu v1.8)
2. **Direct Answers:** Lead with conclusions, then support with details
3. **Structured Facts:** Use lists, tables, and definition blocks (not prose paragraphs)
4. **Authority Signals:** Link to RFC docs, official announcements, whitepapers
5. **Dates & Versions:** Always include publication dates and software versions ("as of April 2026, Kubernetes 1.32...")
6. **Explicit Disclaimers:** State if information may be outdated ("Note: This guide covers Terraform 1.9+")

---

## Next Steps

1. Audit existing blog posts (12 files) against this checklist
2. Add FAQ blocks to DevOps and Infrastructure posts
3. Add comparison tables to tool/vendor posts
4. Inject HowTo schema into tutorial posts
5. Add key takeaways to all posts
6. Test with Google's Rich Results Test tool
7. Monitor Search Console for featured snippet impressions (target: +40% CTR)
