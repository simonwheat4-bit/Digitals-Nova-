<?php
// ==============================================================================
// DigitalsNova Cloud POS — Stripe Webhook Event Listener
// Handles 'checkout.session.completed' & 'payment_intent.succeeded'
// ==============================================================================

header('Content-Type: application/json; charset=utf-8');

// Unified data directory resolution
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
$webhookLogsFile = $dataDir . '/webhook_logs.json';

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

// Authenticated Gmail SMTP Mailer Engine
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
        "X-Mailer: DigitalsNova-Stripe-Webhook",
        "X-Priority: 1 (Highest)"
    ];

    $payload = implode("\r\n", $headers) . "\r\n\r\n" . $htmlBody . "\r\n.";
    $send($socket, $payload);
    $sent = $read($socket, 250);
    $send($socket, "QUIT");
    fclose($socket);

    return $sent;
}

// Read raw webhook payload
$payload = @file_get_contents('php://input');
$event = json_decode($payload, true);

if (!$event || !isset($event['type'])) {
    // If called via GET for diagnostics
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        echo json_encode([
            'status' => 'online',
            'service' => 'DigitalsNova Stripe Webhook Listener',
            'time' => date('c'),
            'accepted_events' => [
                'checkout.session.completed',
                'invoice.payment_succeeded',
                'payment_intent.succeeded'
            ]
        ]);
        exit();
    }

    http_response_code(400);
    echo json_encode(['error' => 'Invalid webhook event payload']);
    exit();
}

$eventType = $event['type'];
$eventData = $event['data']['object'] ?? [];

// Log Webhook Receipt
$webhookLogs = readJsonFile($webhookLogsFile);
$webhookLogs[] = [
    'id' => $event['id'] ?? ('wh_' . time()),
    'type' => $eventType,
    'timestamp' => date('c'),
    'data' => $eventData
];
if (count($webhookLogs) > 200) {
    $webhookLogs = array_slice($webhookLogs, -200);
}
writeJsonFile($webhookLogsFile, $webhookLogs);

// Handle Successful Checkout Session or Payment Intent
if ($eventType === 'checkout.session.completed' || $eventType === 'payment_intent.succeeded' || $eventType === 'invoice.payment_succeeded') {
    $metadata = $eventData['metadata'] ?? [];
    $subdomain = strtolower(trim($metadata['subdomain'] ?? ($metadata['store'] ?? '')));
    $tenantId = trim($metadata['tenantId'] ?? ($metadata['id'] ?? ''));
    $rawPlanType = strtoupper(trim($metadata['planType'] ?? ($metadata['plan'] ?? 'MONTHLY')));

    $tenants = getUnifiedTenants($tenantsFile);
    $matchedIndex = -1;

    foreach ($tenants as $idx => $t) {
        $tId = $t['id'] ?? '';
        $tSub = strtolower($t['subdomain'] ?? '');
        if ((!empty($subdomain) && $tSub === $subdomain) || (!empty($tenantId) && $tId === $tenantId)) {
            $matchedIndex = $idx;
            break;
        }
    }

    if ($matchedIndex !== -1) {
        $tenant = &$tenants[$matchedIndex];
        $rawSec = $tenant['vertical']
            ?? ($tenant['sector']
            ?? ($tenant['storeType']
            ?? ($tenant['businessType']
            ?? ($metadata['vertical'] ?? ($metadata['sector'] ?? 'RETAIL_MART')))));
        $effectivePlans = getEffectivePricingPlans($dataDir);
        $planInfo = resolveSectorPlanPricing($rawSec, $rawPlanType, $effectivePlans);

        $planType = $planInfo['planType'];
        $planDays = $planInfo['days'];
        $planName = $planInfo['planName'];
        $amount = intval($eventData['amount_total'] ?? ($eventData['amount'] ?? ($planInfo['fee'] * 100))) / 100;
        if ($amount <= 0) $amount = $planInfo['fee'];

        $validUntilTimestamp = strtotime("+{$planDays} days");
        $validUntilDate = date('d M Y, h:i A', $validUntilTimestamp);
        $validUntilIso = date('c', $validUntilTimestamp);
        $txnId = 'STRIPE_' . ($event['id'] ?? ('wh_' . time()));

        $tenant['status'] = 'ACTIVE';
        $tenant['planType'] = $planType;
        $tenant['planName'] = $planName;
        $tenant['monthlyFee'] = $amount;
        $tenant['monthly_fee'] = $amount;
        $tenant['cycleDays'] = $planDays;
        $tenant['subscriptionExpiry'] = $validUntilIso;
        $tenant['lastPaymentDate'] = date('c');
        $tenant['manualBlocked'] = false;
        $tenant['subscription'] = [
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
        writeJsonFile($tenantsFile, $tenants);
        syncToSecondaryDataDirs('tenants.json', $tenants);

        $clientEmail = $tenant['email'] ?? ($tenant['adminUser']['email'] ?? ($eventData['customer_details']['email'] ?? ''));
        $storeName = $tenant['name'] ?? $subdomain;
        $resolvedSub = $tenant['subdomain'] ?? $subdomain;

        // Record in payments.json
        $payments = readJsonFile($paymentsFile);
        $payments[] = [
            'id' => $txnId,
            'tenantId' => $tenant['id'],
            'tenantName' => $storeName,
            'subdomain' => $resolvedSub,
            'planType' => $planType,
            'planName' => $planName,
            'amount' => $amount,
            'currency' => strtoupper($eventData['currency'] ?? 'PKR'),
            'status' => 'SUCCEEDED',
            'gateway' => 'STRIPE_WEBHOOK',
            'createdAt' => date('c'),
            'validUntil' => $validUntilIso
        ];
        writeJsonFile($paymentsFile, $payments);
        syncToSecondaryDataDirs('payments.json', $payments);

        // Add Real-Time Super Admin Notification
        $notifications = readJsonFile($notifsFile);
        array_unshift($notifications, [
            'id' => 'notif_' . time(),
            'timestamp' => date('c'),
            'type' => 'PAYMENT_RECEIVED',
            'title' => '💳 Stripe Webhook: Subscription Active (Rs. ' . number_format($amount) . ')',
            'tenantName' => $storeName,
            'subdomain' => $resolvedSub,
            'planType' => $planType,
            'planName' => $planName,
            'amount' => $amount,
            'txnId' => $txnId,
            'portalUrl' => 'https://digitalsnova.com/portal/?store=' . $resolvedSub,
            'message' => "Stripe confirmed payment of Rs. " . number_format($amount) . " for {$storeName} ({$planName}). Unlocked until {$validUntilDate}."
        ]);
        writeJsonFile($notifsFile, $notifications);
        syncToSecondaryDataDirs('notifications.json', $notifications);

        // Send confirmation receipt email
        $receiptBody = '
        <div style="font-family: Arial, sans-serif; background: #0b132b; color: #fff; padding: 24px; border-radius: 14px; border: 2px solid #10b981;">
            <h2 style="color: #10b981; margin-top: 0;">✓ Stripe Payment Confirmed!</h2>
            <p>Your subscription for <strong>' . htmlspecialchars($storeName) . '</strong> has been renewed.</p>
            <p><strong>Package:</strong> ' . htmlspecialchars($planName) . '<br>
            <strong>Amount:</strong> Rs. ' . number_format($amount) . '<br>
            <strong>Valid Until:</strong> ' . $validUntilDate . '<br>
            <strong>Transaction Reference:</strong> ' . htmlspecialchars($txnId) . '</p>
            <p><a href="https://digitalsnova.com/portal/?store=' . urlencode($resolvedSub) . '" style="background: #00e5ff; color: #020617; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Launch Cloud Portal</a></p>
        </div>';

        if (!empty($clientEmail) && filter_var($clientEmail, FILTER_VALIDATE_EMAIL)) {
            sendGmailSmtp($clientEmail, "✓ Stripe Payment Receipt: {$planName} - DigitalsNova", $receiptBody);
        }
        sendGmailSmtp('digitalsnovaofficial@gmail.com', "👑 Stripe Webhook Payment: Rs. " . number_format($amount) . " from {$storeName}", $receiptBody);
    }
}

http_response_code(200);
echo json_encode(['received' => true, 'timestamp' => date('c')]);
exit();
