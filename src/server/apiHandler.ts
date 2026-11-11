import type { IncomingMessage, ServerResponse } from 'http';

// In-memory rate limiting map for view auditing against spam
const viewAuditMap = new Map<string, number>();

// Allowed Lao system admins
const AUTHORIZED_ADMIN_EMAILS = ['sabaichatai@gmail.com'];

export function handleApiRequest(req: IncomingMessage, res: ServerResponse): boolean {
  const url = req.url || '';

  if (!url.startsWith('/api')) {
    return false;
  }

  // Set standard API headers
  res.setHeader('Content-Type', 'application/json');

  // Health check
  if (url === '/api/health') {
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status: 'ok',
        platform: 'LAOCHAT',
        server: 'Node.js Fullstack Engine',
        timestamp: new Date().toISOString(),
      })
    );
    return true;
  }

  // Monetization rate card
  if (url === '/api/monetization/rates') {
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        currency: 'LAK',
        baseRpmKip: 120000, // ~120 Kip per verified view
        minPayoutKip: 100000,
        supportedMethods: ['bcel_one', 'ldb', 'bank_transfer'],
        reviewCycleDays: 3,
      })
    );
    return true;
  }

  // Parse POST body helper
  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Protect against oversized JSON payloads (> 1MB)
      if (body.length > 1e6) {
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const payload = body ? JSON.parse(body) : {};

        // Verify Admin Role endpoint
        if (url === '/api/admin/verify-role') {
          const email = (payload.email || '').toLowerCase().trim();
          const isAdmin = AUTHORIZED_ADMIN_EMAILS.includes(email);
          res.statusCode = 200;
          res.end(JSON.stringify({ isAdmin, role: isAdmin ? 'admin' : 'user' }));
          return;
        }

        // Audited View Tracking with Anti-Spam protection
        if (url === '/api/views/track') {
          const { postId, viewerId, durationSeconds } = payload;
          if (!postId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing postId' }));
            return;
          }

          const auditKey = `${postId}_${viewerId || req.socket.remoteAddress}`;
          const lastTime = viewAuditMap.get(auditKey) || 0;
          const now = Date.now();

          // Reject if view event sent within 30 seconds from same client (anti-spam)
          if (now - lastTime < 30000) {
            res.statusCode = 429;
            res.end(JSON.stringify({ verified: false, reason: 'rate_limited' }));
            return;
          }

          viewAuditMap.set(auditKey, now);

          // Clean map size periodically
          if (viewAuditMap.size > 5000) {
            viewAuditMap.clear();
          }

          res.statusCode = 200;
          res.end(JSON.stringify({ verified: true, eligibleForMonetization: (durationSeconds || 0) >= 3 }));
          return;
        }

        // Text sanitization & spam detection
        if (url === '/api/moderation/sanitize') {
          const rawText = String(payload.text || '');
          const isSpam = /((casino|betting|ບາຄາຣາ|ການພະນັນ)\s*online)/i.test(rawText);
          const sanitized = rawText.replace(/<[^>]*>?/gm, '').trim();

          res.statusCode = 200;
          res.end(JSON.stringify({ valid: !isSpam, sanitized, isFlagged: isSpam }));
          return;
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Invalid payload' }));
      }
    });

    return true;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method not allowed' }));
  return true;
}
