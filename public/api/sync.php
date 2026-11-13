<?php
// ==============================================================================
// DigitalsNova Cloud SaaS Sync, Multi-Tenant ERP & Email Automation Backend
// Hostinger Shared Hosting Native PHP API
// ==============================================================================

require_once __DIR__ . '/bootstrap.php';

dnSendApiHeaders();
dnHandleCorsPreflight();

$dataDir = dnResolveDataDir();

$tenantsFile = $dataDir . '/tenants.json';
$notifsFile = $dataDir . '/notifications.json';
$staffFile = $dataDir . '/staff.json';
$deletedStaffFile = $dataDir . '/deleted_staff.json';
$deletedTenantsFile = $dataDir . '/deleted_tenants.json';
$paymentsFile = $dataDir . '/payments.json';
$licenseKeysFile = $dataDir . '/license_keys.json';
$deletedLicenseKeysFile = $dataDir . '/deleted_license_keys.json';
$platformBrandFile = $dataDir . '/platform_brand.json';
$remoteConfigFile = $dataDir . '/remote_config.json';
$passwordResetsFile = $dataDir . '/password_resets.json';
$cronLogsFile = $dataDir . '/cron_logs.json';
$otpTokensFile = $dataDir . '/otp_tokens.json';
$leadsFile = $dataDir . '/leads.json';

function syncToSecondaryDataDirs($filename, $data) {
    global $dataDir;
    dnSyncToSecondaryDataDirs($filename, $data, $dataDir);
}

function sendDigitalsNovaEmail($toEmail, $subject, $htmlContent, $senderName = 'DigitalsNova Team') {
    return dnSendGmailSmtp($toEmail, $subject, $htmlContent, $senderName);
}

function getUnifiedNotifications($dataDir) {
    $primaryPath = $dataDir . '/notifications.json';
    $notifs = dnReadJsonFile($primaryPath, []);
    $seededFlag = $dataDir . '/.notifs_seeded.flag';

    // Only import docroot seed notifications ONCE on a brand-new installation
    if (!file_exists($seededFlag) && empty($notifs)) {
        $otherPaths = [
            __DIR__ . '/data/notifications.json',
            dirname(__DIR__) . '/portal/api/data/notifications.json'
        ];
        $seen = [];
        foreach ($otherPaths as $op) {
            if (file_exists($op)) {
                foreach (dnReadJsonFile($op, []) as $on) {
                    if (!empty($on['id']) && empty($seen[$on['id']])) {
                        $notifs[] = $on;
                        $seen[$on['id']] = true;
                    }
                }
            }
        }
        if (!empty($notifs)) {
            usort($notifs, function($a, $b) {
                return strtotime($b['timestamp'] ?? '0') - strtotime($a['timestamp'] ?? '0');
            });
            dnWriteJsonFile($primaryPath, $notifs);
            dnSyncToSecondaryDataDirs('notifications.json', $notifs, $dataDir);
        }
        @file_put_contents($seededFlag, date('c'));
    }

    return is_array($notifs) ? $notifs : [];
}

function dnFindTenantMatch($tenants, $targetId = '', $targetSub = '') {
    $tid = trim((string)$targetId);
    $tsub = strtolower(trim((string)$targetSub));
    foreach ($tenants as $idx => $t) {
        $curId = (string)($t['id'] ?? '');
        $curSub = strtolower((string)($t['subdomain'] ?? ''));
        if (($tid !== '' && ($curId === $tid || $curSub === strtolower($tid))) ||
            ($tsub !== '' && $curSub === $tsub)) {
            return $idx;
        }
    }
    return -1;
}

function dnResolveWorkspaceContext($body, $tenants) {
    $rawSub = $body['subdomain']
        ?? ($_GET['subdomain']
        ?? ($_GET['store']
        ?? ($_SERVER['HTTP_X_TENANT_SUBDOMAIN'] ?? '')));
    $rawTid = $body['tenantId'] ?? ($_GET['tenantId'] ?? '');
    $cleanSub = dnSanitizeSubdomain($rawSub);

    $idx = dnFindTenantMatch($tenants, $rawTid, $cleanSub);
    $tenant = ($idx !== -1) ? $tenants[$idx] : null;
    if ($tenant && !empty($tenant['subdomain'])) {
        $cleanSub = dnSanitizeSubdomain($tenant['subdomain']);
    }
    if ($cleanSub === '' && $rawTid !== '') {
        $cleanSub = dnSanitizeSubdomain($rawTid);
    }
    return [
        'subdomain' => $cleanSub,
        'tenantId' => $tenant ? ($tenant['id'] ?? $rawTid) : $rawTid,
        'tenant' => $tenant,
        'index' => $idx
    ];
}

// Parse request
$action = isset($_GET['action']) ? trim((string)$_GET['action']) : '';
$rawBody = @file_get_contents('php://input');
$body = json_decode($rawBody, true);
if (!is_array($body)) {
    $body = !empty($_POST) ? $_POST : [];
}
if ($action === '' && isset($body['action'])) {
    $action = trim((string)$body['action']);
}

// ==============================================================================
// 1. PRICING PLANS
// ==============================================================================
if ($action === 'get_pricing_plans') {
    $plans = dnGetEffectivePricingPlans($dataDir);
    echo json_encode(['success' => true, 'plans' => $plans]);
    exit();
}

if ($action === 'save_pricing_plans') {
    $pricingFile = $dataDir . '/pricing_plans.json';
    $plans = isset($body['plans']) && is_array($body['plans']) ? $body['plans'] : $body;
    if (!empty($plans) && is_array($plans)) {
        $plans['pricingVersion'] = 2;
        $plans = array_merge(dnGetCanonicalPricingDefaults(), $plans);
        dnWriteJsonFile($pricingFile, $plans);
        syncToSecondaryDataDirs('pricing_plans.json', $plans);
        echo json_encode(['success' => true, 'message' => 'Sector pricing plans updated and synced across SaaS.', 'plans' => $plans]);
        exit();
    }
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid pricing plans payload']);
    exit();
}

// ==============================================================================
// 2. TEST EMAIL & BROADCAST
// ==============================================================================
if ($action === 'test_email' || $action === 'send_test_email') {
    $testTo = !empty($_GET['to']) ? $_GET['to'] : (!empty($body['to']) ? $body['to'] : 'digitalsnovaofficial@gmail.com');
    $testSubject = 'Welcome to DigitalsNova - Your Cloud POS Portal is Ready! [SMTP TEST]';
    $testBody = '<div style="font-family: Arial, sans-serif; background: #030712; color: #fff; padding: 20px; border-radius: 12px; border: 1px solid #00e5ff;">'
        . '<h2 style="color: #00e5ff;">DigitalsNova Gmail SMTP Test Successful</h2>'
        . '<p>Gmail SMTP (smtp.gmail.com:465 SSL) is actively working and connected!</p>'
        . '<p>Recipient: ' . htmlspecialchars($testTo) . '<br>Server time: ' . date('c') . '</p>'
        . '</div>';
    $ok = dnSendGmailSmtp($testTo, $testSubject, $testBody);
    echo json_encode([
        'success' => $ok,
        'message' => $ok ? "Test email successfully sent to {$testTo} via Gmail SMTP (465 SSL)!" : 'Failed to send email via SMTP',
        'recipient' => $testTo,
        'smtpHost' => 'smtp.gmail.com:465'
    ]);
    exit();
}

if ($action === 'newsletter' || $action === 'send_broadcast') {
    $subject = !empty($body['subject']) ? $body['subject'] : 'Important Update from DigitalsNova';
    $messageText = !empty($body['message']) ? $body['message'] : '';

    if (empty($messageText)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Message cannot be empty']);
        exit();
    }

    $tenants = dnGetUnifiedTenants($dataDir);
    $sentCount = 0;

    foreach ($tenants as $t) {
        $email = $t['email'] ?? ($t['adminUser']['email'] ?? '');
        if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $broadcastHtml = '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; background-color: #030712; color: #f8fafc; padding: 20px;">'
                . '<div style="max-width: 600px; margin: 0 auto; background: #0b132b; border: 1px solid #1e293b; border-radius: 12px; padding: 24px;">'
                . '<h2 style="color: #00e5ff; margin-top: 0;">DigitalsNova Official Announcement</h2>'
                . '<p style="color: #e2e8f0; font-size: 14px; line-height: 1.6;">' . nl2br(htmlspecialchars($messageText)) . '</p>'
                . '<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; font-size: 12px; color: #94a3b8;">'
                . 'Sent by DigitalsNova Official (<a href="mailto:digitalsnovaofficial@gmail.com" style="color: #00e5ff;">digitalsnovaofficial@gmail.com</a>)'
                . '</div></div></body></html>';
            dnSendGmailSmtp($email, $subject, $broadcastHtml);
            $sentCount++;
        }
    }

    echo json_encode(['success' => true, 'sentCount' => $sentCount]);
    exit();
}

// ==============================================================================
// 3. NOTIFICATIONS & CONTACT / QUOTE LEADS
// ==============================================================================
if ($action === 'clear_notifications' || $action === 'clear_feed') {
    dnWriteJsonFile($notifsFile, []);
    syncToSecondaryDataDirs('notifications.json', []);
    @file_put_contents($dataDir . '/.notifs_seeded.flag', date('c'));
    echo json_encode([
        'success' => true,
        'clearedAt' => round(microtime(true) * 1000),
        'message' => 'All feed notifications have been permanently cleared from cloud storage.'
    ]);
    exit();
}

if ($action === 'submit_lead') {
    $name = trim((string)($body['name'] ?? ($body['fullName'] ?? '')));
    $email = trim((string)($body['email'] ?? ''));
    $phone = trim((string)($body['phone'] ?? ''));
    $company = trim((string)($body['company'] ?? ''));
    $service = $body['service'] ?? '';
    $servicesList = isset($body['services']) && is_array($body['services']) ? $body['services'] : (!empty($service) ? [$service] : []);
    $budget = trim((string)($body['budget'] ?? ''));
    $timeline = trim((string)($body['timeline'] ?? ''));
    $message = trim((string)($body['message'] ?? ($body['notes'] ?? '')));
    $source = trim((string)($body['source'] ?? 'CONTACT_FORM'));

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Please enter your valid name and email address.']);
        exit();
    }

    $leadId = 'lead_' . time() . '_' . rand(100, 999);
    $lead = [
        'id' => $leadId,
        'source' => $source,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'company' => $company,
        'services' => $servicesList,
        'budget' => $budget,
        'timeline' => $timeline,
        'message' => $message,
        'createdAt' => date('c')
    ];

    $leads = dnReadJsonFile($leadsFile, []);
    array_unshift($leads, $lead);
    dnWriteJsonFile($leadsFile, array_slice($leads, 0, 500));

    $notifications = getUnifiedNotifications($dataDir);
    $svcStr = !empty($servicesList) ? implode(', ', $servicesList) : 'General Inquiry';
    array_unshift($notifications, [
        'id' => 'notif_' . $leadId,
        'timestamp' => date('c'),
        'type' => 'NEW_LEAD',
        'title' => ($source === 'QUOTE_FORM' ? 'New Quote Request: ' : 'New Contact Inquiry: ') . $name,
        'tenantName' => $company ?: $name,
        'subdomain' => '',
        'ownerName' => $name,
        'phone' => $phone,
        'email' => $email,
        'message' => "{$name} ({$email}" . ($phone ? " / {$phone}" : '') . ") inquired about {$svcStr}" . ($budget ? " • Budget: {$budget}" : '') . ($message ? " — " . substr($message, 0, 140) : ''),
        'unread' => true
    ]);
    dnWriteJsonFile($notifsFile, array_slice($notifications, 0, 100));
    syncToSecondaryDataDirs('notifications.json', array_slice($notifications, 0, 100));

    $leadHtml = '<div style="font-family: Arial, sans-serif; background: #030712; color: #f8fafc; padding: 24px;">'
        . '<div style="max-width: 600px; margin: 0 auto; background: #0b132b; border: 1px solid #00e5ff; border-radius: 14px; padding: 24px;">'
        . '<h2 style="color: #00e5ff; margin-top: 0;">' . htmlspecialchars($source === 'QUOTE_FORM' ? 'New Quote Request' : 'New Contact Inquiry') . '</h2>'
        . '<p><strong>Name:</strong> ' . htmlspecialchars($name) . '<br>'
        . '<strong>Email:</strong> ' . htmlspecialchars($email) . '<br>'
        . '<strong>Phone:</strong> ' . htmlspecialchars($phone ?: 'N/A') . '<br>'
        . '<strong>Company:</strong> ' . htmlspecialchars($company ?: 'N/A') . '<br>'
        . '<strong>Services:</strong> ' . htmlspecialchars($svcStr) . '<br>'
        . ($budget ? '<strong>Budget:</strong> ' . htmlspecialchars($budget) . '<br>' : '')
        . ($timeline ? '<strong>Timeline:</strong> ' . htmlspecialchars($timeline) . '<br>' : '')
        . '<strong>Notes / Message:</strong><br>' . nl2br(htmlspecialchars($message ?: '(None)')) . '</p>'
        . '</div></div>';
    dnSendGmailSmtp('digitalsnovaofficial@gmail.com', "New Website Lead ({$source}): {$name}", $leadHtml);

    echo json_encode([
        'success' => true,
        'leadId' => $leadId,
        'message' => $source === 'QUOTE_FORM'
            ? 'Quote inquiry received! Our senior strategy team will review your requirements and contact you shortly.'
            : 'Thank you! Your message has been sent successfully. We will contact you within 24 hours.'
    ]);
    exit();
}

// ==============================================================================
// 4. TENANT REGISTRATION & DELETION
// ==============================================================================
if ($action === 'register_tenant' || $action === 'register') {
    $tenant = isset($body['tenant']) && is_array($body['tenant']) ? $body['tenant'] : $body;
    $allowUpdate = !empty($body['allowUpdate']) || !empty($tenant['allowUpdate']);

    $storeName = trim((string)($tenant['name'] ?? ($tenant['clinicName'] ?? ($tenant['businessName'] ?? ''))));
    if ($storeName === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing store or clinic name.']);
        exit();
    }

    $rawSub = !empty($tenant['subdomain']) ? $tenant['subdomain'] : $storeName;
    $subdomain = dnSanitizeSubdomain($rawSub);
    if (dnIsReservedName($subdomain)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'This store subdomain name is reserved or invalid. Please choose another name.']);
        exit();
    }

    $ownerName = trim((string)($tenant['ownerName'] ?? ($tenant['adminName'] ?? ($tenant['adminUser']['name'] ?? ($storeName . ' Owner')))));
    $ownerPhone = trim((string)($tenant['phone'] ?? ($tenant['adminUser']['phone'] ?? '')));
    $ownerEmail = trim((string)($tenant['email'] ?? ($tenant['adminUser']['email'] ?? '')));
    $cleanPhone = preg_replace('/[^0-9]/', '', $ownerPhone);
    $cleanEmail = strtolower($ownerEmail);
    $explicitId = trim((string)($tenant['id'] ?? ''));

    $tenants = dnGetUnifiedTenants($dataDir);

    // Reject duplicate subdomain / phone / email BEFORE writing anything
    foreach ($tenants as $existing) {
        $exId = (string)($existing['id'] ?? '');
        $exSub = dnSanitizeSubdomain($existing['subdomain'] ?? '');
        $exPhone = preg_replace('/[^0-9]/', '', (string)($existing['phone'] ?? ($existing['adminUser']['phone'] ?? '')));
        $exEmail = strtolower(trim((string)($existing['email'] ?? ($existing['adminUser']['email'] ?? ''))));

        if ($allowUpdate && $explicitId !== '' && $exId === $explicitId) {
            continue;
        }
        if ($exSub === $subdomain) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => "Store subdomain \"{$subdomain}\" is already registered. Please sign in or choose another store name."]);
            exit();
        }
        if (strlen($cleanPhone) >= 7 && $exPhone === $cleanPhone) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'An account with this phone number already exists.']);
            exit();
        }
        if ($cleanEmail !== '' && $exEmail !== '' && $exEmail === $cleanEmail) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'An account with this email address already exists.']);
            exit();
        }
    }

    $planType = !empty($tenant['planType']) ? $tenant['planType'] : 'TRIAL_3_DAYS';
    $activationKeyInput = strtoupper(trim((string)($tenant['activationKey'] ?? '')));
    $businessType = !empty($tenant['businessType']) ? $tenant['businessType'] : (!empty($tenant['business_type']) ? $tenant['business_type'] : 'Retail Mart / General Store');
    $rawSec = $tenant['vertical'] ?? ($tenant['sector'] ?? ($tenant['storeType'] ?? ''));
    $vertical = !empty($rawSec) ? dnNormalizeSectorCode($rawSec) : dnNormalizeSectorCode($businessType . ' ' . $storeName);

    $plans = dnGetEffectivePricingPlans($dataDir);
    $resolvedPlan = dnResolveSectorPlanPricing($vertical, $planType, $plans);
    $planType = $resolvedPlan['planType'];
    $cycleDays = isset($tenant['cycleDays']) && is_numeric($tenant['cycleDays']) && intval($tenant['cycleDays']) > 0 ? intval($tenant['cycleDays']) : $resolvedPlan['days'];
    $defaultFee = $resolvedPlan['fee'];

    $planName = !empty($tenant['planName']) ? $tenant['planName'] : $resolvedPlan['planName'];
    $monthlyFee = isset($tenant['monthlyFee']) && is_numeric($tenant['monthlyFee']) ? floatval($tenant['monthlyFee']) : (isset($tenant['monthly_fee']) && is_numeric($tenant['monthly_fee']) ? floatval($tenant['monthly_fee']) : $defaultFee);
    $adminUser = trim((string)($tenant['adminUsername'] ?? ($tenant['adminUser']['username'] ?? ('admin.' . $subdomain))));
    $adminPass = (string)($tenant['adminPassword'] ?? ($tenant['adminUser']['password'] ?? '123456'));

    $createdAt = !empty($tenant['createdAt']) ? $tenant['createdAt'] : date('c');
    $expiryTs = strtotime("+{$cycleDays} days");
    $subscriptionExpiry = !empty($tenant['subscriptionExpiry']) ? $tenant['subscriptionExpiry'] : date('c', $expiryTs);
    $expiryFormatted = date('d M Y, h:i A', $expiryTs);

    $record = [
        'id' => $explicitId !== '' ? $explicitId : ('tenant_' . $subdomain . '_' . time()),
        'name' => $storeName,
        'businessName' => $storeName,
        'subdomain' => $subdomain,
        'domain' => 'digitalsnova.com/portal/?store=' . $subdomain,
        'portalUrl' => 'https://digitalsnova.com/portal/?store=' . $subdomain,
        'ownerName' => $ownerName,
        'phone' => $ownerPhone,
        'whatsappNumber' => !empty($tenant['whatsappNumber']) ? trim((string)$tenant['whatsappNumber']) : $ownerPhone,
        'whatsappAutoDispatch' => isset($tenant['whatsappAutoDispatch']) ? (bool)$tenant['whatsappAutoDispatch'] : true,
        'smsEnabled' => isset($tenant['smsEnabled']) ? (bool)$tenant['smsEnabled'] : true,
        'email' => $ownerEmail,
        'businessType' => $businessType,
        'business_type' => $businessType,
        'vertical' => $vertical,
        'sector' => $vertical,
        'storeType' => $vertical,
        'planType' => $planType,
        'planName' => $planName,
        'cycleDays' => $cycleDays,
        'subscriptionExpiry' => $subscriptionExpiry,
        'monthlyFee' => $monthlyFee,
        'monthly_fee' => $monthlyFee,
        'createdAt' => $createdAt,
        'lastPaymentDate' => $createdAt,
        'adminName' => $ownerName,
        'adminUsername' => $adminUser,
        'adminPassword' => $adminPass,
        'adminPin' => '1234',
        'status' => 'ACTIVE',
        'manualBlocked' => false,
        'enabledModules' => [
            'pos' => true,
            'inventory' => true,
            'patientsLedger' => ($vertical === 'CLINIC_HMS'),
            'tableManagement' => ($vertical === 'RESTAURANT'),
            'expiryBatch' => ($vertical === 'PHARMACY')
        ],
        'subscription' => [
            'state' => 'ACTIVE',
            'plan' => $planType,
            'planName' => $planName,
            'billingCycleDay' => 1,
            'totalDays' => $cycleDays,
            'graceDaysRemaining' => 3,
            'monthlyFee' => $monthlyFee,
            'validUntil' => $subscriptionExpiry,
            'validUntilFormatted' => $expiryFormatted
        ],
        'adminUser' => [
            'name' => $ownerName,
            'username' => $adminUser,
            'password' => $adminPass,
            'email' => $ownerEmail,
            'phone' => $ownerPhone,
            'role' => $vertical === 'CLINIC_HMS' ? 'CLINIC_ADMIN' : 'STORE_ADMIN'
        ]
    ];

    if ($activationKeyInput !== '') {
        $regKeys = dnReadUnifiedJson($licenseKeysFile, 'license_keys.json', []);
        foreach ($regKeys as &$rk) {
            if (strtoupper(trim((string)($rk['keyCode'] ?? ''))) === $activationKeyInput) {
                $rkStatus = strtoupper((string)($rk['status'] ?? 'READY'));
                $rkSub = strtolower(trim((string)($rk['subdomain'] ?? '')));
                if (($rkStatus === 'READY' || $rkStatus === 'ACTIVE') && ($rkSub === '' || $rkSub === $subdomain)) {
                    $kDays = max(1, intval($rk['cycleDays'] ?? $cycleDays));
                    $kFee = is_numeric($rk['fee'] ?? null) ? floatval($rk['fee']) : $monthlyFee;
                    $kPlan = !empty($rk['planType']) ? $rk['planType'] : $planType;
                    $expTs = strtotime("+{$kDays} days");
                    $record['planType'] = $kPlan;
                    $record['cycleDays'] = $kDays;
                    $record['monthlyFee'] = $kFee;
                    $record['monthly_fee'] = $kFee;
                    $record['subscriptionExpiry'] = date('c', $expTs);
                    $record['activeLicenseKey'] = $activationKeyInput;
                    $rk['status'] = 'ACTIVATED';
                    $rk['activatedAt'] = date('c');
                    $rk['tenantId'] = $record['id'];
                    $rk['subdomain'] = $record['subdomain'];
                    dnWriteJsonFile($licenseKeysFile, $regKeys);
                    syncToSecondaryDataDirs('license_keys.json', $regKeys);
                }
                break;
            }
        }
        unset($rk);
    }

    dnNormalizeTenantState($record, $plans);

    $newTenants = [];
    foreach ($tenants as $t) {
        if ($allowUpdate && $explicitId !== '' && ($t['id'] ?? '') === $explicitId) {
            continue;
        }
        $newTenants[] = $t;
    }
    $newTenants[] = $record;
    dnWriteJsonFile($tenantsFile, $newTenants);
    syncToSecondaryDataDirs('tenants.json', $newTenants);

    // Ensure clean isolated empty workspace exists for this store
    if (!file_exists(dnWorkspacePath($dataDir, $subdomain))) {
        dnSaveWorkspace($dataDir, $subdomain, dnEmptyWorkspace());
    }

    // Remove from deleted_tenants.json if previously deleted and re-registered intentionally
    $deletedList = dnReadJsonFile($deletedTenantsFile, []);
    $deletedList = array_filter($deletedList, function($d) use ($subdomain, $cleanPhone, $cleanEmail) {
        $dSub = strtolower((string)($d['subdomain'] ?? ''));
        $dPhone = preg_replace('/[^0-9]/', '', (string)($d['phone'] ?? ''));
        $dEmail = strtolower(trim((string)($d['email'] ?? '')));
        return $dSub !== $subdomain && ($cleanPhone === '' || $dPhone !== $cleanPhone) && ($cleanEmail === '' || $dEmail !== $cleanEmail);
    });
    dnWriteJsonFile($deletedTenantsFile, array_values($deletedList));
    syncToSecondaryDataDirs('deleted_tenants.json', array_values($deletedList));

    // Real-Time Super Admin Notification
    $notifications = getUnifiedNotifications($dataDir);
    $notif = [
        'id' => 'notif_' . time() . '_' . rand(100, 999),
        'timestamp' => $createdAt,
        'type' => 'NEW_REGISTRATION',
        'title' => 'New Store Registered (Cloud Sync)',
        'tenantName' => $storeName,
        'subdomain' => $subdomain,
        'ownerName' => $ownerName,
        'phone' => $ownerPhone,
        'whatsappNumber' => !empty($tenant['whatsappNumber']) ? trim((string)$tenant['whatsappNumber']) : $ownerPhone,
        'whatsappAutoDispatch' => isset($tenant['whatsappAutoDispatch']) ? (bool)$tenant['whatsappAutoDispatch'] : true,
        'smsEnabled' => isset($tenant['smsEnabled']) ? (bool)$tenant['smsEnabled'] : true,
        'email' => $ownerEmail,
        'businessType' => $businessType,
        'vertical' => $vertical,
        'planType' => $planType,
        'planName' => $planName,
        'monthlyFee' => $monthlyFee,
        'adminUsername' => $adminUser,
        'adminPassword' => $adminPass,
        'portalUrl' => 'https://digitalsnova.com/portal/?store=' . $subdomain,
        'message' => "Store '{$storeName}' registered on {$planName}! Owner: {$ownerName} ({$ownerPhone}).",
        'unread' => true
    ];
    array_unshift($notifications, $notif);
    if (count($notifications) > 100) {
        $notifications = array_slice($notifications, 0, 100);
    }
    dnWriteJsonFile($notifsFile, $notifications);
    syncToSecondaryDataDirs('notifications.json', $notifications);

    if ($ownerEmail !== '' && filter_var($ownerEmail, FILTER_VALIDATE_EMAIL)) {
        $clientSubject = 'Welcome to DigitalsNova - Your Cloud POS Portal is Ready!';
        $clientHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"></head>'
            . '<body style="font-family: Arial, sans-serif; background-color: #030712; color: #f8fafc; padding: 24px; margin: 0;">'
            . '<div style="max-width: 600px; margin: 0 auto; background: #0b132b; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden;">'
            . '<div style="background: linear-gradient(135deg, #0f172a, #1e3a8a); padding: 28px 24px; text-align: center; border-bottom: 2px solid #00e5ff;">'
            . '<h1 style="color: #00e5ff; font-size: 24px; margin: 0 0 6px 0; font-weight: 900;">DigitalsNova Cloud POS</h1>'
            . '<p style="color: #94a3b8; font-size: 13px; margin: 0;">High-Performance Multi-Tenant Retail & Clinical SaaS</p></div>'
            . '<div style="padding: 28px 24px;">'
            . '<h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Assalam-o-Alaikum, ' . htmlspecialchars($ownerName) . '!</h2>'
            . '<p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Your dedicated cloud business portal for <strong>' . htmlspecialchars($storeName) . '</strong> is active on <strong>' . htmlspecialchars($planName) . '</strong>.</p>'
            . '<div style="background: #020617; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 24px 0;">'
            . '<p style="margin: 6px 0; font-size: 13px; color: #e2e8f0;"><strong>Store:</strong> ' . htmlspecialchars($storeName) . '</p>'
            . '<p style="margin: 6px 0; font-size: 13px; color: #e2e8f0;"><strong>Login Username:</strong> <code>' . htmlspecialchars($adminUser) . '</code></p>'
            . '<p style="margin: 6px 0; font-size: 13px; color: #e2e8f0;"><strong>Password:</strong> <code>' . htmlspecialchars($adminPass) . '</code></p></div>'
            . '<div style="text-align: center; margin: 30px 0;"><a href="https://digitalsnova.com/portal/?store=' . urlencode($subdomain) . '" style="background: linear-gradient(135deg, #00e5ff, #0077b6); color: #020617; font-weight: 900; font-size: 15px; padding: 14px 32px; text-decoration: none; border-radius: 10px; display: inline-block;">Launch Cloud POS Portal &rarr;</a></div>'
            . '</div></div></body></html>';
        dnSendGmailSmtp($ownerEmail, $clientSubject, $clientHtml);
    }

    $adminHtml = '<div style="font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px; border: 2px solid #f59e0b; border-radius: 14px;">'
        . '<h2 style="color: #f59e0b; margin-top: 0;">New Client Registration</h2>'
        . '<p><strong>Store:</strong> ' . htmlspecialchars($storeName) . ' (' . htmlspecialchars($subdomain) . ')<br>'
        . '<strong>Owner:</strong> ' . htmlspecialchars($ownerName) . '<br>'
        . '<strong>Phone:</strong> ' . htmlspecialchars($ownerPhone) . '<br>'
        . '<strong>Email:</strong> ' . htmlspecialchars($ownerEmail) . '<br>'
        . '<strong>Plan:</strong> ' . htmlspecialchars($planName) . '</p></div>';
    dnSendGmailSmtp('digitalsnovaofficial@gmail.com', "New Store Provisioned: {$storeName} [{$planName}]", $adminHtml);

    echo json_encode([
        'success' => true,
        'message' => 'Tenant registered, synced, and emails dispatched!',
        'tenant' => $record,
        'user' => $record['adminUser'],
        'notification' => $notif
    ]);
    exit();
}

if ($action === 'delete_tenant' || $action === 'delete') {
    $tenantId = trim((string)($body['id'] ?? ($body['tenantId'] ?? ($_GET['id'] ?? ''))));
    $subdomain = strtolower(trim((string)($body['subdomain'] ?? ($_GET['subdomain'] ?? ''))));
    $phone = preg_replace('/[^0-9]/', '', (string)($body['phone'] ?? ''));
    $email = strtolower(trim((string)($body['email'] ?? '')));

    $tenants = dnGetUnifiedTenants($dataDir);
    $remainingTenants = [];
    $deletedTenant = null;

    foreach ($tenants as $t) {
        $tId = (string)($t['id'] ?? '');
        $tSub = strtolower((string)($t['subdomain'] ?? ''));
        $tPhone = preg_replace('/[^0-9]/', '', (string)($t['phone'] ?? ($t['adminUser']['phone'] ?? '')));
        $tEmail = strtolower(trim((string)($t['email'] ?? ($t['adminUser']['email'] ?? ''))));

        $isMatch = false;
        if ($tenantId !== '' && ($tId === $tenantId || $tSub === strtolower($tenantId))) $isMatch = true;
        if ($subdomain !== '' && $tSub === $subdomain) $isMatch = true;
        if ($phone !== '' && $tPhone !== '' && $phone === $tPhone) $isMatch = true;
        if ($email !== '' && $tEmail !== '' && $email === $tEmail) $isMatch = true;

        if ($isMatch) {
            $deletedTenant = $t;
        } else {
            $remainingTenants[] = $t;
        }
    }
    dnWriteJsonFile($tenantsFile, $remainingTenants);
    syncToSecondaryDataDirs('tenants.json', $remainingTenants);

    $delSub = $subdomain ?: strtolower((string)($deletedTenant['subdomain'] ?? ''));
    $delId = $tenantId ?: ($deletedTenant['id'] ?? '');

    if ($delSub !== '') {
        dnDeleteWorkspace($dataDir, $delSub);
    }

    $allStaff = dnReadUnifiedJson($staffFile, 'staff.json', []);
    $remainingStaff = [];
    foreach ($allStaff as $s) {
        if (($delSub !== '' && strtolower((string)($s['subdomain'] ?? '')) === $delSub) ||
            ($delId !== '' && ($s['tenantId'] ?? '') === $delId)) {
            continue;
        }
        $remainingStaff[] = $s;
    }
    dnWriteJsonFile($staffFile, $remainingStaff);
    syncToSecondaryDataDirs('staff.json', $remainingStaff);

    $allNotifs = dnReadJsonFile($notifsFile, []);
    $remainingNotifs = [];
    foreach ($allNotifs as $n) {
        if ($delSub !== '' && strtolower((string)($n['subdomain'] ?? '')) === $delSub) {
            continue;
        }
        $remainingNotifs[] = $n;
    }
    dnWriteJsonFile($notifsFile, $remainingNotifs);
    syncToSecondaryDataDirs('notifications.json', $remainingNotifs);

    $deletedList = dnReadUnifiedJson($deletedTenantsFile, 'deleted_tenants.json', []);
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
    dnWriteJsonFile($deletedTenantsFile, array_values($deletedList));
    syncToSecondaryDataDirs('deleted_tenants.json', array_values($deletedList));

    echo json_encode([
        'success' => true,
        'message' => 'Store account and all associated data permanently deleted from cloud database.',
        'deletedTenant' => $deletedTenant
    ]);
    exit();
}

// ==============================================================================
// 5. GET_ALL & ISOLATED TENANT WORKSPACE BOOTSTRAP
// ==============================================================================
if ($action === 'get_all' || $action === 'tenants') {
    $tenants = dnGetUnifiedTenants($dataDir);
    $notifications = getUnifiedNotifications($dataDir);
    $effectivePlans = dnGetEffectivePricingPlans($dataDir);
    $deletedTenants = dnReadUnifiedJson($deletedTenantsFile, 'deleted_tenants.json', []);

    $tenantsDirty = false;
    foreach ($tenants as &$tItem) {
        if (dnNormalizeTenantState($tItem, $effectivePlans)) {
            $tenantsDirty = true;
        }
    }
    unset($tItem);
    if ($tenantsDirty) {
        dnWriteJsonFile($tenantsFile, $tenants);
        syncToSecondaryDataDirs('tenants.json', $tenants);
    }

    $staff = dnReadUnifiedJson($staffFile, 'staff.json', []);
    $deletedStaff = dnReadUnifiedJson($deletedStaffFile, 'deleted_staff.json', []);
    $platformBrand = array_merge(dnGetDefaultPlatformBrand(), dnReadUnifiedJson($platformBrandFile, 'platform_brand.json', []));
    $remoteConfig = array_merge(dnGetDefaultRemoteConfig(), dnReadUnifiedJson($remoteConfigFile, 'remote_config.json', []));
    $licenseKeys = dnReadUnifiedJson($licenseKeysFile, 'license_keys.json', []);
    $deletedLicenseKeys = dnReadUnifiedJson($deletedLicenseKeysFile, 'deleted_license_keys.json', []);
    $passwordResets = dnReadUnifiedJson($passwordResetsFile, 'password_resets.json', []);
    $cronLogs = dnReadUnifiedJson($cronLogsFile, 'cron_logs.json', []);

    $ctx = dnResolveWorkspaceContext($body, $tenants);
    $workspace = null;
    if ($ctx['subdomain'] !== '' && $ctx['subdomain'] !== 'hq' && $ctx['subdomain'] !== 'store') {
        $workspace = dnLoadWorkspace($dataDir, $ctx['subdomain']);
    }

    echo json_encode([
        'success' => true,
        'tenants' => $tenants,
        'notifications' => $notifications,
        'staff' => $staff,
        'deleted_staff' => $deletedStaff,
        'deleted_tenants' => $deletedTenants,
        'pricing_plans' => $effectivePlans,
        'platform_brand' => $platformBrand,
        'remote_config' => $remoteConfig,
        'license_keys' => $licenseKeys,
        'deleted_license_keys' => $deletedLicenseKeys,
        'password_resets' => $passwordResets,
        'cron_logs' => $cronLogs,
        'workspace' => $workspace,
        'count' => count($tenants),
        'serverTime' => date('c')
    ]);
    exit();
}

if ($action === 'get_workspace') {
    $tenants = dnGetUnifiedTenants($dataDir);
    $ctx = dnResolveWorkspaceContext($body, $tenants);
    if ($ctx['subdomain'] === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing store subdomain']);
        exit();
    }
    echo json_encode([
        'success' => true,
        'subdomain' => $ctx['subdomain'],
        'workspace' => dnLoadWorkspace($dataDir, $ctx['subdomain'])
    ]);
    exit();
}

// ==============================================================================
// 6. UNIVERSAL LOGIN, OTP RECOVERY & PROFILE MANAGEMENT
// ==============================================================================
if ($action === 'login') {
    $identifier = trim(strtolower((string)($body['identifier'] ?? ($body['username'] ?? ''))));
    $password = trim((string)($body['password'] ?? ''));

    if ($identifier === '' || $password === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Please provide username and password.']);
        exit();
    }

    // Master Super Admin verified strictly against persisted super_admin.json
    $saCheck = dnVerifySuperAdminLogin($dataDir, $identifier, $password);
    if ($saCheck['matched']) {
        if (!$saCheck['ok']) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Invalid password for Super Admin account.']);
            exit();
        }
        $sa = $saCheck['sa'];
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $sa['id'] ?? 'u_ubaid',
                'name' => $sa['name'] ?? 'Ubaid Ur Rehman (Platform Owner)',
                'username' => $sa['username'] ?? 'ubaid',
                'email' => $sa['email'] ?? 'ubaidurrehman2200230@gmail.com',
                'role' => 'SUPER_ADMIN',
                'active' => true
            ],
            'tenant' => null
        ]);
        exit();
    }

    $cleanPhone = preg_replace('/[^0-9]/', '', $identifier);

    $deletedList = dnReadUnifiedJson($deletedTenantsFile, 'deleted_tenants.json', []);
    foreach ($deletedList as $dt) {
        $dtSub = strtolower((string)($dt['subdomain'] ?? ''));
        $dtId = strtolower((string)($dt['id'] ?? ''));
        $dtPhone = preg_replace('/[^0-9]/', '', (string)($dt['phone'] ?? ''));
        $dtEmail = strtolower(trim((string)($dt['email'] ?? '')));

        if (($dtSub && $identifier === $dtSub) ||
            ($dtId && $identifier === $dtId) ||
            ($dtEmail && $identifier === $dtEmail) ||
            ($cleanPhone !== '' && $dtPhone !== '' && $cleanPhone === $dtPhone)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'This store account has been permanently deleted by administrator. Please register a new account.'
            ]);
            exit();
        }
    }

    $tenants = dnGetUnifiedTenants($dataDir);
    $effectivePlans = dnGetEffectivePricingPlans($dataDir);
    $matchedTenant = null;

    foreach ($tenants as $t) {
        $tSub = strtolower((string)($t['subdomain'] ?? ''));
        $tUser = strtolower((string)($t['adminUsername'] ?? ($t['adminUser']['username'] ?? '')));
        $tEmail = strtolower((string)($t['email'] ?? ($t['adminUser']['email'] ?? '')));
        $tPhone = preg_replace('/[^0-9]/', '', (string)($t['phone'] ?? ($t['adminUser']['phone'] ?? '')));

        if ($identifier === $tSub ||
            $identifier === $tUser ||
            ($tEmail !== '' && $identifier === $tEmail) ||
            ($cleanPhone !== '' && $tPhone !== '' && $cleanPhone === $tPhone)) {
            $matchedTenant = $t;
            break;
        }
    }

    if ($matchedTenant) {
        dnNormalizeTenantState($matchedTenant, $effectivePlans);
        $expectedPass = (string)($matchedTenant['adminPassword'] ?? ($matchedTenant['adminUser']['password'] ?? '123456'));
        if (!hash_equals($expectedPass, $password)) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Incorrect password for this account.']);
            exit();
        }
        if (!empty($matchedTenant['manualBlocked']) || strtoupper((string)($matchedTenant['status'] ?? '')) === 'BLOCKED') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'This store account has been suspended by the platform administrator. Please contact DigitalsNova support.'
            ]);
            exit();
        }

        $resolvedRole = $matchedTenant['adminUser']['role'] ?? (($matchedTenant['vertical'] ?? '') === 'CLINIC_HMS' ? 'CLINIC_ADMIN' : 'STORE_ADMIN');
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => 'u_' . ($matchedTenant['subdomain'] ?? 'admin'),
                'tenantId' => $matchedTenant['id'],
                'name' => $matchedTenant['adminName'] ?? ($matchedTenant['adminUser']['name'] ?? $matchedTenant['name'] . ' Admin'),
                'username' => $matchedTenant['adminUsername'] ?? ($matchedTenant['adminUser']['username'] ?? 'admin'),
                'email' => $matchedTenant['email'] ?? '',
                'phone' => $matchedTenant['phone'] ?? '',
                'role' => $resolvedRole,
                'subdomain' => $matchedTenant['subdomain'] ?? '',
                'vertical' => $matchedTenant['vertical'] ?? 'RETAIL_MART',
                'active' => true
            ],
            'tenant' => $matchedTenant
        ]);
        exit();
    }

    $allStaff = dnReadUnifiedJson($staffFile, 'staff.json', []);
    foreach ($allStaff as $s) {
        $sUser = strtolower((string)($s['username'] ?? ''));
        if ($identifier === $sUser) {
            if (!hash_equals((string)($s['password'] ?? '123'), $password)) {
                http_response_code(401);
                echo json_encode(['success' => false, 'error' => 'Incorrect password for staff account.']);
                exit();
            }
            if (isset($s['active']) && $s['active'] === false) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'This staff account has been suspended by your Store / Clinic Admin.']);
                exit();
            }
            $staffTenant = null;
            $sSub = strtolower((string)($s['subdomain'] ?? ''));
            $sTid = (string)($s['tenantId'] ?? '');
            foreach ($tenants as $t) {
                if (($sTid !== '' && ($t['id'] ?? '') === $sTid) || ($sSub !== '' && strtolower((string)($t['subdomain'] ?? '')) === $sSub)) {
                    $staffTenant = $t;
                    break;
                }
            }
            if ($staffTenant) {
                dnNormalizeTenantState($staffTenant, $effectivePlans);
                if (!empty($staffTenant['manualBlocked']) || strtoupper((string)($staffTenant['status'] ?? '')) === 'BLOCKED') {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'error' => 'Parent store account is suspended by platform administrator.']);
                    exit();
                }
            }
            echo json_encode([
                'success' => true,
                'user' => $s,
                'tenant' => $staffTenant ?: [
                    'id' => $sTid,
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

if ($action === 'send_recovery_otp') {
    $identifier = strtolower(trim((string)($body['identifier'] ?? '')));
    if ($identifier === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Please enter your registered Gmail, username, or phone number.']);
        exit();
    }

    $cleanPhone = preg_replace('/[^0-9]/', '', $identifier);
    $tenants = dnGetUnifiedTenants($dataDir);
    $allStaff = dnReadUnifiedJson($staffFile, 'staff.json', []);
    $sa = dnGetSuperAdmin($dataDir);

    $targetType = '';
    $targetId = '';
    $targetName = '';
    $targetEmail = '';
    $tenantId = '';

    $saAliases = array_map('strtolower', is_array($sa['aliases'] ?? null) ? $sa['aliases'] : ['ubaid', 'superadmin']);
    if ($identifier === strtolower((string)$sa['username']) || in_array($identifier, $saAliases, true) || $identifier === strtolower((string)$sa['email'])) {
        $targetType = 'SUPER_ADMIN';
        $targetId = $sa['id'];
        $targetName = $sa['name'];
        $targetEmail = $sa['email'];
    } else {
        foreach ($tenants as $t) {
            $tSub = strtolower((string)($t['subdomain'] ?? ''));
            $tUser = strtolower((string)($t['adminUsername'] ?? ($t['adminUser']['username'] ?? '')));
            $tEmail = strtolower(trim((string)($t['email'] ?? ($t['adminUser']['email'] ?? ''))));
            $tPhone = preg_replace('/[^0-9]/', '', (string)($t['phone'] ?? ($t['adminUser']['phone'] ?? '')));
            if ($identifier === $tSub || $identifier === $tUser || ($tEmail !== '' && $identifier === $tEmail) || ($cleanPhone !== '' && $tPhone === $cleanPhone)) {
                $targetType = 'TENANT';
                $targetId = $t['id'];
                $targetName = $t['name'] ?? $tSub;
                $targetEmail = $t['email'] ?? ($t['adminUser']['email'] ?? '');
                $tenantId = $t['id'];
                break;
            }
        }
        if ($targetType === '') {
            foreach ($allStaff as $s) {
                if (strtolower((string)($s['username'] ?? '')) === $identifier || strtolower((string)($s['email'] ?? '')) === $identifier) {
                    $targetType = 'STAFF';
                    $targetId = $s['id'];
                    $targetName = $s['name'] ?? $s['username'];
                    $targetEmail = $s['email'] ?? '';
                    $tenantId = $s['tenantId'] ?? '';
                    break;
                }
            }
        }
    }

    if ($targetType === '') {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'No registered account found with this username, email, or phone.']);
        exit();
    }

    if (empty($targetEmail) || !filter_var($targetEmail, FILTER_VALIDATE_EMAIL)) {
        $resets = dnReadUnifiedJson($passwordResetsFile, 'password_resets.json', []);
        $req = [
            'id' => 'pr_' . time() . '_' . rand(100, 999),
            'identifier' => $identifier,
            'tenantId' => $tenantId,
            'tenantName' => $targetName,
            'status' => 'PENDING',
            'createdAt' => date('c')
        ];
        array_unshift($resets, $req);
        dnWriteJsonFile($passwordResetsFile, array_slice($resets, 0, 50));
        syncToSecondaryDataDirs('password_resets.json', array_slice($resets, 0, 50));

        http_response_code(400);
        echo json_encode([
            'success' => false,
            'noEmail' => true,
            'ticketId' => $req['id'],
            'error' => 'No recovery email is saved on this account. A support ticket (#' . $req['id'] . ') was sent to your Administrator to reset your password.'
        ]);
        exit();
    }

    $tokens = dnReadJsonFile($otpTokensFile, []);
    $now = time();
    // Prune expired
    $tokens = array_values(array_filter($tokens, function($tk) use ($now) {
        return intval($tk['expiresAt'] ?? 0) > $now;
    }));

    foreach ($tokens as $tk) {
        if (($tk['targetId'] ?? '') === $targetId && ($now - intval($tk['createdAt'] ?? 0)) < 60) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Please wait 60 seconds before requesting another verification code.']);
            exit();
        }
    }

    $otp = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $salt = bin2hex(random_bytes(16));
    $hash = hash('sha256', $salt . ':' . $otp);

    $tokens = array_values(array_filter($tokens, function($tk) use ($targetId) {
        return ($tk['targetId'] ?? '') !== $targetId;
    }));
    $tokens[] = [
        'targetType' => $targetType,
        'targetId' => $targetId,
        'identifier' => $identifier,
        'email' => $targetEmail,
        'salt' => $salt,
        'hash' => $hash,
        'attempts' => 0,
        'createdAt' => $now,
        'expiresAt' => $now + 600
    ];
    dnWriteJsonFile($otpTokensFile, $tokens);

    $mailHtml = '<div style="font-family: Arial, sans-serif; background: #030712; color: #f8fafc; padding: 24px;">'
        . '<div style="max-width: 520px; margin: 0 auto; background: #0b132b; border: 1px solid #00e5ff; border-radius: 14px; padding: 24px;">'
        . '<h2 style="color: #00e5ff; margin-top: 0;">DigitalsNova Password Reset Code</h2>'
        . '<p>Use this 6-digit verification code to reset the password for <strong>' . htmlspecialchars($targetName) . '</strong>:</p>'
        . '<div style="background: #020617; border: 2px solid #f59e0b; border-radius: 10px; padding: 16px; text-align: center; font-family: monospace; font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #f59e0b;">' . $otp . '</div>'
        . '<p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">This code expires in 10 minutes. Do not share this code with anyone.</p></div></div>';
    dnSendGmailSmtp($targetEmail, 'DigitalsNova Password Recovery Code: ' . $otp, $mailHtml);

    $parts = explode('@', $targetEmail);
    $uPart = $parts[0] ?? 'user';
    $dPart = $parts[1] ?? 'gmail.com';
    $masked = strlen($uPart) <= 2 ? substr($uPart, 0, 1) . '*@' . $dPart : substr($uPart, 0, 2) . str_repeat('*', max(2, strlen($uPart) - 3)) . substr($uPart, -1) . '@' . $dPart;

    echo json_encode([
        'success' => true,
        'maskedEmail' => $masked,
        'expiresIn' => 600,
        'message' => "A 6-digit verification code has been emailed to {$masked}."
    ]);
    exit();
}

if ($action === 'verify_recovery_otp') {
    $identifier = strtolower(trim((string)($body['identifier'] ?? '')));
    $otpInput = trim((string)($body['otp'] ?? ($body['code'] ?? '')));
    $newPassword = (string)($body['newPassword'] ?? ($body['password'] ?? ''));

    if ($identifier === '' || $otpInput === '' || strlen($newPassword) < 3) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Please enter your 6-digit code and a new password (min 3 characters).']);
        exit();
    }

    $tokens = dnReadJsonFile($otpTokensFile, []);
    $now = time();
    $matchIdx = -1;
    foreach ($tokens as $i => $tk) {
        if (strtolower((string)($tk['identifier'] ?? '')) === $identifier && intval($tk['expiresAt'] ?? 0) > $now) {
            $matchIdx = $i;
            break;
        }
    }

    if ($matchIdx === -1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Verification code has expired or was not requested.']);
        exit();
    }

    $tk = $tokens[$matchIdx];
    if (intval($tk['attempts'] ?? 0) >= 5) {
        array_splice($tokens, $matchIdx, 1);
        dnWriteJsonFile($otpTokensFile, $tokens);
        http_response_code(429);
        echo json_encode(['success' => false, 'error' => 'Too many incorrect attempts. Please request a new code.']);
        exit();
    }

    $candidateHash = hash('sha256', ($tk['salt'] ?? '') . ':' . $otpInput);
    if (!hash_equals((string)($tk['hash'] ?? ''), $candidateHash)) {
        $tokens[$matchIdx]['attempts'] = intval($tk['attempts'] ?? 0) + 1;
        dnWriteJsonFile($otpTokensFile, $tokens);
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid verification code. Please check your email and try again.']);
        exit();
    }

    $resetUsername = $identifier;
    $tType = $tk['targetType'] ?? '';
    $tId = $tk['targetId'] ?? '';

    if ($tType === 'SUPER_ADMIN') {
        $sa = dnGetSuperAdmin($dataDir);
        $sa['passwordHash'] = password_hash($newPassword, PASSWORD_DEFAULT);
        $sa['updatedAt'] = date('c');
        dnSaveSuperAdmin($dataDir, $sa);
        $resetUsername = $sa['username'] ?? 'ubaid';
    } elseif ($tType === 'TENANT') {
        $tenants = dnGetUnifiedTenants($dataDir);
        $plans = dnGetEffectivePricingPlans($dataDir);
        foreach ($tenants as &$t) {
            if (($t['id'] ?? '') === $tId) {
                $t['adminPassword'] = $newPassword;
                if (!isset($t['adminUser']) || !is_array($t['adminUser'])) $t['adminUser'] = [];
                $t['adminUser']['password'] = $newPassword;
                $t['forceLogoutAt'] = intval(round(microtime(true) * 1000));
                dnNormalizeTenantState($t, $plans);
                $resetUsername = $t['adminUsername'] ?? ($t['subdomain'] ?? $identifier);
                break;
            }
        }
        unset($t);
        dnWriteJsonFile($tenantsFile, $tenants);
        syncToSecondaryDataDirs('tenants.json', $tenants);
    } elseif ($tType === 'STAFF') {
        $allStaff = dnReadUnifiedJson($staffFile, 'staff.json', []);
        foreach ($allStaff as &$s) {
            if (($s['id'] ?? '') === $tId) {
                $s['password'] = $newPassword;
                $resetUsername = $s['username'] ?? $identifier;
                break;
            }
        }
        unset($s);
        dnWriteJsonFile($staffFile, $allStaff);
        syncToSecondaryDataDirs('staff.json', $allStaff);
    }

    array_splice($tokens, $matchIdx, 1);
    dnWriteJsonFile($otpTokensFile, $tokens);

    echo json_encode([
        'success' => true,
        'username' => $resetUsername,
        'message' => 'Password updated successfully! You can now sign in with your new password.'
    ]);
    exit();
}

// ==============================================================================
// 7. STAFF MANAGEMENT
// ==============================================================================
if ($action === 'save_staff') {
    $staffItem = isset($body['staff']) && is_array($body['staff']) ? $body['staff'] : $body;
    $cleanUser = strtolower(trim((string)($staffItem['username'] ?? '')));
    if ($cleanUser === '' || dnIsReservedName($cleanUser)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid or reserved staff username.']);
        exit();
    }

    $tenants = dnGetUnifiedTenants($dataDir);
    foreach ($tenants as $t) {
        $tUser = strtolower(trim((string)($t['adminUsername'] ?? ($t['adminUser']['username'] ?? ''))));
        if ($tUser !== '' && $tUser === $cleanUser) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => "Username @{$cleanUser} is already used by an Admin account."]);
            exit();
        }
    }

    $allStaff = dnReadUnifiedJson($staffFile, 'staff.json', []);
    $incomingId = (string)($staffItem['id'] ?? '');
    $existingCreated = null;
    $filteredStaff = [];

    foreach ($allStaff as $s) {
        $sId = (string)($s['id'] ?? '');
        $sUser = strtolower(trim((string)($s['username'] ?? '')));
        if ($sUser === $cleanUser && ($incomingId === '' || $sId !== $incomingId)) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => "Staff username @{$cleanUser} already exists."]);
            exit();
        }
        if ($incomingId !== '' && $sId === $incomingId) {
            $existingCreated = $s['createdAt'] ?? null;
            continue;
        }
        $filteredStaff[] = $s;
    }

    $newStaff = [
        'id' => $incomingId !== '' ? $incomingId : ('staff_' . time()),
        'tenantId' => $staffItem['tenantId'] ?? '',
        'subdomain' => dnSanitizeSubdomain($staffItem['subdomain'] ?? ''),
        'name' => trim((string)($staffItem['name'] ?? 'POS Cashier')),
        'username' => $cleanUser,
        'password' => (string)($staffItem['password'] ?? '123'),
        'role' => !empty($staffItem['role']) ? strtoupper((string)$staffItem['role']) : 'STAFF',
        'active' => isset($staffItem['active']) ? (bool)$staffItem['active'] : true,
        'createdAt' => $existingCreated ?: (!empty($staffItem['createdAt']) ? $staffItem['createdAt'] : date('c'))
    ];

    $filteredStaff[] = $newStaff;
    dnWriteJsonFile($staffFile, $filteredStaff);
    syncToSecondaryDataDirs('staff.json', $filteredStaff);

    $deletedStaff = dnReadUnifiedJson($deletedStaffFile, 'deleted_staff.json', []);
    $deletedStaff = array_values(array_filter($deletedStaff, function($d) use ($newStaff) {
        return ($d['id'] ?? $d) !== $newStaff['id'];
    }));
    dnWriteJsonFile($deletedStaffFile, $deletedStaff);
    syncToSecondaryDataDirs('deleted_staff.json', $deletedStaff);

    echo json_encode(['success' => true, 'staff' => $newStaff]);
    exit();
}

if ($action === 'toggle_staff') {
    $staffId = trim((string)($body['id'] ?? ''));
    $active = isset($body['active']) ? (bool)$body['active'] : true;
    $allStaff = dnReadUnifiedJson($staffFile, 'staff.json', []);
    $updated = null;
    foreach ($allStaff as &$s) {
        if (($s['id'] ?? '') === $staffId || strtolower((string)($s['username'] ?? '')) === strtolower($staffId)) {
            $s['active'] = $active;
            $updated = $s;
            break;
        }
    }
    unset($s);
    dnWriteJsonFile($staffFile, $allStaff);
    syncToSecondaryDataDirs('staff.json', $allStaff);
    echo json_encode(['success' => true, 'staff' => $updated]);
    exit();
}

if ($action === 'delete_staff') {
    $staffId = trim((string)($body['id'] ?? ''));
    $allStaff = dnReadUnifiedJson($staffFile, 'staff.json', []);
    $remaining = array_values(array_filter($allStaff, function($s) use ($staffId) {
        return ($s['id'] ?? '') !== $staffId;
    }));
    dnWriteJsonFile($staffFile, $remaining);
    syncToSecondaryDataDirs('staff.json', $remaining);

    $deletedStaff = dnReadUnifiedJson($deletedStaffFile, 'deleted_staff.json', []);
    if (!in_array($staffId, $deletedStaff, true)) $deletedStaff[] = $staffId;
    dnWriteJsonFile($deletedStaffFile, $deletedStaff);
    syncToSecondaryDataDirs('deleted_staff.json', $deletedStaff);

    echo json_encode(['success' => true, 'deletedId' => $staffId]);
    exit();
}

if ($action === 'update_profile') {
    $role = strtoupper(trim((string)($body['role'] ?? '')));
    $tenantId = trim((string)($body['tenantId'] ?? ''));
    $subdomain = dnSanitizeSubdomain($body['subdomain'] ?? '');
    $userId = trim((string)($body['userId'] ?? ''));
    $newName = isset($body['name']) ? trim((string)$body['name']) : '';
    $newUsername = isset($body['username']) ? trim((string)$body['username']) : '';
    $newEmail = isset($body['email']) ? trim((string)$body['email']) : '';
    $newPass = isset($body['newPassword']) ? trim((string)$body['newPassword']) : (isset($body['password']) ? trim((string)$body['password']) : '');
    $currentPass = isset($body['currentPassword']) ? trim((string)$body['currentPassword']) : '';

    if ($role === 'SUPER_ADMIN') {
        $sa = dnGetSuperAdmin($dataDir);
        if ($newPass !== '' && $currentPass !== '' && !password_verify($currentPass, $sa['passwordHash'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Current Super Admin password is incorrect.']);
            exit();
        }
        if ($newName !== '') $sa['name'] = $newName;
        if ($newUsername !== '') $sa['username'] = strtolower($newUsername);
        if ($newEmail !== '' && filter_var($newEmail, FILTER_VALIDATE_EMAIL)) $sa['email'] = $newEmail;
        if ($newPass !== '') $sa['passwordHash'] = password_hash($newPass, PASSWORD_DEFAULT);
        $sa['updatedAt'] = date('c');
        dnSaveSuperAdmin($dataDir, $sa);
        echo json_encode([
            'success' => true,
            'role' => 'SUPER_ADMIN',
            'user' => [
                'id' => $sa['id'],
                'name' => $sa['name'],
                'username' => $sa['username'],
                'email' => $sa['email'],
                'role' => 'SUPER_ADMIN'
            ],
            'message' => 'Super Admin profile and password updated.'
        ]);
        exit();
    }

    if ($role === 'STAFF') {
        $allStaff = dnReadUnifiedJson($staffFile, 'staff.json', []);
        $updatedUser = null;
        foreach ($allStaff as &$s) {
            if (($userId !== '' && ($s['id'] ?? '') === $userId) ||
                ($newUsername !== '' && strtolower((string)($s['username'] ?? '')) === strtolower($newUsername))) {
                if ($newName !== '') $s['name'] = $newName;
                if ($newPass !== '') $s['password'] = $newPass;
                $updatedUser = $s;
                break;
            }
        }
        unset($s);
        dnWriteJsonFile($staffFile, $allStaff);
        syncToSecondaryDataDirs('staff.json', $allStaff);
        echo json_encode(['success' => true, 'user' => $updatedUser]);
        exit();
    }

    $tenants = dnGetUnifiedTenants($dataDir);
    $effectivePlans = dnGetEffectivePricingPlans($dataDir);
    $updatedTenant = null;
    foreach ($tenants as &$t) {
        if (($tenantId !== '' && ($t['id'] ?? '') === $tenantId) ||
            ($subdomain !== '' && strtolower((string)($t['subdomain'] ?? '')) === $subdomain)) {
            $profCredChanged = false;
            if ($newName !== '') $t['adminName'] = $newName;
            if ($newEmail !== '' && filter_var($newEmail, FILTER_VALIDATE_EMAIL)) $t['email'] = $newEmail;
            if ($newUsername !== '' && $newUsername !== trim((string)($t['adminUsername'] ?? ''))) {
                $t['adminUsername'] = $newUsername;
                $profCredChanged = true;
            }
            if ($newPass !== '' && $newPass !== (string)($t['adminPassword'] ?? '')) {
                $t['adminPassword'] = $newPass;
                $profCredChanged = true;
            }
            if ($profCredChanged) {
                $t['forceLogoutAt'] = intval(round(microtime(true) * 1000));
            }
            dnNormalizeTenantState($t, $effectivePlans);
            $updatedTenant = $t;
            break;
        }
    }
    unset($t);
    if ($updatedTenant) {
        dnWriteJsonFile($tenantsFile, $tenants);
        syncToSecondaryDataDirs('tenants.json', $tenants);
    }
    echo json_encode(['success' => true, 'tenant' => $updatedTenant]);
    exit();
}

if ($action === 'forgot_password') {
    $resets = dnReadUnifiedJson($passwordResetsFile, 'password_resets.json', []);
    $req = [
        'id' => 'pr_' . time() . '_' . rand(100, 999),
        'identifier' => trim((string)($body['identifier'] ?? '')),
        'tenantId' => trim((string)($body['tenantId'] ?? '')),
        'tenantName' => trim((string)($body['tenantName'] ?? '')),
        'status' => 'PENDING',
        'createdAt' => date('c')
    ];
    array_unshift($resets, $req);
    $resets = array_slice($resets, 0, 50);
    dnWriteJsonFile($passwordResetsFile, $resets);
    syncToSecondaryDataDirs('password_resets.json', $resets);
    echo json_encode(['success' => true, 'request' => $req]);
    exit();
}

if ($action === 'resolve_password_reset') {
    $reqId = trim((string)($body['id'] ?? ''));
    $newPass = trim((string)($body['newPassword'] ?? ''));
    $resets = dnReadUnifiedJson($passwordResetsFile, 'password_resets.json', []);
    $targetReq = null;
    foreach ($resets as &$r) {
        if (($r['id'] ?? '') === $reqId) {
            $r['status'] = strtoupper((string)($body['status'] ?? ($body['decision'] ?? 'RESOLVED')));
            $r['resolvedBy'] = $body['resolvedBy'] ?? 'Super Admin';
            $r['resolvedAt'] = date('c');
            $targetReq = $r;
            break;
        }
    }
    unset($r);
    dnWriteJsonFile($passwordResetsFile, $resets);
    syncToSecondaryDataDirs('password_resets.json', $resets);

    // Optional direct password reset from Admin/Super Admin
    if ($targetReq && $targetReq['status'] === 'RESOLVED' && $newPass !== '') {
        $ident = strtolower(trim((string)($targetReq['identifier'] ?? '')));
        $tenants = dnGetUnifiedTenants($dataDir);
        $plans = dnGetEffectivePricingPlans($dataDir);
        $tDirty = false;
        foreach ($tenants as &$t) {
            if (($targetReq['tenantId'] ?? '') === ($t['id'] ?? '') || strtolower((string)($t['subdomain'] ?? '')) === $ident || strtolower((string)($t['adminUsername'] ?? '')) === $ident) {
                $t['adminPassword'] = $newPass;
                $t['forceLogoutAt'] = intval(round(microtime(true) * 1000));
                dnNormalizeTenantState($t, $plans);
                $tDirty = true;
                break;
            }
        }
        unset($t);
        if ($tDirty) {
            dnWriteJsonFile($tenantsFile, $tenants);
            syncToSecondaryDataDirs('tenants.json', $tenants);
        } else {
            $allStaff = dnReadUnifiedJson($staffFile, 'staff.json', []);
            $sDirty = false;
            foreach ($allStaff as &$s) {
                if (strtolower((string)($s['username'] ?? '')) === $ident) {
                    $s['password'] = $newPass;
                    $sDirty = true;
                    break;
                }
            }
            unset($s);
            if ($sDirty) {
                dnWriteJsonFile($staffFile, $allStaff);
                syncToSecondaryDataDirs('staff.json', $allStaff);
            }
        }
    }

    echo json_encode(['success' => true]);
    exit();
}

// ==============================================================================
// 8. REMOTE CONFIG, PLATFORM BRAND & TENANT CONTROLS
// ==============================================================================
if ($action === 'get_platform_brand') {
    $brand = array_merge(dnGetDefaultPlatformBrand(), dnReadUnifiedJson($platformBrandFile, 'platform_brand.json', []));
    echo json_encode(['success' => true, 'platformBrand' => $brand]);
    exit();
}

if ($action === 'save_platform_brand') {
    $existing = array_merge(dnGetDefaultPlatformBrand(), dnReadUnifiedJson($platformBrandFile, 'platform_brand.json', []));
    $payload = isset($body['platformBrand']) && is_array($body['platformBrand']) ? $body['platformBrand'] : $body;
    $updated = [
        'name' => isset($payload['name']) ? trim((string)$payload['name']) : $existing['name'],
        'logoUrl' => isset($payload['logoUrl']) ? trim((string)$payload['logoUrl']) : $existing['logoUrl'],
        'tagline' => isset($payload['tagline']) ? trim((string)$payload['tagline']) : $existing['tagline'],
        'address' => isset($payload['address']) ? trim((string)$payload['address']) : $existing['address'],
        'phone' => isset($payload['phone']) ? trim((string)$payload['phone']) : $existing['phone'],
        'updatedAt' => date('c')
    ];
    dnWriteJsonFile($platformBrandFile, $updated);
    syncToSecondaryDataDirs('platform_brand.json', $updated);
    echo json_encode(['success' => true, 'platformBrand' => $updated, 'message' => 'Platform branding updated across all devices.']);
    exit();
}

if ($action === 'get_remote_config') {
    $cfg = array_merge(dnGetDefaultRemoteConfig(), dnReadUnifiedJson($remoteConfigFile, 'remote_config.json', []));
    echo json_encode(['success' => true, 'remoteConfig' => $cfg]);
    exit();
}

if ($action === 'save_remote_config') {
    $existing = array_merge(dnGetDefaultRemoteConfig(), dnReadUnifiedJson($remoteConfigFile, 'remote_config.json', []));
    $payload = isset($body['remoteConfig']) && is_array($body['remoteConfig']) ? $body['remoteConfig'] : $body;
    $updated = [
        'appVersion' => !empty($payload['appVersion']) ? trim((string)$payload['appVersion']) : ($existing['appVersion'] ?? '20261111v21'),
        'buildId' => !empty($payload['buildId']) ? trim((string)$payload['buildId']) : ($existing['buildId'] ?? '20261111v21'),
        'forceReloadAt' => !empty($payload['pushUpdate'])
            ? intval(round(microtime(true) * 1000))
            : (isset($payload['forceReloadAt']) ? intval($payload['forceReloadAt']) : intval($existing['forceReloadAt'] ?? 0)),
        'maintenanceMode' => isset($payload['maintenanceMode']) ? (bool)$payload['maintenanceMode'] : (bool)($existing['maintenanceMode'] ?? false),
        'maintenanceMessage' => isset($payload['maintenanceMessage']) ? trim((string)$payload['maintenanceMessage']) : ($existing['maintenanceMessage'] ?? ''),
        'globalNotice' => isset($payload['globalNotice']) ? trim((string)$payload['globalNotice']) : ($existing['globalNotice'] ?? ''),
        'globalNoticeType' => !empty($payload['globalNoticeType']) ? strtoupper(trim((string)$payload['globalNoticeType'])) : ($existing['globalNoticeType'] ?? 'INFO'),
        'globalNoticeActive' => isset($payload['globalNoticeActive']) ? (bool)$payload['globalNoticeActive'] : (bool)($existing['globalNoticeActive'] ?? false),
        'updatedAt' => date('c')
    ];
    dnWriteJsonFile($remoteConfigFile, $updated);
    syncToSecondaryDataDirs('remote_config.json', $updated);
    echo json_encode(['success' => true, 'remoteConfig' => $updated, 'message' => 'Remote configuration saved & pushed to all terminals.']);
    exit();
}

if ($action === 'update_tenant') {
    $updates = isset($body['updates']) && is_array($body['updates']) ? $body['updates'] : $body;
    $targetId = trim((string)($body['id'] ?? ($body['tenantId'] ?? ($updates['id'] ?? ($_GET['id'] ?? '')))));
    $targetSub = strtolower(trim((string)($body['subdomain'] ?? ($updates['subdomain'] ?? ($_GET['subdomain'] ?? '')))));

    if ($targetId === '' && $targetSub === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing tenant identifier']);
        exit();
    }

    $tenants = dnGetUnifiedTenants($dataDir);
    $effectivePlans = dnGetEffectivePricingPlans($dataDir);
    $matchedIndex = dnFindTenantMatch($tenants, $targetId, $targetSub);

    if ($matchedIndex === -1) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Tenant not found']);
        exit();
    }

    $t = &$tenants[$matchedIndex];
    $scalarFields = ['name', 'businessName', 'logoUrl', 'phone', 'whatsappNumber', 'address', 'email', 'receiptHeader', 'receiptFooter', 'smsApiUrl', 'smsApiKey', 'adminPin', 'planType', 'planName', 'activeLicenseKey', 'vertical', 'sector', 'storeType', 'businessType'];
    foreach ($scalarFields as $f) {
        if (array_key_exists($f, $updates) && $updates[$f] !== null) {
            $t[$f] = $updates[$f];
        }
    }
    if (isset($updates['name']) && !isset($updates['businessName'])) $t['businessName'] = $updates['name'];
    if (array_key_exists('smsEnabled', $updates)) $t['smsEnabled'] = (bool)$updates['smsEnabled'];
    if (array_key_exists('whatsappAutoDispatch', $updates)) $t['whatsappAutoDispatch'] = (bool)$updates['whatsappAutoDispatch'];
    if (isset($updates['cycleDays']) && is_numeric($updates['cycleDays']) && intval($updates['cycleDays']) > 0) {
        $t['cycleDays'] = intval($updates['cycleDays']);
    }
    if (isset($updates['monthlyFee']) && is_numeric($updates['monthlyFee'])) {
        $t['monthlyFee'] = floatval($updates['monthlyFee']);
        $t['monthly_fee'] = floatval($updates['monthlyFee']);
    }
    if (isset($updates['billingCycleDay']) && is_numeric($updates['billingCycleDay'])) {
        $newDay = max(1, intval($updates['billingCycleDay']));
        $t['billingCycleDay'] = $newDay;
        if ($newDay <= intval($t['cycleDays'] ?? 30) && !array_key_exists('subscriptionExpiry', $updates)) {
            $remDays = max(1, intval($t['cycleDays'] ?? 30) - $newDay + 1);
            $t['subscriptionExpiry'] = date('c', strtotime("+{$remDays} days"));
        }
    }
    if (isset($updates['planType']) && !isset($updates['planName'])) {
        $vertNow = $t['vertical'] ?? 'RETAIL_MART';
        $resolvedNew = dnResolveSectorPlanPricing($vertNow, $updates['planType'], $effectivePlans);
        $t['planName'] = $resolvedNew['planName'];
    }
    if (isset($updates['enabledModules']) && is_array($updates['enabledModules'])) {
        $t['enabledModules'] = array_merge(is_array($t['enabledModules'] ?? null) ? $t['enabledModules'] : [], $updates['enabledModules']);
    }

    $credsChanged = false;
    $prevUser = trim((string)($t['adminUsername'] ?? ($t['adminUser']['username'] ?? '')));
    $prevPass = (string)($t['adminPassword'] ?? ($t['adminUser']['password'] ?? ''));
    if (isset($updates['adminName'])) {
        $t['adminName'] = $updates['adminName'];
        if (!isset($t['adminUser']) || !is_array($t['adminUser'])) $t['adminUser'] = [];
        $t['adminUser']['name'] = $updates['adminName'];
    }
    if (isset($updates['adminUsername'])) {
        $newU = trim((string)$updates['adminUsername']);
        if ($newU !== '' && $newU !== $prevUser) { $credsChanged = true; $prevUser = $newU; }
        $t['adminUsername'] = $newU;
        if (!isset($t['adminUser']) || !is_array($t['adminUser'])) $t['adminUser'] = [];
        $t['adminUser']['username'] = $newU;
    }
    if (isset($updates['adminPassword'])) {
        $newP = (string)$updates['adminPassword'];
        if ($newP !== '' && $newP !== $prevPass) { $credsChanged = true; $prevPass = $newP; }
        $t['adminPassword'] = $newP;
        if (!isset($t['adminUser']) || !is_array($t['adminUser'])) $t['adminUser'] = [];
        $t['adminUser']['password'] = $newP;
    }
    if (isset($updates['adminUser']) && is_array($updates['adminUser'])) {
        $t['adminUser'] = array_merge(is_array($t['adminUser'] ?? null) ? $t['adminUser'] : [], $updates['adminUser']);
        if (isset($updates['adminUser']['name'])) $t['adminName'] = $updates['adminUser']['name'];
        if (isset($updates['adminUser']['username'])) {
            $u2 = trim((string)$updates['adminUser']['username']);
            if ($u2 !== '' && $u2 !== $prevUser) $credsChanged = true;
            $t['adminUsername'] = $u2;
        }
        if (isset($updates['adminUser']['password'])) {
            $p2 = (string)$updates['adminUser']['password'];
            if ($p2 !== '' && $p2 !== $prevPass) $credsChanged = true;
            $t['adminPassword'] = $p2;
        }
    }

    if (array_key_exists('manualBlocked', $updates)) {
        $t['manualBlocked'] = (bool)$updates['manualBlocked'];
        $t['status'] = $t['manualBlocked'] ? 'BLOCKED' : 'ACTIVE';
    } elseif (isset($updates['status'])) {
        $stUpper = strtoupper(trim((string)$updates['status']));
        $t['status'] = $stUpper;
        if ($stUpper === 'BLOCKED') $t['manualBlocked'] = true;
        elseif ($stUpper === 'ACTIVE') $t['manualBlocked'] = false;
    }

    if (isset($updates['forceLogoutAt'])) {
        $t['forceLogoutAt'] = intval($updates['forceLogoutAt']);
    } elseif ($credsChanged) {
        $t['forceLogoutAt'] = intval(round(microtime(true) * 1000));
    }

    dnNormalizeTenantState($t, $effectivePlans);
    $updatedTenant = $t;
    unset($t);

    dnWriteJsonFile($tenantsFile, $tenants);
    syncToSecondaryDataDirs('tenants.json', $tenants);

    echo json_encode(['success' => true, 'tenant' => $updatedTenant, 'message' => 'Tenant updated and pushed live!']);
    exit();
}

if ($action === 'unlock_tenant') {
    $targetId = trim((string)($body['tenantId'] ?? ($body['id'] ?? ($_GET['id'] ?? ''))));
    $targetSub = strtolower(trim((string)($body['subdomain'] ?? ($_GET['subdomain'] ?? ''))));
    $tenants = dnGetUnifiedTenants($dataDir);
    $effectivePlans = dnGetEffectivePricingPlans($dataDir);
    $matchedIndex = dnFindTenantMatch($tenants, $targetId, $targetSub);

    if ($matchedIndex === -1) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Tenant not found for unlock']);
        exit();
    }

    $t = &$tenants[$matchedIndex];
    $cycleDays = max(1, intval($t['cycleDays'] ?? 30));
    $validTs = strtotime("+{$cycleDays} days");
    $t['manualBlocked'] = false;
    $t['status'] = 'ACTIVE';
    $t['billingCycleDay'] = 1;
    $t['lastPaymentDate'] = date('c');
    $t['subscriptionExpiry'] = date('c', $validTs);
    if (!isset($t['subscription']) || !is_array($t['subscription'])) $t['subscription'] = [];
    $t['subscription']['billingCycleDay'] = 1;
    $t['subscription']['state'] = 'ACTIVE';
    $t['subscription']['validUntil'] = date('c', $validTs);
    $t['subscription']['validUntilFormatted'] = date('d M Y, h:i A', $validTs);
    dnNormalizeTenantState($t, $effectivePlans);
    $unlocked = $t;
    unset($t);

    dnWriteJsonFile($tenantsFile, $tenants);
    syncToSecondaryDataDirs('tenants.json', $tenants);

    echo json_encode(['success' => true, 'tenant' => $unlocked, 'message' => 'Store unlocked & restored to Day 1 active cycle.']);
    exit();
}

if ($action === 'run_midnight_cron') {
    $tenants = dnGetUnifiedTenants($dataDir);
    $effectivePlans = dnGetEffectivePricingPlans($dataDir);
    $graceCount = 0;
    $lockedCount = 0;

    foreach ($tenants as &$t) {
        if (!empty($t['manualBlocked']) || strtoupper((string)($t['status'] ?? '')) === 'BLOCKED') {
            dnNormalizeTenantState($t, $effectivePlans);
            $lockedCount++;
            continue;
        }
        $day = intval($t['billingCycleDay'] ?? 1) + 1;
        $t['billingCycleDay'] = $day;
        $totalDays = max(1, intval($t['cycleDays'] ?? 30));
        if ($day <= $totalDays) {
            $remDays = max(1, $totalDays - $day + 1);
            $t['subscriptionExpiry'] = date('c', strtotime("+{$remDays} days"));
        }
        dnNormalizeTenantState($t, $effectivePlans);
        $st = $t['subscription']['state'] ?? 'ACTIVE';
        if ($st === 'GRACE_PERIOD') $graceCount++;
        if ($st === 'LOCKED') $lockedCount++;
    }
    unset($t);

    dnWriteJsonFile($tenantsFile, $tenants);
    syncToSecondaryDataDirs('tenants.json', $tenants);

    $cronLogs = dnReadUnifiedJson($cronLogsFile, 'cron_logs.json', []);
    $entry = [
        'id' => 'cron_' . time(),
        'timestamp' => date('c'),
        'summary' => 'Advanced ' . count($tenants) . " tenant billing cycles (+1 Day). Grace: {$graceCount} • Locked: {$lockedCount}."
    ];
    array_unshift($cronLogs, $entry);
    $cronLogs = array_slice($cronLogs, 0, 50);
    dnWriteJsonFile($cronLogsFile, $cronLogs);
    syncToSecondaryDataDirs('cron_logs.json', $cronLogs);

    echo json_encode(['success' => true, 'log' => $entry, 'tenants' => $tenants]);
    exit();
}

// ==============================================================================
// 9. LICENSE KEYS & CARD CHECKOUT
// ==============================================================================
if ($action === 'generate_license_key') {
    $tenants = dnGetUnifiedTenants($dataDir);
    $effectivePlans = dnGetEffectivePricingPlans($dataDir);
    $tenantId = trim((string)($body['tenantId'] ?? ''));
    $idx = dnFindTenantMatch($tenants, $tenantId, '');
    $targetTenant = ($idx !== -1) ? $tenants[$idx] : null;

    $planType = strtoupper(trim((string)($body['planType'] ?? 'MONTHLY')));
    $vert = $targetTenant ? ($targetTenant['vertical'] ?? 'RETAIL_MART') : 'RETAIL_MART';
    $resolved = dnResolveSectorPlanPricing($vert, $planType, $effectivePlans);
    $cycleDays = isset($body['cycleDays']) && intval($body['cycleDays']) > 0 ? intval($body['cycleDays']) : $resolved['days'];
    $fee = isset($body['fee']) && is_numeric($body['fee']) ? floatval($body['fee']) : $resolved['fee'];
    $keyCode = 'DNOVA-' . strtoupper(substr(preg_replace('/[^A-Z0-9]/', '', $planType), 0, 4)) . '-' . strtoupper(bin2hex(random_bytes(3))) . '-' . strtoupper(bin2hex(random_bytes(2)));

    $newKey = [
        'id' => 'key_' . time() . '_' . rand(100, 999),
        'keyCode' => $keyCode,
        'tenantId' => $targetTenant ? $targetTenant['id'] : $tenantId,
        'tenantName' => $targetTenant ? $targetTenant['name'] : ($body['tenantName'] ?? 'Client Store'),
        'subdomain' => $targetTenant ? ($targetTenant['subdomain'] ?? '') : ($body['subdomain'] ?? ''),
        'planType' => $planType,
        'cycleDays' => $cycleDays,
        'fee' => $fee,
        'status' => 'READY',
        'notes' => $body['notes'] ?? 'Issued by Super Admin',
        'createdAt' => date('c')
    ];

    $keys = dnReadUnifiedJson($licenseKeysFile, 'license_keys.json', []);
    array_unshift($keys, $newKey);
    dnWriteJsonFile($licenseKeysFile, $keys);
    syncToSecondaryDataDirs('license_keys.json', $keys);

    echo json_encode(['success' => true, 'key' => $newKey]);
    exit();
}

if ($action === 'toggle_license_key') {
    $keyId = trim((string)($body['id'] ?? ($_GET['id'] ?? '')));
    $keys = dnReadUnifiedJson($licenseKeysFile, 'license_keys.json', []);
    $tenants = dnGetUnifiedTenants($dataDir);
    $effectivePlans = dnGetEffectivePricingPlans($dataDir);
    $updatedKey = null;
    $affectedTenant = null;

    foreach ($keys as &$k) {
        if (($k['id'] ?? '') === $keyId || strcasecmp((string)($k['keyCode'] ?? ''), $keyId) === 0) {
            $curSt = strtoupper((string)($k['status'] ?? 'READY'));
            $isRevoked = ($curSt === 'REVOKED' || $curSt === 'INACTIVE');
            $k['status'] = $isRevoked ? (!empty($k['activatedAt']) ? 'ACTIVATED' : 'READY') : 'REVOKED';
            $updatedKey = $k;

            $kCode = $k['keyCode'] ?? '';
            $kTid = $k['tenantId'] ?? '';
            foreach ($tenants as &$t) {
                if (($t['activeLicenseKey'] ?? '') === $kCode || (!empty($k['activatedAt']) && ($t['id'] ?? '') === $kTid)) {
                    $t['manualBlocked'] = ($k['status'] === 'REVOKED');
                    $t['status'] = ($k['status'] === 'REVOKED') ? 'BLOCKED' : 'ACTIVE';
                    dnNormalizeTenantState($t, $effectivePlans);
                    $affectedTenant = $t;
                }
            }
            unset($t);
            break;
        }
    }
    unset($k);

    if (!$updatedKey) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'License key not found']);
        exit();
    }

    dnWriteJsonFile($licenseKeysFile, $keys);
    syncToSecondaryDataDirs('license_keys.json', $keys);
    if ($affectedTenant) {
        dnWriteJsonFile($tenantsFile, $tenants);
        syncToSecondaryDataDirs('tenants.json', $tenants);
    }

    echo json_encode(['success' => true, 'key' => $updatedKey, 'tenant' => $affectedTenant]);
    exit();
}

if ($action === 'delete_license_key') {
    $keyId = trim((string)($body['id'] ?? ($_GET['id'] ?? '')));
    $keys = dnReadUnifiedJson($licenseKeysFile, 'license_keys.json', []);
    $remaining = array_values(array_filter($keys, function($k) use ($keyId) {
        return ($k['id'] ?? '') !== $keyId;
    }));
    dnWriteJsonFile($licenseKeysFile, $remaining);
    syncToSecondaryDataDirs('license_keys.json', $remaining);

    $delKeys = dnReadUnifiedJson($deletedLicenseKeysFile, 'deleted_license_keys.json', []);
    if (!in_array($keyId, $delKeys, true)) $delKeys[] = $keyId;
    dnWriteJsonFile($deletedLicenseKeysFile, $delKeys);
    syncToSecondaryDataDirs('deleted_license_keys.json', $delKeys);

    echo json_encode(['success' => true, 'deletedId' => $keyId]);
    exit();
}

if ($action === 'activate_license_key') {
    $keyCode = strtoupper(trim((string)($body['keyCode'] ?? '')));
    $targetId = trim((string)($body['tenantId'] ?? ''));
    $targetSub = strtolower(trim((string)($body['subdomain'] ?? '')));

    if ($keyCode === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Please enter a valid License Key code.']);
        exit();
    }

    $keys = dnReadUnifiedJson($licenseKeysFile, 'license_keys.json', []);
    $matchedKeyIdx = -1;
    foreach ($keys as $idx => $k) {
        if (strtoupper(trim((string)($k['keyCode'] ?? ''))) === $keyCode) {
            $matchedKeyIdx = $idx;
            break;
        }
    }
    if ($matchedKeyIdx === -1) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Invalid License Key. Please contact DigitalsNova HQ.']);
        exit();
    }
    $kStatus = strtoupper((string)($keys[$matchedKeyIdx]['status'] ?? 'READY'));
    if ($kStatus === 'REVOKED' || $kStatus === 'INACTIVE') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'This License Key has been revoked by Super Admin.']);
        exit();
    }

    $kTid = $keys[$matchedKeyIdx]['tenantId'] ?? '';
    $kSub = strtolower(trim((string)($keys[$matchedKeyIdx]['subdomain'] ?? '')));
    if ($kSub !== '' && $targetSub !== '' && $kSub !== $targetSub) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'This License Key is assigned to store subdomain "' . $kSub . '".']);
        exit();
    }

    $tenants = dnGetUnifiedTenants($dataDir);
    $effectivePlans = dnGetEffectivePricingPlans($dataDir);
    $tIdx = dnFindTenantMatch($tenants, $targetId ?: $kTid, $targetSub ?: $kSub);
    if ($tIdx === -1) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Target tenant store not found for activation.']);
        exit();
    }

    $days = max(1, intval($keys[$matchedKeyIdx]['cycleDays'] ?? 30));
    $fee = floatval($keys[$matchedKeyIdx]['fee'] ?? ($tenants[$tIdx]['monthlyFee'] ?? 4999));
    $planType = $keys[$matchedKeyIdx]['planType'] ?? 'MONTHLY';
    $expTs = strtotime("+{$days} days");

    $keys[$matchedKeyIdx]['status'] = 'ACTIVATED';
    $keys[$matchedKeyIdx]['activatedAt'] = date('c');
    $keys[$matchedKeyIdx]['tenantId'] = $tenants[$tIdx]['id'];
    $keys[$matchedKeyIdx]['subdomain'] = $tenants[$tIdx]['subdomain'];

    $tenants[$tIdx]['planType'] = $planType;
    $tenants[$tIdx]['cycleDays'] = $days;
    $tenants[$tIdx]['monthlyFee'] = $fee;
    $tenants[$tIdx]['monthly_fee'] = $fee;
    $tenants[$tIdx]['billingCycleDay'] = 1;
    $tenants[$tIdx]['manualBlocked'] = false;
    $tenants[$tIdx]['status'] = 'ACTIVE';
    $tenants[$tIdx]['activeLicenseKey'] = $keyCode;
    $tenants[$tIdx]['lastPaymentDate'] = date('c');
    $tenants[$tIdx]['subscriptionExpiry'] = date('c', $expTs);
    dnNormalizeTenantState($tenants[$tIdx], $effectivePlans);

    dnWriteJsonFile($licenseKeysFile, $keys);
    syncToSecondaryDataDirs('license_keys.json', $keys);
    dnWriteJsonFile($tenantsFile, $tenants);
    syncToSecondaryDataDirs('tenants.json', $tenants);

    echo json_encode([
        'success' => true,
        'message' => "License Key {$keyCode} verified & activated ({$days} days)!",
        'key' => $keys[$matchedKeyIdx],
        'tenant' => $tenants[$tIdx]
    ]);
    exit();
}

if ($action === 'deactivate_license_key') {
    $targetId = trim((string)($body['tenantId'] ?? ''));
    $targetSub = strtolower(trim((string)($body['subdomain'] ?? '')));
    $keyCode = strtoupper(trim((string)($body['keyCode'] ?? '')));

    $tenants = dnGetUnifiedTenants($dataDir);
    $effectivePlans = dnGetEffectivePricingPlans($dataDir);
    $keys = dnReadUnifiedJson($licenseKeysFile, 'license_keys.json', []);

    $idx = dnFindTenantMatch($tenants, $targetId, $targetSub);
    if ($idx !== -1) {
        $activeKey = strtoupper((string)($tenants[$idx]['activeLicenseKey'] ?: $keyCode));
        $tenants[$idx]['activeLicenseKey'] = '';
        $tenants[$idx]['manualBlocked'] = true;
        $tenants[$idx]['status'] = 'BLOCKED';
        dnNormalizeTenantState($tenants[$idx], $effectivePlans);
        if ($activeKey !== '') {
            foreach ($keys as &$k) {
                if (strtoupper((string)($k['keyCode'] ?? '')) === $activeKey) {
                    $k['status'] = 'REVOKED';
                }
            }
            unset($k);
        }
    }

    dnWriteJsonFile($licenseKeysFile, $keys);
    syncToSecondaryDataDirs('license_keys.json', $keys);
    dnWriteJsonFile($tenantsFile, $tenants);
    syncToSecondaryDataDirs('tenants.json', $tenants);

    echo json_encode(['success' => true, 'message' => 'License key revoked and portal locked.']);
    exit();
}

if ($action === 'card_checkout' || $action === 'stripe_checkout' || $action === 'subscription_payment') {
    require __DIR__ . '/stripe-checkout.php';
    exit();
}

// ==============================================================================
// 10. CROSS-DEVICE WIRELESS BARCODE SCANNER QUEUE (HTTP + BroadcastChannel)
// ==============================================================================
if ($action === 'push_scan') {
    $tid = trim((string)($body['tenantId'] ?? ($body['subdomain'] ?? ($_GET['tenantId'] ?? 'default'))));
    $barcode = trim((string)($body['barcode'] ?? ''));
    $deviceName = trim((string)($body['deviceName'] ?? 'Mobile Phone Scanner'));
    if ($barcode === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing barcode value']);
        exit();
    }
    $safeKey = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $tid) ?: 'default';
    $scanFile = $dataDir . '/scans/' . $safeKey . '.json';
    $nowMs = intval(round(microtime(true) * 1000));
    $cutoff = $nowMs - 120000;
    $scans = array_values(array_filter(dnReadJsonFile($scanFile, []), function($s) use ($cutoff) {
        return intval($s['timestamp'] ?? 0) > $cutoff;
    }));
    $entry = [
        'id' => 'sc_' . $nowMs . '_' . rand(100, 999),
        'barcode' => $barcode,
        'deviceName' => $deviceName,
        'timestamp' => $nowMs
    ];
    $scans[] = $entry;
    dnWriteJsonFile($scanFile, array_slice($scans, -50));
    echo json_encode(['success' => true, 'scan' => $entry]);
    exit();
}

if ($action === 'poll_scans') {
    $tid = trim((string)($_GET['tenantId'] ?? ($body['tenantId'] ?? 'default')));
    $since = intval($_GET['since'] ?? ($body['since'] ?? 0));
    $safeKey = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $tid) ?: 'default';
    $scanFile = $dataDir . '/scans/' . $safeKey . '.json';
    $nowMs = intval(round(microtime(true) * 1000));
    $cutoff = $nowMs - 120000;
    $scans = array_values(array_filter(dnReadJsonFile($scanFile, []), function($s) use ($cutoff) {
        return intval($s['timestamp'] ?? 0) > $cutoff;
    }));
    dnWriteJsonFile($scanFile, $scans);
    $newScans = array_values(array_filter($scans, function($s) use ($since) {
        return intval($s['timestamp'] ?? 0) > $since;
    }));
    echo json_encode(['success' => true, 'scans' => $newScans, 'serverTimeMs' => $nowMs]);
    exit();
}

// ==============================================================================
// 11. OFFLINE QUEUE SYNCHRONIZATION (Applies directly into Tenant Workspace!)
// ==============================================================================
if ($action === 'sync_offline_sales') {
    $sales = isset($body['sales']) && is_array($body['sales']) ? $body['sales'] : [];
    $tenants = dnGetUnifiedTenants($dataDir);
    $payments = dnReadUnifiedJson($paymentsFile, 'payments.json', []);
    $existingPayIds = [];
    foreach ($payments as $p) {
        if (!empty($p['id'])) $existingPayIds[$p['id']] = true;
    }

    $workspacesCache = [];
    $synced = 0;

    foreach ($sales as $sale) {
        if (!is_array($sale)) continue;
        $saleId = !empty($sale['id']) ? $sale['id'] : ('sale_offline_' . uniqid());
        $sub = dnSanitizeSubdomain($sale['subdomain'] ?? '');
        if ($sub === '' && !empty($sale['tenantId'])) {
            $idx = dnFindTenantMatch($tenants, $sale['tenantId'], '');
            if ($idx !== -1) $sub = dnSanitizeSubdomain($tenants[$idx]['subdomain'] ?? '');
        }
        if ($sub === '') $sub = 'default';

        if (!isset($workspacesCache[$sub])) {
            $workspacesCache[$sub] = dnLoadWorkspace($dataDir, $sub);
        }
        $ws = &$workspacesCache[$sub];

        $alreadyInWs = false;
        foreach ($ws['sales'] as $exS) {
            if (($exS['id'] ?? '') === $saleId) { $alreadyInWs = true; break; }
        }

        $subTotal = isset($sale['subtotal']) ? floatval($sale['subtotal']) : 0;
        $discAmt = isset($sale['discountAmount']) ? floatval($sale['discountAmount']) : 0;
        $netTotal = isset($sale['netTotal']) ? floatval($sale['netTotal']) : (isset($sale['total']) ? floatval($sale['total']) : max(0, $subTotal - $discAmt));
        $paidAmt = isset($sale['amountPaidToday']) ? floatval($sale['amountPaidToday']) : $netTotal;

        if (!$alreadyInWs) {
            $cleanSale = array_merge($sale, [
                'id' => $saleId,
                'subdomain' => $sub,
                'invoiceNumber' => $sale['invoiceNumber'] ?? ('INV-' . substr($saleId, -4)),
                'subtotal' => $subTotal > 0 ? $subTotal : $netTotal,
                'discountAmount' => $discAmt,
                'netTotal' => $netTotal,
                'amountPaidToday' => $paidAmt,
                'remainingLedgerBalance' => isset($sale['remainingLedgerBalance']) ? floatval($sale['remainingLedgerBalance']) : max(0, $netTotal - $paidAmt),
                'paymentMethod' => strtoupper((string)($sale['paymentMethod'] ?? 'CASH')),
                'status' => $sale['status'] ?? 'COMPLETED',
                'offlineQueued' => false,
                'syncedFromOffline' => true,
                'createdAt' => $sale['createdAt'] ?? ($sale['timestamp'] ?? date('c'))
            ]);
            array_unshift($ws['sales'], $cleanSale);

            // Deduct non-session stock
            if (!empty($sale['items']) && is_array($sale['items'])) {
                foreach ($sale['items'] as $item) {
                    if (strtoupper((string)($item['type'] ?? '')) === 'SESSION') continue;
                    $qty = max(1, floatval($item['qty'] ?? ($item['quantity'] ?? 1)));
                    foreach ($ws['inventory'] as &$inv) {
                        if ((!empty($item['id']) && ($inv['id'] ?? '') === $item['id']) ||
                            (!empty($item['barcode']) && ($inv['barcode'] ?? '') === $item['barcode'])) {
                            $inv['quantity'] = max(0, floatval($inv['quantity'] ?? 0) - $qty);
                            break;
                        }
                    }
                    unset($inv);
                }
            }

            if (is_array($ws['activeShift'] ?? null)) {
                $ws['activeShift']['totalSalesCount'] = intval($ws['activeShift']['totalSalesCount'] ?? 0) + 1;
                if ($cleanSale['paymentMethod'] === 'CASH') {
                    $ws['activeShift']['totalCashCollected'] = floatval($ws['activeShift']['totalCashCollected'] ?? 0) + $paidAmt;
                } else {
                    $ws['activeShift']['totalDigitalCollected'] = floatval($ws['activeShift']['totalDigitalCollected'] ?? 0) + $paidAmt;
                }
            }
            $synced++;
        }

        if (!isset($existingPayIds[$saleId])) {
            $existingPayIds[$saleId] = true;
            $payments[] = [
                'id' => $saleId,
                'tenantId' => $sale['tenantId'] ?? $sub,
                'subdomain' => $sub,
                'invoiceNumber' => $sale['invoiceNumber'] ?? ('OFF-' . substr($saleId, -6)),
                'patientName' => $sale['patientName'] ?? ($sale['customerName'] ?? 'Walk-in'),
                'amount' => $paidAmt,
                'method' => $sale['paymentMethod'] ?? 'CASH',
                'createdAt' => $sale['createdAt'] ?? date('c'),
                'syncedFromOffline' => true,
                'status' => 'COMPLETED'
            ];
        }
        unset($ws);
    }

    foreach ($workspacesCache as $subKey => $wsData) {
        dnSaveWorkspace($dataDir, $subKey, $wsData);
    }
    dnWriteJsonFile($paymentsFile, $payments);
    syncToSecondaryDataDirs('payments.json', $payments);

    echo json_encode(['success' => true, 'synced_count' => $synced, 'message' => "Successfully synced {$synced} offline sales into cloud workspace."]);
    exit();
}

if ($action === 'sync_offline_inventory') {
    $ops = isset($body['operations']) && is_array($body['operations']) ? $body['operations'] : (isset($body['items']) && is_array($body['items']) ? $body['items'] : []);
    $invSyncFile = $dataDir . '/inventory_sync.json';
    $existingOps = dnReadUnifiedJson($invSyncFile, 'inventory_sync.json', []);
    $seen = [];
    foreach ($existingOps as $eo) {
        if (!empty($eo['opId'])) $seen[$eo['opId']] = true;
    }

    $workspacesCache = [];
    $synced = 0;

    foreach ($ops as $op) {
        if (!is_array($op)) continue;
        $opId = !empty($op['opId']) ? $op['opId'] : (!empty($op['id']) ? $op['id'] : ('inv_offline_' . uniqid()));
        if (isset($seen[$opId])) continue;
        $seen[$opId] = true;

        $sub = dnSanitizeSubdomain($op['subdomain'] ?? '');
        if ($sub === '') $sub = 'default';
        if (!isset($workspacesCache[$sub])) {
            $workspacesCache[$sub] = dnLoadWorkspace($dataDir, $sub);
        }
        $ws = &$workspacesCache[$sub];
        $type = strtoupper((string)($op['type'] ?? 'UPSERT'));
        $payload = $op['payload'] ?? $op;

        $applyUpsert = function(&$invArr, $item) {
            if (!is_array($item) || empty($item['name'])) return;
            $itemId = $item['id'] ?? ('inv_' . time() . '_' . rand(100, 999));
            $barcode = $item['barcode'] ?? '';
            $found = -1;
            foreach ($invArr as $i => $cur) {
                if (($cur['id'] ?? '') === $itemId || ($barcode !== '' && ($cur['barcode'] ?? '') === $barcode)) {
                    $found = $i;
                    break;
                }
            }
            if ($found >= 0) {
                $invArr[$found] = array_merge($invArr[$found], $item);
            } else {
                $invArr[] = array_merge(['id' => $itemId, 'createdAt' => date('c')], $item);
            }
        };

        if ($type === 'BULK_UPSERT' && is_array($payload)) {
            foreach ($payload as $row) {
                $applyUpsert($ws['inventory'], $row);
            }
        } elseif ($type === 'UPSERT' || $type === 'UPDATE') {
            $applyUpsert($ws['inventory'], $payload);
        } elseif ($type === 'DELETE' && is_array($payload)) {
            $delId = $payload['id'] ?? '';
            $ws['inventory'] = array_values(array_filter($ws['inventory'], function($cur) use ($delId) {
                return ($cur['id'] ?? '') !== $delId;
            }));
        }
        unset($ws);

        $existingOps[] = [
            'opId' => $opId,
            'type' => $type,
            'subdomain' => $sub,
            'payload' => $payload,
            'offlineTimestamp' => $op['timestamp'] ?? date('c'),
            'serverTimestamp' => date('c')
        ];
        $synced++;
    }

    foreach ($workspacesCache as $subKey => $wsData) {
        dnSaveWorkspace($dataDir, $subKey, $wsData);
    }
    dnWriteJsonFile($invSyncFile, array_slice($existingOps, -500));
    syncToSecondaryDataDirs('inventory_sync.json', array_slice($existingOps, -500));

    echo json_encode(['success' => true, 'synced_count' => $synced, 'message' => "Successfully synced {$synced} offline inventory changes."]);
    exit();
}

// ==============================================================================
// 12. ISOLATED TENANT WORKSPACE ERP / POS / HMS MUTATION ENDPOINTS
// ==============================================================================
$wsActions = [
    'checkout_sale', 'park_cart', 'unpark_cart', 'open_shift', 'close_shift',
    'create_patient', 'delete_patient', 'create_treatment', 'pay_treatment_session', 'delete_treatment',
    'add_stock', 'update_stock', 'delete_stock', 'bulk_inventory', 'bulk_treatments',
    'add_catalog_treatment', 'delete_catalog_treatment',
    'verify_pin_discount', 'request_remote_discount', 'respond_discount_request',
    'refund_sale', 'delete_sale'
];

if (in_array($action, $wsActions, true)) {
    $tenants = dnGetUnifiedTenants($dataDir);
    $ctx = dnResolveWorkspaceContext($body, $tenants);
    $sub = $ctx['subdomain'];
    if ($sub === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing store subdomain for workspace operation.']);
        exit();
    }
    $tenant = $ctx['tenant'];
    $ws = dnLoadWorkspace($dataDir, $sub);

    // ----- POS CHECKOUT -----
    if ($action === 'checkout_sale') {
        $items = isset($body['items']) && is_array($body['items']) ? $body['items'] : [];
        if (empty($items)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Cannot finalize an empty cart.']);
            exit();
        }
        $saleId = !empty($body['id']) ? (string)$body['id'] : ('sale_' . time() . '_' . rand(100, 999));
        foreach ($ws['sales'] as $exS) {
            if (($exS['id'] ?? '') === $saleId) {
                echo json_encode(['success' => true, 'sale' => $exS, 'duplicate' => true]);
                exit();
            }
        }

        $subTotal = 0;
        $normItems = [];
        foreach ($items as $it) {
            $qty = max(1, floatval($it['qty'] ?? ($it['quantity'] ?? 1)));
            $unitPrice = floatval($it['unitPrice'] ?? ($it['price'] ?? 0));
            $lineTotal = round($qty * $unitPrice, 2);
            $subTotal += $lineTotal;
            $normItems[] = array_merge($it, [
                'qty' => $qty,
                'quantity' => $qty,
                'unitPrice' => $unitPrice,
                'subtotal' => $lineTotal
            ]);
        }

        $discAmt = max(0, floatval($body['discountAmount'] ?? 0));
        $netTotal = max(0, round($subTotal - $discAmt, 2));
        $paidToday = isset($body['amountPaidToday']) && $body['amountPaidToday'] !== ''
            ? max(0, floatval($body['amountPaidToday']))
            : $netTotal;
        $remaining = max(0, round($netTotal - $paidToday, 2));
        $payMethod = strtoupper((string)($body['paymentMethod'] ?? 'CASH'));

        $invNo = !empty($body['invoiceNumber']) ? (string)$body['invoiceNumber'] : ('INV-' . substr((string)time(), -4) . rand(10, 99));
        $patId = trim((string)($body['patientId'] ?? 'pat_walkin'));
        $matchedPat = null;
        foreach ($ws['patients'] as $p) {
            if (($p['id'] ?? '') === $patId) {
                $matchedPat = $p;
                break;
            }
        }
        $patCode = !empty($body['patientCode'])
            ? (string)$body['patientCode']
            : ($matchedPat ? (string)($matchedPat['patientCode'] ?? 'PAT') : (($patId === 'pat_walkin' || $patId === '') ? 'WALK-IN' : 'CUST'));

        $discountApprovedBy = !empty($body['discountApprovedBy']) ? (string)$body['discountApprovedBy'] : null;
        $discReqId = !empty($body['discountRequestId']) ? trim((string)$body['discountRequestId']) : '';
        if ($discReqId !== '' && isset($ws['discountRequests']) && is_array($ws['discountRequests'])) {
            foreach ($ws['discountRequests'] as &$dr) {
                if (($dr['id'] ?? '') === $discReqId) {
                    $dr['invoiceNumber'] = $invNo;
                    if ($discountApprovedBy === null && !empty($dr['approvedBy'])) {
                        $discountApprovedBy = (string)$dr['approvedBy'];
                    }
                    break;
                }
            }
            unset($dr);
        }
        if ($discAmt > 0 && $discountApprovedBy === null) {
            $discountApprovedBy = 'Admin';
        }

        $saleRecord = [
            'id' => $saleId,
            'tenantId' => $ctx['tenantId'] ?: ('tenant_' . $sub),
            'subdomain' => $sub,
            'invoiceNumber' => $invNo,
            'patientId' => $patId ?: 'pat_walkin',
            'patientCode' => $patCode,
            'patientName' => $body['patientName'] ?? ($body['walkInName'] ?? ($matchedPat ? $matchedPat['name'] : 'Walk-in Customer')),
            'patientPhone' => $body['patientPhone'] ?? ($body['walkInPhone'] ?? ($matchedPat ? $matchedPat['phone'] : '')),
            'cashierId' => $body['cashierId'] ?? 'u_staff',
            'cashierName' => $body['cashierName'] ?? 'POS Cashier',
            'items' => $normItems,
            'subtotal' => $subTotal,
            'discountAmount' => $discAmt,
            'discount' => $discAmt,
            'discountRequestId' => $body['discountRequestId'] ?? null,
            'discountApprovedBy' => $discountApprovedBy,
            'netTotal' => $netTotal,
            'total' => $netTotal,
            'amountPaidToday' => $paidToday,
            'paidAmount' => $paidToday,
            'remainingLedgerBalance' => $remaining,
            'dueAmount' => $remaining,
            'paymentMethod' => $payMethod,
            'tableNumber' => $body['tableNumber'] ?? null,
            'waiterName' => $body['waiterName'] ?? null,
            'orderType' => $body['orderType'] ?? 'RETAIL',
            'treatmentId' => $body['treatmentId'] ?? null,
            'status' => 'COMPLETED',
            'offlineQueued' => false,
            'createdAt' => date('c')
        ];

        // Deduct non-session stock
        foreach ($normItems as $item) {
            if (strtoupper((string)($item['type'] ?? '')) === 'SESSION') continue;
            $qty = floatval($item['qty']);
            foreach ($ws['inventory'] as &$inv) {
                if ((!empty($item['id']) && ($inv['id'] ?? '') === $item['id']) ||
                    (!empty($item['barcode']) && ($inv['barcode'] ?? '') === $item['barcode'])) {
                    $inv['quantity'] = max(0, floatval($inv['quantity'] ?? 0) - $qty);
                    break;
                }
            }
            unset($inv);
        }

        // Update linked patient balance or treatment ledger
        if (!empty($body['treatmentId'])) {
            foreach ($ws['treatments'] as &$tr) {
                if (($tr['id'] ?? '') === $body['treatmentId']) {
                    $tr['paidAmount'] = floatval($tr['paidAmount'] ?? 0) + $paidToday;
                    $tr['remainingBalance'] = max(0, floatval($tr['totalCost'] ?? 0) - $tr['paidAmount']);
                    $tr['status'] = ($tr['remainingBalance'] <= 0) ? 'COMPLETED' : 'IN_PROGRESS';
                    if (!isset($tr['sessions']) || !is_array($tr['sessions'])) $tr['sessions'] = [];
                    $tr['sessions'][] = [
                        'id' => 'ses_' . time(),
                        'sessionNumber' => count($tr['sessions']) + 1,
                        'amountPaid' => $paidToday,
                        'balanceAfter' => $tr['remainingBalance'],
                        'invoiceNumber' => $invNo,
                        'notes' => 'POS Checkout Payment (' . $invNo . ')',
                        'date' => date('c')
                    ];
                    $saleRecord['remainingLedgerBalance'] = $tr['remainingBalance'];
                    $saleRecord['dueAmount'] = $tr['remainingBalance'];
                    break;
                }
            }
            unset($tr);
        }

        array_unshift($ws['sales'], $saleRecord);
        $ws['sales'] = array_slice($ws['sales'], 0, 1000);

        if (is_array($ws['activeShift'] ?? null)) {
            $ws['activeShift']['totalSalesCount'] = intval($ws['activeShift']['totalSalesCount'] ?? 0) + 1;
            if ($payMethod === 'CASH') {
                $ws['activeShift']['totalCashCollected'] = floatval($ws['activeShift']['totalCashCollected'] ?? 0) + $paidToday;
            } else {
                $ws['activeShift']['totalDigitalCollected'] = floatval($ws['activeShift']['totalDigitalCollected'] ?? 0) + $paidToday;
            }
        }

        $storeDisplayName = !empty($tenant['name']) ? (string)$tenant['name'] : strtoupper($sub);
        $bizWhatsapp = trim((string)($tenant['whatsappNumber'] ?? ($tenant['phone'] ?? '')));
        $custPhone = trim((string)$saleRecord['patientPhone']);
        $autoDispatchOn = (($tenant['whatsappAutoDispatch'] ?? ($tenant['smsEnabled'] ?? true)) !== false);

        $itemLines = [];
        foreach ($normItems as $ni) {
            $iName = trim((string)($ni['name'] ?? 'Item'));
            $iQty = $ni['qty'];
            $iSub = number_format(floatval($ni['subtotal'] ?? 0));
            $itemLines[] = "• {$iName} x{$iQty} = Rs. {$iSub}";
        }
        $waText = "*{$storeDisplayName}* - Digital Invoice\n"
            . "Invoice: {$saleRecord['invoiceNumber']}\n"
            . "Customer: {$saleRecord['patientName']}\n"
            . "Items:\n" . implode("\n", $itemLines) . "\n"
            . ($discAmt > 0 ? "Discount: -Rs. " . number_format($discAmt) . "\n" : '')
            . "*Total Bill: Rs. " . number_format($netTotal) . "*\n"
            . "Paid: Rs. " . number_format($paidToday)
            . ($saleRecord['remainingLedgerBalance'] > 0 ? "\nBalance Due: Rs. " . number_format($saleRecord['remainingLedgerBalance']) : '')
            . ($bizWhatsapp !== '' ? "\nStore WhatsApp: {$bizWhatsapp}" : '')
            . "\n" . (!empty($tenant['receiptFooter']) ? (string)$tenant['receiptFooter'] : 'Thank you for your business!');

        $digitsOnly = preg_replace('/[^0-9]/', '', $custPhone);
        if (strlen($digitsOnly) === 11 && strpos($digitsOnly, '03') === 0) {
            $digitsOnly = '92' . substr($digitsOnly, 1);
        } elseif (strlen($digitsOnly) === 10 && strpos($digitsOnly, '3') === 0) {
            $digitsOnly = '92' . $digitsOnly;
        }
        $waLink = ($digitsOnly !== '' && strlen($digitsOnly) >= 10)
            ? ('https://wa.me/' . $digitsOnly . '?text=' . rawurlencode($waText))
            : '';

        $smsText = "Receipt {$saleRecord['invoiceNumber']}: Rs. " . number_format($netTotal) . " (Paid: Rs. " . number_format($paidToday) . ($saleRecord['remainingLedgerBalance'] > 0 ? ", Due: Rs. " . number_format($saleRecord['remainingLedgerBalance']) : '') . "). Thank you!";
        $smsStatus = ($autoDispatchOn && $custPhone !== '') ? 'AUTO_DISPATCHED' : 'QUEUED';
        $gwUrl = trim((string)($tenant['smsApiUrl'] ?? ''));
        $gwKey = trim((string)($tenant['smsApiKey'] ?? ''));
        if ($autoDispatchOn && $gwUrl !== '' && preg_match('#^https?://#i', $gwUrl) && $custPhone !== '') {
            $gwPayload = json_encode([
                'to' => $digitsOnly !== '' ? $digitsOnly : $custPhone,
                'recipientPhone' => $custPhone,
                'fromWhatsapp' => $bizWhatsapp,
                'storeName' => $storeDisplayName,
                'invoiceNumber' => $saleRecord['invoiceNumber'],
                'netTotal' => $netTotal,
                'paidToday' => $paidToday,
                'message' => $waText,
                'apiKey' => $gwKey
            ]);
            if (function_exists('curl_init')) {
                $ch = @curl_init($gwUrl);
                if ($ch) {
                    @curl_setopt($ch, CURLOPT_POST, true);
                    @curl_setopt($ch, CURLOPT_POSTFIELDS, $gwPayload);
                    @curl_setopt($ch, CURLOPT_HTTPHEADER, array_filter([
                        'Content-Type: application/json',
                        $gwKey !== '' ? ('Authorization: Bearer ' . $gwKey) : null
                    ]));
                    @curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    @curl_setopt($ch, CURLOPT_TIMEOUT, 3);
                    @curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 2);
                    @curl_exec($ch);
                    $httpCode = @curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    @curl_close($ch);
                    if ($httpCode >= 200 && $httpCode < 300) {
                        $smsStatus = 'GATEWAY_SENT';
                    }
                }
            }
        }

        $smsLog = [
            'id' => 'sms_' . time() . '_' . rand(10, 99),
            'to' => $custPhone,
            'recipientPhone' => $custPhone,
            'fromWhatsapp' => $bizWhatsapp,
            'patientName' => $saleRecord['patientName'],
            'invoiceNumber' => $saleRecord['invoiceNumber'],
            'message' => $waText,
            'shortMessage' => $smsText,
            'whatsappLink' => $waLink,
            'channel' => 'WHATSAPP_AUTO_BILLING',
            'status' => $smsStatus,
            'timestamp' => date('c'),
            'createdAt' => date('c')
        ];
        array_unshift($ws['smsLogs'], $smsLog);
        $ws['smsLogs'] = array_slice($ws['smsLogs'], 0, 200);

        array_unshift($ws['auditLogs'], [
            'id' => 'aud_' . time() . '_' . rand(10, 99),
            'action' => 'SALE_COMPLETED',
            'receiptId' => $saleRecord['invoiceNumber'],
            'actor' => $saleRecord['cashierName'],
            'staffName' => $saleRecord['cashierName'],
            'staffId' => $saleRecord['cashierId'],
            'approvingAdmin' => $discountApprovedBy ?: $saleRecord['cashierName'],
            'details' => "Invoice {$saleRecord['invoiceNumber']} • Net Rs. {$netTotal} • Paid Rs. {$paidToday} ({$payMethod})",
            'timestamp' => date('c'),
            'createdAt' => date('c')
        ]);
        $ws['auditLogs'] = array_slice($ws['auditLogs'], 0, 300);

        dnSaveWorkspace($dataDir, $sub, $ws);

        // Append to global payments ledger
        $payments = dnReadUnifiedJson($paymentsFile, 'payments.json', []);
        array_unshift($payments, [
            'id' => $saleId,
            'tenantId' => $saleRecord['tenantId'],
            'subdomain' => $sub,
            'invoiceNumber' => $saleRecord['invoiceNumber'],
            'patientName' => $saleRecord['patientName'],
            'amount' => $paidToday,
            'method' => $payMethod,
            'status' => 'COMPLETED',
            'createdAt' => $saleRecord['createdAt']
        ]);
        dnWriteJsonFile($paymentsFile, array_slice($payments, 0, 500));
        syncToSecondaryDataDirs('payments.json', array_slice($payments, 0, 500));

        echo json_encode(['success' => true, 'sale' => $saleRecord, 'smsLog' => $smsLog]);
        exit();
    }

    // ----- HOLD / PARK BILL -----
    if ($action === 'park_cart') {
        $park = [
            'id' => 'park_' . time() . '_' . rand(100, 999),
            'patientId' => $body['patientId'] ?? 'pat_walkin',
            'patientName' => $body['patientName'] ?? 'Walk-in Customer',
            'patientPhone' => $body['patientPhone'] ?? '',
            'walkInName' => $body['walkInName'] ?? '',
            'walkInPhone' => $body['walkInPhone'] ?? '',
            'items' => isset($body['items']) && is_array($body['items']) ? $body['items'] : [],
            'subtotal' => floatval($body['subtotal'] ?? 0),
            'discount' => floatval($body['discount'] ?? 0),
            'netTotal' => floatval($body['netTotal'] ?? 0),
            'cashierId' => $body['cashierId'] ?? 'u_staff',
            'cashierName' => $body['cashierName'] ?? 'Staff',
            'notes' => $body['notes'] ?? '',
            'createdAt' => date('c')
        ];
        array_unshift($ws['parkedSales'], $park);
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'parked' => $park]);
        exit();
    }

    if ($action === 'unpark_cart') {
        $parkId = trim((string)($body['id'] ?? ($_GET['id'] ?? '')));
        $ws['parkedSales'] = array_values(array_filter($ws['parkedSales'], function($p) use ($parkId) {
            return ($p['id'] ?? '') !== $parkId;
        }));
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'deletedId' => $parkId]);
        exit();
    }

    // ----- SHIFTS & Z-REPORT -----
    if ($action === 'open_shift') {
        $shift = [
            'id' => 'shift_' . time() . '_' . rand(10, 99),
            'code' => (string)rand(100, 999),
            'tenantId' => $ctx['tenantId'] ?: ('tenant_' . $sub),
            'subdomain' => $sub,
            'cashierId' => $body['cashierId'] ?? 'u_staff',
            'cashierName' => $body['cashierName'] ?? 'POS Cashier',
            'openingFloat' => floatval($body['openingFloat'] ?? 0),
            'openedAt' => date('c'),
            'status' => 'ACTIVE',
            'totalSalesCount' => 0,
            'totalCashCollected' => 0,
            'totalDigitalCollected' => 0
        ];
        $ws['activeShift'] = $shift;
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'shift' => $shift]);
        exit();
    }

    if ($action === 'close_shift') {
        $active = is_array($ws['activeShift'] ?? null) ? $ws['activeShift'] : [
            'id' => trim((string)($body['shiftId'] ?? ('shift_' . time()))),
            'code' => (string)rand(100, 999),
            'cashierName' => $body['cashierName'] ?? 'POS Cashier',
            'openingFloat' => 0,
            'openedAt' => date('c')
        ];
        $openTs = strtotime((string)($active['openedAt'] ?? date('c'))) ?: time();
        $cashCollected = 0;
        $digitalCollected = 0;
        $salesCount = 0;
        $grossSales = 0;
        $totalDiscounts = 0;
        $netSales = 0;
        $breakdown = [
            'CASH' => 0,
            'CARD' => 0,
            'BANK_TRANSFER' => 0
        ];

        foreach ($ws['sales'] as $s) {
            if (strtoupper((string)($s['status'] ?? '')) === 'REFUNDED') continue;
            $sTs = strtotime((string)($s['createdAt'] ?? '0')) ?: 0;
            if ($sTs >= ($openTs - 5)) {
                $salesCount++;
                $sDisc = floatval($s['discountAmount'] ?? ($s['discount'] ?? 0));
                $sNet = floatval($s['netTotal'] ?? ($s['total'] ?? 0));
                $sSub = isset($s['subtotal']) ? floatval($s['subtotal']) : ($sNet + $sDisc);
                $grossSales += $sSub;
                $totalDiscounts += $sDisc;
                $netSales += $sNet;
                $paid = floatval($s['amountPaidToday'] ?? $sNet);
                $pm = strtoupper((string)($s['paymentMethod'] ?? 'CASH'));
                if ($pm === 'CASH') {
                    $cashCollected += $paid;
                    $breakdown['CASH'] += $paid;
                } elseif ($pm === 'CARD') {
                    $digitalCollected += $paid;
                    $breakdown['CARD'] += $paid;
                } else {
                    $digitalCollected += $paid;
                    $breakdown['BANK_TRANSFER'] += $paid;
                }
            }
        }

        $openingFloat = round(floatval($active['openingFloat'] ?? 0), 2);
        $netCash = max(round($cashCollected, 2), round(floatval($active['totalCashCollected'] ?? 0), 2));
        $digitalTot = max(round($digitalCollected, 2), round(floatval($active['totalDigitalCollected'] ?? 0), 2));
        $expectedCash = round($openingFloat + $netCash, 2);
        $actualCash = round(floatval($body['actualCashCounted'] ?? 0), 2);
        $diff = round($actualCash - $expectedCash, 2);
        $notes = trim((string)($body['notes'] ?? ($body['closingNotes'] ?? '')));

        $closed = array_merge($active, [
            'closedAt' => date('c'),
            'salesCount' => max($salesCount, intval($active['totalSalesCount'] ?? 0)),
            'totalSalesCount' => max($salesCount, intval($active['totalSalesCount'] ?? 0)),
            'grossSales' => round($grossSales, 2),
            'totalDiscounts' => round($totalDiscounts, 2),
            'netSales' => round($netSales, 2),
            'paymentBreakdown' => [
                'CASH' => round($breakdown['CASH'], 2),
                'CARD' => round($breakdown['CARD'], 2),
                'BANK_TRANSFER' => round($breakdown['BANK_TRANSFER'], 2)
            ],
            'netCashCollected' => $netCash,
            'totalCashCollected' => $netCash,
            'totalDigitalCollected' => $digitalTot,
            'expectedCashInDrawer' => $expectedCash,
            'expectedCash' => $expectedCash,
            'actualCashCounted' => $actualCash,
            'difference' => $diff,
            'discrepancy' => $diff,
            'notes' => $notes,
            'closingNotes' => $notes,
            'status' => 'CLOSED'
        ]);
        array_unshift($ws['closedShifts'], $closed);
        $ws['closedShifts'] = array_slice($ws['closedShifts'], 0, 100);
        $ws['activeShift'] = null;
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'shift' => $closed]);
        exit();
    }

    // ----- PATIENTS & TREATMENTS -----
    if ($action === 'create_patient') {
        $name = trim((string)($body['name'] ?? ''));
        $phone = trim((string)($body['phone'] ?? ''));
        if ($name === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Patient name is required.']);
            exit();
        }
        $pat = [
            'id' => 'pat_' . time() . '_' . rand(100, 999),
            'patientCode' => 'PAT-' . rand(1000, 9999),
            'name' => $name,
            'phone' => $phone,
            'age' => $body['age'] ?? '',
            'gender' => $body['gender'] ?? 'Male',
            'balance' => 0,
            'createdAt' => date('c')
        ];
        array_unshift($ws['patients'], $pat);
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'patient' => $pat]);
        exit();
    }

    if ($action === 'delete_patient') {
        $patId = trim((string)($body['id'] ?? ($_GET['id'] ?? '')));
        $ws['patients'] = array_values(array_filter($ws['patients'], function($p) use ($patId) {
            return ($p['id'] ?? '') !== $patId;
        }));
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'deletedId' => $patId]);
        exit();
    }

    if ($action === 'create_treatment') {
        $patId = trim((string)($body['patientId'] ?? ''));
        $pat = null;
        foreach ($ws['patients'] as $p) {
            if (($p['id'] ?? '') === $patId) { $pat = $p; break; }
        }
        $totalCost = max(0, floatval($body['totalCost'] ?? 0));
        $initialPaid = max(0, floatval($body['initialPaid'] ?? 0));
        $rem = max(0, round($totalCost - $initialPaid, 2));
        $invNo = 'INV-' . substr((string)time(), -4) . rand(10, 99);
        $trId = 'tr_' . time() . '_' . rand(100, 999);
        $patName = $pat ? $pat['name'] : ($body['patientName'] ?? 'Patient');
        $patPhone = $pat ? ($pat['phone'] ?? '') : ($body['patientPhone'] ?? '');
        $patCode = $pat ? ($pat['patientCode'] ?? 'PAT') : 'PAT';
        $title = trim((string)($body['title'] ?? 'Clinical Treatment'));
        $cashierName = trim((string)($body['cashierName'] ?? 'Receptionist POS'));
        $payMethod = strtoupper((string)($body['paymentMethod'] ?? 'CASH'));

        $tr = [
            'id' => $trId,
            'patientId' => $patId,
            'patientName' => $patName,
            'patientPhone' => $patPhone,
            'patientCode' => $patCode,
            'title' => $title,
            'totalCost' => $totalCost,
            'paidAmount' => $initialPaid,
            'remainingBalance' => $rem,
            'totalSessions' => max(1, intval($body['totalSessions'] ?? 1)),
            'status' => ($rem <= 0 ? 'COMPLETED' : 'IN_PROGRESS'),
            'sessions' => [[
                'id' => 'ses_' . time(),
                'sessionNumber' => 1,
                'amountPaid' => $initialPaid,
                'balanceAfter' => $rem,
                'invoiceNumber' => $invNo,
                'notes' => $body['notes'] ?? 'Initial session',
                'date' => !empty($body['sessionDate']) ? $body['sessionDate'] : date('c')
            ]],
            'createdAt' => date('c')
        ];
        array_unshift($ws['treatments'], $tr);

        $saleRecord = null;
        $smsLog = null;
        if ($initialPaid > 0) {
            $saleId = 'sale_' . time() . '_' . rand(100, 999);
            $saleRecord = [
                'id' => $saleId,
                'tenantId' => $ctx['tenantId'] ?: ('tenant_' . $sub),
                'subdomain' => $sub,
                'invoiceNumber' => $invNo,
                'patientId' => $patId ?: 'pat_walkin',
                'patientCode' => $patCode,
                'patientName' => $patName,
                'patientPhone' => $patPhone,
                'cashierId' => $body['cashierId'] ?? 'u_staff',
                'cashierName' => $cashierName,
                'items' => [[
                    'id' => $trId,
                    'name' => $title . ' (Session #1)',
                    'qty' => 1,
                    'quantity' => 1,
                    'unitPrice' => $initialPaid,
                    'price' => $initialPaid,
                    'subtotal' => $initialPaid,
                    'type' => 'SESSION'
                ]],
                'subtotal' => $initialPaid,
                'discountAmount' => 0,
                'discount' => 0,
                'discountApprovedBy' => null,
                'netTotal' => $initialPaid,
                'total' => $initialPaid,
                'amountPaidToday' => $initialPaid,
                'paidAmount' => $initialPaid,
                'remainingLedgerBalance' => $rem,
                'dueAmount' => $rem,
                'paymentMethod' => $payMethod,
                'orderType' => 'SESSION',
                'treatmentId' => $trId,
                'status' => 'COMPLETED',
                'offlineQueued' => false,
                'createdAt' => date('c')
            ];
            array_unshift($ws['sales'], $saleRecord);
            $ws['sales'] = array_slice($ws['sales'], 0, 1000);

            if (is_array($ws['activeShift'] ?? null)) {
                $ws['activeShift']['totalSalesCount'] = intval($ws['activeShift']['totalSalesCount'] ?? 0) + 1;
                if ($payMethod === 'CASH') {
                    $ws['activeShift']['totalCashCollected'] = floatval($ws['activeShift']['totalCashCollected'] ?? 0) + $initialPaid;
                } else {
                    $ws['activeShift']['totalDigitalCollected'] = floatval($ws['activeShift']['totalDigitalCollected'] ?? 0) + $initialPaid;
                }
            }

            $smsText = "Receipt {$invNo} ({$title} Session #1): Paid Rs. " . number_format($initialPaid) . ($rem > 0 ? ", Remaining Balance: Rs. " . number_format($rem) : ", Account Settled") . ". Thank you!";
            $smsLog = [
                'id' => 'sms_' . time() . '_' . rand(10, 99),
                'to' => $patPhone,
                'recipientPhone' => $patPhone,
                'patientName' => $patName,
                'message' => $smsText,
                'status' => 'QUEUED',
                'timestamp' => date('c'),
                'createdAt' => date('c')
            ];
            array_unshift($ws['smsLogs'], $smsLog);
            $ws['smsLogs'] = array_slice($ws['smsLogs'], 0, 200);

            array_unshift($ws['auditLogs'], [
                'id' => 'aud_' . time() . '_' . rand(10, 99),
                'action' => 'TREATMENT_SESSION_PAID',
                'receiptId' => $invNo,
                'actor' => $cashierName,
                'staffName' => $cashierName,
                'staffId' => $body['cashierId'] ?? 'u_staff',
                'approvingAdmin' => $cashierName,
                'details' => "Created treatment '{$title}' for {$patName} • Session #1 Paid Rs. {$initialPaid} • Bal Rs. {$rem}",
                'timestamp' => date('c'),
                'createdAt' => date('c')
            ]);
            $ws['auditLogs'] = array_slice($ws['auditLogs'], 0, 300);

            $payments = dnReadUnifiedJson($paymentsFile, 'payments.json', []);
            array_unshift($payments, [
                'id' => $saleId,
                'tenantId' => $saleRecord['tenantId'],
                'subdomain' => $sub,
                'invoiceNumber' => $invNo,
                'patientName' => $patName,
                'amount' => $initialPaid,
                'method' => $payMethod,
                'status' => 'COMPLETED',
                'createdAt' => $saleRecord['createdAt']
            ]);
            dnWriteJsonFile($paymentsFile, array_slice($payments, 0, 500));
            syncToSecondaryDataDirs('payments.json', array_slice($payments, 0, 500));
        }

        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'treatment' => $tr, 'sale' => $saleRecord, 'smsLog' => $smsLog]);
        exit();
    }

    if ($action === 'pay_treatment_session') {
        $trId = trim((string)($body['id'] ?? ($_GET['id'] ?? '')));
        $amt = max(0, floatval($body['amountPaid'] ?? 0));
        $cashierName = trim((string)($body['cashierName'] ?? 'Receptionist POS'));
        $payMethod = strtoupper((string)($body['paymentMethod'] ?? 'CASH'));
        $invNo = 'INV-' . substr((string)time(), -4) . rand(10, 99);
        $updated = null;
        $sesNum = 1;
        foreach ($ws['treatments'] as &$tr) {
            if (($tr['id'] ?? '') === $trId) {
                if (!isset($tr['sessions']) || !is_array($tr['sessions'])) $tr['sessions'] = [];
                $sesNum = count($tr['sessions']) + 1;
                $tr['paidAmount'] = floatval($tr['paidAmount'] ?? 0) + $amt;
                $tr['remainingBalance'] = max(0, round(floatval($tr['totalCost'] ?? 0) - $tr['paidAmount'], 2));
                $tr['status'] = ($tr['remainingBalance'] <= 0) ? 'COMPLETED' : 'IN_PROGRESS';
                $tr['sessions'][] = [
                    'id' => 'ses_' . time() . '_' . rand(10, 99),
                    'sessionNumber' => $sesNum,
                    'amountPaid' => $amt,
                    'balanceAfter' => $tr['remainingBalance'],
                    'invoiceNumber' => $invNo,
                    'notes' => $body['notes'] ?? 'Follow-up session',
                    'date' => !empty($body['sessionDate']) ? $body['sessionDate'] : date('c')
                ];
                $updated = $tr;
                break;
            }
        }
        unset($tr);
        if (!$updated) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Treatment record not found.']);
            exit();
        }

        $saleRecord = null;
        $smsLog = null;
        if ($amt > 0) {
            $saleId = 'sale_' . time() . '_' . rand(100, 999);
            $patName = $updated['patientName'] ?? 'Patient';
            $patPhone = $updated['patientPhone'] ?? '';
            $patCode = $updated['patientCode'] ?? 'PAT';
            $rem = floatval($updated['remainingBalance'] ?? 0);
            $saleRecord = [
                'id' => $saleId,
                'tenantId' => $ctx['tenantId'] ?: ('tenant_' . $sub),
                'subdomain' => $sub,
                'invoiceNumber' => $invNo,
                'patientId' => $updated['patientId'] ?? 'pat_walkin',
                'patientCode' => $patCode,
                'patientName' => $patName,
                'patientPhone' => $patPhone,
                'cashierId' => $body['cashierId'] ?? 'u_staff',
                'cashierName' => $cashierName,
                'items' => [[
                    'id' => $updated['id'],
                    'name' => ($updated['title'] ?? 'Treatment') . ' (Session #' . $sesNum . ')',
                    'qty' => 1,
                    'quantity' => 1,
                    'unitPrice' => $amt,
                    'price' => $amt,
                    'subtotal' => $amt,
                    'type' => 'SESSION'
                ]],
                'subtotal' => $amt,
                'discountAmount' => 0,
                'discount' => 0,
                'discountApprovedBy' => null,
                'netTotal' => $amt,
                'total' => $amt,
                'amountPaidToday' => $amt,
                'paidAmount' => $amt,
                'remainingLedgerBalance' => $rem,
                'dueAmount' => $rem,
                'paymentMethod' => $payMethod,
                'orderType' => 'SESSION',
                'treatmentId' => $updated['id'],
                'status' => 'COMPLETED',
                'offlineQueued' => false,
                'createdAt' => date('c')
            ];
            array_unshift($ws['sales'], $saleRecord);
            $ws['sales'] = array_slice($ws['sales'], 0, 1000);

            if (is_array($ws['activeShift'] ?? null)) {
                $ws['activeShift']['totalSalesCount'] = intval($ws['activeShift']['totalSalesCount'] ?? 0) + 1;
                if ($payMethod === 'CASH') {
                    $ws['activeShift']['totalCashCollected'] = floatval($ws['activeShift']['totalCashCollected'] ?? 0) + $amt;
                } else {
                    $ws['activeShift']['totalDigitalCollected'] = floatval($ws['activeShift']['totalDigitalCollected'] ?? 0) + $amt;
                }
            }

            $smsText = "Receipt {$invNo} ({$updated['title']} Session #{$sesNum}): Paid Rs. " . number_format($amt) . ($rem > 0 ? ", Remaining Balance: Rs. " . number_format($rem) : ", Account Settled") . ". Thank you!";
            $smsLog = [
                'id' => 'sms_' . time() . '_' . rand(10, 99),
                'to' => $patPhone,
                'recipientPhone' => $patPhone,
                'patientName' => $patName,
                'message' => $smsText,
                'status' => 'QUEUED',
                'timestamp' => date('c'),
                'createdAt' => date('c')
            ];
            array_unshift($ws['smsLogs'], $smsLog);
            $ws['smsLogs'] = array_slice($ws['smsLogs'], 0, 200);

            array_unshift($ws['auditLogs'], [
                'id' => 'aud_' . time() . '_' . rand(10, 99),
                'action' => 'TREATMENT_SESSION_PAID',
                'receiptId' => $invNo,
                'actor' => $cashierName,
                'staffName' => $cashierName,
                'staffId' => $body['cashierId'] ?? 'u_staff',
                'approvingAdmin' => $cashierName,
                'details' => "Session #{$sesNum} Paid Rs. {$amt} for {$patName} ({$updated['title']}) • Bal After Rs. {$rem}",
                'timestamp' => date('c'),
                'createdAt' => date('c')
            ]);
            $ws['auditLogs'] = array_slice($ws['auditLogs'], 0, 300);

            $payments = dnReadUnifiedJson($paymentsFile, 'payments.json', []);
            array_unshift($payments, [
                'id' => $saleId,
                'tenantId' => $saleRecord['tenantId'],
                'subdomain' => $sub,
                'invoiceNumber' => $invNo,
                'patientName' => $patName,
                'amount' => $amt,
                'method' => $payMethod,
                'status' => 'COMPLETED',
                'createdAt' => $saleRecord['createdAt']
            ]);
            dnWriteJsonFile($paymentsFile, array_slice($payments, 0, 500));
            syncToSecondaryDataDirs('payments.json', array_slice($payments, 0, 500));
        }

        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'treatment' => $updated, 'sale' => $saleRecord, 'smsLog' => $smsLog]);
        exit();
    }

    if ($action === 'delete_treatment') {
        $trId = trim((string)($body['id'] ?? ($_GET['id'] ?? '')));
        $ws['treatments'] = array_values(array_filter($ws['treatments'], function($tr) use ($trId) {
            return ($tr['id'] ?? '') !== $trId;
        }));
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'deletedId' => $trId]);
        exit();
    }

    // ----- INVENTORY & TREATMENT CATALOG -----
    if ($action === 'add_stock') {
        $item = [
            'id' => !empty($body['id']) ? $body['id'] : ('inv_' . time() . '_' . rand(10, 99)),
            'tenantId' => $ctx['tenantId'] ?: ('tenant_' . $sub),
            'subdomain' => $sub,
            'barcode' => trim((string)($body['barcode'] ?? (string)rand(100000000, 999999999))),
            'name' => trim((string)($body['name'] ?? 'Product')),
            'category' => trim((string)($body['category'] ?? 'General')),
            'supplier' => trim((string)($body['supplier'] ?? ($tenant['name'] ?? 'Supplier'))),
            'quantity' => floatval($body['quantity'] ?? 0),
            'minStockAlert' => floatval($body['minStockAlert'] ?? 10),
            'purchasePrice' => floatval($body['purchasePrice'] ?? 0),
            'sellingPrice' => floatval($body['sellingPrice'] ?? 0),
            'imageUrl' => $body['imageUrl'] ?? '',
            'description' => $body['description'] ?? '',
            'unit' => $body['unit'] ?? 'Pcs',
            'expiryDate' => $body['expiryDate'] ?? '',
            'createdAt' => date('c')
        ];
        $ws['inventory'][] = $item;
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'item' => $item]);
        exit();
    }

    if ($action === 'update_stock') {
        $itemId = trim((string)($body['id'] ?? ($_GET['id'] ?? '')));
        $updates = isset($body['updates']) && is_array($body['updates']) ? $body['updates'] : $body;
        unset($updates['action'], $updates['subdomain'], $updates['tenantId']);
        $updated = null;
        foreach ($ws['inventory'] as &$inv) {
            if (($inv['id'] ?? '') === $itemId) {
                $inv = array_merge($inv, $updates);
                $updated = $inv;
                break;
            }
        }
        unset($inv);
        if (!$updated) {
            $updated = array_merge(['id' => $itemId, 'subdomain' => $sub, 'createdAt' => date('c')], $updates);
            $ws['inventory'][] = $updated;
        }
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'item' => $updated]);
        exit();
    }

    if ($action === 'delete_stock') {
        $itemId = trim((string)($body['id'] ?? ($_GET['id'] ?? '')));
        $ws['inventory'] = array_values(array_filter($ws['inventory'], function($inv) use ($itemId) {
            return ($inv['id'] ?? '') !== $itemId;
        }));
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'deletedId' => $itemId]);
        exit();
    }

    if ($action === 'bulk_inventory') {
        $items = isset($body['items']) && is_array($body['items']) ? $body['items'] : [];
        foreach ($items as $idx => $row) {
            $bCode = !empty($row['barcode']) ? $row['barcode'] : (string)(896400000 + rand(1000, 99999) + $idx);
            $found = -1;
            foreach ($ws['inventory'] as $i => $cur) {
                if (($cur['barcode'] ?? '') === $bCode || strtolower((string)($cur['name'] ?? '')) === strtolower((string)($row['name'] ?? ''))) {
                    $found = $i; break;
                }
            }
            if ($found >= 0) {
                $ws['inventory'][$found]['quantity'] = floatval($ws['inventory'][$found]['quantity'] ?? 0) + floatval($row['quantity'] ?? 50);
            } else {
                $ws['inventory'][] = [
                    'id' => 'inv_' . time() . '_' . $idx . rand(10, 99),
                    'tenantId' => $ctx['tenantId'] ?: ('tenant_' . $sub),
                    'subdomain' => $sub,
                    'barcode' => $bCode,
                    'name' => trim((string)($row['name'] ?? 'Product')),
                    'category' => $row['category'] ?? 'General',
                    'supplier' => $row['supplier'] ?? ($tenant['name'] ?? 'Local Store'),
                    'quantity' => floatval($row['quantity'] ?? 50),
                    'minStockAlert' => floatval($row['minStockAlert'] ?? 10),
                    'purchasePrice' => floatval($row['purchasePrice'] ?? 100),
                    'sellingPrice' => floatval($row['sellingPrice'] ?? 150),
                    'unit' => $row['unit'] ?? 'Pcs',
                    'expiryDate' => $row['expiryDate'] ?? '2028-12-31',
                    'createdAt' => date('c')
                ];
            }
        }
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'count' => count($items)]);
        exit();
    }

    if ($action === 'add_catalog_treatment') {
        $cat = [
            'id' => 'cat_' . time() . '_' . rand(10, 99),
            'name' => trim((string)($body['name'] ?? '')),
            'category' => trim((string)($body['category'] ?? 'Clinical Treatment')),
            'defaultCost' => floatval($body['defaultCost'] ?? 5000),
            'defaultSessions' => max(1, intval($body['defaultSessions'] ?? 1))
        ];
        $ws['treatmentCatalog'][] = $cat;
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'item' => $cat]);
        exit();
    }

    if ($action === 'delete_catalog_treatment') {
        $catId = trim((string)($body['id'] ?? ($_GET['id'] ?? '')));
        $ws['treatmentCatalog'] = array_values(array_filter($ws['treatmentCatalog'], function($c) use ($catId) {
            return ($c['id'] ?? '') !== $catId;
        }));
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'deletedId' => $catId]);
        exit();
    }

    if ($action === 'bulk_treatments') {
        $items = isset($body['items']) && is_array($body['items']) ? $body['items'] : [];
        foreach ($items as $idx => $row) {
            $name = trim((string)($row['name'] ?? ''));
            if ($name === '') continue;
            $exists = false;
            foreach ($ws['treatmentCatalog'] as $c) {
                if (strtolower((string)($c['name'] ?? '')) === strtolower($name)) { $exists = true; break; }
            }
            if (!$exists) {
                $ws['treatmentCatalog'][] = [
                    'id' => 'cat_' . time() . '_' . $idx,
                    'name' => $name,
                    'category' => $row['category'] ?? 'Clinical Treatment',
                    'defaultCost' => floatval($row['defaultCost'] ?? 5000),
                    'defaultSessions' => max(1, intval($row['defaultSessions'] ?? 1))
                ];
            }
        }
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true]);
        exit();
    }

    // ----- DISCOUNTS & REFUNDS -----
    if ($action === 'verify_pin_discount') {
        $pin = trim((string)($body['pin'] ?? ''));
        $expectedPin = trim((string)($tenant['adminPin'] ?? '1234'));
        $actor = $body['staffName'] ?? 'Staff Cashier';
        $staffId = $body['staffId'] ?? 'u_staff';
        $patName = $body['patientName'] ?? 'Customer';
        $discAmt = floatval($body['discountAmount'] ?? 0);

        if ($pin === '' || !hash_equals($expectedPin, $pin)) {
            array_unshift($ws['auditLogs'], [
                'id' => 'aud_' . time() . '_' . rand(10, 99),
                'action' => 'DISCOUNT_PIN_FAILED',
                'receiptId' => 'PIN-DENIED',
                'actor' => $actor,
                'staffName' => $actor,
                'staffId' => $staffId,
                'approvingAdmin' => 'DENIED (Invalid PIN)',
                'details' => "Invalid 4-Digit Admin PIN attempt for Rs. {$discAmt} discount on {$patName}.",
                'timestamp' => date('c'),
                'createdAt' => date('c')
            ]);
            dnSaveWorkspace($dataDir, $sub, $ws);
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Invalid 4-Digit Admin PIN! Attempt logged in Audit Trail.']);
            exit();
        }

        $rec = [
            'id' => 'disc_' . time() . '_' . rand(10, 99),
            'staffId' => $staffId,
            'staffName' => $actor,
            'patientName' => $patName,
            'cartTotal' => floatval($body['cartTotal'] ?? 0),
            'discountRequested' => $discAmt,
            'reason' => $body['reason'] ?? 'Admin PIN Discount',
            'status' => 'APPROVED',
            'approvalMethod' => 'ADMIN_PIN',
            'approvedBy' => '4-Digit Admin PIN Verified',
            'invoiceNumber' => 'Pending',
            'createdAt' => date('c')
        ];
        array_unshift($ws['discountRequests'], $rec);
        array_unshift($ws['auditLogs'], [
            'id' => 'aud_' . time() . '_' . rand(10, 99),
            'action' => 'DISCOUNT_PIN_APPROVED',
            'receiptId' => 'Pending',
            'actor' => $actor,
            'staffName' => $actor,
            'staffId' => $staffId,
            'approvingAdmin' => '4-Digit Admin PIN Verified',
            'details' => "Rs. {$discAmt} discount unlocked via Admin PIN for {$rec['patientName']}.",
            'timestamp' => date('c'),
            'createdAt' => date('c')
        ]);
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'approved' => true, 'approvalRecord' => $rec]);
        exit();
    }

    if ($action === 'request_remote_discount') {
        $req = [
            'id' => 'dreq_' . time() . '_' . rand(10, 99),
            'staffId' => $body['staffId'] ?? 'u_staff',
            'staffName' => $body['staffName'] ?? 'Staff Cashier',
            'patientName' => $body['patientName'] ?? 'Customer',
            'cartTotal' => floatval($body['cartTotal'] ?? 0),
            'discountRequested' => floatval($body['discountAmount'] ?? 0),
            'reason' => $body['reason'] ?? 'Staff Discount Request',
            'status' => 'PENDING',
            'approvalMethod' => 'REMOTE_WEBSOCKET',
            'invoiceNumber' => 'Pending',
            'createdAt' => date('c')
        ];
        array_unshift($ws['discountRequests'], $req);
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'request' => $req]);
        exit();
    }

    if ($action === 'respond_discount_request') {
        $reqId = trim((string)($body['id'] ?? ($body['requestId'] ?? '')));
        $decision = strtoupper(trim((string)($body['decision'] ?? 'REJECT')));
        $adminName = $body['adminName'] ?? 'Store Admin';
        $updated = null;
        foreach ($ws['discountRequests'] as &$dr) {
            if (($dr['id'] ?? '') === $reqId) {
                $dr['status'] = ($decision === 'APPROVE' || $decision === 'APPROVED') ? 'APPROVED' : 'REJECTED';
                $dr['approvedBy'] = $adminName;
                $dr['approvalMethod'] = $dr['approvalMethod'] ?? 'REMOTE_WEBSOCKET';
                $dr['invoiceNumber'] = $dr['invoiceNumber'] ?? 'Pending';
                $dr['respondedAt'] = date('c');
                $updated = $dr;
                break;
            }
        }
        unset($dr);
        if ($updated) {
            array_unshift($ws['auditLogs'], [
                'id' => 'aud_' . time() . '_' . rand(10, 99),
                'action' => 'REMOTE_DISCOUNT_' . $updated['status'],
                'receiptId' => $updated['invoiceNumber'] ?? 'Pending',
                'actor' => $adminName,
                'staffName' => $updated['staffName'] ?? 'Staff Cashier',
                'staffId' => $updated['staffId'] ?? 'u_staff',
                'approvingAdmin' => $adminName,
                'details' => "Rs. {$updated['discountRequested']} discount for {$updated['patientName']} marked {$updated['status']}.",
                'timestamp' => date('c'),
                'createdAt' => date('c')
            ]);
            dnSaveWorkspace($dataDir, $sub, $ws);
        }
        echo json_encode(['success' => true, 'request' => $updated]);
        exit();
    }

    if ($action === 'refund_sale') {
        $saleId = trim((string)($body['id'] ?? ($_GET['id'] ?? '')));
        $role = strtoupper(trim((string)($body['role'] ?? 'STAFF')));
        $pin = trim((string)($body['adminPin'] ?? ''));
        $actor = $body['actorName'] ?? 'User';
        $actorId = $body['actorId'] ?? ($body['staffId'] ?? 'u_staff');
        $expectedPin = trim((string)($tenant['adminPin'] ?? '1234'));

        $authorized = in_array($role, ['CLINIC_ADMIN', 'STORE_ADMIN', 'SUPER_ADMIN'], true) || ($pin !== '' && hash_equals($expectedPin, $pin));
        if (!$authorized) {
            array_unshift($ws['auditLogs'], [
                'id' => 'aud_' . time() . '_' . rand(10, 99),
                'action' => 'UNAUTHORIZED_REFUND_BLOCKED',
                'receiptId' => $saleId,
                'actor' => $actor,
                'staffName' => $actor,
                'staffId' => $actorId,
                'approvingAdmin' => 'BLOCKED (Admin Required)',
                'details' => "Blocked staff refund attempt on sale {$saleId} without Admin authority.",
                'timestamp' => date('c'),
                'createdAt' => date('c')
            ]);
            dnSaveWorkspace($dataDir, $sub, $ws);
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Only Store/Clinic Admin can void or refund completed receipts. Logged in Audit Trail.']);
            exit();
        }

        $refundedSale = null;
        foreach ($ws['sales'] as &$s) {
            if (($s['id'] ?? '') === $saleId) {
                if (strtoupper((string)($s['status'] ?? '')) === 'REFUNDED') {
                    echo json_encode(['success' => true, 'sale' => $s]);
                    exit();
                }
                $s['status'] = 'REFUNDED';
                $s['refundedAt'] = date('c');
                $s['refundedBy'] = $actor;
                $refundedSale = $s;
                // Restore non-session inventory quantities
                foreach ($s['items'] ?? [] as $item) {
                    if (strtoupper((string)($item['type'] ?? '')) === 'SESSION') continue;
                    $qty = floatval($item['qty'] ?? ($item['quantity'] ?? 1));
                    foreach ($ws['inventory'] as &$inv) {
                        if ((!empty($item['id']) && ($inv['id'] ?? '') === $item['id']) ||
                            (!empty($item['barcode']) && ($inv['barcode'] ?? '') === $item['barcode'])) {
                            $inv['quantity'] = floatval($inv['quantity'] ?? 0) + $qty;
                            break;
                        }
                    }
                    unset($inv);
                }
                if (is_array($ws['activeShift'] ?? null)) {
                    $paid = floatval($s['amountPaidToday'] ?? 0);
                    if (strtoupper((string)($s['paymentMethod'] ?? 'CASH')) === 'CASH') {
                        $ws['activeShift']['totalCashCollected'] = max(0, floatval($ws['activeShift']['totalCashCollected'] ?? 0) - $paid);
                    } else {
                        $ws['activeShift']['totalDigitalCollected'] = max(0, floatval($ws['activeShift']['totalDigitalCollected'] ?? 0) - $paid);
                    }
                }
                break;
            }
        }
        unset($s);

        $invRef = $refundedSale['invoiceNumber'] ?? $saleId;
        array_unshift($ws['auditLogs'], [
            'id' => 'aud_' . time() . '_' . rand(10, 99),
            'action' => 'SALE_REFUNDED',
            'receiptId' => $invRef,
            'actor' => $actor,
            'staffName' => $refundedSale['cashierName'] ?? $actor,
            'staffId' => $refundedSale['cashierId'] ?? $actorId,
            'approvingAdmin' => $actor,
            'details' => 'Refunded invoice ' . $invRef . ' and restored stock.',
            'timestamp' => date('c'),
            'createdAt' => date('c')
        ]);
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'sale' => $refundedSale]);
        exit();
    }

    if ($action === 'delete_sale') {
        $saleId = trim((string)($body['id'] ?? ($_GET['id'] ?? '')));
        $ws['sales'] = array_values(array_filter($ws['sales'], function($s) use ($saleId) {
            return ($s['id'] ?? '') !== $saleId;
        }));
        dnSaveWorkspace($dataDir, $sub, $ws);
        echo json_encode(['success' => true, 'deletedId' => $saleId]);
        exit();
    }
}

// Default status ping
echo json_encode([
    'status' => 'online',
    'service' => 'DigitalsNova Cloud Sync Engine',
    'version' => '20261111v21',
    'time' => date('c')
]);
exit();
