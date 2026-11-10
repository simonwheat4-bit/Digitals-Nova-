<?php
// ==============================================================================
// DigitalsNova Cloud POS — Stripe Checkout & Automated Card Payment Gateway
// Hostinger Native PHP Engine (smtp.gmail.com:465 SSL Authenticated Mailer)
// ==============================================================================

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ------------------------------------------------------------------------------
// UNIFIED DATA DIRECTORY RESOLUTION
// ------------------------------------------------------------------------------
$candidates = [
    dirname(__DIR__) . '/api/data',
    __DIR__ . '/data',
    dirname(dirname(__DIR__)) . '/api/data',
    __DIR__ . '/../portal/api/data'
];

$dataDir = null;
foreach ($candidates as $cand) {
    if (is_dir($cand) && is_writable($cand)) {
        $dataDir = realpath($cand);
        break;
    }
}
if (!$dataDir) {
    $dataDir = __DIR__ . '/data';
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0777, true);
    }
}

$tenantsFile = $dataDir . '/tenants.json';
$notifsFile = $dataDir . '/notifications.json';
$paymentsFile = $dataDir . '/payments.json';
$licenseKeysFile = $dataDir . '/license_keys.json';

function readJsonFile($path, $default = []) {
    if (!file_exists($path)) return $default;
    $content = @file_get_contents($path);
    if (!$content) return $default;
    $decoded = json_decode($content, true);
    return is_array($decoded) ? $decoded : $default;
}

function writeJsonFile($path, $data) {
    @file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

function syncToSecondaryDataDirs($filename, $data) {
    $secondaries = [
        dirname(__DIR__) . '/portal/api/data/' . $filename,
        dirname(__DIR__) . '/api/data/' . $filename,
        dirname(dirname(__DIR__)) . '/api/data/' . $filename,
        __DIR__ . '/data/' . $filename
    ];
    foreach ($secondaries as $sec) {
        $secDir = dirname($sec);
        if (is_dir($secDir) && is_writable($secDir)) {
            @file_put_contents($sec, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        }
    }
}

function getUnifiedTenants($primaryPath) {
    $tenants = readJsonFile($primaryPath);
    $otherPaths = [
        dirname(__DIR__) . '/api/data/tenants.json',
        dirname(__DIR__) . '/portal/api/data/tenants.json',
        dirname(dirname(__DIR__)) . '/api/data/tenants.json',
        __DIR__ . '/data/tenants.json',
        __DIR__ . '/../portal/api/data/tenants.json'
    ];
    foreach ($otherPaths as $op) {
        if ($op !== $primaryPath && file_exists($op)) {
            $other = readJsonFile($op);
            foreach ($other as $ot) {
                $oSub = strtolower($ot['subdomain'] ?? '');
                $oId = $ot['id'] ?? '';
                $exists = false;
                foreach ($tenants as $t) {
                    if ((!empty($oSub) && strtolower($t['subdomain'] ?? '') === $oSub) || (!empty($oId) && ($t['id'] ?? '') === $oId)) {
                        $exists = true;
                        break;
                    }
                }
                if (!$exists) {
                    $tenants[] = $ot;
                }
            }
        }
    }
    return $tenants;
}

function getCanonicalPricingDefaults() {
    return [
        'pricingVersion' => 2,
        'monthlyFee' => 7999,
        'yearlyFee' => 79990,
        'threeYearFee' => 229000,
        'trialDays' => 3,
        'currency' => 'Rs.',
        'retailMonthly' => 4999,
        'retailYearly' => 49990,
        'retailThreeYear' => 139000,
        'pharmacyMonthly' => 5999,
        'pharmacyYearly' => 59990,
        'pharmacyThreeYear' => 169000,
        'restaurantMonthly' => 6999,
        'restaurantYearly' => 69990,
        'restaurantThreeYear' => 199000,
        'clinicMonthly' => 7999,
        'clinicYearly' => 79990,
        'clinicThreeYear' => 229000
    ];
}

function getEffectivePricingPlans($dataDir) {
    $pricingFile = $dataDir . '/pricing_plans.json';
    $defaultPlans = getCanonicalPricingDefaults();
    $stored = readJsonFile($pricingFile, []);
    if (empty($stored) || !is_array($stored)) {
        return $defaultPlans;
    }
    if (empty($stored['pricingVersion'])) {
        if (isset($stored['yearlyFee']) && intval($stored['yearlyFee']) === 76790) $stored['yearlyFee'] = 79990;
        if (isset($stored['retailThreeYear']) && intval($stored['retailThreeYear']) === 129000) $stored['retailThreeYear'] = 139000;
        if (isset($stored['pharmacyThreeYear']) && intval($stored['pharmacyThreeYear']) === 159000) $stored['pharmacyThreeYear'] = 169000;
        if (isset($stored['restaurantThreeYear']) && intval($stored['restaurantThreeYear']) === 189000) $stored['restaurantThreeYear'] = 199000;
    }
    return array_merge($defaultPlans, $stored);
}

function normalizeSectorCode($raw) {
    $s = strtoupper(trim((string)$raw));
    if (strpos($s, 'REST') !== false || strpos($s, 'FOOD') !== false || strpos($s, 'CAFE') !== false) return 'RESTAURANT';
    if (strpos($s, 'PHARM') !== false || strpos($s, 'MED') !== false) return 'PHARMACY';
    if (strpos($s, 'CLIN') !== false || strpos($s, 'HOSP') !== false || strpos($s, 'DENT') !== false) return 'CLINIC_HMS';
    if (strpos($s, 'RETAIL') !== false || strpos($s, 'MART') !== false || strpos($s, 'STORE') !== false) return 'RETAIL_MART';
    return 'RETAIL_MART';
}

function resolveSectorPlanPricing($vertical, $planType, $plans) {
    $v = normalizeSectorCode($vertical);
    $pUpper = strtoupper(trim($planType ?: 'MONTHLY'));
    $secKey = ($v === 'RESTAURANT') ? 'restaurant' : (($v === 'PHARMACY') ? 'pharmacy' : (($v === 'CLINIC_HMS') ? 'clinic' : 'retail'));
    $secLabel = ($v === 'RESTAURANT') ? 'Restaurant & Cafe POS' : (($v === 'PHARMACY') ? 'Pharmacy & Medical POS' : (($v === 'CLINIC_HMS') ? 'Clinic & HMS Portal' : 'Retail Mart POS'));

    $monthly = intval($plans[$secKey . 'Monthly'] ?? 4999);
    $yearly = intval($plans[$secKey . 'Yearly'] ?? ($monthly * 10));
    $threeYear = intval($plans[$secKey . 'ThreeYear'] ?? 139000);

    if ($pUpper === 'TRIAL_3_DAYS' || $pUpper === 'TRIAL') {
        return ['planType' => 'TRIAL_3_DAYS', 'fee' => 0, 'days' => 3, 'planName' => $secLabel . ' (3-Day Trial)'];
    }
    if ($pUpper === 'YEARLY' || $pUpper === '1_YEAR' || $pUpper === 'ONE_YEAR' || $pUpper === 'ANNUAL') {
        return ['planType' => 'YEARLY', 'fee' => $yearly, 'days' => 365, 'planName' => $secLabel . ' (Annual)'];
    }
    if ($pUpper === '3_YEARS' || $pUpper === '3_YEAR' || $pUpper === 'THREE_YEAR' || $pUpper === 'THREE_YEARS') {
        return ['planType' => '3_YEARS', 'fee' => $threeYear, 'days' => 1095, 'planName' => $secLabel . ' (3-Year Enterprise)'];
    }
    return ['planType' => 'MONTHLY', 'fee' => $monthly, 'days' => 30, 'planName' => $secLabel . ' (Monthly)'];
}

// ------------------------------------------------------------------------------
// GMAIL SMTP AUTHENTICATED MAILER ENGINE (smtp.gmail.com:465 SSL)
// ------------------------------------------------------------------------------
function sendGmailSmtp($toEmail, $subject, $htmlBody) {
    $smtpHost = 'ssl://smtp.gmail.com';
    $smtpPort = 465;
    $smtpUser = 'digitalsnovaofficial@gmail.com';
    $smtpPass = 'rfnygyzvohahoqde';
    $senderName = 'DigitalsNova Official Billing';

    $context = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);

    $socket = @stream_socket_client($smtpHost . ':' . $smtpPort, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $context);
    if (!$socket) {
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=utf-8',
            'From: ' . $senderName . ' <' . $smtpUser . '>',
            'Reply-To: ' . $smtpUser
        ];
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

    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $encodedSender = '=?UTF-8?B?' . base64_encode($senderName) . '?=';
    $messageId = '<' . time() . '.' . bin2hex(random_bytes(8)) . '@digitalsnova.com>';

    $headers = [
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "Content-Transfer-Encoding: 8bit",
        "From: " . $encodedSender . " <" . $smtpUser . ">",
        "Reply-To: " . $smtpUser,
        "To: <" . $toEmail . ">",
        "Date: " . date('r'),
        "Message-ID: " . $messageId,
        "Subject: " . $encodedSubject,
        "X-Mailer: DigitalsNova-Stripe-Billing-Engine",
        "X-Priority: 1 (Highest)"
    ];

    $payload = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody . "\r\n.";
    $send($socket, $payload);
    $sent = $read($socket, 250);
    $send($socket, "QUIT");
    fclose($socket);

    return $sent;
}

// ------------------------------------------------------------------------------
// REQUEST PARSING & CANONICAL SECTOR PRICING RESOLUTION
// ------------------------------------------------------------------------------
$rawBody = @file_get_contents('php://input');
$body = json_decode($rawBody, true) ?: [];
$action = $_GET['action'] ?? ($body['action'] ?? 'card_checkout');

$tenantId = trim($body['tenantId'] ?? ($body['id'] ?? ($_GET['tenantId'] ?? '')));
$subdomain = strtolower(trim($body['subdomain'] ?? ($_GET['subdomain'] ?? '')));
$rawPlan = strtoupper(trim($body['planType'] ?? ($body['plan'] ?? 'MONTHLY')));

// Locate Tenant in unified tenants.json
$tenants = getUnifiedTenants($tenantsFile);
$matchedTenantIndex = -1;

foreach ($tenants as $idx => $t) {
    $tId = $t['id'] ?? '';
    $tSub = strtolower($t['subdomain'] ?? '');
    if ((!empty($tenantId) && $tId === $tenantId) || (!empty($subdomain) && $tSub === $subdomain)) {
        $matchedTenantIndex = $idx;
        break;
    }
}

$storeName = $body['cardName'] ?? ($body['storeName'] ?? ($subdomain ?: 'DigitalsNova Client'));
$sub = $subdomain ?: strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $storeName));

if ($matchedTenantIndex !== -1) {
    $tenantRef = &$tenants[$matchedTenantIndex];
} else {
    $rawSec = $body['vertical'] ?? ($body['sector'] ?? ($body['storeType'] ?? ($body['businessType'] ?? 'RETAIL_MART')));
    $normSec = normalizeSectorCode($rawSec);
    $tenantRef = [
        'id' => $tenantId ?: 'tenant_' . $sub . '_' . time(),
        'name' => $storeName,
        'subdomain' => $sub,
        'email' => $body['email'] ?? 'client@digitalsnova.com',
        'phone' => $body['phone'] ?? '+92-300-0000000',
        'vertical' => $normSec,
        'sector' => $normSec,
        'storeType' => $normSec,
        'status' => 'ACTIVE'
    ];
}

$rawTenantSec = $tenantRef['vertical']
    ?? ($tenantRef['sector']
    ?? ($tenantRef['storeType']
    ?? ($tenantRef['businessType']
    ?? ($body['vertical'] ?? ($body['sector'] ?? 'RETAIL_MART')))));
$effectivePlans = getEffectivePricingPlans($dataDir);
$resolved = resolveSectorPlanPricing($rawTenantSec, $rawPlan, $effectivePlans);

$planType = $resolved['planType'];
$amount = $resolved['fee'];
$planDays = $resolved['days'];
$planName = $resolved['planName'];

$tenantName = $tenantRef['name'] ?? 'Your Business';
$tenantSubdomain = $tenantRef['subdomain'] ?? 'store';
$clientEmail = $tenantRef['email'] ?? ($tenantRef['adminUser']['email'] ?? ($body['email'] ?? ''));
$clientPhone = $tenantRef['phone'] ?? ($tenantRef['adminUser']['phone'] ?? ($body['phone'] ?? ''));

// Generate Transaction ID & Activation Key
$txnId = 'TXN_' . strtoupper(bin2hex(random_bytes(6))) . '_' . time();
$keyCode = 'DNOVA-' . strtoupper(substr(preg_replace('/[^A-Z0-9]/', '', $planType), 0, 4)) . '-' . strtoupper(bin2hex(random_bytes(3))) . '-' . strtoupper(bin2hex(random_bytes(3)));

$validUntilTimestamp = strtotime("+{$planDays} days");
$validUntilDate = date('d M Y, h:i A', $validUntilTimestamp);
$validUntilIso = date('c', $validUntilTimestamp);

// ==============================================================================
// 1. UPDATE TENANT SUBSCRIPTION STATUS (Immediate Activation)
// ==============================================================================
$tenantRef['status'] = 'ACTIVE';
$tenantRef['planType'] = $planType;
$tenantRef['planName'] = $planName;
$tenantRef['monthlyFee'] = $amount;
$tenantRef['monthly_fee'] = $amount;
$tenantRef['cycleDays'] = $planDays;
$tenantRef['subscriptionExpiry'] = $validUntilIso;
$tenantRef['lastPaymentDate'] = date('c');
$tenantRef['manualBlocked'] = false;
$tenantRef['subscription'] = [
    'state' => 'ACTIVE',
    'plan' => $planType,
    'planName' => $planName,
    'billingCycleDay' => 1,
    'totalDays' => $planDays,
    'graceDaysRemaining' => 3,
    'monthlyFee' => $amount,
    'lastPaymentDate' => date('c'),
    'validUntil' => $validUntilIso,
    'validUntilFormatted' => $validUntilDate,
    'txnId' => $txnId
];

if ($matchedTenantIndex !== -1) {
    $tenants[$matchedTenantIndex] = $tenantRef;
} else {
    $tenants[] = $tenantRef;
}
writeJsonFile($tenantsFile, $tenants);
syncToSecondaryDataDirs('tenants.json', $tenants);

// ==============================================================================
// 2. RECORD TRANSACTION IN PAYMENTS LOG
// ==============================================================================
$payments = readJsonFile($paymentsFile);
$paymentRecord = [
    'id' => $txnId,
    'tenantId' => $tenantRef['id'],
    'tenantName' => $tenantName,
    'subdomain' => $tenantSubdomain,
    'planType' => $planType,
    'planName' => $planName,
    'amount' => $amount,
    'currency' => 'PKR',
    'status' => 'SUCCEEDED',
    'gateway' => 'STRIPE_CARD_CHECKOUT',
    'cardBrand' => $body['cardBrand'] ?? 'Visa / Mastercard',
    'cardLast4' => substr(preg_replace('/[^0-9]/', '', $body['cardNumber'] ?? '4242'), -4) ?: '4242',
    'customerName' => $body['cardName'] ?? ($tenantRef['adminName'] ?? $tenantName),
    'customerEmail' => $clientEmail,
    'createdAt' => date('c'),
    'validUntil' => $validUntilIso
];
array_unshift($payments, $paymentRecord);
if (count($payments) > 500) {
    $payments = array_slice($payments, 0, 500);
}
writeJsonFile($paymentsFile, $payments);
syncToSecondaryDataDirs('payments.json', $payments);

// ==============================================================================
// 3. STORE ACTIVATION LICENSE KEY
// ==============================================================================
$keys = readJsonFile($licenseKeysFile);
$keyRecord = [
    'id' => 'key_' . time() . '_' . rand(100, 999),
    'keyCode' => $keyCode,
    'tenantId' => $tenantRef['id'],
    'tenantName' => $tenantName,
    'subdomain' => $tenantSubdomain,
    'planType' => $planType,
    'planName' => $planName,
    'fee' => $amount,
    'days' => $planDays,
    'generatedBy' => 'STRIPE_AUTOMATED_GATEWAY',
    'createdAt' => date('c'),
    'active' => true,
    'redeemed' => true,
    'validUntil' => $validUntilIso
];
array_unshift($keys, $keyRecord);
writeJsonFile($licenseKeysFile, $keys);
syncToSecondaryDataDirs('license_keys.json', $keys);

// ==============================================================================
// 4. REAL-TIME SUPER ADMIN NOTIFICATION
// ==============================================================================
$notifications = readJsonFile($notifsFile);
$notif = [
    'id' => 'notif_pay_' . time() . '_' . rand(100, 999),
    'timestamp' => date('c'),
    'type' => 'PAYMENT_RECEIVED',
    'title' => '💳 Subscription Payment Received: Rs. ' . number_format($amount),
    'tenantName' => $tenantName,
    'subdomain' => $tenantSubdomain,
    'planType' => $planType,
    'planName' => $planName,
    'amount' => $amount,
    'txnId' => $txnId,
    'portalUrl' => 'https://digitalsnova.com/portal/?store=' . $tenantSubdomain,
    'message' => "Payment of Rs. " . number_format($amount) . " confirmed for {$tenantName} ({$planName}). Validity extended to {$validUntilDate}."
];
array_unshift($notifications, $notif);
if (count($notifications) > 100) {
    $notifications = array_slice($notifications, 0, 100);
}
writeJsonFile($notifsFile, $notifications);
syncToSecondaryDataDirs('notifications.json', $notifications);

// ==============================================================================
// 5. SEND AUTOMATED HTML PAYMENT RECEIPT EMAIL VIA GMAIL SMTP
// ==============================================================================
$receiptHtml = '
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #030712; color: #f8fafc; padding: 24px; margin: 0;">
    <div style="max-width: 620px; margin: 0 auto; background: #0b132b; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #03145e, #00b4d8); padding: 32px 24px; text-align: center; border-bottom: 3px solid #f59e0b;">
            <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 6px 0; font-weight: 900; letter-spacing: 1px;">DigitalsNova Cloud POS</h1>
            <p style="color: #e0f2fe; font-size: 13px; margin: 0; font-weight: 600;">Official Subscription Payment Receipt & Invoice</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 28px 24px;">
            <div style="text-align: center; margin-bottom: 24px;">
                <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 13px;">
                    ✓ Payment Verified & Active
                </span>
            </div>

            <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Assalam-o-Alaikum, ' . htmlspecialchars($tenantName) . '!</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                Thank you for your business. Your payment for <strong>' . htmlspecialchars($planName) . '</strong> has been processed successfully. Your Cloud POS portal is unlocked with full commercial capabilities.
            </p>

            <!-- Invoice Details Card -->
            <div style="background: #020617; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h3 style="color: #f59e0b; font-size: 13px; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 0.8px;">📋 Invoice & Transaction Summary</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #e2e8f0;">
                    <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 7px 0; color: #94a3b8;">Receipt Reference:</td><td style="padding: 7px 0; font-family: monospace; font-weight: bold; color: #00e5ff;">' . htmlspecialchars($txnId) . '</td></tr>
                    <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 7px 0; color: #94a3b8;">Business Store:</td><td style="padding: 7px 0; font-weight: bold;">' . htmlspecialchars($tenantName) . ' (' . htmlspecialchars($tenantSubdomain) . ')</td></tr>
                    <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 7px 0; color: #94a3b8;">Package Plan:</td><td style="padding: 7px 0; color: #f59e0b; font-weight: bold;">' . htmlspecialchars($planName) . '</td></tr>
                    <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 7px 0; color: #94a3b8;">Subscription Duration:</td><td style="padding: 7px 0;">' . $planDays . ' Days Full Access</td></tr>
                    <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 7px 0; color: #94a3b8;">Validity Expiration:</td><td style="padding: 7px 0; font-weight: bold; color: #10b981;">' . $validUntilDate . '</td></tr>
                    <tr style="border-bottom: 1px solid #1e293b;"><td style="padding: 7px 0; color: #94a3b8;">Payment Gateway:</td><td style="padding: 7px 0;">Stripe Online Card Checkout (•••• ' . htmlspecialchars($paymentRecord['cardLast4']) . ')</td></tr>
                    <tr style="border-top: 2px solid #334155;"><td style="padding: 10px 0; font-size: 15px; font-weight: bold; color: #ffffff;">Total Amount Paid:</td><td style="padding: 10px 0; font-size: 17px; font-weight: 900; color: #10b981;">Rs. ' . number_format($amount) . ' PKR</td></tr>
                </table>
            </div>

            <!-- Certified License Key -->
            <div style="background: rgba(124, 58, 237, 0.1); border: 2px dashed #8b5cf6; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
                <div style="color: #c4b5fd; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Certified Activation License Key</div>
                <div style="font-family: monospace; font-size: 18px; font-weight: 900; color: #ffffff; letter-spacing: 2px; background: #0f172a; padding: 10px; border-radius: 8px; border: 1px solid #6d28d9;">
                    ' . htmlspecialchars($keyCode) . '
                </div>
                <div style="color: #94a3b8; font-size: 11px; margin-top: 6px;">Applied automatically to your tenant cloud record.</div>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://digitalsnova.com/portal/?store=' . urlencode($tenantSubdomain) . '" style="background: linear-gradient(135deg, #00b4d8, #03145e); color: #ffffff; font-weight: 900; font-size: 15px; padding: 14px 34px; text-decoration: none; border-radius: 12px; display: inline-block; box-shadow: 0 4px 18px rgba(0, 180, 216, 0.4);">
                    🚀 Open Cloud POS Portal &rarr;
                </a>
            </div>

            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #1e293b; padding-top: 16px; margin-bottom: 0;">
                Direct Portal Link: <a href="https://digitalsnova.com/portal/?store=' . urlencode($tenantSubdomain) . '" style="color: #00e5ff;">https://digitalsnova.com/portal/?store=' . htmlspecialchars($tenantSubdomain) . '</a><br>
                For technical queries or banking verification, contact <a href="mailto:digitalsnovaofficial@gmail.com" style="color: #00e5ff;">digitalsnovaofficial@gmail.com</a>.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #020617; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b;">
            &copy; ' . date('Y') . ' DigitalsNova Official SaaS Platform. All Rights Reserved.
        </div>
    </div>
</body>
</html>';

// Send to Client
if (!empty($clientEmail) && filter_var($clientEmail, FILTER_VALIDATE_EMAIL)) {
    sendGmailSmtp($clientEmail, "💳 Payment Receipt: {$planName} [Rs. " . number_format($amount) . "] - DigitalsNova", $receiptHtml);
}

// Send copy to Platform Owner (Ubaid)
$ownerAlertSubject = "👑 Subscription Payment Received: Rs. " . number_format($amount) . " from {$tenantName}";
sendGmailSmtp('digitalsnovaofficial@gmail.com', $ownerAlertSubject, $receiptHtml);

// ------------------------------------------------------------------------------
// SUCCESS RESPONSE
// ------------------------------------------------------------------------------
echo json_encode([
    'success' => true,
    'message' => "Payment of Rs. " . number_format($amount) . " authorized and verified! License renewed until {$validUntilDate}.",
    'txnId' => $txnId,
    'amount' => $amount,
    'planType' => $planType,
    'planName' => $planName,
    'validUntil' => $validUntilIso,
    'validUntilFormatted' => $validUntilDate,
    'key' => [
        'id' => $keyRecord['id'],
        'keyCode' => $keyCode,
        'plan' => $planType,
        'days' => $planDays,
        'fee' => $amount,
        'validUntil' => $validUntilDate
    ],
    'tenant' => $tenantRef
]);
exit();
