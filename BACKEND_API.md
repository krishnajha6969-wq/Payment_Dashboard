# Backend API contract

The frontend accepts direct JSON responses or responses wrapped in `data`. All monetary values should be stored and returned as numbers in INR.

## `GET /health`

Optional health endpoint for monitoring.

```json
{ "ok": true }
```

## `GET /payments`

Return either an array or `{ "payments": [...] }`.

```json
{
  "payments": [
    {
      "id": "payment-record-id",
      "registrationId": "registration-reference",
      "teamName": "Team name",
      "leaderName": "Team leader",
      "email": "leader@example.com",
      "category": "UG",
      "transactionId": "bank-transaction-reference",
      "date": "2026-09-21",
      "time": "14:30",
      "amount": 300,
      "status": "PENDING",
      "locked": false,
      "lockedAt": null,
      "lockedBy": null
    }
  ]
}
```

Accepted categories are `UG`, `PG` and `PPG`. Accepted statuses are `PENDING`, `APPROVED` and `REJECTED`.

## `POST /payments`

Create a payment submission. The server must validate every field and reject duplicate registration or transaction references as required by the event rules.

```json
{
  "registrationId": "registration-reference",
  "teamName": "Team name",
  "leaderName": "Team leader",
  "email": "leader@example.com",
  "category": "UG",
  "transactionId": "bank-transaction-reference",
  "amount": 300,
  "date": "2026-09-21",
  "time": "14:30"
}
```

Return the created record with HTTP `201`.

## `PATCH /payments/:id/verify`

```json
{ "status": "APPROVED" }
```

Only `APPROVED` or `REJECTED` is valid. Verification must be an authenticated, atomic backend operation:

- Reject a second decision when a payment is already locked.
- Record `locked`, `lockedAt` and `lockedBy` on the server.
- Only approved payments consume seats.
- Reject approval when the category capacity is full.
- Use a database transaction or equivalent concurrency control so two approvals cannot exceed capacity.
- Return HTTP `409` for a locked record or capacity conflict.

## `GET /payment-config`

```json
{
  "UG": { "fee": 300, "seats": 100 },
  "PG": { "fee": 300, "seats": 50 },
  "PPG": { "fee": 300, "seats": 50 }
}
```

The example values only demonstrate the schema. Return the event's real settings from the database.

## `PUT /payment-config`

Accept the same object as `GET /payment-config`. Require administrator authorization and validate that fees and seats are non-negative numbers.

## Security and deployment requirements

- Serve the API over HTTPS.
- Allow CORS only from the deployed dashboard origin.
- Authenticate administrator access and authorize every mutation.
- Rate-limit login and mutation endpoints.
- Validate and normalize input server-side.
- Keep database credentials and secrets in server environment variables.
- Return JSON errors as `{ "message": "Clear error message" }` with an appropriate HTTP status.

