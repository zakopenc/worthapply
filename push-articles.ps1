# WorthApply — Auto Push Articles + Email Confirmation
# ======================================================
# Runs via Windows Task Scheduler at 6:05 AM daily
# 1. Pushes locally committed articles to GitHub
# 2. Sends email confirmation to abdelboch@gmail.com
#
# ONE-TIME SETUP (run once in PowerShell):
#   1. Go to https://myaccount.google.com/apppasswords
#   2. Create an App Password for "Mail" > "Windows Computer"
#   3. Set it as a Windows environment variable:
#      [System.Environment]::SetEnvironmentVariable("GMAIL_APP_PASSWORD", "xxxx xxxx xxxx xxxx", "User")
#   4. Then run: install-scheduler.ps1 (as Administrator)

$repoPath       = "F:\Worthapply-main"
$logFile        = "$repoPath\push-log.txt"
$siteBaseUrl    = "https://www.worthapply.com/blog"
$notifyEmail    = "abdelboch@gmail.com"
$fromEmail      = "abdelboch@gmail.com"
$gmailPassword  = [System.Environment]::GetEnvironmentVariable("GMAIL_APP_PASSWORD", "User")

function Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$ts  $msg" | Tee-Object -FilePath $logFile -Append
}

function Send-ArticleEmail($title, $slug, $category) {
    if (-not $gmailPassword) {
        Log "WARNING: GMAIL_APP_PASSWORD not set — skipping email. See setup instructions at top of this script."
        return
    }

    $articleUrl = "$siteBaseUrl/$slug"
    $today      = Get-Date -Format "MMMM dd, yyyy"

    $subject = "[WorthApply SEO] New article live: $title"

    $htmlBody = @"
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
  <div style="background: #6366F1; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h1 style="color: white; margin: 0; font-size: 20px;">📝 New SEO Article Live</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 14px;">WorthApply Daily SEO Agent — $today</p>
  </div>

  <p style="font-size: 16px; color: #374151; line-height: 1.6;">Your SEO agent published a new article this morning:</p>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #1a1a2e;">$title</h2>
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">Category: $category</p>
    <a href="$articleUrl"
       style="display: inline-block; background: #6366F1; color: white; text-decoration: none;
              padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 14px;">
      View Article →
    </a>
  </div>

  <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin: 20px 0;">
    <p style="margin: 0; font-size: 14px; color: #166534;">
      ✅ <strong>Committed + pushed to GitHub</strong><br>
      ✅ <strong>Live on worthapply.com/blog</strong><br>
      ✅ <strong>Next article writes tomorrow at 6:00 AM</strong>
    </p>
  </div>

  <p style="font-size: 13px; color: #9ca3af; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
    WorthApply SEO Agent · Auto-generated · Manage at Cowork Scheduled Tasks
  </p>
</body>
</html>
"@

    try {
        $smtp = New-Object System.Net.Mail.SmtpClient("smtp.gmail.com", 587)
        $smtp.EnableSsl   = $true
        $smtp.Credentials = New-Object System.Net.NetworkCredential($fromEmail, $gmailPassword)

        $msg                  = New-Object System.Net.Mail.MailMessage
        $msg.From             = $fromEmail
        $msg.To.Add($notifyEmail)
        $msg.Subject          = $subject
        $msg.Body             = $htmlBody
        $msg.IsBodyHtml       = $true

        $smtp.Send($msg)
        Log "EMAIL SENT: '$subject' → $notifyEmail"
    } catch {
        Log "EMAIL FAILED: $($_.Exception.Message)"
    }
}

# ── Main ──────────────────────────────────────────────────────────────────────

Log "=== WorthApply Auto-Push Started ==="
Set-Location $repoPath

# Check for unpushed commits
$unpushed = git log origin/main..HEAD --oneline 2>&1
if (-not $unpushed) {
    Log "Nothing to push. Exiting."
    exit 0
}

Log "Unpushed commits:"
$unpushed | ForEach-Object { Log "  $_" }

# Extract article info from the most recent commit message
$latestCommit   = git log origin/main..HEAD --oneline | Select-Object -First 1
$slugMatch      = [regex]::Match($latestCommit, 'add SEO article — (.+)')
$commitSlug     = if ($slugMatch.Success) { $slugMatch.Groups[1].Value.Trim() } else { "new-article" }

# Get the actual title and category from the staged file
$newFiles = git diff --name-only origin/main..HEAD | Where-Object { $_ -match "content/blog/.+\.md$" }
$articleTitle    = $commitSlug
$articleCategory = "guides"
$articleSlug     = $commitSlug

if ($newFiles) {
    $firstFile = $newFiles | Select-Object -First 1
    $fullPath  = Join-Path $repoPath $firstFile

    # Extract slug from path
    $articleSlug = [System.IO.Path]::GetFileNameWithoutExtension($firstFile)

    # Extract category from path
    if ($firstFile -match "blog/([^/]+)/") {
        $articleCategory = $Matches[1]
    }

    # Extract title from frontmatter
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $titleMatch = [regex]::Match($content, 'title:\s*"([^"]+)"')
        if ($titleMatch.Success) {
            $articleTitle = $titleMatch.Groups[1].Value
        }
    }
}

# Push to GitHub
Log "Pushing to GitHub..."
$result = git push origin main 2>&1
Log $result

if ($LASTEXITCODE -eq 0) {
    Log "PUSH SUCCESS"
    # Send confirmation email
    Send-ArticleEmail -title $articleTitle -slug $articleSlug -category $articleCategory
} else {
    Log "PUSH FAILED: $result"
    # Still try to email about the failure
    if ($gmailPassword) {
        try {
            $smtp = New-Object System.Net.Mail.SmtpClient("smtp.gmail.com", 587)
            $smtp.EnableSsl   = $true
            $smtp.Credentials = New-Object System.Net.NetworkCredential($fromEmail, $gmailPassword)
            $msg = New-Object System.Net.Mail.MailMessage
            $msg.From = $fromEmail
            $msg.To.Add($notifyEmail)
            $msg.Subject = "[WorthApply SEO] ⚠️ Push failed — action needed"
            $msg.Body    = "The SEO article was written and committed locally but the GitHub push failed.`n`nError: $result`n`nTo fix: open PowerShell in F:\Worthapply-main and run: git push origin main"
            $smtp.Send($msg)
        } catch {}
    }
    exit 1
}

Log "=== Done ==="
