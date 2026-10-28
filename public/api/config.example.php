<?php
/**
 * Orridan contact endpoint configuration.
 *
 * 1. Copy this file to config.php in the same folder ON THE SERVER (never commit it).
 * 2. Fill in the values below.
 * Direct web access to config*.php is denied by api/.htaccess.
 */

// Google reCAPTCHA v2 checkbox SECRET key (the public site key goes in .env as VITE_RECAPTCHA_SITE_KEY).
define('RECAPTCHA_SECRET', '');

// Where contact messages and newsletter sign-ups are delivered.
define('MAIL_TO', 'team@example.com');

// Fixed sender on the site's own domain (must be allowed to send by the host, ideally with SPF/DKIM).
define('MAIL_FROM', 'no-reply@orridan.net');

// Hostnames accepted from reCAPTCHA siteverify responses.
define('ALLOWED_HOSTNAMES', ['orridan.net', 'www.orridan.net']);

// Long random string used to hash IP addresses for rate limiting. Change it.
define('RATE_LIMIT_SALT', 'replace-with-a-long-random-string');
