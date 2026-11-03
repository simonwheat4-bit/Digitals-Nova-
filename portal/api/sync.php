<?php
// ==============================================================================
// DigitalsNova Cloud SaaS Sync & Email Automation Backend
// Hostinger Shared Hosting Native PHP API
// ==============================================================================

// Set CORS headers so API can be called from any subdomain or client PC
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

$tenantsFile = $dataDir . '/tenants.json';
$notifsFile = $dataDir . '/notifications.json';
$staffFile = $dataDir . '/staff.json';
$deletedTenantsFile = $dataDir . '/deleted_tenants.json';

// Helper to read JSON file safely
function readJsonFile($path, $default = []) {
    if (!file_exists($path)) {
        return $default;
    }
    $content = @file_get_contents($path);
    if (!$content) {
        return $default;
    }
    $decoded = json_decode($content, true);
    return is_array($decoded) ? $decoded : $default;
}

// Helper to write JSON file safely
function writeJsonFile($path, $data) {
    @file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// ==============================================================================
// GMAIL SMTP AUTHENTICATED MAILER ENGINE (smtp.gmail.com:465 SSL)
// ==============================================================================
function sendGmailSmtp($toEmail, $subject, $htmlBody) {
    $smtpHost = 'ssl://smtp.gmail.com';
    $smtpPort = 465;
    $smtpUser = 'digitalsnovaofficial@gmail.com';
    $smtpPass = 'rfnygyzvohahoqde';
    $senderName = 'DigitalsNova Team';

    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);

    $socket = @stream_socket_client($smtpHost . ':' . $smtpPort, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        // Fallback to PHP native mail() if socket is restricted
        $headers = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=utf-8';
        $headers[] = 'From: ' . $senderName . ' <' . $smtpUser . '>';
        $headers[] = 'Reply-To: ' . $smtpUser;
        return @mail($toEmail, $subject, $htmlBody, implode("\r\n", $headers));
    }

    $read = function($sock, $expectedCode) {
        $response = '';
        while ($line = fgets($sock, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) === ' ') break;
        }
        $code = intval(substr($response, 0, 3));
        return ($code === $expectedCode || ($expectedCode === 250 && ($code === 250 || $code === 251)));
    };

    $send = function($sock, $cmd) {
        fputs($sock, $cmd . "\r\n");
    };

    if (!$read($socket, 220)) { fclose($socket); return false; }

    $send($socket, "EHLO " . ($_SERVER['SERVER_NAME'] ?? 'digitalsnova.com'));
    if (!$read($socket, 250)) { fclose($socket); return false; }

    $send($socket, "AUTH LOGIN");
    if (!$read($socket, 334)) { fclose($socket); return false; }

    $send($socket, base64_encode($smtpUser));
    if (!$read($socket, 334)) { fclose($socket); return false; }

    $send($socket, base64_encode($smtpPass));
    if (!$read($socket, 235)) { fclose($socket); return false; }

    $send($socket, "MAIL FROM:<" . $smtpUser . ">");
    if (!$read($socket, 250)) { fclose($socket); return false; }

    $send($socket, "RCPT TO:<" . $toEmail . ">");
    if (!$read($socket, 250)) { fclose($socket); return false; }

    $send($socket, "DATA");
    if (!$read($socket, 354)) { fclose($socket); return false; }

    $headers = [
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "From: " . $senderName . " <" . $smtpUser . ">",
        "Reply-To: " . $smtpUser,
        "To: <" . $toEmail . ">",
        "Date: " . date('r'),
        "Subject: " . $subject,
        "X-Mailer: DigitalsNova-Gmail-SMTP"
    ];

    $payload = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody . "\r\n.";
    $send($socket, $payload);
    $sent = $read($socket, 250);

    $send($socket, "QUIT");
    fclose($socket);

    return $sent;
}

function sendDigitalsNovaEmail($toEmail, $subject, $htmlContent) {
    return sendGmailSmtp($toEmail, $subject, $htmlContent);
}

// Read incoming request
$action = isset($_GET['action']) ? $_GET['action'] : '';
$rawBody = @file_get_contents('php://input');
$body = json_decode($rawBody, true) ?: [];

if (empty($action) && isset($body['action'])) {
    $action = $body['action'];
}

// ==============================================================================
// Action: Test Email
if ($action === 'test_email' || $action === 'send_test_email') {
    $testTo = !empty($_GET['to']) ? $_GET['to'] : (!empty($body['to']) ? $body['to'] : 'digitalsnovaofficial@gmail.com');
    $testSubject = '🎉 Welcome to DigitalsNova - Your Cloud POS Portal is Ready! [SMTP TEST]';
    $testBody = '<div style="font-family: Arial, sans-serif; background: #030712; color: #fff; padding: 20px; border-radius: 12px; border: 1px solid #00e5ff;">'
        . '<h2 style="color: #00e5ff;">DigitalsNova Gmail SMTP Test Successful</h2>'
        . '<p>Gmail SMTP (smtp.gmail.com:465 SSL) is actively working and connected!</p>'
        . '<p>Recipient: ' . htmlspecialchars($testTo) . '<br>Server time: ' . date('c') . '</p>'
        . '</div>';
    $ok = sendGmailSmtp($testTo, $testSubject, $testBody);
    echo json_encode([
        'success' => $ok,
        'message' => $ok ? "Test email successfully sent to {$testTo} via Gmail SMTP (465 SSL)!" : "Failed to send email via SMTP",
        'recipient' => $testTo,
        'smtpHost' => 'smtp.gmail.com:465'
    ]);
    exit();
}


// ==============================================================================
// 1.5 ACTION: DELETE TENANT (Called from Super Admin to permanently wipe store)
// ==============================================================================
if ($action === 'delete_tenant' || $action === 'delete') {
    $tenantId = trim($body['id'] ?? ($body['tenantId'] ?? ($_GET['id'] ?? '')));
    $subdomain = strtolower(trim($body['subdomain'] ?? ($_GET['subdomain'] ?? '')));
    $phone = preg_replace('/[^0-9]/', '', $body['phone'] ?? '');
    $email = strtolower(trim($body['email'] ?? ''));

    $tenants = readJsonFile($tenantsFile);
    $remainingTenants = [];
    $deletedTenant = null;

    foreach ($tenants as $t) {
        $tId = $t['id'] ?? '';
        $tSub = strtolower($t['subdomain'] ?? '');
        $tPhone = preg_replace('/[^0-9]/', '', $t['phone'] ?? ($t['adminUser']['phone'] ?? ''));
        $tEmail = strtolower(trim($t['email'] ?? ($t['adminUser']['email'] ?? '')));

        $isMatch = false;
        if (!empty($tenantId) && ($tId === $tenantId || $tSub === strtolower($tenantId))) $isMatch = true;
        if (!empty($subdomain) && $tSub === $subdomain) $isMatch = true;
        if (!empty($phone) && !empty($tPhone) && $phone === $tPhone) $isMatch = true;
        if (!empty($email) && !empty($tEmail) && $email === $tEmail) $isMatch = true;

        if ($isMatch) {
            $deletedTenant = $t;
        } else {
            $remainingTenants[] = $t;
        }
    }
    writeJsonFile($tenantsFile, $remainingTenants);

    // Clean associated staff accounts from staff.json
    $delSub = $subdomain ?: strtolower($deletedTenant['subdomain'] ?? '');
    $delId = $tenantId ?: ($deletedTenant['id'] ?? '');
    $allStaff = readJsonFile($staffFile);
    $remainingStaff = [];
    foreach ($allStaff as $s) {
        if ((!empty($delSub) && strtolower($s['subdomain'] ?? '') === $delSub) ||
            (!empty($delId) && ($s['tenantId'] ?? '') === $delId)) {
            // Discard staff of deleted tenant
        } else {
            $remainingStaff[] = $s;
        }
    }
    writeJsonFile($staffFile, $remainingStaff);

    // Clean notifications for this tenant from notifications.json
    $allNotifs = readJsonFile($notifsFile);
    $remainingNotifs = [];
    foreach ($allNotifs as $n) {
        if (!empty($delSub) && strtolower($n['subdomain'] ?? '') === $delSub) {
            // Discard notification
        } else {
            $remainingNotifs[] = $n;
        }
    }
    writeJsonFile($notifsFile, $remainingNotifs);

    // Record in deleted_tenants.json
    $deletedList = readJsonFile($deletedTenantsFile);
    $deletedList = array_filter($deletedList, function($d) use ($delSub, $delId) {
        return ($d['subdomain'] ?? '') !== $delSub && ($d['id'] ?? '') !== $delId;
    });
    $deletedList[] = [
        'id' => $delId,
        'subdomain' => $delSub,
        'phone' => $phone ?: ($deletedTenant['phone'] ?? ''),
        'email' => $email ?: ($deletedTenant['email'] ?? ''),
        'deletedAt' => date('c')
    ];
    writeJsonFile($deletedTenantsFile, array_values($deletedList));

    echo json_encode([
        'success' => true,
        'message' => 'Store account and all associated data permanently deleted from cloud database.',
        'deletedTenant' => $deletedTenant
    ]);
    exit();
}

// 1. ACTION: REGISTER TENANT (Called from website or portal registration)
// ==============================================================================
if ($action === 'register_tenant' || $action === 'register') {
    $tenant = isset($body['tenant']) ? $body['tenant'] : $body;

    if (empty($tenant['name']) && empty($tenant['clinicName'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing store name']);
        exit();
    }

    $storeName = !empty($tenant['name']) ? $tenant['name'] : $tenant['clinicName'];
    $subdomain = !empty($tenant['subdomain']) ? strtolower($tenant['subdomain']) : strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $storeName));
    $ownerName = !empty($tenant['adminName']) ? $tenant['adminName'] : (!empty($tenant['adminUser']['name']) ? $tenant['adminUser']['name'] : $storeName . ' Owner');
    $ownerPhone = !empty($tenant['phone']) ? $tenant['phone'] : '';
    $ownerEmail = !empty($tenant['email']) ? $tenant['email'] : (!empty($tenant['adminUser']['email']) ? $tenant['adminUser']['email'] : '');
    $planType = !empty($tenant['planType']) ? $tenant['planType'] : 'TRIAL_3_DAYS';
    $planName = !empty($tenant['planName']) ? $tenant['planName'] : ($planType === 'YEARLY' ? '1-Year Annual Package' : ($planType === 'MONTHLY' ? 'Standard Monthly Plan' : '3-Day Enterprise Trial'));
    $adminUser = !empty($tenant['adminUsername']) ? $tenant['adminUsername'] : (!empty($tenant['adminUser']['username']) ? $tenant['adminUser']['username'] : 'admin.' . $subdomain);
    $adminPass = !empty($tenant['adminPassword']) ? $tenant['adminPassword'] : (!empty($tenant['adminUser']['password']) ? $tenant['adminUser']['password'] : '123456');
    $businessType = !empty($tenant['businessType']) ? $tenant['businessType'] : 'Retail Mart / General Store';

    $tenants = readJsonFile($tenantsFile);

    // Filter out duplicate if same subdomain exists
    $newTenants = [];
    foreach ($tenants as $t) {
        if (strtolower($t['subdomain'] ?? '') !== $subdomain && ($t['id'] ?? '') !== ($tenant['id'] ?? '')) {
            $newTenants[] = $t;
        }
    }

    $createdAt = !empty($tenant['createdAt']) ? $tenant['createdAt'] : date('c');

    $record = [
        'id' => !empty($tenant['id']) ? $tenant['id'] : 'tenant_' . $subdomain . '_' . time(),
        'name' => $storeName,
        'subdomain' => $subdomain,
        'domain' => 'digitalsnova.com/portal/?store=' . $subdomain,
        'portalUrl' => 'https://digitalsnova.com/portal/?store=' . $subdomain,
        'phone' => $ownerPhone,
        'email' => $ownerEmail,
        'businessType' => $businessType,
        'planType' => $planType,
        'planName' => $planName,
        'createdAt' => $createdAt,
        'adminName' => $ownerName,
        'adminUsername' => $adminUser,
        'adminPassword' => $adminPass,
        'adminPin' => '1234',
        'status' => 'ACTIVE',
        'subscription' => [
            'state' => 'ACTIVE',
            'plan' => $planType,
            'planName' => $planName,
            'billingCycleDay' => 1,
            'graceDaysRemaining' => 3
        ],
        'adminUser' => [
            'name' => $ownerName,
            'username' => $adminUser,
            'password' => $adminPass,
            'email' => $ownerEmail,
            'phone' => $ownerPhone,
            'role' => 'CLINIC_ADMIN'
        ]
    ];

    $newTenants[] = $record;
    writeJsonFile($tenantsFile, $newTenants);

    // Unmark newly registered store from deleted list
    $deletedList = readJsonFile($deletedTenantsFile);
    $deletedList = array_filter($deletedList, function($d) use ($subdomain, $ownerPhone, $ownerEmail) {
        $dSub = strtolower($d['subdomain'] ?? '');
        $dPhone = preg_replace('/[^0-9]/', '', $d['phone'] ?? '');
        $dEmail = strtolower(trim($d['email'] ?? ''));
        $cleanP = preg_replace('/[^0-9]/', '', $ownerPhone);
        return $dSub !== $subdomain && ($dPhone !== $cleanP || empty($cleanP)) && ($dEmail !== strtolower($ownerEmail) || empty($ownerEmail));
    });
    writeJsonFile($deletedTenantsFile, array_values($deletedList));

    // Save Real-Time Super Admin Notification
    $notifications = readJsonFile($notifsFile);
    $notif = [
        'id' => 'notif_' . time() . '_' . rand(100, 999),
        'timestamp' => $createdAt,
        'type' => 'NEW_REGISTRATION',
        'title' => '🎉 New Store Registered (Cloud Sync)',
        'tenantName' => $storeName,
        'subdomain' => $subdomain,
        'ownerName' => $ownerName,
        'phone' => $ownerPhone,
        'email' => $ownerEmail,
        'planType' => $planType,
        'planName' => $planName,
        'adminUsername' => $adminUser,
        'adminPassword' => $adminPass,
        'portalUrl' => 'https://digitalsnova.com/portal/?store=' . $subdomain,
        'message' => "Store '{$storeName}' registered on {$planName}! Owner: {$ownerName} ({$ownerPhone})."
    ];
    array_unshift($notifications, $notif);
    if (count($notifications) > 100) {
        $notifications = array_slice($notifications, 0, 100);
    }
    writeJsonFile($notifsFile, $notifications);

    // -------------------------------------------------------------------------
    // AUTOMATED EMAIL 1: WELCOME & ACCESS PASS TO CLIENT
    // -------------------------------------------------------------------------
    if (!empty($ownerEmail) && filter_var($ownerEmail, FILTER_VALIDATE_EMAIL)) {
        $clientSubject = "🎉 Welcome to DigitalsNova - Your Cloud POS Portal is Ready!";
        $clientHtml = '
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; background-color: #030712; color: #f8fafc; padding: 24px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background: #0b132b; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <div style="background: linear-gradient(135deg, #0f172a, #1e3a8a); padding: 28px 24px; text-align: center; border-bottom: 2px solid #00e5ff;">
                    <h1 style="color: #00e5ff; font-size: 24px; margin: 0 0 6px 0; font-weight: 900; letter-spacing: 1px;">DigitalsNova Cloud POS</h1>
                    <p style="color: #94a3b8; font-size: 13px; margin: 0;">High-Performance Multi-Tenant Retail & Clinical SaaS</p>
                </div>
                <div style="padding: 28px 24px;">
                    <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Assalam-o-Alaikum, ' . htmlspecialchars($ownerName) . '!</h2>
                    <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                        Thank you for choosing <strong>DigitalsNova</strong>. Your dedicated cloud business portal for <strong>' . htmlspecialchars($storeName) . '</strong> has been activated on the <strong>' . htmlspecialchars($planName) . '</strong>.
                    </p>
                    <div style="background: #020617; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 24px 0;">
                        <h3 style="color: #f59e0b; font-size: 14px; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 0.5px;">🔑 Your Portal Access Credentials</h3>
                        <p style="margin: 6px 0; font-size: 13px; color: #e2e8f0;"><strong>Store Name:</strong> ' . htmlspecialchars($storeName) . '</p>
                        <p style="margin: 6px 0; font-size: 13px; color: #e2e8f0;"><strong>Active Plan:</strong> ' . htmlspecialchars($planName) . '</p>
                        <p style="margin: 6px 0; font-size: 13px; color: #e2e8f0;"><strong>Login Username:</strong> <span style="color: #00e5ff; font-family: monospace; font-weight: bold; background: #0f172a; padding: 2px 8px; border-radius: 4px;">' . htmlspecialchars($adminUser) . '</span> (or your Email: ' . htmlspecialchars($ownerEmail) . ')</p>
                        <p style="margin: 6px 0; font-size: 13px; color: #e2e8f0;"><strong>Master Password:</strong> <span style="color: #10b981; font-family: monospace; font-weight: bold; background: #0f172a; padding: 2px 8px; border-radius: 4px;">' . htmlspecialchars($adminPass) . '</span></p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://digitalsnova.com/portal/?store=' . urlencode($subdomain) . '" style="background: linear-gradient(135deg, #00e5ff, #0077b6); color: #020617; font-weight: 900; font-size: 15px; padding: 14px 32px; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 4px 15px rgba(0,229,255,0.4);">
                            🚀 Launch Cloud POS Portal &rarr;
                        </a>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #1e293b; padding-top: 16px; margin-bottom: 0;">
                        Direct Portal Link: <a href="https://digitalsnova.com/portal/?store=' . urlencode($subdomain) . '" style="color: #00e5ff;">https://digitalsnova.com/portal/?store=' . htmlspecialchars($subdomain) . '</a><br>
                        Need assistance? Reply directly to this email (<a href="mailto:digitalsnovaofficial@gmail.com" style="color: #00e5ff;">digitalsnovaofficial@gmail.com</a>) or contact our WhatsApp Tech Desk.
                    </p>
                </div>
                <div style="background: #020617; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b;">
                    &copy; ' . date('Y') . ' DigitalsNova SaaS Platform. All Rights Reserved.
                </div>
            </div>
        </body>
        </html>';
        sendDigitalsNovaEmail($ownerEmail, $clientSubject, $clientHtml);
    }

    // -------------------------------------------------------------------------
    // AUTOMATED EMAIL 2: NOTIFICATION ALERT TO PLATFORM OWNER (UBAID)
    // -------------------------------------------------------------------------
    $adminAlertEmail = 'digitalsnovaofficial@gmail.com';
    $adminSubject = "🚨 New Store Provisioned: {$storeName} [{$planName}]";
    $adminHtml = '
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #030712; color: #f8fafc; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #0f172a; border: 2px solid #f59e0b; border-radius: 14px; padding: 24px;">
            <h2 style="color: #f59e0b; margin-top: 0;">👑 New Client Registration Received!</h2>
            <p style="font-size: 14px; color: #cbd5e1;">A new store has registered on the platform. Details below:</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0; color: #f1f5f9;">
                <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Store Name:</td><td style="padding: 8px 0; font-weight: bold;">' . htmlspecialchars($storeName) . '</td></tr>
                <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Owner:</td><td style="padding: 8px 0;">' . htmlspecialchars($ownerName) . '</td></tr>
                <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Phone / WhatsApp:</td><td style="padding: 8px 0; font-weight: bold; color: #10b981;">' . htmlspecialchars($ownerPhone) . '</td></tr>
                <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Email:</td><td style="padding: 8px 0;">' . htmlspecialchars($ownerEmail) . '</td></tr>
                <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Plan:</td><td style="padding: 8px 0; color: #f59e0b; font-weight: bold;">' . htmlspecialchars($planName) . '</td></tr>
                <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Subdomain:</td><td style="padding: 8px 0;">' . htmlspecialchars($subdomain) . '</td></tr>
                <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Admin Username:</td><td style="padding: 8px 0; color: #00e5ff; font-family: monospace; font-weight: bold;">' . htmlspecialchars($adminUser) . '</td></tr>
                <tr style="border-bottom: 1px solid #334155;"><td style="padding: 8px 0; color: #94a3b8;">Admin Password:</td><td style="padding: 8px 0; color: #f87171; font-family: monospace; font-weight: bold;">' . htmlspecialchars($adminPass) . '</td></tr>
                <tr><td style="padding: 8px 0; color: #94a3b8;">Registered At:</td><td style="padding: 8px 0;">' . htmlspecialchars($createdAt) . '</td></tr>
            </table>
            <div style="margin-top: 20px; text-align: center;">
                <a href="https://digitalsnova.com/super-admin" style="background: #f59e0b; color: #0f172a; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Super Admin HQ</a>
            </div>
        </div>
    </body>
    </html>';
    sendDigitalsNovaEmail($adminAlertEmail, $adminSubject, $adminHtml);

    echo json_encode([
        'success' => true,
        'message' => 'Tenant registered, synced, and emails dispatched!',
        'tenant' => $record,
        'notification' => $notif
    ]);
    exit();
}

// ==============================================================================
// 2. ACTION: GET ALL (Super Admin Dashboard fetch from ANY computer)
// ==============================================================================
if ($action === 'get_all' || $action === 'tenants') {
    $tenants = readJsonFile($tenantsFile);
    $notifications = readJsonFile($notifsFile);
    $staff = readJsonFile($staffFile);
    $deletedTenants = readJsonFile($deletedTenantsFile);

    echo json_encode([
        'success' => true,
        'tenants' => $tenants,
        'notifications' => $notifications,
        'staff' => $staff,
        'deleted_tenants' => $deletedTenants,
        'count' => count($tenants),
        'serverTime' => date('c')
    ]);
    exit();
}

// ==============================================================================
// 3. ACTION: UNIVERSAL LOGIN (Authenticate by Username, Email, OR Phone)
// ==============================================================================
if ($action === 'login') {
    $identifier = trim(strtolower($body['identifier'] ?? ($body['username'] ?? '')));
    $password = trim($body['password'] ?? '');

    if (empty($identifier) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Please provide username and password']);
        exit();
    }

    // Check Master Super Admin (Ubaid)
    if (($identifier === 'ubaid' || $identifier === 'superadmin') && $password === '2200230') {
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => 'u_ubaid',
                'name' => 'Ubaid Ur Rehman (Platform Owner)',
                'username' => 'ubaid',
                'role' => 'SUPER_ADMIN',
                'active' => true
            ],
            'tenant' => null
        ]);
        exit();
    }

    $cleanPhone = preg_replace('/[^0-9]/', '', $identifier);

    // Check if account has been deleted by Super Admin
    $deletedList = readJsonFile($deletedTenantsFile);
    foreach ($deletedList as $dt) {
        $dtSub = strtolower($dt['subdomain'] ?? '');
        $dtId = strtolower($dt['id'] ?? '');
        $dtPhone = preg_replace('/[^0-9]/', '', $dt['phone'] ?? '');
        $dtEmail = strtolower(trim($dt['email'] ?? ''));

        if (($dtSub && $identifier === $dtSub) ||
            ($dtId && $identifier === $dtId) ||
            ($dtEmail && $identifier === $dtEmail) ||
            (!empty($cleanPhone) && !empty($dtPhone) && $cleanPhone === $dtPhone)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'This store account has been permanently deleted by administrator. Please register a new account.'
            ]);
            exit();
        }
    }
    $tenants = readJsonFile($tenantsFile);
    $matchedTenant = null;

    foreach ($tenants as $t) {
        $tSub = strtolower($t['subdomain'] ?? '');
        $tUser = strtolower($t['adminUsername'] ?? ($t['adminUser']['username'] ?? ''));
        $tEmail = strtolower($t['email'] ?? ($t['adminUser']['email'] ?? ''));
        $tPhone = preg_replace('/[^0-9]/', '', $t['phone'] ?? ($t['adminUser']['phone'] ?? ''));

        if ($identifier === $tSub ||
            $identifier === $tUser ||
            $identifier === $tEmail ||
            (!empty($cleanPhone) && $cleanPhone === $tPhone)) {
            $matchedTenant = $t;
            break;
        }
    }

    if ($matchedTenant) {
        $expectedPass = $matchedTenant['adminPassword'] ?? ($matchedTenant['adminUser']['password'] ?? '123456');
        if ($expectedPass !== $password && $password !== '2200230') {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Incorrect password for this account.']);
            exit();
        }

        echo json_encode([
            'success' => true,
            'user' => [
                'id' => 'u_' . ($matchedTenant['subdomain'] ?? 'admin'),
                'tenantId' => $matchedTenant['id'],
                'name' => $matchedTenant['adminName'] ?? ($matchedTenant['adminUser']['name'] ?? $matchedTenant['name'] . ' Admin'),
                'username' => $matchedTenant['adminUsername'] ?? ($matchedTenant['adminUser']['username'] ?? 'admin'),
                'email' => $matchedTenant['email'] ?? '',
                'phone' => $matchedTenant['phone'] ?? '',
                'role' => 'CLINIC_ADMIN',
                'active' => true
            ],
            'tenant' => $matchedTenant
        ]);
        exit();
    }

    // Check Staff Accounts
    $allStaff = readJsonFile($staffFile);
    foreach ($allStaff as $s) {
        $sUser = strtolower($s['username'] ?? '');
        if ($identifier === $sUser && ($s['password'] ?? '123') === $password) {
            echo json_encode([
                'success' => true,
                'user' => $s,
                'tenant' => [
                    'id' => $s['tenantId'] ?? '',
                    'subdomain' => $s['subdomain'] ?? ''
                ]
            ]);
            exit();
        }
    }

    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Account not found with this username, email, or phone.']);
    exit();
}

// ==============================================================================
// 4. ACTION: SAVE STAFF (Sync staff to server)
// ==============================================================================
if ($action === 'save_staff') {
    $staffItem = isset($body['staff']) ? $body['staff'] : $body;
    if (empty($staffItem['username'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing staff username']);
        exit();
    }

    $allStaff = readJsonFile($staffFile);
    $filteredStaff = [];
    $cleanUser = strtolower($staffItem['username']);

    foreach ($allStaff as $s) {
        if (strtolower($s['username'] ?? '') !== $cleanUser) {
            $filteredStaff[] = $s;
        }
    }

    $newStaff = [
        'id' => !empty($staffItem['id']) ? $staffItem['id'] : 'staff_' . time(),
        'tenantId' => $staffItem['tenantId'] ?? '',
        'subdomain' => $staffItem['subdomain'] ?? '',
        'name' => $staffItem['name'] ?? 'POS Cashier',
        'username' => $cleanUser,
        'password' => $staffItem['password'] ?? '123',
        'role' => 'STAFF',
        'active' => true,
        'createdAt' => date('c')
    ];

    $filteredStaff[] = $newStaff;
    writeJsonFile($staffFile, $filteredStaff);

    echo json_encode(['success' => true, 'staff' => $newStaff]);
    exit();
}

// ==============================================================================
// 5. ACTION: NEWSLETTER / BROADCAST EMAIL (Sent from digitalsnovaofficial@gmail.com)
// ==============================================================================
if ($action === 'newsletter' || $action === 'send_broadcast') {
    $subject = !empty($body['subject']) ? $body['subject'] : 'Important Update from DigitalsNova';
    $messageText = !empty($body['message']) ? $body['message'] : '';

    if (empty($messageText)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Message cannot be empty']);
        exit();
    }

    $tenants = readJsonFile($tenantsFile);
    $sentCount = 0;

    foreach ($tenants as $t) {
        $email = $t['email'] ?? ($t['adminUser']['email'] ?? '');
        if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $broadcastHtml = '
            <!DOCTYPE html><html><body style="font-family: Arial, sans-serif; background-color: #030712; color: #f8fafc; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #0b132b; border: 1px solid #1e293b; border-radius: 12px; padding: 24px;">
                    <h2 style="color: #00e5ff; margin-top: 0;">DigitalsNova Official Announcement</h2>
                    <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6;">' . nl2br(htmlspecialchars($messageText)) . '</p>
                    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; font-size: 12px; color: #94a3b8;">
                        Sent by DigitalsNova Official (<a href="mailto:digitalsnovaofficial@gmail.com" style="color: #00e5ff;">digitalsnovaofficial@gmail.com</a>)
                    </div>
                </div>
            </body></html>';
            sendDigitalsNovaEmail($email, $subject, $broadcastHtml);
            $sentCount++;
        }
    }

    echo json_encode(['success' => true, 'sentCount' => $sentCount]);
    exit();
}

// Default response
echo json_encode(['status' => 'online', 'service' => 'DigitalsNova Cloud Sync Engine', 'time' => date('c')]);
exit();
