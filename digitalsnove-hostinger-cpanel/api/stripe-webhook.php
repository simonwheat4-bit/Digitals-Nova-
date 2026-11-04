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
    $planType = strtoupper(trim($metadata['planType'] ?? 'MONTHLY'));

    $planConfig = [
        'TRIAL_3_DAYS' => ['days' => 3, 'fee' => 0, 'name' => '3-Day Enterprise Trial'],
        'MONTHLY' => ['days' => 30, 'fee' => 7999, 'name' => 'Standard Monthly Plan'],
        'YEARLY' => ['days' => 365, 'fee' => 76790, 'name' => '1-Year Annual Package'],
        '3_YEARS' => ['days' => 1095, 'fee' => 229000, 'name' => '3-Year Multi-Year Package']
    ];

    $planInfo = $planConfig[$planType] ?? $planConfig['MONTHLY'];
    $amount = intval($eventData['amount_total'] ?? ($eventData['amount'] ?? ($planInfo['fee'] * 100))) / 100;
    if ($amount <= 0) $amount = $planInfo['fee'];
    $planDays = $planInfo['days'];
    $planName = $planInfo['name'];

    $tenants = readJsonFile($tenantsFile);
    $matchedIndex = -1;

    foreach ($tenants as $idx => $t) {
        $tId = $t['id'] ?? '';
        $tSub = strtolower($t['subdomain'] ?? '');
        if ((!empty($subdomain) && $tSub === $subdomain) || (!empty($tenantId) && $tId === $tenantId)) {
            $matchedIndex = $idx;
            break;
        }
    }

    $validUntilTimestamp = strtotime("+{$planDays} days");
    $validUntilDate = date('d M Y, h:i A', $validUntilTimestamp);
    $txnId = 'STRIPE_' . ($event['id'] ?? ('wh_' . time()));

    if ($matchedIndex !== -1) {
        $tenant = &$tenants[$matchedIndex];
        $tenant['status'] = 'ACTIVE';
        $tenant['planType'] = $planType;
        $tenant['planName'] = $planName;
        $tenant['monthlyFee'] = $amount;
        $tenant['lastPaymentDate'] = date('c');
        $tenant['manualBlocked'] = false;
        $tenant['subscription'] = [
            'state' => 'ACTIVE',
            'plan' => $planType,
            'planName' => $planName,
            'billingCycleDay' => 1,
            'graceDaysRemaining' => 3,
            'lastPaymentDate' => date('c'),
            'validUntil' => date('c', $validUntilTimestamp),
            'validUntilFormatted' => $validUntilDate,
            'txnId' => $txnId
        ];
        writeJsonFile($tenantsFile, $tenants);

        $clientEmail = $tenant['email'] ?? ($tenant['adminUser']['email'] ?? ($eventData['customer_details']['email'] ?? ''));
        $storeName = $tenant['name'] ?? $subdomain;

        // Record in payments.json
        $payments = readJsonFile($paymentsFile);
        $payments[] = [
            'id' => $txnId,
            'tenantId' => $tenant['id'],
            'tenantName' => $storeName,
            'subdomain' => $subdomain,
            'planType' => $planType,
            'planName' => $planName,
            'amount' => $amount,
            'currency' => strtoupper($eventData['currency'] ?? 'PKR'),
            'status' => 'SUCCEEDED',
            'gateway' => 'STRIPE_WEBHOOK',
            'createdAt' => date('c'),
            'validUntil' => date('c', $validUntilTimestamp)
        ];
        writeJsonFile($paymentsFile, $payments);

        // Add Real-Time Super Admin Notification
        $notifications = readJsonFile($notifsFile);
        $notifications[] = [
            'id' => 'notif_' . time(),
            'timestamp' => date('c'),
            'type' => 'PAYMENT_RECEIVED',
            'title' => '💳 Stripe Webhook: Subscription Active (Rs. ' . number_format($amount) . ')',
            'tenantName' => $storeName,
            'subdomain' => $subdomain,
            'planType' => $planType,
            'planName' => $planName,
            'amount' => $amount,
            'txnId' => $txnId,
            'portalUrl' => 'https://digitalsnova.com/portal/?store=' . $subdomain,
            'message' => "Stripe confirmed payment of Rs. " . number_format($amount) . " for {$storeName}. Unlocked until {$validUntilDate}."
        ];
        writeJsonFile($notifsFile, $notifications);

        // Send confirmation receipt email
        $receiptBody = '
        <div style="font-family: Arial, sans-serif; background: #0b132b; color: #fff; padding: 24px; border-radius: 14px; border: 2px solid #10b981;">
            <h2 style="color: #10b981; margin-top: 0;">✓ Stripe Payment Confirmed!</h2>
            <p>Your subscription for <strong>' . htmlspecialchars($storeName) . '</strong> has been renewed.</p>
            <p><strong>Package:</strong> ' . htmlspecialchars($planName) . '<br>
            <strong>Amount:</strong> Rs. ' . number_format($amount) . '<br>
            <strong>Valid Until:</strong> ' . $validUntilDate . '<br>
            <strong>Transaction Reference:</strong> ' . htmlspecialchars($txnId) . '</p>
            <p><a href="https://digitalsnova.com/portal/?store=' . urlencode($subdomain) . '" style="background: #00e5ff; color: #020617; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Launch Cloud Portal</a></p>
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
