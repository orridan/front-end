<?php
/**
 * Orridan contact and newsletter endpoint (same origin, no CORS).
 *
 * POST application/json, max 10 KB.
 *   { "type": "contact", "name", "email", "company", "subject", "message", "hp_field", "recaptchaToken" }
 *   { "type": "newsletter", "email", "hp_field" }
 *
 * Responses are JSON: { "ok": true } or { "ok": false, "error": "<code>" }. Internal details
 * are written to the server error log only, never to the client.
 *
 * Secrets live in config.php (copy config.example.php on the server). Compatible with PHP 7.4+.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
header('Referrer-Policy: no-referrer');

const MAX_BODY_BYTES = 10240;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 600; // seconds

const SUBJECTS = ['General enquiry', 'Pricing', 'Enterprise plan', 'Product demo', 'Support', 'Partnership'];

/** Sends a JSON response and stops. */
function respond(int $status, array $body, array $headers = []): void
{
    http_response_code($status);
    foreach ($headers as $h) {
        header($h);
    }
    echo json_encode($body, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(int $status, string $code, array $headers = []): void
{
    respond($status, ['ok' => false, 'error' => $code], $headers);
}

function str_len(string $s): int
{
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
}

/** Trims, removes control characters (keeping newlines only when allowed) and checks UTF-8. */
function clean_text($value, bool $allowNewlines = false): ?string
{
    if ($value === null) {
        return '';
    }
    if (!is_string($value)) {
        return null;
    }
    if (function_exists('mb_check_encoding') && !mb_check_encoding($value, 'UTF-8')) {
        return null;
    }
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    $pattern = $allowNewlines ? '/[\x00-\x09\x0B-\x1F\x7F]/u' : '/[\x00-\x1F\x7F]/u';
    $value = preg_replace($pattern, '', $value);
    return $value === null ? null : trim($value);
}

/** Header values must never contain line breaks (header injection). */
function header_safe(string $value): string
{
    return trim(str_replace(["\r", "\n", "%0a", "%0d", "%0A", "%0D"], ' ', $value));
}

function valid_email(string $email): bool
{
    return strlen($email) <= 254
        && filter_var($email, FILTER_VALIDATE_EMAIL) !== false
        && header_safe($email) === $email;
}

function encode_subject(string $subject): string
{
    if (function_exists('mb_encode_mimeheader')) {
        return mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n");
    }
    return '=?UTF-8?B?' . base64_encode($subject) . '?=';
}

function client_ip(): string
{
    // REMOTE_ADDR only: forwarded headers are client controlled and would allow bypassing the limit.
    return isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
}

/** File-based rate limit by hashed IP. Returns false when the limit is exceeded. */
function rate_limit_ok(string $salt): bool
{
    $dir = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'orridan_rl';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        error_log('orridan contact: cannot create rate limit dir');
        return true; // fail open rather than blocking every visitor
    }
    $file = $dir . DIRECTORY_SEPARATOR . hash('sha256', $salt . '|' . client_ip()) . '.json';
    $fh = @fopen($file, 'c+');
    if ($fh === false) {
        error_log('orridan contact: cannot open rate limit file');
        return true;
    }
    $allowed = true;
    if (flock($fh, LOCK_EX)) {
        $now = time();
        $raw = stream_get_contents($fh);
        $hits = json_decode($raw === false ? '' : $raw, true);
        $hits = is_array($hits) ? array_values(array_filter($hits, function ($t) use ($now) {
            return is_int($t) && $t > $now - RATE_LIMIT_WINDOW;
        })) : [];
        if (count($hits) >= RATE_LIMIT_MAX) {
            $allowed = false;
        } else {
            $hits[] = $now;
        }
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, json_encode($hits));
        fflush($fh);
        flock($fh, LOCK_UN);
    }
    fclose($fh);

    // Occasional cleanup of stale files.
    if (mt_rand(1, 50) === 1) {
        foreach (glob($dir . DIRECTORY_SEPARATOR . '*.json') ?: [] as $old) {
            if (@filemtime($old) < time() - RATE_LIMIT_WINDOW) {
                @unlink($old);
            }
        }
    }
    return $allowed;
}

/** Verifies a reCAPTCHA v2 token with Google, checking success and the hostname. */
function verify_recaptcha(string $token, string $secret, array $allowedHosts): bool
{
    if ($token === '' || strlen($token) > 4000 || $secret === '') {
        return false;
    }
    $payload = http_build_query(['secret' => $secret, 'response' => $token, 'remoteip' => client_ip()]);
    $url = 'https://www.google.com/recaptcha/api/siteverify';
    $response = false;

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => $payload,
                'timeout' => 8,
            ],
        ]);
        $response = @file_get_contents($url, false, $context);
    }

    if (!is_string($response)) {
        error_log('orridan contact: siteverify request failed');
        return false;
    }
    $data = json_decode($response, true);
    if (!is_array($data) || ($data['success'] ?? false) !== true) {
        return false;
    }
    $host = isset($data['hostname']) ? strtolower((string) $data['hostname']) : '';
    return in_array($host, array_map('strtolower', $allowedHosts), true);
}

/* ================================================================== */
/* Request checks                                                      */
/* ================================================================== */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'method_not_allowed', ['Allow: POST']);
}

$contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? ''));
if (strpos($contentType, 'application/json') !== 0) {
    fail(415, 'unsupported_media_type');
}

$declaredLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($declaredLength > MAX_BODY_BYTES) {
    fail(413, 'payload_too_large');
}

// Same origin only: reject cross-site browser requests. No CORS headers are ever sent.
$origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '') {
    $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
    $serverHost = strtolower(preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')));
    if ($originHost === '' || $originHost !== $serverHost) {
        fail(403, 'forbidden');
    }
}

$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($raw === false || strlen($raw) > MAX_BODY_BYTES) {
    fail(413, 'payload_too_large');
}
$input = json_decode($raw, true);
if (!is_array($input)) {
    fail(400, 'invalid_json');
}

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    error_log('orridan contact: config.php is missing');
    fail(500, 'server_error');
}
require $configFile;
foreach (['RECAPTCHA_SECRET', 'MAIL_TO', 'MAIL_FROM'] as $const) {
    if (!defined($const)) {
        error_log('orridan contact: ' . $const . ' is not defined in config.php');
        fail(500, 'server_error');
    }
}
$mailTo = (string) MAIL_TO;
$mailFrom = (string) MAIL_FROM;
if (!valid_email($mailTo) || !valid_email($mailFrom)) {
    error_log('orridan contact: MAIL_TO or MAIL_FROM is invalid');
    fail(500, 'server_error');
}
$allowedHosts = defined('ALLOWED_HOSTNAMES') && is_array(ALLOWED_HOSTNAMES) ? ALLOWED_HOSTNAMES : ['orridan.net', 'www.orridan.net'];
$salt = defined('RATE_LIMIT_SALT') ? (string) RATE_LIMIT_SALT : (string) RECAPTCHA_SECRET;

$type = $input['type'] ?? '';
if ($type !== 'contact' && $type !== 'newsletter') {
    fail(400, 'invalid_type');
}

// Honeypot: bots fill hidden fields. Pretend success and drop the message.
$honeypot = $input['hp_field'] ?? '';
if (!is_string($honeypot) || $honeypot !== '') {
    respond(200, ['ok' => true]);
}

if (!rate_limit_ok($salt)) {
    fail(429, 'rate_limited', ['Retry-After: ' . RATE_LIMIT_WINDOW]);
}

/* ================================================================== */
/* Validation                                                          */
/* ================================================================== */

$email = clean_text($input['email'] ?? null);
if ($email === null || !valid_email($email)) {
    fail(422, 'invalid_email');
}

$headers = [
    'From: Orridan Website <' . header_safe($mailFrom) . '>',
    'Reply-To: ' . header_safe($email),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];
$envelope = '-f' . $mailFrom;

if ($type === 'newsletter') {
    $subjectLine = 'Newsletter sign-up';
    $body = "New newsletter sign-up from the Orridan website.\n\nEmail: {$email}\nTime (UTC): " . gmdate('Y-m-d H:i:s') . "\n";
} else {
    $name = clean_text($input['name'] ?? null);
    $company = clean_text($input['company'] ?? null);
    $subject = clean_text($input['subject'] ?? null);
    $message = clean_text($input['message'] ?? null, true);
    $token = clean_text($input['recaptchaToken'] ?? null);

    if ($name === null || str_len($name) < 2 || str_len($name) > 100) {
        fail(422, 'invalid_name');
    }
    if ($company === null || str_len($company) > 120) {
        fail(422, 'invalid_company');
    }
    if ($subject === null || !in_array($subject, SUBJECTS, true)) {
        fail(422, 'invalid_subject');
    }
    if ($message === null || str_len($message) < 10 || str_len($message) > 2000) {
        fail(422, 'invalid_message');
    }
    if (!verify_recaptcha((string) $token, (string) RECAPTCHA_SECRET, $allowedHosts)) {
        fail(400, 'captcha_failed');
    }

    $subjectLine = header_safe('Website enquiry: ' . $subject . ' from ' . $name);
    $body = "New message from the Orridan website contact form.\n\n"
        . "Name: {$name}\n"
        . "Email: {$email}\n"
        . 'Company: ' . ($company !== '' ? $company : '(not given)') . "\n"
        . "Subject: {$subject}\n"
        . 'Time (UTC): ' . gmdate('Y-m-d H:i:s') . "\n\n"
        . "Message:\n{$message}\n";
}

/* ================================================================== */
/* Send                                                                */
/* ================================================================== */

$sent = @mail($mailTo, encode_subject($subjectLine), $body, implode("\r\n", $headers), $envelope);
if (!$sent) {
    error_log('orridan contact: mail() returned false for type ' . $type);
    fail(502, 'send_failed');
}

respond(200, ['ok' => true]);
