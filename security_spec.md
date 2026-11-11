# Security Specification for LAOCHAT Firestore Database

## 1. Data Invariants
1. **User Identity & Profile Integrity**: A user can only write their own profile document where `userId == request.auth.uid`. A regular user can never elevate themselves to `role: 'admin'`, nor can they set `isVerifiedCreator: true` directly.
2. **Post Authorship**: A post can only be created if `request.resource.data.authorId == request.auth.uid`. A user cannot forge posts under another creator's name or ID.
3. **Immutable Post Fields**: Once created, `authorId`, `createdAt`, and `type` cannot be modified.
4. **Post Update Permission**: Only the author can update their post content/title/category, or an admin can update `status` (for moderation).
5. **No Direct Earnings Tampering**: Creators can NEVER directly create or update documents in `/creatorEarnings/{creatorId}`. All earnings calculations, views eligibility, and balances are strictly controlled by server/admin.
6. **Payout Request Legitimacy**: A creator can only create a payout request for their own `creatorId == request.auth.uid` with status `'pending'`. Once created, creators cannot mark their own payout requests as `'approved'`.
7. **Comment Authenticity**: Comments must have `request.resource.data.authorId == request.auth.uid` and valid `postId`.
8. **Like Atomicity & Uniqueness**: Likes can only be created by the authenticated user (`userId == request.auth.uid`). A user can only delete their own likes.
9. **Follow Integrity**: Users can only create follow documents where `followerId == request.auth.uid`, and cannot forge follows on behalf of other users.
10. **Admin Protection**: Admin operations require existence of an admin document in `/admins/$(request.auth.uid)` or matching authenticated admin. The bootstrap admin is `sabaichatai@gmail.com`.
11. **Sponsored Ads Protection**: Only admins can create, update, or delete advertisements in `/advertisements`. Regular users have read-only access.
12. **Content Moderation Reports**: Authenticated users can submit reports with `reporterId == request.auth.uid` and `status == 'pending'`. Only admins can review or change report status.

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1: Privilege Escalation in User Profile**
```json
{
  "path": "/users/victim123",
  "operation": "update",
  "auth": { "uid": "attacker456" },
  "data": { "role": "admin", "isVerifiedCreator": true }
}
```
*Expected: PERMISSION_DENIED*

2. **Payload 2: Forged Post Author ID**
```json
{
  "path": "/posts/post_hacked_01",
  "operation": "create",
  "auth": { "uid": "attacker456" },
  "data": {
    "id": "post_hacked_01",
    "authorId": "celebrity_creator_999",
    "authorName": "Somxay Celebrity",
    "type": "video",
    "content": "Malicious announcement",
    "category": "ຂ່າວສານ",
    "status": "active"
  }
}
```
*Expected: PERMISSION_DENIED*

3. **Payload 3: Direct Balance / Earnings Manipulation**
```json
{
  "path": "/creatorEarnings/attacker456",
  "operation": "create",
  "auth": { "uid": "attacker456" },
  "data": {
    "creatorId": "attacker456",
    "balanceAvailableKip": 50000000,
    "isMonetized": true
  }
}
```
*Expected: PERMISSION_DENIED*

4. **Payload 4: Self-Approved Payout Request**
```json
{
  "path": "/payoutRequests/req_999",
  "operation": "create",
  "auth": { "uid": "attacker456" },
  "data": {
    "id": "req_999",
    "creatorId": "attacker456",
    "amountKip": 10000000,
    "paymentMethod": "bcel_one",
    "accountNumber": "02099999999",
    "accountName": "Attacker",
    "status": "approved"
  }
}
```
*Expected: PERMISSION_DENIED*

5. **Payload 5: Overwriting Another User's Post**
```json
{
  "path": "/posts/post_somxay_1",
  "operation": "update",
  "auth": { "uid": "attacker456" },
  "data": { "content": "Defaced by attacker" }
}
```
*Expected: PERMISSION_DENIED*

6. **Payload 6: Deleting Someone Else's Comment**
```json
{
  "path": "/comments/comm_good_user",
  "operation": "delete",
  "auth": { "uid": "attacker456" }
}
```
*Expected: PERMISSION_DENIED*

7. **Payload 7: Unauthenticated Post Creation**
```json
{
  "path": "/posts/anon_post_01",
  "operation": "create",
  "auth": null,
  "data": { "content": "Spam bot link" }
}
```
*Expected: PERMISSION_DENIED*

8. **Payload 8: Creating Malicious Ad Without Admin Privilege**
```json
{
  "path": "/advertisements/ad_scam_01",
  "operation": "create",
  "auth": { "uid": "attacker456" },
  "data": {
    "id": "ad_scam_01",
    "title": "Crypto Scam",
    "brandName": "Fake Lao Bank",
    "targetUrl": "https://phishing.example.com",
    "status": "active"
  }
}
```
*Expected: PERMISSION_DENIED*

9. **Payload 9: Altering Author ID on Post Update (Identity Theft)**
```json
{
  "path": "/posts/post_original_01",
  "operation": "update",
  "auth": { "uid": "author_user_01" },
  "data": { "authorId": "different_user_02" }
}
```
*Expected: PERMISSION_DENIED*

10. **Payload 10: Forged Follow Relation (Following on Behalf of Others)**
```json
{
  "path": "/follows/victim_target",
  "operation": "create",
  "auth": { "uid": "attacker456" },
  "data": {
    "id": "victim_target",
    "followerId": "innocent_victim_789",
    "creatorId": "attacker456"
  }
}
```
*Expected: PERMISSION_DENIED*

11. **Payload 11: Injecting 2MB String in Post Title (Denial of Wallet)**
```json
{
  "path": "/posts/oversized_post_01",
  "operation": "create",
  "auth": { "uid": "attacker456" },
  "data": {
    "id": "oversized_post_01",
    "authorId": "attacker456",
    "title": "A".repeat(500000),
    "content": "Normal content",
    "category": "ທົ່ວໄປ",
    "status": "active"
  }
}
```
*Expected: PERMISSION_DENIED*

12. **Payload 12: Creating Admin Document Direct Bypass**
```json
{
  "path": "/admins/attacker456",
  "operation": "create",
  "auth": { "uid": "attacker456" },
  "data": { "email": "attacker@evil.com", "role": "admin" }
}
```
*Expected: PERMISSION_DENIED*

## 3. Test Runner Concept (firestore.rules.test.ts)
A test suite structure verifying all 12 payloads return PERMISSION_DENIED under the ruleset.
