# Context for Claude Code

## Telephony (SMS, voice)

This app does NOT talk to Twilio, Retell, or any telephony provider directly.
All SMS and voice flows through `ahc-switchboard`.

**Before writing any messaging code, read:**
https://github.com/torontocarlos/ahc-switchboard/blob/main/docs/integration-guide.md

**Specifically you must:**
- Use `SWITCHBOARD_TOKEN` (issued at app registration) — not Twilio credentials
- Call `POST /api/sms/send` on switchboard for outbound SMS
- Implement an HMAC-signed inbound webhook if this app needs to receive replies
- Treat `status: "blocked"` (200 OK) as a normal response, not an error
- Pass `idempotency_key` for any cron-driven sends

If you find the Twilio SDK installed in this app's package.json or `TWILIO_*` env
vars in this app's Vercel project, that's a bug — they should not be here.
