<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

This is all the information about my api endpoints 

Explore
OdNowa Backend API

1.0.0

OAS 3.1

/v3/api-docs

REST API for managing Users, Companies, Services, Transactions, Coin Additions, and AWS Cognito Authentication.
Apache 2.0
Servers
Authorize
Users

Endpoints for managing users
GET
/api/users/{id}
Get user by ID

Retrieves a single user by their unique identifier.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the user to retrieve

Example : 1
Responses
Code	Description	Links
200

User retrieved successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}

	No links
404

User not found
Media type

    Example Value
    Schema

{
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}

	No links
PUT
/api/users/{id}
Update an existing user

Updates an existing user's details by their ID.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the user to update

Example : 1
Request body

    Example Value
    Schema

{
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": false,
"isDeleted": false,
"isOwner": false
}

Responses
Code	Description	Links
200

User updated successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}

	No links
400

Invalid request payload
Media type

    Example Value
    Schema

{
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}

	No links
404

User not found
Media type

    Example Value
    Schema

{
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}

	No links
DELETE
/api/users/{id}
Delete user by ID

Removes a user record by their unique identifier.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the user to delete

Example : 1
Responses
Code	Description	Links
204

User deleted successfully
No links
404

User not found
No links
GET
/api/users
Get all users

Retrieves a list of all registered users.
Parameters
Try it out

No parameters
Responses
Code	Description	Links
200

List of users retrieved successfully
Media type
Controls Accept header.

    Example Value
    Schema

[
{
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}
]

	No links
POST
/api/users
Create a new user

Creates a new user record with name, surname, coins, and contact details.
Parameters
Try it out

No parameters
Request body

    Example Value
    Schema

{
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": false,
"isDeleted": false,
"isOwner": false
}

Responses
Code	Description	Links
201

User created successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}

	No links
400

Invalid request payload
Media type

    Example Value
    Schema

{
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}

	No links
Transactions

Endpoints for managing transactions and consumption by service providers
PUT
/api/transactions/{id}/consume
Consume transaction by ID

Marks a transaction as consumed by the service provider. Sets isValid to false and isConsumed to true. Rejects if already consumed.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the transaction to consume

Example : 1
providerId
integer($int32)
(query)


Optional service provider company ID to verify ownership

Example : 1
Responses
Code	Description	Links
200

Transaction consumed successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
400

Transaction already consumed or provider ID mismatch
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
404

Transaction not found
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
POST
/api/transactions/{id}/consume
Consume transaction by ID

Marks a transaction as consumed by the service provider. Sets isValid to false and isConsumed to true. Rejects if already consumed.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the transaction to consume

Example : 1
providerId
integer($int32)
(query)


Optional service provider company ID to verify ownership

Example : 1
Responses
Code	Description	Links
200

Transaction consumed successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
400

Transaction already consumed or provider ID mismatch
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
404

Transaction not found
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
PATCH
/api/transactions/{id}/consume
Consume transaction by ID

Marks a transaction as consumed by the service provider. Sets isValid to false and isConsumed to true. Rejects if already consumed.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the transaction to consume

Example : 1
providerId
integer($int32)
(query)


Optional service provider company ID to verify ownership

Example : 1
Responses
Code	Description	Links
200

Transaction consumed successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
400

Transaction already consumed or provider ID mismatch
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
404

Transaction not found
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
GET
/api/transactions/{id}
Get transaction by ID

Retrieves a single transaction by its unique identifier.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the transaction to retrieve

Example : 1
Responses
Code	Description	Links
200

Transaction retrieved successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
404

Transaction not found
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
PUT
/api/transactions/{id}
Update an existing transaction

Updates an existing transaction by its ID.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the transaction to update

Example : 1
Request body

    Example Value
    Schema

{
"userId": 1,
"phoneNumber": 123456789,
"serviceId": 1,
"date": "2026-09-12"
}

Responses
Code	Description	Links
200

Transaction updated successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
400

Invalid request payload or insufficient coins
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
404

Transaction, user, or service not found
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
DELETE
/api/transactions/{id}
Delete transaction by ID

Removes a transaction record by its unique identifier.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the transaction to delete

Example : 1
Responses
Code	Description	Links
204

Transaction deleted successfully
No links
404

Transaction not found
No links
GET
/api/transactions
Get all transactions

Retrieves a list of all transactions, optionally filtered by user ID, service provider (company ID), service ID, or validity/consumption status.
Parameters
Try it out
Name	Description
userId
integer($int32)
(query)


Optional filter by user ID

Example : 1
providerId
integer($int32)
(query)


Optional filter by service provider company ID

Example : 1
serviceId
integer($int32)
(query)


Optional filter by service ID

Example : 1
isValid
boolean
(query)


Optional filter by valid (unconsumed) status

Example : true
isConsumed
boolean
(query)


Optional filter by consumed status

Example : false
Responses
Code	Description	Links
200

List of transactions retrieved successfully
Media type
Controls Accept header.

    Example Value
    Schema

[
{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}
]

	No links
POST
/api/transactions
Create a new transaction

Creates a new transaction record linking a user (via userId or phoneNumber), service, and execution date.
Parameters
Try it out

No parameters
Request body

    Example Value
    Schema

{
"userId": 1,
"phoneNumber": 123456789,
"serviceId": 1,
"date": "2026-09-12"
}

Responses
Code	Description	Links
201

Transaction created successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
400

Invalid request payload or insufficient coins
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
404

User or service not found
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
POST
/api/transactions/consume
Consume transaction via payload or query

Consumes a transaction specifying transactionId and optional providerId in request body or request parameters.
Parameters
Try it out
Name	Description
transactionId
integer($int32)
(query)


Transaction ID if not provided in body

Example : 1
providerId
integer($int32)
(query)


Provider ID if not provided in body

Example : 1
Request body

    Example Value
    Schema

{
"transactionId": 1,
"providerId": 1
}

Responses
Code	Description	Links
200

Transaction consumed successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
400

Transaction already consumed or invalid request
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
404

Transaction not found
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
POST
/api/transactions/by-phone
Create transaction by user phone number

Creates a new transaction for a user identified solely by their phone number.
Parameters
Try it out

No parameters
Request body

    Example Value
    Schema

{
"phoneNumber": 123456789,
"serviceId": 1,
"date": "2026-09-12"
}

Responses
Code	Description	Links
201

Transaction created successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
400

Invalid request payload or insufficient coins
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
404

User or service not found
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}

	No links
GET
/api/transactions/user/{userId}/provider/{providerId}
Get user transactions by service provider

Retrieves transactions for a specific user filtered by the service provider company.
Parameters
Try it out
Name	Description
userId *
integer($int32)
(path)


ID of the user

Example : 1
providerId *
integer($int32)
(path)


ID of the service provider company

Example : 1
isValid
boolean
(query)


Optional filter by valid (unconsumed) status

Example : true
isConsumed
boolean
(query)


Optional filter by consumed status

Example : false
Responses
Code	Description	Links
200

List of user transactions for the provider retrieved successfully
Media type
Controls Accept header.

    Example Value
    Schema

[
{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}
]

	No links
GET
/api/transactions/provider/{providerId}
Get transactions by service provider

Retrieves transactions associated with a specific service provider (company ID), optionally filtered by user ID, phone number, or validity/consumption status.
Parameters
Try it out
Name	Description
providerId *
integer($int32)
(path)


ID of the service provider company

Example : 1
userId
integer($int32)
(query)


Optional filter by user ID

Example : 1
phoneNumber
integer($int32)
(query)


Optional filter by user phone number

Example : 123456789
isValid
boolean
(query)


Optional filter by valid (unconsumed) status

Example : true
isConsumed
boolean
(query)


Optional filter by consumed status

Example : false
Responses
Code	Description	Links
200

List of transactions retrieved successfully
Media type
Controls Accept header.

    Example Value
    Schema

[
{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}
]

	No links
404

User not found (when phone number filter is used)
Media type

    Example Value
    Schema

[
{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}
]

	No links
GET
/api/transactions/by-provider/{providerId}
Get transactions by service provider (alias)

Retrieves transactions associated with a specific service provider company.
Parameters
Try it out
Name	Description
providerId *
integer($int32)
(path)


ID of the service provider company

Example : 1
userId
integer($int32)
(query)


Optional filter by user ID

Example : 1
phoneNumber
integer($int32)
(query)


Optional filter by user phone number

Example : 123456789
isValid
boolean
(query)


Optional filter by valid (unconsumed) status

Example : true
isConsumed
boolean
(query)


Optional filter by consumed status

Example : false
Responses
Code	Description	Links
200

List of transactions retrieved successfully
Media type
Controls Accept header.

    Example Value
    Schema

[
{
"id": 1,
"userId": 1,
"serviceId": 1,
"providerId": 1,
"providerName": "Coffee Lab",
"serviceName": "Espresso",
"coinCost": 15,
"isValid": true,
"isConsumed": false,
"date": "2026-09-12"
}
]

	No links
Authentication

Endpoints for user authentication and creation via AWS Cognito
POST
/api/auth/resend-code
Resend confirmation code

Resends the email confirmation code for an unconfirmed account.
Parameters
Try it out

No parameters
Request body

    Example Value
    Schema

{
"email": "user@example.com"
}

Responses
Code	Description	Links
200

Confirmation code resent successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
400

Invalid email or user already confirmed
Media type

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
POST
/api/auth/register
Register user

Registers a new user account with AWS Cognito and creates a corresponding local profile.
Parameters
Try it out

No parameters
Request body

    Example Value
    Schema

{
"email": "user@example.com",
"password": "Secret123",
"name": "Jan",
"surname": "Kowalski",
"phoneNumber": 123456789,
"isOwner": false
}

Responses
Code	Description	Links
201

User successfully registered in Cognito and local database
Media type
Controls Accept header.

    Example Value
    Schema

{
"message": "User registered successfully. Please check your email for confirmation code.",
"userSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"email": "user@example.com",
"isConfirmed": false,
"user": {
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}
}

	No links
400

Invalid request payload or weak password
Media type

    Example Value
    Schema

{
"message": "User registered successfully. Please check your email for confirmation code.",
"userSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"email": "user@example.com",
"isConfirmed": false,
"user": {
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}
}

	No links
409

User with this email already exists
Media type

    Example Value
    Schema

{
"message": "User registered successfully. Please check your email for confirmation code.",
"userSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"email": "user@example.com",
"isConfirmed": false,
"user": {
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}
}

	No links
POST
/api/auth/refresh
Refresh tokens

Issues a new AccessToken and IdToken using a valid Cognito RefreshToken.
Parameters
Try it out

No parameters
Request body

    Example Value
    Schema

{
"refreshToken": "eyJjdHkiOiJ..."
}

Responses
Code	Description	Links
200

Tokens refreshed successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"accessToken": "eyJraWQiOiJ...",
"idToken": "eyJraWQiOiJ...",
"refreshToken": "eyJjdHkiOiJ...",
"expiresIn": 3600,
"tokenType": "Bearer",
"user": {
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}
}

	No links
401

Invalid or expired refresh token
Media type

    Example Value
    Schema

{
"accessToken": "eyJraWQiOiJ...",
"idToken": "eyJraWQiOiJ...",
"refreshToken": "eyJjdHkiOiJ...",
"expiresIn": 3600,
"tokenType": "Bearer",
"user": {
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}
}

	No links
POST
/api/auth/phone/verify
Verify phone number via SMS code

Verifies the SMS code sent to the mobile device and marks the phone number as verified.
Parameters
Try it out
Name	Description
Authorization
string
(header)


Bearer access token
Request body

    Example Value
    Schema

{
"phoneNumber": 123456789,
"code": "123456",
"accessToken": "eyJraWQi..."
}

Responses
Code	Description	Links
200

Phone number verified successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
400

Invalid or expired SMS verification code
Media type

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
401

Unauthorized - invalid access token
Media type

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
POST
/api/auth/phone/send-code
Input phone number and send SMS verification code

Registers the user's phone number separately and requests an SMS verification code from AWS Cognito.
Parameters
Try it out
Name	Description
Authorization
string
(header)


Bearer access token
Request body

    Example Value
    Schema

{
"phoneNumber": 123456789,
"accessToken": "eyJraWQi..."
}

Responses
Code	Description	Links
200

SMS verification code sent successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
400

Invalid phone number format
Media type

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
401

Unauthorized - invalid access token
Media type

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
POST
/api/auth/phone/resend-code
Resend phone SMS verification code
POST
/api/auth/logout
Log out

Signs out the user globally from all devices and invalidates all issued Cognito refresh tokens.
Parameters
Try it out
Name	Description
Authorization *
string
(header)


Bearer access token
Responses
Code	Description	Links
200

Successfully logged out
Media type
Controls Accept header.

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
401

Invalid access token
Media type

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
POST
/api/auth/login
Log in

Authenticates user credentials against AWS Cognito and returns JWT tokens (AccessToken, IdToken, RefreshToken) along with user profile.
Parameters
Try it out

No parameters
Request body

    Example Value
    Schema

{
"email": "user@example.com",
"password": "Secret123"
}

Responses
Code	Description	Links
200

Authentication successful
Media type
Controls Accept header.

    Example Value
    Schema

{
"accessToken": "eyJraWQiOiJ...",
"idToken": "eyJraWQiOiJ...",
"refreshToken": "eyJjdHkiOiJ...",
"expiresIn": 3600,
"tokenType": "Bearer",
"user": {
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}
}

	No links
401

Incorrect username or password
Media type

    Example Value
    Schema

{
"accessToken": "eyJraWQiOiJ...",
"idToken": "eyJraWQiOiJ...",
"refreshToken": "eyJjdHkiOiJ...",
"expiresIn": 3600,
"tokenType": "Bearer",
"user": {
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}
}

	No links
403

User account not confirmed
Media type

    Example Value
    Schema

{
"accessToken": "eyJraWQiOiJ...",
"idToken": "eyJraWQiOiJ...",
"refreshToken": "eyJjdHkiOiJ...",
"expiresIn": 3600,
"tokenType": "Bearer",
"user": {
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}
}

	No links
POST
/api/auth/forgot-password
Forgot password

Requests a password reset code sent to the user's verified email.
Parameters
Try it out

No parameters
Request body

    Example Value
    Schema

{
"email": "user@example.com"
}

Responses
Code	Description	Links
200

Password reset code sent
Media type
Controls Accept header.

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
404

User not found
Media type

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
POST
/api/auth/confirm
Confirm registration

Confirms a newly registered user account using the verification code sent to their email.
Parameters
Try it out

No parameters
Request body

    Example Value
    Schema

{
"email": "user@example.com",
"confirmationCode": "123456"
}

Responses
Code	Description	Links
200

Email confirmed successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
400

Invalid or expired confirmation code
Media type

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
POST
/api/auth/confirm-forgot-password
Confirm forgot password

Resets user password using the verification code received via email.
Parameters
Try it out

No parameters
Request body

    Example Value
    Schema

{
"email": "user@example.com",
"confirmationCode": "123456",
"newPassword": "NewSecret123"
}

Responses
Code	Description	Links
200

Password successfully reset
Media type
Controls Accept header.

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
400

Invalid confirmation code or password policy violation
Media type

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
POST
/api/auth/change-password
Change password

Changes the password for an authenticated user using their current AccessToken.
Parameters
Try it out
Name	Description
Authorization
string
(header)


Bearer access token
Request body

    Example Value
    Schema

{
"accessToken": "eyJraWQiOiJ...",
"previousPassword": "OldSecret123",
"proposedPassword": "NewSecret123"
}

Responses
Code	Description	Links
200

Password changed successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
400

Invalid previous password or new password does not meet policy requirements
Media type

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
401

Unauthorized - invalid access token
Media type

    Example Value
    Schema

{
"message": "Operation completed successfully",
"success": true
}

	No links
GET
/api/auth/me
Get current user profile

Retrieves the currently authenticated user's profile from the database matching the Bearer AccessToken.
Parameters
Try it out
Name	Description
Authorization *
string
(header)


Bearer access token
Responses
Code	Description	Links
200

User profile retrieved successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}

	No links
401

Invalid or expired access token
Media type

    Example Value
    Schema

{
"id": 1,
"email": "jan.kowalski@example.com",
"cognitoSub": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
"cognitoUsername": "c2a9a473-b43e-4b47-bcf7-9a4f7e271a39",
"name": "Jan",
"coins": 100,
"surname": "Kowalski",
"phoneNumber": 123456789,
"isPhoneVerified": true,
"isDeleted": false,
"isOwner": false
}

	No links
Services

Endpoints for managing services/offerings
GET
/api/services/{id}
Get service by ID
PUT
/api/services/{id}
Update an existing service
DELETE
/api/services/{id}
Delete service by ID
GET
/api/services
Get all services
POST
/api/services
Create a new service
Companies

Endpoints for managing companies and company static resources
GET
/api/companies/{id}
Get company by ID

Retrieves a single company by its unique identifier.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the company to retrieve

Example : 1
Responses
Code	Description	Links
200

Company retrieved successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"name": "EkoPiekarnia",
"locationX": 52.23,
"locationY": 21.01,
"description": "Lokalna piekarnia rzemieślnicza",
"ownerId": 1,
"isInRevitalizationZone": true,
"picture": "/uploads/companies/example.jpg"
}

	No links
404

Company not found
Media type

    Example Value
    Schema

{
"id": 1,
"name": "EkoPiekarnia",
"locationX": 52.23,
"locationY": 21.01,
"description": "Lokalna piekarnia rzemieślnicza",
"ownerId": 1,
"isInRevitalizationZone": true,
"picture": "/uploads/companies/example.jpg"
}

	No links
PUT
/api/companies/{id}
Update an existing company

Updates an existing company's information by its ID.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the company to update

Example : 1
Request body

    Example Value
    Schema

{
"name": "EkoPiekarnia",
"locationX": 52.23,
"locationY": 21.01,
"description": "Lokalna piekarnia rzemieślnicza",
"ownerId": 1,
"isInRevitalizationZone": false,
"picture": "/uploads/companies/example.jpg"
}

Responses
Code	Description	Links
200

Company updated successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"name": "EkoPiekarnia",
"locationX": 52.23,
"locationY": 21.01,
"description": "Lokalna piekarnia rzemieślnicza",
"ownerId": 1,
"isInRevitalizationZone": true,
"picture": "/uploads/companies/example.jpg"
}

	No links
400

Invalid request payload
Media type

    Example Value
    Schema

{
"id": 1,
"name": "EkoPiekarnia",
"locationX": 52.23,
"locationY": 21.01,
"description": "Lokalna piekarnia rzemieślnicza",
"ownerId": 1,
"isInRevitalizationZone": true,
"picture": "/uploads/companies/example.jpg"
}

	No links
404

Company or owner user not found
Media type

    Example Value
    Schema

{
"id": 1,
"name": "EkoPiekarnia",
"locationX": 52.23,
"locationY": 21.01,
"description": "Lokalna piekarnia rzemieślnicza",
"ownerId": 1,
"isInRevitalizationZone": true,
"picture": "/uploads/companies/example.jpg"
}

	No links
DELETE
/api/companies/{id}
Delete company by ID

Removes a company record by its unique identifier.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the company to delete

Example : 1
Responses
Code	Description	Links
204

Company deleted successfully
No links
404

Company not found
No links
GET
/api/companies/{id}/image
Get company picture resource

Serves the image file static resource directly for the specified company.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the company

Example : 1
Responses
Code	Description	Links
200

Image resource returned successfully
Media type
Controls Accept header.

    Example Value
    Schema

string

	No links
404

Company or image not found
Media type

    Example Value
    Schema

string

	No links
PUT
/api/companies/{id}/image
Update company picture

Replaces the existing picture of the company with a newly uploaded image file.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the company

Example : 1
Request body
file *
string($binary)


New image file to replace the old one
Responses
Code	Description	Links
200

Image updated successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"name": "EkoPiekarnia",
"locationX": 52.23,
"locationY": 21.01,
"description": "Lokalna piekarnia rzemieślnicza",
"ownerId": 1,
"isInRevitalizationZone": true,
"picture": "/uploads/companies/example.jpg"
}

	No links
400

Invalid image file
Media type

    Example Value
    Schema

{
"id": 1,
"name": "EkoPiekarnia",
"locationX": 52.23,
"locationY": 21.01,
"description": "Lokalna piekarnia rzemieślnicza",
"ownerId": 1,
"isInRevitalizationZone": true,
"picture": "/uploads/companies/example.jpg"
}

	No links
404

Company not found
Media type

    Example Value
    Schema

{
"id": 1,
"name": "EkoPiekarnia",
"locationX": 52.23,
"locationY": 21.01,
"description": "Lokalna piekarnia rzemieślnicza",
"ownerId": 1,
"isInRevitalizationZone": true,
"picture": "/uploads/companies/example.jpg"
}

	No links
POST
/api/companies/{id}/image
Upload company picture

Uploads a picture image file (JPG, PNG, GIF, WEBP) for the specified company.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the company

Example : 1
Request body
file *
string($binary)


Image file to upload
Responses
Code	Description	Links
200

Image uploaded successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"name": "EkoPiekarnia",
"locationX": 52.23,
"locationY": 21.01,
"description": "Lokalna piekarnia rzemieślnicza",
"ownerId": 1,
"isInRevitalizationZone": true,
"picture": "/uploads/companies/example.jpg"
}

	No links
400

Invalid image file
Media type

    Example Value
    Schema

{
"id": 1,
"name": "EkoPiekarnia",
"locationX": 52.23,
"locationY": 21.01,
"description": "Lokalna piekarnia rzemieślnicza",
"ownerId": 1,
"isInRevitalizationZone": true,
"picture": "/uploads/companies/example.jpg"
}

	No links
404

Company not found
Media type

    Example Value
    Schema

{
"id": 1,
"name": "EkoPiekarnia",
"locationX": 52.23,
"locationY": 21.01,
"description": "Lokalna piekarnia rzemieślnicza",
"ownerId": 1,
"isInRevitalizationZone": true,
"picture": "/uploads/companies/example.jpg"
}

	No links
DELETE
/api/companies/{id}/image
Delete company picture

Deletes the stored picture of the company from disk and clears the reference.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the company

Example : 1
Responses
Code	Description	Links
204

Image deleted successfully
No links
404

Company not found
No links
GET
/api/companies
Get all companies

Retrieves a list of all companies, optionally filtered by owner ID.
Parameters
Try it out
Name	Description
ownerId
integer($int32)
(query)


Optional filter by owner user ID

Example : 1
Responses
Code	Description	Links
200

List of companies retrieved successfully
Media type
Controls Accept header.

    Example Value
    Schema

[
{
"id": 1,
"name": "EkoPiekarnia",
"locationX": 52.23,
"locationY": 21.01,
"description": "Lokalna piekarnia rzemieślnicza",
"ownerId": 1,
"isInRevitalizationZone": true,
"picture": "/uploads/companies/example.jpg"
}
]

	No links
POST
/api/companies
Create a new company
Coin Additions

Endpoints for managing coin additions
GET
/api/coin-additions/{id}
Get coin addition by ID

Retrieves a single coin addition by its unique identifier.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the coin addition to retrieve

Example : 1
Responses
Code	Description	Links
200

Coin addition retrieved successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"companyId": 1,
"coinAmount": 50,
"date": "2026-09-12"
}

	No links
404

Coin addition not found
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"companyId": 1,
"coinAmount": 50,
"date": "2026-09-12"
}

	No links
PUT
/api/coin-additions/{id}
Update an existing coin addition

Updates an existing coin addition record by its ID.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the coin addition to update

Example : 1
Request body

    Example Value
    Schema

{
"userId": 1,
"companyId": 1,
"coinAmount": 50,
"date": "2026-09-12"
}

Responses
Code	Description	Links
200

Coin addition updated successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"companyId": 1,
"coinAmount": 50,
"date": "2026-09-12"
}

	No links
400

Invalid request payload
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"companyId": 1,
"coinAmount": 50,
"date": "2026-09-12"
}

	No links
404

Coin addition, user, or company not found
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"companyId": 1,
"coinAmount": 50,
"date": "2026-09-12"
}

	No links
DELETE
/api/coin-additions/{id}
Delete coin addition by ID

Removes a coin addition record by its unique identifier.
Parameters
Try it out
Name	Description
id *
integer($int32)
(path)


ID of the coin addition to delete

Example : 1
Responses
Code	Description	Links
204

Coin addition deleted successfully
No links
404

Coin addition not found
No links
GET
/api/coin-additions
Get all coin additions

Retrieves a list of all coin additions, optionally filtered by user ID or company ID.
Parameters
Try it out
Name	Description
userId
integer($int32)
(query)


Optional filter by user ID

Example : 1
companyId
integer($int32)
(query)


Optional filter by company ID

Example : 1
Responses
Code	Description	Links
200

List of coin additions retrieved successfully
Media type
Controls Accept header.

    Example Value
    Schema

[
{
"id": 1,
"userId": 1,
"companyId": 1,
"coinAmount": 50,
"date": "2026-09-12"
}
]

	No links
POST
/api/coin-additions
Create a new coin addition

Records an addition of coins from a company to a user on a specific date.
Parameters
Try it out

No parameters
Request body

    Example Value
    Schema

{
"userId": 1,
"companyId": 1,
"coinAmount": 50,
"date": "2026-09-12"
}

Responses
Code	Description	Links
201

Coin addition created successfully
Media type
Controls Accept header.

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"companyId": 1,
"coinAmount": 50,
"date": "2026-09-12"
}

	No links
400

Invalid request payload
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"companyId": 1,
"coinAmount": 50,
"date": "2026-09-12"
}

	No links
404

User or company not found
Media type

    Example Value
    Schema

{
"id": 1,
"userId": 1,
"companyId": 1,
"coinAmount": 50,
"date": "2026-09-12"
}

	No links
Schemas
TransactionResponseDto
Expand allobject
UserRequestDto
Expand allobject
UserResponseDto
Expand allobject
TransactionRequestDto
Expand allobject
ServiceRequestDto
Expand allobject
ServiceResponseDto
Expand allobject
CompanyRequestDto
Expand allobject
CompanyResponseDto
Expand allobject
CoinAdditionRequestDto
Expand allobject
CoinAdditionResponseDto
Expand allobject
ConsumeTransactionRequestDto
Expand allobject
TransactionByPhoneRequestDto
Expand allobject
ResendCodeRequestDto
Expand allobject
MessageResponseDto
Expand allobject
RegisterRequestDto
Expand allobject
RegisterResponseDto
Expand allobject
RefreshTokenRequestDto
Expand allobject
AuthResponseDto
Expand allobject
ConfirmPhoneRequestDto
Expand allobject
PhoneVerificationRequestDto
Expand allobject
LoginRequestDto
Expand allobject
ForgotPasswordRequestDto
Expand allobject
ConfirmSignUpRequestDto
Expand allobject
ConfirmForgotPasswordRequestDto
Expand allobject
ChangePasswordRequestDto
Expand allobject


<!-- END:nextjs-agent-rules -->
