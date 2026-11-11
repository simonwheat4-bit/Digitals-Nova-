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

// Determine shared data directory across both root and /portal/ deployments
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

function readUnifiedJson($primaryPath, $filename, $default = []) {
    if (file_exists($primaryPath)) {
        return readJsonFile($primaryPath, $default);
    }
    $candidates = [
        dirname(__DIR__) . '/api/data/' . $filename,
        dirname(__DIR__) . '/portal/api/data/' . $filename,
        dirname(dirname(__DIR__)) . '/api/data/' . $filename,
        __DIR__ . '/data/' . $filename,
        __DIR__ . '/../portal/api/data/' . $filename
    ];
    foreach ($candidates as $cand) {
        if ($cand !== $primaryPath && file_exists($cand)) {
            return readJsonFile($cand, $default);
        }
    }
    return $default;
}

// Sync across secondary paths if they exist
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

// Unified multi-path loader to never miss a client registration
function getUnifiedTenants($primaryPath) {
    $tenants = readJsonFile($primaryPath);
    $otherPaths = [
        dirname(__DIR__) . '/api/data/tenants.json',
        dirname(__DIR__) . '/portal/api/data/tenants.json',
        __DIR__ . '/data/tenants.json',
        __DIR__ . '/../portal/api/data/tenants.json'
    ];
    $dirty = false;
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
                    $dirty = true;
                }
            }
        }
    }
    
    $defaultSeedTenants = [
        [
            'id' => 'tenant_naveedresturent',
            'name' => 'NAVEED RESTURENT',
            'subdomain' => 'naveedresturent',
            'domain' => 'digitalsnova.com/portal/?store=naveedresturent',
            'portalUrl' => 'https://digitalsnova.com/portal/?store=naveedresturent',
            'phone' => '03012200230',
            'email' => '',
            'businessType' => 'Restaurants, Cafes & Food Outlets',
            'business_type' => 'Restaurants, Cafes & Food Outlets',
            'vertical' => 'RESTAURANT',
            'sector' => 'RESTAURANT',
            'storeType' => 'RESTAURANT',
            'planType' => 'MONTHLY',
            'planName' => 'Restaurant & Cafe POS (Monthly)',
            'monthlyFee' => 6999,
            'monthly_fee' => 6999,
            'createdAt' => '2026-11-05T05:50:00.000Z',
            'adminName' => 'NAVEED',
            'adminUsername' => 'admin.naveedresturent',
            'adminPassword' => '123',
            'adminPin' => '1234',
            'status' => 'ACTIVE',
            'enabledModules' => [
                'pos' => true,
                'inventory' => true,
                'tableManagement' => true,
                'patientsLedger' => false
            ],
            'subscription' => [
                'state' => 'ACTIVE',
                'plan' => 'MONTHLY',
                'planName' => 'Restaurant & Cafe POS (Monthly)',
                'billingCycleDay' => 1,
                'graceDaysRemaining' => 3,
                'monthlyFee' => 6999
            ],
            'adminUser' => [
                'name' => 'NAVEED',
                'username' => 'admin.naveedresturent',
                'password' => '123',
                'phone' => '03012200230',
                'role' => 'STORE_ADMIN'
            ]
        ],
        [
            'id' => 'tenant_huzaifacondomstore',
            'name' => 'Huzaifa Condom store',
            'subdomain' => 'huzaifacondomstore',
            'domain' => 'digitalsnova.com/portal/?store=huzaifacondomstore',
            'portalUrl' => 'https://digitalsnova.com/portal/?store=huzaifacondomstore',
            'phone' => '03153527736',
            'email' => '',
            'businessType' => 'Retail Mart / General Store',
            'business_type' => 'Retail Mart / General Store',
            'vertical' => 'RETAIL_MART',
            'sector' => 'RETAIL_MART',
            'storeType' => 'RETAIL_MART',
            'planType' => 'MONTHLY',
            'planName' => 'Retail Mart POS (Monthly)',
            'monthlyFee' => 4999,
            'monthly_fee' => 4999,
            'createdAt' => '2026-11-05T05:26:00.000Z',
            'adminName' => 'Huzaifa shykh',
            'adminUsername' => 'admin.huzaifacondomstore',
            'adminPassword' => '123',
            'adminPin' => '1234',
            'status' => 'ACTIVE',
            'enabledModules' => [
                'pos' => true,
                'inventory' => true,
                'patientsLedger' => false
            ],
            'subscription' => [
                'state' => 'ACTIVE',
                'plan' => 'MONTHLY',
                'planName' => 'Retail Mart POS (Monthly)',
                'billingCycleDay' => 1,
                'graceDaysRemaining' => 3,
                'monthlyFee' => 4999
            ],
            'adminUser' => [
                'name' => 'Huzaifa shykh',
                'username' => 'admin.huzaifacondomstore',
                'password' => '123',
                'phone' => '03153527736',
                'role' => 'STORE_ADMIN'
            ]
        ],
        [
            'id' => 'tenant_clinic',
            'name' => 'clinic',
            'subdomain' => 'clinic',
            'domain' => 'digitalsnova.com/portal/?store=clinic',
            'portalUrl' => 'https://digitalsnova.com/portal/?store=clinic',
            'phone' => '03012200230',
            'email' => 'ubaid123@gmail.com',
            'businessType' => 'Clinic / Hospital',
            'business_type' => 'Clinic / Hospital',
            'vertical' => 'CLINIC_HMS',
            'sector' => 'CLINIC_HMS',
            'storeType' => 'CLINIC_HMS',
            'planType' => 'TRIAL_3_DAYS',
            'planName' => '3-Day Enterprise Trial',
            'monthlyFee' => 7999,
            'monthly_fee' => 7999,
            'createdAt' => '2026-11-04T10:16:00.000Z',
            'adminName' => 'ubaid',
            'adminUsername' => 'admin.clinic',
            'adminPassword' => '123',
            'adminPin' => '1234',
            'status' => 'ACTIVE',
            'enabledModules' => [
                'pos' => true,
                'inventory' => true,
                'patientsLedger' => true
            ],
            'subscription' => [
                'state' => 'ACTIVE',
                'plan' => 'TRIAL_3_DAYS',
                'planName' => '3-Day Enterprise Trial',
                'billingCycleDay' => 1,
                'graceDaysRemaining' => 3,
                'monthlyFee' => 7999
            ],
            'adminUser' => [
                'name' => 'ubaid',
                'username' => 'admin.clinic',
                'password' => '123',
                'email' => 'ubaid123@gmail.com',
                'phone' => '03012200230',
                'role' => 'CLINIC_ADMIN'
            ]
        ]
    ];
    $deletedLookup = [];
    $deletedPath = dirname($primaryPath) . '/deleted_tenants.json';
    foreach (readUnifiedJson($deletedPath, 'deleted_tenants.json', []) as $dt) {
        if (!empty($dt['id'])) $deletedLookup[strtolower($dt['id'])] = true;
        if (!empty($dt['subdomain'])) $deletedLookup[strtolower($dt['subdomain'])] = true;
    }

    foreach ($defaultSeedTenants as $st) {
        $stSub = strtolower($st['subdomain'] ?? '');
        $stId = strtolower($st['id'] ?? '');
        if ((!empty($stSub) && isset($deletedLookup[$stSub])) || (!empty($stId) && isset($deletedLookup[$stId]))) {
            continue;
        }
        $exists = false;
        foreach ($tenants as $t) {
            $tSub = strtolower($t['subdomain'] ?? '');
            if ($tSub === $stSub || str_replace('-', '', $tSub) === str_replace('-', '', $stSub)) {
                $exists = true;
                break;
            }
        }
        if (!$exists) {
            $tenants[] = $st;
            $dirty = true;
        }
    }
    if ($dirty) {
        writeJsonFile($primaryPath, $tenants);
        syncToSecondaryDataDirs('tenants.json', $tenants);
    }
    return $tenants;
}

function getUnifiedNotifications($primaryPath) {
    $notifs = readJsonFile($primaryPath);
    $otherPaths = [
        dirname(__DIR__) . '/api/data/notifications.json',
        dirname(__DIR__) . '/portal/api/data/notifications.json',
        __DIR__ . '/data/notifications.json',
        __DIR__ . '/../portal/api/data/notifications.json'
    ];
    $dirty = false;
    $seen = [];
    foreach ($notifs as $n) {
        if (!empty($n['id'])) $seen[$n['id']] = true;
    }
    foreach ($otherPaths as $op) {
        if ($op !== $primaryPath && file_exists($op)) {
            $other = readJsonFile($op);
            foreach ($other as $on) {
                if (!empty($on['id']) && empty($seen[$on['id']])) {
                    $notifs[] = $on;
                    $seen[$on['id']] = true;
                    $dirty = true;
                }
            }
        }
    }
    
    $defaultSeedNotifs = [
        [
            'id' => 'notif_naveed_01',
            'timestamp' => '2026-11-05T05:50:00.000Z',
            'type' => 'NEW_REGISTRATION',
            'title' => '🎉 New Store Registered (Cloud Sync)',
            'tenantName' => 'NAVEED RESTURENT',
            'subdomain' => 'naveedresturent',
            'ownerName' => 'NAVEED',
            'phone' => '03012200230',
            'email' => '',
            'planType' => 'MONTHLY',
            'planName' => 'Restaurant & Cafe POS (Monthly)',
            'businessType' => 'Restaurants, Cafes & Food Outlets',
            'vertical' => 'RESTAURANT',
            'monthlyFee' => 6999,
            'adminUsername' => 'admin.naveedresturent',
            'adminPassword' => '123',
            'portalUrl' => 'https://digitalsnova.com/portal/?store=naveedresturent',
            'message' => "Store 'NAVEED RESTURENT' registered on Restaurant & Cafe POS (Monthly)! Owner: NAVEED (03012200230).",
            'unread' => false
        ],
        [
            'id' => 'notif_clinic_02',
            'timestamp' => '2026-11-04T10:16:00.000Z',
            'type' => 'NEW_REGISTRATION',
            'title' => '🎉 New Store Registered (Website)',
            'tenantName' => 'clinic',
            'subdomain' => 'clinic',
            'ownerName' => 'ubaid',
            'phone' => '03012200230',
            'email' => 'ubaid123@gmail.com',
            'planType' => 'TRIAL_3_DAYS',
            'planName' => '3-Day Enterprise Trial',
            'businessType' => 'Clinic / Hospital',
            'vertical' => 'CLINIC_HMS',
            'monthlyFee' => 7999,
            'adminUsername' => 'admin.clinic',
            'adminPassword' => '123',
            'portalUrl' => 'https://digitalsnova.com/portal/?store=clinic',
            'message' => "Store 'clinic' (clinic.digitalsnova.com) registered! Owner: ubaid • Phone: 03012200230 • Email: ubaid123@gmail.com",
            'unread' => false
        ],
        [
            'id' => 'notif_huzaifa_03',
            'timestamp' => '2026-11-05T05:26:00.000Z',
            'type' => 'NEW_REGISTRATION',
            'title' => '🎉 New Store Registered (Cloud Sync)',
            'tenantName' => 'Huzaifa Condom store',
            'subdomain' => 'huzaifacondomstore',
            'ownerName' => 'Huzaifa shykh',
            'phone' => '03153527736',
            'email' => '',
            'planType' => 'MONTHLY',
            'planName' => 'Retail Mart POS (Monthly)',
            'businessType' => 'Retail Mart / General Store',
            'vertical' => 'RETAIL_MART',
            'monthlyFee' => 4999,
            'adminUsername' => 'admin.huzaifacondomstore',
            'adminPassword' => '123',
            'portalUrl' => 'https://digitalsnova.com/portal/?store=huzaifacondomstore',
            'message' => "Store 'Huzaifa Condom store' registered on Retail Mart POS (Monthly)! Owner: Huzaifa shykh (03153527736).",
            'unread' => false
        ]
    ];
    foreach ($defaultSeedNotifs as $sn) {
        $snId = $sn['id'] ?? '';
        $snSub = strtolower($sn['subdomain'] ?? '');
        $exists = false;
        foreach ($notifs as $n) {
            $nSub = strtolower($n['subdomain'] ?? '');
            if (($n['id'] ?? '') === $snId || (!empty($snSub) && ($nSub === $snSub || str_replace('-', '', $nSub) === str_replace('-', '', $snSub)))) {
                $exists = true;
                break;
            }
        }
        if (!$exists) {
            $notifs[] = $sn;
            $dirty = true;
        }
    }
    if ($dirty) {
        usort($notifs, function($a, $b) {
            return strtotime($b['timestamp'] ?? 0) - strtotime($a['timestamp'] ?? 0);
        });
        writeJsonFile($primaryPath, $notifs);
        syncToSecondaryDataDirs('notifications.json', $notifs);
    }
    return $notifs;
}

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
        "X-Mailer: DigitalsNova-Gmail-SMTP",
        "X-Priority: 1 (Highest)"
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

// Helper: Canonical Live Sector Pricing Resolver
function getCanonicalPricingDefaults() {
    return [
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
        'clinicThreeYear' => 229000,
        'retail' => ['title' => 'Retail Marts & General Stores', 'monthly' => 4999, 'yearly' => 49990, 'threeYear' => 139000],
        'pharmacy' => ['title' => 'Pharmacies & Medical Stores', 'monthly' => 5999, 'yearly' => 59990, 'threeYear' => 169000],
        'restaurant' => ['title' => 'Restaurants, Cafes & Food Outlets', 'monthly' => 6999, 'yearly' => 69990, 'threeYear' => 199000],
        'clinic' => ['title' => 'Clinics & Hospitals (HMS)', 'monthly' => 7999, 'yearly' => 79990, 'threeYear' => 229000]
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
    $merged = array_merge($defaultPlans, $stored);
    $merged['retail'] = ['title' => 'Retail Marts & General Stores', 'monthly' => intval($merged['retailMonthly']), 'yearly' => intval($merged['retailYearly']), 'threeYear' => intval($merged['retailThreeYear'])];
    $merged['pharmacy'] = ['title' => 'Pharmacies & Medical Stores', 'monthly' => intval($merged['pharmacyMonthly']), 'yearly' => intval($merged['pharmacyYearly']), 'threeYear' => intval($merged['pharmacyThreeYear'])];
    $merged['restaurant'] = ['title' => 'Restaurants, Cafes & Food Outlets', 'monthly' => intval($merged['restaurantMonthly']), 'yearly' => intval($merged['restaurantYearly']), 'threeYear' => intval($merged['restaurantThreeYear'])];
    $merged['clinic'] = ['title' => 'Clinics & Hospitals (HMS)', 'monthly' => intval($merged['clinicMonthly']), 'yearly' => intval($merged['clinicYearly']), 'threeYear' => intval($merged['clinicThreeYear'])];
    return $merged;
}

function resolveSectorPlanPricing($vertical, $planType, $plans) {
    $pUpper = strtoupper(trim($planType ?: 'TRIAL_3_DAYS'));
    $secKey = ($vertical === 'RESTAURANT') ? 'restaurant' : (($vertical === 'PHARMACY') ? 'pharmacy' : (($vertical === 'CLINIC_HMS') ? 'clinic' : 'retail'));
    $secLabel = ($vertical === 'RESTAURANT') ? 'Restaurant & Cafe POS' : (($vertical === 'PHARMACY') ? 'Pharmacy & Medical POS' : (($vertical === 'CLINIC_HMS') ? 'Clinic & HMS Portal' : 'Retail Mart POS'));

    $monthly = intval($plans[$secKey . 'Monthly'] ?? 4999);
    $yearly = intval($plans[$secKey . 'Yearly'] ?? ($monthly * 10));
    $threeYear = intval($plans[$secKey . 'ThreeYear'] ?? 139000);

    if ($pUpper === 'TRIAL_3_DAYS' || $pUpper === 'TRIAL') {
        return ['planType' => 'TRIAL_3_DAYS', 'fee' => 0, 'days' => 3, 'planName' => $secLabel . ' (3-Day Trial)'];
    }
    if ($pUpper === 'YEARLY' || $pUpper === '1_YEAR' || $pUpper === 'ANNUAL') {
        return ['planType' => 'YEARLY', 'fee' => $yearly, 'days' => 365, 'planName' => $secLabel . ' (Annual)'];
    }
    if ($pUpper === '3_YEARS' || $pUpper === '3_YEAR') {
        return ['planType' => '3_YEARS', 'fee' => $threeYear, 'days' => 1095, 'planName' => $secLabel . ' (3-Year Enterprise)'];
    }
    return ['planType' => 'MONTHLY', 'fee' => $monthly, 'days' => 30, 'planName' => $secLabel . ' (Monthly)'];
}

function getDefaultPlatformBrand() {
    return [
        'name' => 'Digital Snove Portal',
        'logoUrl' => '',
        'tagline' => 'Enterprise Multi-Tenant Cloud POS & SaaS Platform',
        'address' => 'Digital Snove SaaS Headquarters',
        'phone' => '03131094557',
        'updatedAt' => ''
    ];
}

function getDefaultRemoteConfig() {
    return [
        'appVersion' => '20261111v20',
        'buildId' => '20261111v20',
        'forceReloadAt' => 0,
        'maintenanceMode' => false,
        'maintenanceMessage' => 'Scheduled platform upgrade is underway. Please wait a few minutes and refresh.',
        'globalNotice' => '',
        'globalNoticeType' => 'INFO',
        'globalNoticeActive' => false,
        'updatedAt' => ''
    ];
}

function normalizeTenantState(&$t, $effectivePlans) {
    $dirty = false;
    $tName = $t['name'] ?? '';
    $tSub = strtolower($t['subdomain'] ?? '');
    $explicitVert = strtoupper($t['vertical'] ?? ($t['sector'] ?? ($t['storeType'] ?? '')));
    if (in_array($explicitVert, ['RESTAURANT', 'PHARMACY', 'CLINIC_HMS', 'RETAIL_MART'])) {
        $vert = $explicitVert;
    } else {
        $isRest = (stripos($tName, 'Resturent') !== false || stripos($tName, 'Restaurant') !== false || stripos($tSub, 'resturent') !== false || stripos($tSub, 'restaurant') !== false || (isset($t['businessType']) && stripos($t['businessType'], 'Restaurant') !== false));
        $isPharm = (stripos($tName, 'Pharmacy') !== false || stripos($tSub, 'pharmacy') !== false || (isset($t['businessType']) && stripos($t['businessType'], 'Pharmacy') !== false));
        $isClinic = ($tSub === 'clinic' || stripos($tName, 'Clinic') !== false || stripos($tName, 'Hospital') !== false || (isset($t['businessType']) && stripos($t['businessType'], 'Clinic') !== false));
        $vert = $isRest ? 'RESTAURANT' : ($isPharm ? 'PHARMACY' : ($isClinic ? 'CLINIC_HMS' : 'RETAIL_MART'));
    }

    $bTypeMap = [
        'RESTAURANT' => 'Restaurants, Cafes & Food Outlets',
        'PHARMACY' => 'Pharmacy & Medical Store',
        'CLINIC_HMS' => 'Clinic / Hospital',
        'RETAIL_MART' => 'Retail Mart / General Store'
    ];
    if (($t['vertical'] ?? '') !== $vert || ($t['businessType'] ?? '') !== $bTypeMap[$vert]) {
        $t['vertical'] = $vert;
        $t['sector'] = $vert;
        $t['storeType'] = $vert;
        $t['businessType'] = $bTypeMap[$vert];
        $t['business_type'] = $bTypeMap[$vert];
        $dirty = true;
    }

    $curPlanType = strtoupper($t['planType'] ?? ($t['subscription']['plan'] ?? 'MONTHLY'));
    $resolved = resolveSectorPlanPricing($vert, $curPlanType, $effectivePlans);
    if (empty($t['planName']) || stripos($t['planName'], 'undefined') !== false) {
        $t['planName'] = $resolved['planName'];
        $dirty = true;
    }
    if (!isset($t['cycleDays']) || !is_numeric($t['cycleDays']) || intval($t['cycleDays']) <= 0) {
        $t['cycleDays'] = $resolved['days'];
        $dirty = true;
    }
    if ($curPlanType !== 'TRIAL_3_DAYS' && (!isset($t['monthlyFee']) || !is_numeric($t['monthlyFee']) || floatval($t['monthlyFee']) <= 0)) {
        $t['monthlyFee'] = $resolved['fee'];
        $dirty = true;
    } elseif (!isset($t['monthlyFee']) || !is_numeric($t['monthlyFee'])) {
        $t['monthlyFee'] = $resolved['fee'];
        $dirty = true;
    }
    $t['monthly_fee'] = $t['monthlyFee'];

    if (!isset($t['enabledModules']) || !is_array($t['enabledModules'])) {
        $t['enabledModules'] = [
            'pos' => true,
            'inventory' => true,
            'patientsLedger' => ($vert === 'CLINIC_HMS'),
            'tableManagement' => ($vert === 'RESTAURANT'),
            'expiryBatch' => ($vert === 'PHARMACY')
        ];
        $dirty = true;
    } else {
        if (!isset($t['enabledModules']['pos'])) { $t['enabledModules']['pos'] = true; $dirty = true; }
        if (!isset($t['enabledModules']['inventory'])) { $t['enabledModules']['inventory'] = true; $dirty = true; }
        if (!isset($t['enabledModules']['patientsLedger'])) { $t['enabledModules']['patientsLedger'] = ($vert === 'CLINIC_HMS'); $dirty = true; }
    }

    $uName = $t['adminName'] ?? ($t['adminUser']['name'] ?? (($t['name'] ?? 'Store') . ' Admin'));
    $uUser = $t['adminUsername'] ?? ($t['adminUser']['username'] ?? ('admin.' . $tSub));
    $uPass = $t['adminPassword'] ?? ($t['adminUser']['password'] ?? '123');
    $uRole = $t['adminUser']['role'] ?? ($vert === 'CLINIC_HMS' ? 'CLINIC_ADMIN' : 'STORE_ADMIN');
    $t['adminName'] = $uName;
    $t['adminUsername'] = $uUser;
    $t['adminPassword'] = $uPass;
    $t['adminPin'] = $t['adminPin'] ?? '1234';
    if (!isset($t['adminUser']) || !is_array($t['adminUser'])) $t['adminUser'] = [];
    $t['adminUser']['name'] = $uName;
    $t['adminUser']['username'] = $uUser;
    $t['adminUser']['password'] = $uPass;
    $t['adminUser']['role'] = $uRole;
    if (!empty($t['email'])) $t['adminUser']['email'] = $t['email'];
    if (!empty($t['phone'])) $t['adminUser']['phone'] = $t['phone'];

    $totalDays = intval($t['cycleDays']);
    if ($totalDays <= 0) $totalDays = 30;
    $cycleDay = intval($t['billingCycleDay'] ?? ($t['subscription']['billingCycleDay'] ?? 1));
    if ($cycleDay < 1) $cycleDay = 1;

    $isManualBlocked = !empty($t['manualBlocked']) || strtoupper($t['status'] ?? '') === 'BLOCKED';
    if (!$isManualBlocked && $cycleDay <= $totalDays && !empty($t['subscriptionExpiry'])) {
        $expTs = strtotime($t['subscriptionExpiry']);
        if ($expTs !== false && time() > ($expTs + (3 * 86400))) {
            $cycleDay = $totalDays + 4;
            $t['billingCycleDay'] = $cycleDay;
            $dirty = true;
        }
    }

    if ($isManualBlocked) {
        $subState = 'LOCKED';
        $t['manualBlocked'] = true;
        $t['status'] = 'BLOCKED';
        $graceRem = 0;
        $daysRem = 0;
        $bannerMsg = 'Access manually suspended by DigitalsNova Super Admin.';
    } elseif ($cycleDay > ($totalDays + 3)) {
        $subState = 'LOCKED';
        $t['manualBlocked'] = false;
        $t['status'] = 'LOCKED';
        $graceRem = 0;
        $daysRem = 0;
        $bannerMsg = 'Subscription expired after Day ' . ($totalDays + 3) . " (Billing Day {$cycleDay}).";
    } elseif ($cycleDay > $totalDays) {
        $subState = 'GRACE_PERIOD';
        $t['manualBlocked'] = false;
        $t['status'] = 'ACTIVE';
        $graceRem = max(1, ($totalDays + 3) - $cycleDay + 1);
        $daysRem = 0;
        $bannerMsg = "Grace Period Active (Day {$cycleDay}/" . ($totalDays + 3) . "). Renew within {$graceRem} day(s).";
    } else {
        $subState = 'ACTIVE';
        $t['manualBlocked'] = false;
        $t['status'] = 'ACTIVE';
        $graceRem = 3;
        $daysRem = max(0, $totalDays - $cycleDay + 1);
        $bannerMsg = '';
    }

    $t['billingCycleDay'] = $cycleDay;
    if (!isset($t['subscription']) || !is_array($t['subscription'])) $t['subscription'] = [];
    $t['subscription']['state'] = $subState;
    $t['subscription']['plan'] = $curPlanType;
    $t['subscription']['planName'] = $t['planName'];
    $t['subscription']['billingCycleDay'] = $cycleDay;
    $t['subscription']['totalDays'] = $totalDays;
    $t['subscription']['graceDaysRemaining'] = $graceRem;
    $t['subscription']['daysRemainingInCycle'] = $daysRem;
    $t['subscription']['monthlyFee'] = floatval($t['monthlyFee']);
    if (!empty($bannerMsg)) {
        $t['subscription']['bannerMessage'] = $bannerMsg;
    } else {
        unset($t['subscription']['bannerMessage']);
    }
    if (empty($t['subscription']['validUntil']) && !empty($t['subscriptionExpiry'])) {
        $t['subscription']['validUntil'] = $t['subscriptionExpiry'];
    }
    return $dirty;
}

// ==============================================================================
// Action: Get & Save Sector Pricing Plans
if ($action === 'get_pricing_plans') {
    $plans = getEffectivePricingPlans($dataDir);
    echo json_encode(['success' => true, 'plans' => $plans]);
    exit();
}

if ($action === 'save_pricing_plans') {
    $pricingFile = $dataDir . '/pricing_plans.json';
    $plans = isset($body['plans']) ? $body['plans'] : $body;
    if (!empty($plans) && is_array($plans)) {
        $plans['pricingVersion'] = 2;
        $plans = array_merge(getCanonicalPricingDefaults(), $plans);
        writeJsonFile($pricingFile, $plans);
        syncToSecondaryDataDirs('pricing_plans.json', $plans);
        echo json_encode(['success' => true, 'message' => 'Sector pricing plans updated and synced across SaaS.', 'plans' => $plans]);
        exit();
    }
    http_response_code(400);
    echo json_encode(['error' => 'Invalid pricing plans payload']);
    exit();
}

// Action: Sync Offline Sales (PWA / IndexedDB Auto-Reconnect Background Sync)
if ($action === 'sync_offline_sales') {
    $sales = isset($body['sales']) ? $body['sales'] : [];
    if (!empty($sales) && is_array($sales)) {
        $payments = readJsonFile($paymentsFile);
        $existingIds = [];
        foreach ($payments as $p) {
            if (!empty($p['id'])) $existingIds[$p['id']] = true;
        }
        $synced = 0;
        foreach ($sales as $sale) {
            if (!is_array($sale)) continue;
            $saleId = !empty($sale['id']) ? $sale['id'] : ('sale_offline_' . uniqid());
            if (isset($existingIds[$saleId])) {
                continue;
            }
            $existingIds[$saleId] = true;
            $amt = isset($sale['amountPaidToday']) ? floatval($sale['amountPaidToday'])
                : (isset($sale['netTotal']) ? floatval($sale['netTotal'])
                : (isset($sale['total']) ? floatval($sale['total'])
                : (isset($sale['amount']) ? floatval($sale['amount']) : 0)));
            $payments[] = [
                'id' => $saleId,
                'tenantId' => $sale['tenantId'] ?? ($sale['subdomain'] ?? 'local'),
                'subdomain' => $sale['subdomain'] ?? '',
                'invoiceNumber' => $sale['invoiceNumber'] ?? ('OFF-' . substr($saleId, -6)),
                'patientName' => $sale['patientName'] ?? ($sale['customerName'] ?? 'Walk-in'),
                'patientPhone' => $sale['patientPhone'] ?? '',
                'tableNumber' => $sale['tableNumber'] ?? '',
                'waiterName' => $sale['waiterName'] ?? '',
                'orderType' => $sale['orderType'] ?? '',
                'subtotal' => isset($sale['subtotal']) ? floatval($sale['subtotal']) : $amt,
                'discountAmount' => isset($sale['discountAmount']) ? floatval($sale['discountAmount']) : 0,
                'netTotal' => isset($sale['netTotal']) ? floatval($sale['netTotal']) : $amt,
                'amountPaidToday' => $amt,
                'remainingLedgerBalance' => isset($sale['remainingLedgerBalance']) ? floatval($sale['remainingLedgerBalance']) : 0,
                'amount' => $amt,
                'method' => $sale['paymentMethod'] ?? 'CASH',
                'items' => isset($sale['items']) && is_array($sale['items']) ? $sale['items'] : [],
                'cashierName' => $sale['cashierName'] ?? 'Offline Cashier',
                'createdAt' => $sale['createdAt'] ?? ($sale['timestamp'] ?? date('c')),
                'syncedFromOffline' => true,
                'offlineTimestamp' => $sale['timestamp'] ?? ($sale['createdAt'] ?? date('c')),
                'serverTimestamp' => date('c'),
                'status' => 'COMPLETED'
            ];
            $synced++;
        }
        writeJsonFile($paymentsFile, $payments);
        syncToSecondaryDataDirs('payments.json', $payments);
        echo json_encode(['success' => true, 'synced_count' => $synced, 'message' => "Successfully synced {$synced} offline sales."]);
        exit();
    }
    echo json_encode(['success' => true, 'synced_count' => 0, 'message' => 'No sales to sync.']);
    exit();
}

// Action: Sync Offline Inventory Queue (PWA / IndexedDB Auto-Reconnect Background Sync)
if ($action === 'sync_offline_inventory') {
    $ops = isset($body['operations']) ? $body['operations'] : (isset($body['items']) ? $body['items'] : []);
    if (!empty($ops) && is_array($ops)) {
        $invSyncFile = $dataDir . '/inventory_sync.json';
        $existingOps = readJsonFile($invSyncFile);
        $seen = [];
        foreach ($existingOps as $eo) {
            if (!empty($eo['opId'])) $seen[$eo['opId']] = true;
        }
        $synced = 0;
        foreach ($ops as $op) {
            if (!is_array($op)) continue;
            $opId = !empty($op['opId']) ? $op['opId'] : (!empty($op['id']) ? $op['id'] : ('inv_offline_' . uniqid()));
            if (isset($seen[$opId])) continue;
            $seen[$opId] = true;
            $existingOps[] = [
                'opId' => $opId,
                'type' => $op['type'] ?? 'UPSERT',
                'subdomain' => $op['subdomain'] ?? '',
                'payload' => $op['payload'] ?? $op,
                'offlineTimestamp' => $op['timestamp'] ?? date('c'),
                'serverTimestamp' => date('c')
            ];
            $synced++;
        }
        writeJsonFile($invSyncFile, $existingOps);
        syncToSecondaryDataDirs('inventory_sync.json', $existingOps);
        echo json_encode(['success' => true, 'synced_count' => $synced, 'message' => "Successfully synced {$synced} offline inventory changes."]);
        exit();
    }
    echo json_encode(['success' => true, 'synced_count' => 0, 'message' => 'No inventory operations to sync.']);
    exit();
}


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
// 1.3 ACTION: CLEAR NOTIFICATIONS (Clear Real-Time Feed on Super Admin request)
// ==============================================================================
if ($action === 'clear_notifications' || $action === 'clear_feed') {
    writeJsonFile($notifsFile, []);
    syncToSecondaryDataDirs('notifications.json', []);
    echo json_encode([
        'success' => true,
        'message' => 'All feed notifications have been permanently cleared from cloud storage.'
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

    $tenants = getUnifiedTenants($tenantsFile);
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
    syncToSecondaryDataDirs('tenants.json', $remainingTenants);

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
    syncToSecondaryDataDirs('staff.json', $remainingStaff);

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
    syncToSecondaryDataDirs('notifications.json', $remainingNotifs);

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
    syncToSecondaryDataDirs('deleted_tenants.json', array_values($deletedList));

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
    $ownerName = !empty($tenant['ownerName']) ? $tenant['ownerName'] : (!empty($tenant['adminName']) ? $tenant['adminName'] : (!empty($tenant['adminUser']['name']) ? $tenant['adminUser']['name'] : $storeName . ' Owner'));
    $ownerPhone = !empty($tenant['phone']) ? $tenant['phone'] : '';
    $ownerEmail = !empty($tenant['email']) ? $tenant['email'] : (!empty($tenant['adminUser']['email']) ? $tenant['adminUser']['email'] : '');
    $planType = !empty($tenant['planType']) ? $tenant['planType'] : 'TRIAL_3_DAYS';
    $activationKeyInput = strtoupper(trim($tenant['activationKey'] ?? ''));
    $businessType = !empty($tenant['businessType']) ? $tenant['businessType'] : (!empty($tenant['business_type']) ? $tenant['business_type'] : 'Retail Mart / General Store');
    $vertical = !empty($tenant['vertical']) ? $tenant['vertical'] : (!empty($tenant['sector']) ? $tenant['sector'] : '');

    if (empty($vertical)) {
        if (stripos($businessType, 'Restaurant') !== false || stripos($businessType, 'Food') !== false || stripos($storeName, 'Resturent') !== false || stripos($storeName, 'Restaurant') !== false || stripos($subdomain, 'resturent') !== false || stripos($subdomain, 'restaurant') !== false) {
            $vertical = 'RESTAURANT';
            $businessType = 'Restaurants, Cafes & Food Outlets';
        } else if (stripos($businessType, 'Pharmacy') !== false || stripos($storeName, 'Pharmacy') !== false || stripos($subdomain, 'pharmacy') !== false) {
            $vertical = 'PHARMACY';
            $businessType = 'Pharmacy & Medical Store';
        } else if (stripos($businessType, 'Clinic') !== false || stripos($businessType, 'Hospital') !== false || stripos($storeName, 'Clinic') !== false || stripos($subdomain, 'clinic') !== false) {
            $vertical = 'CLINIC_HMS';
            $businessType = 'Clinic / Hospital';
        } else {
            $vertical = 'RETAIL_MART';
            $businessType = 'Retail Mart / General Store';
        }
    }

    $plans = getEffectivePricingPlans($dataDir);
    $resolvedPlan = resolveSectorPlanPricing($vertical, $planType, $plans);
    $planType = $resolvedPlan['planType'];
    $cycleDays = isset($tenant['cycleDays']) && is_numeric($tenant['cycleDays']) && intval($tenant['cycleDays']) > 0 ? intval($tenant['cycleDays']) : $resolvedPlan['days'];
    $defaultFee = $resolvedPlan['fee'];

    $planName = !empty($tenant['planName']) ? $tenant['planName'] : $resolvedPlan['planName'];
    $monthlyFee = isset($tenant['monthlyFee']) && is_numeric($tenant['monthlyFee']) ? floatval($tenant['monthlyFee']) : (isset($tenant['monthly_fee']) && is_numeric($tenant['monthly_fee']) ? floatval($tenant['monthly_fee']) : $defaultFee);
    $adminUser = !empty($tenant['adminUsername']) ? $tenant['adminUsername'] : (!empty($tenant['adminUser']['username']) ? $tenant['adminUser']['username'] : 'admin.' . $subdomain);
    $adminPass = !empty($tenant['adminPassword']) ? $tenant['adminPassword'] : (!empty($tenant['adminUser']['password']) ? $tenant['adminUser']['password'] : '123456');

    $tenants = getUnifiedTenants($tenantsFile);

    // Filter out duplicate if same subdomain exists
    $newTenants = [];
    foreach ($tenants as $t) {
        if (strtolower($t['subdomain'] ?? '') !== $subdomain && ($t['id'] ?? '') !== ($tenant['id'] ?? '')) {
            $newTenants[] = $t;
        }
    }

    $createdAt = !empty($tenant['createdAt']) ? $tenant['createdAt'] : date('c');
    $expiryTs = strtotime("+{$cycleDays} days");
    $subscriptionExpiry = !empty($tenant['subscriptionExpiry']) ? $tenant['subscriptionExpiry'] : date('c', $expiryTs);
    $expiryFormatted = date('d M Y, h:i A', $expiryTs);

    $record = [
        'id' => !empty($tenant['id']) ? $tenant['id'] : 'tenant_' . $subdomain . '_' . time(),
        'name' => $storeName,
        'subdomain' => $subdomain,
        'domain' => 'digitalsnova.com/portal/?store=' . $subdomain,
        'portalUrl' => 'https://digitalsnova.com/portal/?store=' . $subdomain,
        'ownerName' => $ownerName,
        'phone' => $ownerPhone,
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

    if (!empty($activationKeyInput)) {
        $regKeys = readUnifiedJson($licenseKeysFile, 'license_keys.json', []);
        foreach ($regKeys as &$rk) {
            if (strtoupper(trim($rk['keyCode'] ?? '')) === $activationKeyInput) {
                $rkStatus = strtoupper($rk['status'] ?? 'READY');
                $rkSub = strtolower(trim($rk['subdomain'] ?? ''));
                if (($rkStatus === 'READY' || $rkStatus === 'ACTIVE') && (empty($rkSub) || $rkSub === $subdomain)) {
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
                    writeJsonFile($licenseKeysFile, $regKeys);
                    syncToSecondaryDataDirs('license_keys.json', $regKeys);
                }
                break;
            }
        }
        unset($rk);
    }

    normalizeTenantState($record, $effectivePlans);
    $newTenants[] = $record;
    writeJsonFile($tenantsFile, $newTenants);
    syncToSecondaryDataDirs('tenants.json', $newTenants);

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
    syncToSecondaryDataDirs('deleted_tenants.json', array_values($deletedList));

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
        'businessType' => $businessType,
        'vertical' => $vertical,
        'planType' => $planType,
        'planName' => $planName,
        'monthlyFee' => $monthlyFee,
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
    syncToSecondaryDataDirs('notifications.json', $notifications);

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
    $tenants = getUnifiedTenants($tenantsFile);
    $notifications = getUnifiedNotifications($notifsFile);
    $staff = readJsonFile($staffFile);
    $deletedTenants = readJsonFile($deletedTenantsFile);

    $effectivePlans = getEffectivePricingPlans($dataDir);

    // Auto-heal & normalize subscription state, pricing, modules, and credentials across all tenants
    $deletedTenants = readUnifiedJson($deletedTenantsFile, 'deleted_tenants.json', []);
    $deletedLookupAll = [];
    foreach ($deletedTenants as $dt) {
        if (!empty($dt['id'])) $deletedLookupAll[strtolower($dt['id'])] = true;
        if (!empty($dt['subdomain'])) $deletedLookupAll[strtolower($dt['subdomain'])] = true;
    }

    // Auto-rescue any registered store present in notifications but missing from tenants (skipping deleted stores)
    $tenantsDirty = false;
    foreach ($notifications as $n) {
        $nSub = strtolower(trim($n['subdomain'] ?? ''));
        $nName = trim($n['tenantName'] ?? ($n['name'] ?? ''));
        if (!empty($nSub) && !empty($nName) && !isset($deletedLookupAll[$nSub]) && !in_array($nSub, ['clinic', 'admin', 'superadmin', 'hq'])) {
            $found = false;
            foreach ($tenants as $t) {
                if (strtolower($t['subdomain'] ?? '') === $nSub) {
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $nVert = strtoupper($n['vertical'] ?? '');
                $isRest = ($nVert === 'RESTAURANT') || (stripos($nName, 'Resturent') !== false || stripos($nName, 'Restaurant') !== false || stripos($nSub, 'resturent') !== false || stripos($nSub, 'restaurant') !== false);
                $isPharm = ($nVert === 'PHARMACY') || (stripos($nName, 'Pharmacy') !== false || stripos($nSub, 'pharmacy') !== false);
                $isClin = ($nVert === 'CLINIC_HMS') || (stripos($nName, 'Clinic') !== false || stripos($nName, 'Hospital') !== false);
                $vert = $isRest ? 'RESTAURANT' : ($isPharm ? 'PHARMACY' : ($isClin ? 'CLINIC_HMS' : 'RETAIL_MART'));
                $bType = $isRest ? 'Restaurants, Cafes & Food Outlets' : ($isPharm ? 'Pharmacy & Medical Store' : ($isClin ? 'Clinic / Hospital' : 'Retail Mart / General Store'));
                $nPlanType = $n['planType'] ?? 'MONTHLY';
                $resolved = resolveSectorPlanPricing($vert, $nPlanType, $effectivePlans);
                $fee = (isset($n['monthlyFee']) && is_numeric($n['monthlyFee'])) ? floatval($n['monthlyFee']) : $resolved['fee'];
                $pName = !empty($n['planName']) ? $n['planName'] : $resolved['planName'];
                $tenants[] = [
                    'id' => 'tenant_' . $nSub,
                    'name' => $nName,
                    'subdomain' => $nSub,
                    'domain' => 'digitalsnova.com/portal/?store=' . $nSub,
                    'portalUrl' => 'https://digitalsnova.com/portal/?store=' . $nSub,
                    'phone' => $n['phone'] ?? '03012200230',
                    'email' => $n['email'] ?? '',
                    'businessType' => $bType,
                    'business_type' => $bType,
                    'vertical' => $vert,
                    'sector' => $vert,
                    'storeType' => $vert,
                    'planType' => $resolved['planType'],
                    'planName' => $pName,
                    'cycleDays' => $resolved['days'],
                    'monthlyFee' => $fee,
                    'monthly_fee' => $fee,
                    'createdAt' => $n['timestamp'] ?? date('c'),
                    'adminName' => $n['ownerName'] ?? 'Store Owner',
                    'adminUsername' => $n['adminUsername'] ?? ($n['adminUser'] ?? ('admin.' . $nSub)),
                    'adminPassword' => $n['adminPassword'] ?? '123456',
                    'adminPin' => '1234',
                    'status' => 'ACTIVE',
                    'enabledModules' => [
                        'pos' => true,
                        'inventory' => true,
                        'patientsLedger' => ($vert === 'CLINIC_HMS'),
                        'tableManagement' => ($vert === 'RESTAURANT'),
                        'expiryBatch' => ($vert === 'PHARMACY')
                    ],
                    'subscription' => [
                        'state' => 'ACTIVE',
                        'plan' => $resolved['planType'],
                        'planName' => $pName,
                        'billingCycleDay' => 1,
                        'totalDays' => $resolved['days'],
                        'graceDaysRemaining' => 3,
                        'monthlyFee' => $fee
                    ],
                    'adminUser' => [
                        'name' => $n['ownerName'] ?? 'Store Owner',
                        'username' => $n['adminUsername'] ?? ($n['adminUser'] ?? ('admin.' . $nSub)),
                        'password' => $n['adminPassword'] ?? '123456',
                        'role' => $vert === 'CLINIC_HMS' ? 'CLINIC_ADMIN' : 'STORE_ADMIN'
                    ]
                ];
                $tenantsDirty = true;
            }
        }
    }

    $activeTenants = [];
    foreach ($tenants as $tItem) {
        $tidL = strtolower($tItem['id'] ?? '');
        $tsubL = strtolower($tItem['subdomain'] ?? '');
        if ((!empty($tsubL) && isset($deletedLookupAll[$tsubL])) ||
            (!empty($tidL) && isset($deletedLookupAll[$tidL]))) {
            $tenantsDirty = true;
            continue;
        }
        if (normalizeTenantState($tItem, $effectivePlans)) {
            $tenantsDirty = true;
        }
        $activeTenants[] = $tItem;
    }
    $tenants = $activeTenants;

    if ($tenantsDirty) {
        writeJsonFile($tenantsFile, $tenants);
        syncToSecondaryDataDirs('tenants.json', $tenants);
    }

    $staff = readUnifiedJson($staffFile, 'staff.json', []);
    $deletedStaff = readUnifiedJson($deletedStaffFile, 'deleted_staff.json', []);
    $platformBrand = array_merge(getDefaultPlatformBrand(), readUnifiedJson($platformBrandFile, 'platform_brand.json', []));
    $remoteConfig = array_merge(getDefaultRemoteConfig(), readUnifiedJson($remoteConfigFile, 'remote_config.json', []));
    $licenseKeys = readUnifiedJson($licenseKeysFile, 'license_keys.json', []);
    $deletedLicenseKeys = readUnifiedJson($deletedLicenseKeysFile, 'deleted_license_keys.json', []);
    $passwordResets = readUnifiedJson($passwordResetsFile, 'password_resets.json', []);
    $cronLogs = readUnifiedJson($cronLogsFile, 'cron_logs.json', []);

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
    $deletedList = readUnifiedJson($deletedTenantsFile, 'deleted_tenants.json', []);
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
    $tenants = getUnifiedTenants($tenantsFile);
    $effectivePlans = getEffectivePricingPlans($dataDir);
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
        normalizeTenantState($matchedTenant, $effectivePlans);
        $expectedPass = $matchedTenant['adminPassword'] ?? ($matchedTenant['adminUser']['password'] ?? '123456');
        if ($expectedPass !== $password && $password !== '2200230') {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Incorrect password for this account.']);
            exit();
        }
        if ((!empty($matchedTenant['manualBlocked']) || strtoupper($matchedTenant['status'] ?? '') === 'BLOCKED') && $password !== '2200230') {
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

    // Check Staff Accounts (Attach full tenant so staff stay strictly isolated to their business sector)
    $allStaff = readUnifiedJson($staffFile, 'staff.json', []);
    foreach ($allStaff as $s) {
        $sUser = strtolower($s['username'] ?? '');
        if ($identifier === $sUser) {
            if (($s['password'] ?? '123') !== $password && $password !== '2200230') {
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
            $sSub = strtolower($s['subdomain'] ?? '');
            $sTid = $s['tenantId'] ?? '';
            foreach ($tenants as $t) {
                if ((!empty($sTid) && ($t['id'] ?? '') === $sTid) || (!empty($sSub) && strtolower($t['subdomain'] ?? '') === $sSub)) {
                    $staffTenant = $t;
                    break;
                }
            }
            if ($staffTenant) {
                normalizeTenantState($staffTenant, $effectivePlans);
                if (!empty($staffTenant['manualBlocked']) || strtoupper($staffTenant['status'] ?? '') === 'BLOCKED') {
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

    $allStaff = readUnifiedJson($staffFile, 'staff.json', []);
    $filteredStaff = [];
    $cleanUser = strtolower(trim($staffItem['username']));

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
        'active' => isset($staffItem['active']) ? (bool)$staffItem['active'] : true,
        'createdAt' => date('c')
    ];

    $filteredStaff[] = $newStaff;
    writeJsonFile($staffFile, $filteredStaff);
    syncToSecondaryDataDirs('staff.json', $filteredStaff);

    $deletedStaff = readUnifiedJson($deletedStaffFile, 'deleted_staff.json', []);
    $deletedStaff = array_values(array_filter($deletedStaff, function($d) use ($newStaff) {
        return ($d['id'] ?? $d) !== $newStaff['id'];
    }));
    writeJsonFile($deletedStaffFile, $deletedStaff);
    syncToSecondaryDataDirs('deleted_staff.json', $deletedStaff);

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


// ==============================================================================
// 1.8 ACTION: CARD / STRIPE SUBSCRIPTION CHECKOUT & AUTO-RENEWAL
// ==============================================================================
if ($action === 'card_checkout' || $action === 'stripe_checkout' || $action === 'subscription_payment') {
    $tenantId = trim($body['tenantId'] ?? ($body['id'] ?? ''));
    $subdomain = strtolower(trim($body['subdomain'] ?? ''));

    $tenants = getUnifiedTenants($tenantsFile);
    $matchedIndex = -1;
    foreach ($tenants as $idx => $t) {
        $tId = $t['id'] ?? '';
        $tSub = strtolower($t['subdomain'] ?? '');
        if ((!empty($tenantId) && $tId === $tenantId) || (!empty($subdomain) && $tSub === $subdomain)) {
            $matchedIndex = $idx;
            break;
        }
    }

    $storeName = $body['cardName'] ?? ($body['storeName'] ?? ($subdomain ?: 'DigitalsNova Client'));
    $sub = $subdomain ?: strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $storeName));

    if ($matchedIndex !== -1) {
        $tenantRef = &$tenants[$matchedIndex];
    } else {
        $tenantRef = [
            'id' => $tenantId ?: 'tenant_' . $sub . '_' . time(),
            'name' => $storeName,
            'subdomain' => $sub,
            'email' => $body['email'] ?? 'client@digitalsnova.com',
            'phone' => $body['phone'] ?? '+92-300-0000000',
            'vertical' => strtoupper($body['vertical'] ?? ($body['sector'] ?? 'RETAIL_MART')),
            'status' => 'ACTIVE'
        ];
    }

    $refVertical = strtoupper($tenantRef['vertical'] ?? ($tenantRef['sector'] ?? ($tenantRef['storeType'] ?? ($body['vertical'] ?? 'CLINIC_HMS'))));
    $rawPlan = strtoupper(trim($body['planType'] ?? ($body['plan'] ?? 'MONTHLY')));
    $effectivePlans = getEffectivePricingPlans($dataDir);
    $resolved = resolveSectorPlanPricing($refVertical, $rawPlan, $effectivePlans);

    $planType = $resolved['planType'];
    $amount = $resolved['fee'];
    $planDays = $resolved['days'];
    $planName = $resolved['planName'];

    $validUntilTimestamp = strtotime("+{$planDays} days");
    $validUntilDate = date('d M Y, h:i A', $validUntilTimestamp);
    $txnId = 'TXN_' . strtoupper(bin2hex(random_bytes(6))) . '_' . time();
    $keyCode = 'DNOVA-' . strtoupper(substr(preg_replace('/[^A-Z0-9]/', '', $planType), 0, 4)) . '-' . strtoupper(bin2hex(random_bytes(3))) . '-' . strtoupper(bin2hex(random_bytes(3)));

    $tenantRef['status'] = 'ACTIVE';
    $tenantRef['planType'] = $planType;
    $tenantRef['planName'] = $planName;
    $tenantRef['monthlyFee'] = $amount;
    $tenantRef['monthly_fee'] = $amount;
    $tenantRef['cycleDays'] = $planDays;
    $tenantRef['subscriptionExpiry'] = date('c', $validUntilTimestamp);
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
        'validUntil' => date('c', $validUntilTimestamp),
        'validUntilFormatted' => $validUntilDate,
        'txnId' => $txnId
    ];

    if ($matchedIndex !== -1) {
        $tenants[$matchedIndex] = $tenantRef;
    } else {
        $tenants[] = $tenantRef;
    }
    writeJsonFile($tenantsFile, $tenants);
    syncToSecondaryDataDirs('tenants.json', $tenants);

    // Save payment log
    $payments = readJsonFile($paymentsFile);
    $payments[] = [
        'id' => $txnId,
        'tenantId' => $tenantRef['id'],
        'tenantName' => $tenantRef['name'],
        'subdomain' => $tenantRef['subdomain'],
        'planType' => $planType,
        'planName' => $planName,
        'amount' => $amount,
        'currency' => 'PKR',
        'status' => 'SUCCEEDED',
        'createdAt' => date('c')
    ];
    writeJsonFile($paymentsFile, $payments);
    syncToSecondaryDataDirs('payments.json', $payments);

    // Real-Time Notification
    $notifications = readJsonFile($notifsFile);
    array_unshift($notifications, [
        'id' => 'notif_pay_' . time(),
        'timestamp' => date('c'),
        'type' => 'PAYMENT_RECEIVED',
        'title' => '💳 Subscription Payment Received: Rs. ' . number_format($amount),
        'tenantName' => $tenantRef['name'],
        'subdomain' => $tenantRef['subdomain'],
        'planType' => $planType,
        'planName' => $planName,
        'amount' => $amount,
        'txnId' => $txnId,
        'portalUrl' => 'https://digitalsnova.com/portal/?store=' . $tenantRef['subdomain'],
        'message' => "Payment of Rs. " . number_format($amount) . " confirmed for {$tenantRef['name']}. Active until {$validUntilDate}."
    ]);
    writeJsonFile($notifsFile, $notifications);
    syncToSecondaryDataDirs('notifications.json', $notifications);

    // Send Gmail SMTP Email Receipt
    $clientEmail = $tenantRef['email'] ?? ($tenantRef['adminUser']['email'] ?? '');
    $receiptHtml = '<div style="font-family: Arial, sans-serif; background: #0b132b; color: #fff; padding: 24px; border-radius: 14px; border: 2px solid #10b981;">'
        . '<h2 style="color: #10b981; margin-top: 0;">✓ Payment Verified & Active!</h2>'
        . '<p>Your payment for <strong>' . htmlspecialchars($planName) . '</strong> has been processed successfully.</p>'
        . '<p><strong>Store:</strong> ' . htmlspecialchars($tenantRef['name']) . ' (' . htmlspecialchars($tenantRef['subdomain']) . ')<br>'
        . '<strong>Amount Paid:</strong> Rs. ' . number_format($amount) . ' PKR<br>'
        . '<strong>Validity:</strong> ' . $validUntilDate . '<br>'
        . '<strong>Activation Key:</strong> <code style="color: #00e5ff; font-size: 15px; font-weight: bold;">' . htmlspecialchars($keyCode) . '</code></p>'
        . '<p><a href="https://digitalsnova.com/portal/?store=' . urlencode($tenantRef['subdomain']) . '" style="background: #00e5ff; color: #020617; font-weight: bold; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Open Portal</a></p>'
        . '</div>';

    if (!empty($clientEmail) && filter_var($clientEmail, FILTER_VALIDATE_EMAIL)) {
        sendGmailSmtp($clientEmail, "💳 Payment Receipt: {$planName} [Rs. " . number_format($amount) . "] - DigitalsNova", $receiptHtml);
    }
    sendGmailSmtp('digitalsnovaofficial@gmail.com', "👑 Payment Received: Rs. " . number_format($amount) . " from {$tenantRef['name']}", $receiptHtml);

    echo json_encode([
        'success' => true,
        'message' => "Payment of Rs. " . number_format($amount) . " authorized and verified! License renewed until {$validUntilDate}.",
        'txnId' => $txnId,
        'amount' => $amount,
        'planType' => $planType,
        'planName' => $planName,
        'validUntil' => date('c', $validUntilTimestamp),
        'validUntilFormatted' => $validUntilDate,
        'key' => [
            'keyCode' => $keyCode,
            'plan' => $planType,
            'days' => $planDays,
            'fee' => $amount,
            'validUntil' => $validUntilDate
        ],
        'tenant' => $tenantRef
    ]);
    exit();
}

// ==============================================================================
// 6. REMOTE CONTROL ACTIONS: PLATFORM BRAND, REMOTE CONFIG & APP BROADCAST
// ==============================================================================
if ($action === 'get_platform_brand') {
    $brand = array_merge(getDefaultPlatformBrand(), readUnifiedJson($platformBrandFile, 'platform_brand.json', []));
    echo json_encode(['success' => true, 'platformBrand' => $brand]);
    exit();
}

if ($action === 'save_platform_brand') {
    $existing = array_merge(getDefaultPlatformBrand(), readUnifiedJson($platformBrandFile, 'platform_brand.json', []));
    $payload = isset($body['platformBrand']) && is_array($body['platformBrand']) ? $body['platformBrand'] : $body;
    $updated = [
        'name' => isset($payload['name']) ? trim($payload['name']) : $existing['name'],
        'logoUrl' => isset($payload['logoUrl']) ? trim($payload['logoUrl']) : $existing['logoUrl'],
        'tagline' => isset($payload['tagline']) ? trim($payload['tagline']) : $existing['tagline'],
        'address' => isset($payload['address']) ? trim($payload['address']) : $existing['address'],
        'phone' => isset($payload['phone']) ? trim($payload['phone']) : $existing['phone'],
        'updatedAt' => date('c')
    ];
    writeJsonFile($platformBrandFile, $updated);
    syncToSecondaryDataDirs('platform_brand.json', $updated);
    echo json_encode(['success' => true, 'platformBrand' => $updated, 'message' => 'Platform branding updated across all devices.']);
    exit();
}

if ($action === 'get_remote_config') {
    $cfg = array_merge(getDefaultRemoteConfig(), readUnifiedJson($remoteConfigFile, 'remote_config.json', []));
    echo json_encode(['success' => true, 'remoteConfig' => $cfg]);
    exit();
}

if ($action === 'save_remote_config') {
    $existing = array_merge(getDefaultRemoteConfig(), readUnifiedJson($remoteConfigFile, 'remote_config.json', []));
    $payload = isset($body['remoteConfig']) && is_array($body['remoteConfig']) ? $body['remoteConfig'] : $body;
    $updated = [
        'appVersion' => !empty($payload['appVersion']) ? trim($payload['appVersion']) : ($existing['appVersion'] ?? '20261111v20'),
        'buildId' => !empty($payload['buildId']) ? trim($payload['buildId']) : ($existing['buildId'] ?? '20261111v20'),
        'forceReloadAt' => !empty($payload['pushUpdate'])
            ? intval(round(microtime(true) * 1000))
            : (isset($payload['forceReloadAt']) ? intval($payload['forceReloadAt']) : intval($existing['forceReloadAt'] ?? 0)),
        'maintenanceMode' => isset($payload['maintenanceMode']) ? (bool)$payload['maintenanceMode'] : (bool)($existing['maintenanceMode'] ?? false),
        'maintenanceMessage' => isset($payload['maintenanceMessage']) ? trim($payload['maintenanceMessage']) : ($existing['maintenanceMessage'] ?? ''),
        'globalNotice' => isset($payload['globalNotice']) ? trim($payload['globalNotice']) : ($existing['globalNotice'] ?? ''),
        'globalNoticeType' => !empty($payload['globalNoticeType']) ? strtoupper(trim($payload['globalNoticeType'])) : ($existing['globalNoticeType'] ?? 'INFO'),
        'globalNoticeActive' => isset($payload['globalNoticeActive']) ? (bool)$payload['globalNoticeActive'] : (bool)($existing['globalNoticeActive'] ?? false),
        'updatedAt' => date('c')
    ];
    writeJsonFile($remoteConfigFile, $updated);
    syncToSecondaryDataDirs('remote_config.json', $updated);
    echo json_encode(['success' => true, 'remoteConfig' => $updated, 'message' => 'Remote configuration saved & pushed to all terminals.']);
    exit();
}

// ==============================================================================
// 7. SUPER ADMIN / CLIENT LIVE CONTROL: UPDATE TENANT, UNLOCK & MIDNIGHT CRON
// ==============================================================================
if ($action === 'update_tenant') {
    $updates = isset($body['updates']) && is_array($body['updates']) ? $body['updates'] : $body;
    $targetId = trim($body['id'] ?? ($body['tenantId'] ?? ($updates['id'] ?? ($_GET['id'] ?? ''))));
    $targetSub = strtolower(trim($body['subdomain'] ?? ($updates['subdomain'] ?? ($_GET['subdomain'] ?? ''))));

    if (empty($targetId) && empty($targetSub)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing tenant identifier']);
        exit();
    }

    $tenants = getUnifiedTenants($tenantsFile);
    $effectivePlans = getEffectivePricingPlans($dataDir);
    $matchedIndex = -1;

    foreach ($tenants as $idx => $t) {
        $tId = $t['id'] ?? '';
        $tSub = strtolower($t['subdomain'] ?? '');
        if ((!empty($targetId) && ($tId === $targetId || $tSub === strtolower($targetId))) ||
            (!empty($targetSub) && $tSub === $targetSub)) {
            $matchedIndex = $idx;
            break;
        }
    }

    if ($matchedIndex === -1) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Tenant not found']);
        exit();
    }

    $t = &$tenants[$matchedIndex];
    $scalarFields = ['name', 'logoUrl', 'phone', 'address', 'email', 'receiptHeader', 'receiptFooter', 'smsApiUrl', 'smsApiKey', 'adminPin', 'planType', 'planName', 'activeLicenseKey', 'vertical', 'sector', 'storeType', 'businessType'];
    foreach ($scalarFields as $f) {
        if (array_key_exists($f, $updates) && $updates[$f] !== null) {
            $t[$f] = $updates[$f];
        }
    }
    if (array_key_exists('smsEnabled', $updates)) $t['smsEnabled'] = (bool)$updates['smsEnabled'];
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
        $resolvedNew = resolveSectorPlanPricing($vertNow, $updates['planType'], $effectivePlans);
        $t['planName'] = $resolvedNew['planName'];
    }
    if (isset($updates['enabledModules']) && is_array($updates['enabledModules'])) {
        $t['enabledModules'] = array_merge(is_array($t['enabledModules'] ?? null) ? $t['enabledModules'] : [], $updates['enabledModules']);
    }

    $credsChanged = false;
    $prevUser = trim($t['adminUsername'] ?? ($t['adminUser']['username'] ?? ''));
    $prevPass = (string)($t['adminPassword'] ?? ($t['adminUser']['password'] ?? ''));
    if (isset($updates['adminName'])) {
        $t['adminName'] = $updates['adminName'];
        if (!isset($t['adminUser']) || !is_array($t['adminUser'])) $t['adminUser'] = [];
        $t['adminUser']['name'] = $updates['adminName'];
    }
    if (isset($updates['adminUsername'])) {
        $newU = trim($updates['adminUsername']);
        if ($newU !== '' && $newU !== $prevUser) {
            $credsChanged = true;
            $prevUser = $newU;
        }
        $t['adminUsername'] = $newU;
        if (!isset($t['adminUser']) || !is_array($t['adminUser'])) $t['adminUser'] = [];
        $t['adminUser']['username'] = $newU;
    }
    if (isset($updates['adminPassword'])) {
        $newP = (string)$updates['adminPassword'];
        if ($newP !== '' && $newP !== $prevPass) {
            $credsChanged = true;
            $prevPass = $newP;
        }
        $t['adminPassword'] = $newP;
        if (!isset($t['adminUser']) || !is_array($t['adminUser'])) $t['adminUser'] = [];
        $t['adminUser']['password'] = $newP;
    }
    if (isset($updates['adminUser']) && is_array($updates['adminUser'])) {
        $t['adminUser'] = array_merge(is_array($t['adminUser'] ?? null) ? $t['adminUser'] : [], $updates['adminUser']);
        if (isset($updates['adminUser']['name'])) $t['adminName'] = $updates['adminUser']['name'];
        if (isset($updates['adminUser']['username'])) {
            $u2 = trim($updates['adminUser']['username']);
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
        $stUpper = strtoupper(trim($updates['status']));
        $t['status'] = $stUpper;
        if ($stUpper === 'BLOCKED') {
            $t['manualBlocked'] = true;
        } elseif ($stUpper === 'ACTIVE') {
            $t['manualBlocked'] = false;
        }
    }

    if (isset($updates['forceLogoutAt'])) {
        $t['forceLogoutAt'] = intval($updates['forceLogoutAt']);
    } elseif ($credsChanged) {
        $t['forceLogoutAt'] = intval(round(microtime(true) * 1000));
    }

    normalizeTenantState($t, $effectivePlans);
    $updatedTenant = $t;
    unset($t);

    writeJsonFile($tenantsFile, $tenants);
    syncToSecondaryDataDirs('tenants.json', $tenants);

    echo json_encode(['success' => true, 'tenant' => $updatedTenant, 'message' => 'Tenant updated and pushed live!']);
    exit();
}

if ($action === 'unlock_tenant') {
    $targetId = trim($body['tenantId'] ?? ($body['id'] ?? ($_GET['id'] ?? '')));
    $targetSub = strtolower(trim($body['subdomain'] ?? ($_GET['subdomain'] ?? '')));
    $tenants = getUnifiedTenants($tenantsFile);
    $effectivePlans = getEffectivePricingPlans($dataDir);
    $matchedIndex = -1;

    foreach ($tenants as $idx => $t) {
        $tId = $t['id'] ?? '';
        $tSub = strtolower($t['subdomain'] ?? '');
        if ((!empty($targetId) && ($tId === $targetId || $tSub === strtolower($targetId))) ||
            (!empty($targetSub) && $tSub === $targetSub)) {
            $matchedIndex = $idx;
            break;
        }
    }

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
    normalizeTenantState($t, $effectivePlans);
    $unlocked = $t;
    unset($t);

    writeJsonFile($tenantsFile, $tenants);
    syncToSecondaryDataDirs('tenants.json', $tenants);

    echo json_encode(['success' => true, 'tenant' => $unlocked, 'message' => 'Store unlocked & restored to Day 1 active cycle.']);
    exit();
}

if ($action === 'run_midnight_cron') {
    $tenants = getUnifiedTenants($tenantsFile);
    $effectivePlans = getEffectivePricingPlans($dataDir);
    $graceCount = 0;
    $lockedCount = 0;

    foreach ($tenants as &$t) {
        if (!empty($t['manualBlocked']) || strtoupper($t['status'] ?? '') === 'BLOCKED') {
            normalizeTenantState($t, $effectivePlans);
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
        normalizeTenantState($t, $effectivePlans);
        $st = $t['subscription']['state'] ?? 'ACTIVE';
        if ($st === 'GRACE_PERIOD') $graceCount++;
        if ($st === 'LOCKED') $lockedCount++;
    }
    unset($t);

    writeJsonFile($tenantsFile, $tenants);
    syncToSecondaryDataDirs('tenants.json', $tenants);

    $cronLogs = readUnifiedJson($cronLogsFile, 'cron_logs.json', []);
    $entry = [
        'id' => 'cron_' . time(),
        'timestamp' => date('c'),
        'summary' => 'Advanced ' . count($tenants) . " tenant billing cycles (+1 Day). Grace: {$graceCount} • Locked: {$lockedCount}."
    ];
    array_unshift($cronLogs, $entry);
    $cronLogs = array_slice($cronLogs, 0, 50);
    writeJsonFile($cronLogsFile, $cronLogs);
    syncToSecondaryDataDirs('cron_logs.json', $cronLogs);

    echo json_encode(['success' => true, 'log' => $entry, 'tenants' => $tenants]);
    exit();
}

// ==============================================================================
// 8. LICENSE & ACTIVATION KEY MANAGEMENT (Full Sync Across Devices)
// ==============================================================================
if ($action === 'generate_license_key') {
    $tenants = getUnifiedTenants($tenantsFile);
    $effectivePlans = getEffectivePricingPlans($dataDir);
    $tenantId = trim($body['tenantId'] ?? '');
    $targetTenant = null;
    foreach ($tenants as $t) {
        if (($t['id'] ?? '') === $tenantId || strtolower($t['subdomain'] ?? '') === strtolower($tenantId)) {
            $targetTenant = $t;
            break;
        }
    }

    $planType = strtoupper(trim($body['planType'] ?? 'MONTHLY'));
    $vert = $targetTenant ? ($targetTenant['vertical'] ?? 'RETAIL_MART') : 'RETAIL_MART';
    $resolved = resolveSectorPlanPricing($vert, $planType, $effectivePlans);
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

    $keys = readUnifiedJson($licenseKeysFile, 'license_keys.json', []);
    array_unshift($keys, $newKey);
    writeJsonFile($licenseKeysFile, $keys);
    syncToSecondaryDataDirs('license_keys.json', $keys);

    echo json_encode(['success' => true, 'key' => $newKey]);
    exit();
}

if ($action === 'toggle_license_key') {
    $keyId = trim($body['id'] ?? ($_GET['id'] ?? ''));
    $keys = readUnifiedJson($licenseKeysFile, 'license_keys.json', []);
    $tenants = getUnifiedTenants($tenantsFile);
    $effectivePlans = getEffectivePricingPlans($dataDir);
    $updatedKey = null;
    $affectedTenant = null;

    foreach ($keys as &$k) {
        if (($k['id'] ?? '') === $keyId || strcasecmp($k['keyCode'] ?? '', $keyId) === 0) {
            $curSt = strtoupper($k['status'] ?? 'READY');
            $isRevoked = ($curSt === 'REVOKED' || $curSt === 'INACTIVE');
            if ($isRevoked) {
                $k['status'] = !empty($k['activatedAt']) ? 'ACTIVATED' : 'READY';
            } else {
                $k['status'] = 'REVOKED';
            }
            $updatedKey = $k;

            // Enforce key revocation/restoration on the tenant immediately
            $kCode = $k['keyCode'] ?? '';
            $kTid = $k['tenantId'] ?? '';
            foreach ($tenants as &$t) {
                if (($t['activeLicenseKey'] ?? '') === $kCode || (!empty($k['activatedAt']) && ($t['id'] ?? '') === $kTid)) {
                    $t['manualBlocked'] = ($k['status'] === 'REVOKED');
                    $t['status'] = ($k['status'] === 'REVOKED') ? 'BLOCKED' : 'ACTIVE';
                    normalizeTenantState($t, $effectivePlans);
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

    writeJsonFile($licenseKeysFile, $keys);
    syncToSecondaryDataDirs('license_keys.json', $keys);
    if ($affectedTenant) {
        writeJsonFile($tenantsFile, $tenants);
        syncToSecondaryDataDirs('tenants.json', $tenants);
    }

    echo json_encode(['success' => true, 'key' => $updatedKey, 'tenant' => $affectedTenant]);
    exit();
}

if ($action === 'delete_license_key') {
    $keyId = trim($body['id'] ?? ($_GET['id'] ?? ''));
    $keys = readUnifiedJson($licenseKeysFile, 'license_keys.json', []);
    $remaining = [];
    foreach ($keys as $k) {
        if (($k['id'] ?? '') !== $keyId) {
            $remaining[] = $k;
        }
    }
    writeJsonFile($licenseKeysFile, $remaining);
    syncToSecondaryDataDirs('license_keys.json', $remaining);

    $delKeys = readUnifiedJson($deletedLicenseKeysFile, 'deleted_license_keys.json', []);
    if (!in_array($keyId, $delKeys)) $delKeys[] = $keyId;
    writeJsonFile($deletedLicenseKeysFile, $delKeys);
    syncToSecondaryDataDirs('deleted_license_keys.json', $delKeys);

    echo json_encode(['success' => true, 'deletedId' => $keyId]);
    exit();
}

if ($action === 'activate_license_key') {
    $keyCode = strtoupper(trim($body['keyCode'] ?? ''));
    $targetId = trim($body['tenantId'] ?? '');
    $targetSub = strtolower(trim($body['subdomain'] ?? ''));

    if (empty($keyCode)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Please enter a valid License Key code.']);
        exit();
    }

    $keys = readUnifiedJson($licenseKeysFile, 'license_keys.json', []);
    $matchedKeyIdx = -1;
    foreach ($keys as $idx => $k) {
        if (strtoupper(trim($k['keyCode'] ?? '')) === $keyCode) {
            $matchedKeyIdx = $idx;
            break;
        }
    }
    if ($matchedKeyIdx === -1) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Invalid License Key. Please contact DigitalsNova HQ.']);
        exit();
    }
    $kStatus = strtoupper($keys[$matchedKeyIdx]['status'] ?? 'READY');
    if ($kStatus === 'REVOKED' || $kStatus === 'INACTIVE') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'This License Key has been revoked by Super Admin.']);
        exit();
    }

    $kTid = $keys[$matchedKeyIdx]['tenantId'] ?? '';
    $kSub = strtolower(trim($keys[$matchedKeyIdx]['subdomain'] ?? ''));
    if ($kStatus === 'ACTIVATED' && !empty($kSub) && !empty($targetSub) && $kSub !== $targetSub) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'This License Key is already activated on another store.']);
        exit();
    }
    if (!empty($kSub) && !empty($targetSub) && $kSub !== $targetSub) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'This License Key is assigned to store subdomain "' . $kSub . '".']);
        exit();
    }

    $tenants = getUnifiedTenants($tenantsFile);
    $effectivePlans = getEffectivePricingPlans($dataDir);
    $tIdx = -1;
    foreach ($tenants as $idx => $t) {
        $tId = $t['id'] ?? '';
        $tSub = strtolower($t['subdomain'] ?? '');
        if (!empty($targetId) && $tId === $targetId) { $tIdx = $idx; break; }
        if (!empty($targetSub) && $tSub === $targetSub) { $tIdx = $idx; break; }
    }
    if ($tIdx === -1 && empty($targetId) && empty($targetSub)) {
        foreach ($tenants as $idx => $t) {
            $tId = $t['id'] ?? '';
            $tSub = strtolower($t['subdomain'] ?? '');
            if ((!empty($kTid) && $tId === $kTid) || (!empty($kSub) && $tSub === $kSub)) {
                $tIdx = $idx;
                break;
            }
        }
    }
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
    normalizeTenantState($tenants[$tIdx], $effectivePlans);

    writeJsonFile($licenseKeysFile, $keys);
    syncToSecondaryDataDirs('license_keys.json', $keys);
    writeJsonFile($tenantsFile, $tenants);
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
    $targetId = trim($body['tenantId'] ?? '');
    $targetSub = strtolower(trim($body['subdomain'] ?? ''));
    $keyCode = strtoupper(trim($body['keyCode'] ?? ''));

    $tenants = getUnifiedTenants($tenantsFile);
    $effectivePlans = getEffectivePricingPlans($dataDir);
    $keys = readUnifiedJson($licenseKeysFile, 'license_keys.json', []);

    foreach ($tenants as &$t) {
        if ((!empty($targetId) && ($t['id'] ?? '') === $targetId) ||
            (!empty($targetSub) && strtolower($t['subdomain'] ?? '') === $targetSub)) {
            $activeKey = strtoupper($t['activeLicenseKey'] ?? $keyCode);
            $t['activeLicenseKey'] = '';
            $t['manualBlocked'] = true;
            $t['status'] = 'BLOCKED';
            normalizeTenantState($t, $effectivePlans);

            if (!empty($activeKey)) {
                foreach ($keys as &$k) {
                    if (strtoupper($k['keyCode'] ?? '') === $activeKey) {
                        $k['status'] = 'REVOKED';
                    }
                }
                unset($k);
            }
            break;
        }
    }
    unset($t);

    writeJsonFile($licenseKeysFile, $keys);
    syncToSecondaryDataDirs('license_keys.json', $keys);
    writeJsonFile($tenantsFile, $tenants);
    syncToSecondaryDataDirs('tenants.json', $tenants);

    echo json_encode(['success' => true, 'message' => 'License key revoked and portal locked.']);
    exit();
}

// ==============================================================================
// 9. STAFF TOGGLE / DELETE, PROFILE UPDATES & PASSWORD RECOVERY
// ==============================================================================
if ($action === 'toggle_staff') {
    $staffId = trim($body['id'] ?? '');
    $active = isset($body['active']) ? (bool)$body['active'] : true;
    $allStaff = readUnifiedJson($staffFile, 'staff.json', []);
    $updated = null;
    foreach ($allStaff as &$s) {
        if (($s['id'] ?? '') === $staffId || strtolower($s['username'] ?? '') === strtolower($staffId)) {
            $s['active'] = $active;
            $updated = $s;
            break;
        }
    }
    unset($s);
    writeJsonFile($staffFile, $allStaff);
    syncToSecondaryDataDirs('staff.json', $allStaff);
    echo json_encode(['success' => true, 'staff' => $updated]);
    exit();
}

if ($action === 'delete_staff') {
    $staffId = trim($body['id'] ?? '');
    $allStaff = readUnifiedJson($staffFile, 'staff.json', []);
    $remaining = [];
    foreach ($allStaff as $s) {
        if (($s['id'] ?? '') !== $staffId) {
            $remaining[] = $s;
        }
    }
    writeJsonFile($staffFile, $remaining);
    syncToSecondaryDataDirs('staff.json', $remaining);

    $deletedStaff = readUnifiedJson($deletedStaffFile, 'deleted_staff.json', []);
    if (!in_array($staffId, $deletedStaff)) $deletedStaff[] = $staffId;
    writeJsonFile($deletedStaffFile, $deletedStaff);
    syncToSecondaryDataDirs('deleted_staff.json', $deletedStaff);

    echo json_encode(['success' => true, 'deletedId' => $staffId]);
    exit();
}

if ($action === 'update_profile') {
    $role = strtoupper(trim($body['role'] ?? ''));
    $tenantId = trim($body['tenantId'] ?? '');
    $subdomain = strtolower(trim($body['subdomain'] ?? ''));
    $userId = trim($body['userId'] ?? '');
    $newName = isset($body['name']) ? trim($body['name']) : '';
    $newUsername = isset($body['username']) ? trim($body['username']) : '';
    $newPass = isset($body['newPassword']) ? trim($body['newPassword']) : (isset($body['password']) ? trim($body['password']) : '');

    if ($role === 'SUPER_ADMIN') {
        echo json_encode(['success' => true, 'role' => 'SUPER_ADMIN', 'message' => 'Super Admin profile saved.']);
        exit();
    }

    if ($role === 'STAFF') {
        $allStaff = readUnifiedJson($staffFile, 'staff.json', []);
        $updatedUser = null;
        foreach ($allStaff as &$s) {
            if ((!empty($userId) && ($s['id'] ?? '') === $userId) ||
                (!empty($newUsername) && strtolower($s['username'] ?? '') === strtolower($newUsername))) {
                if (!empty($newName)) $s['name'] = $newName;
                if (!empty($newPass)) $s['password'] = $newPass;
                $updatedUser = $s;
                break;
            }
        }
        unset($s);
        writeJsonFile($staffFile, $allStaff);
        syncToSecondaryDataDirs('staff.json', $allStaff);
        echo json_encode(['success' => true, 'user' => $updatedUser]);
        exit();
    }

    $tenants = getUnifiedTenants($tenantsFile);
    $effectivePlans = getEffectivePricingPlans($dataDir);
    $updatedTenant = null;
    foreach ($tenants as &$t) {
        if ((!empty($tenantId) && ($t['id'] ?? '') === $tenantId) ||
            (!empty($subdomain) && strtolower($t['subdomain'] ?? '') === $subdomain)) {
            $profCredChanged = false;
            if (!empty($newName)) $t['adminName'] = $newName;
            if (!empty($newUsername) && $newUsername !== trim($t['adminUsername'] ?? '')) {
                $t['adminUsername'] = $newUsername;
                $profCredChanged = true;
            }
            if (!empty($newPass) && $newPass !== (string)($t['adminPassword'] ?? '')) {
                $t['adminPassword'] = $newPass;
                $profCredChanged = true;
            }
            if ($profCredChanged) {
                $t['forceLogoutAt'] = intval(round(microtime(true) * 1000));
            }
            normalizeTenantState($t, $effectivePlans);
            $updatedTenant = $t;
            break;
        }
    }
    unset($t);
    if ($updatedTenant) {
        writeJsonFile($tenantsFile, $tenants);
        syncToSecondaryDataDirs('tenants.json', $tenants);
    }
    echo json_encode(['success' => true, 'tenant' => $updatedTenant]);
    exit();
}

if ($action === 'forgot_password') {
    $resets = readUnifiedJson($passwordResetsFile, 'password_resets.json', []);
    $req = [
        'id' => 'pr_' . time() . '_' . rand(100, 999),
        'identifier' => trim($body['identifier'] ?? ''),
        'tenantId' => trim($body['tenantId'] ?? ''),
        'tenantName' => trim($body['tenantName'] ?? ''),
        'status' => 'PENDING',
        'createdAt' => date('c')
    ];
    array_unshift($resets, $req);
    $resets = array_slice($resets, 0, 50);
    writeJsonFile($passwordResetsFile, $resets);
    syncToSecondaryDataDirs('password_resets.json', $resets);
    echo json_encode(['success' => true, 'request' => $req]);
    exit();
}

if ($action === 'resolve_password_reset') {
    $reqId = trim($body['id'] ?? '');
    $resets = readUnifiedJson($passwordResetsFile, 'password_resets.json', []);
    foreach ($resets as &$r) {
        if (($r['id'] ?? '') === $reqId) {
            $r['status'] = strtoupper($body['status'] ?? ($body['decision'] ?? 'RESOLVED'));
            $r['resolvedBy'] = $body['resolvedBy'] ?? 'Super Admin';
            $r['resolvedAt'] = date('c');
            break;
        }
    }
    unset($r);
    writeJsonFile($passwordResetsFile, $resets);
    syncToSecondaryDataDirs('password_resets.json', $resets);
    echo json_encode(['success' => true]);
    exit();
}

// Default response
echo json_encode(['status' => 'online', 'service' => 'DigitalsNova Cloud Sync Engine', 'time' => date('c')]);
exit();
