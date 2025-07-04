# URL Shortener Service

![Node.js](https://img.shields.io/badge/Node.js-v22.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.8-blue)
![Fastify](https://img.shields.io/badge/Fastify-v5.4-orange)
![MySQL](https://img.shields.io/badge/MySQL-v8.0-blue)
![Prometheus](https://img.shields.io/badge/Prometheus-latest-orange)
![Grafana](https://img.shields.io/badge/Grafana-latest-yellow)
![Jest](https://img.shields.io/badge/Jest-v30.0-red)

A robust URL shortening web service providing customizable link expiration, one-time use links, analytics, and rate limiting features.

## Table of Contents

- [URL Shortener Service](#url-shortener-service)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Features and Architecture](#features-and-architecture)
  - [Tech Stack](#tech-stack)
  - [How To Run](#how-to-run)
  - [How To Use](#how-to-use)
  - [Architecture Diagram](#architecture-diagram)
    - [API](#api)
    - [URL Shortening Flow](#url-shortening-flow)
    - [URL Redirection Flow](#url-redirection-flow)
  - [API Documentation](#api-documentation)
    - [Shorten URL](#shorten-url)
    - [Redirect to URL](#redirect-to-url)
    - [Analytics](#analytics)
  - [Database Schema](#database-schema)
  - [Tradeoffs and Architectural Decisions](#tradeoffs-and-architectural-decisions)
  - [Future Improvements](#future-improvements)

## Description

This project implements a URL shortening service. It generates short, unique codes for long URLs, with added features like expiration, one-time use restrictions, analytics tracking, and built-in rate limiting to protect resources.

## Features and Architecture

* **URL Shortening:** Generates random 6-character alphanumeric codes (over 56 billion possible combinations), ensuring low collision probability.
* **Expiration:** Links expire after 24 hours by default or a custom expiration date.
* **One-Time Links:** Shortened URLs can be marked as one-time use.
* **Analytics:** Track the number of visits to each shortened URL, along with detailed usage logs including IP addresses and user agents.
* **Rate Limiting:** Implemented with a fixed-window algorithm to prevent abuse, initially using in-memory caching with a future plan for distributed caching.
* **Observability:** Server metics with Prometheus and Grafana
* **Containerization**: Full Docker Compose setup for development and testing

## Tech Stack

* **Node.js 22**
* **TypeScript**
* **Fastify** (web framework)
* **Typebox** (schema validation)
* **Jest** (testing framework)
* **Docker Compose**
* **MySQL**
* **Knex** (ORM)
* **Prometheus**
* **Grafana**

## How To Run

1. Build the project
```sh
nvm use && npm i && npm run build
```
2. Build with docker compose
```sh
npm run docker:build
```
3. Run the project in dev environment
```sh
npm run docker:dev
```
4. Run all tests in e2e test environment
```sh
npm run docker:test
```
**In case of docker related errors, run:**
```sh
npm run docker:down
```

## How To Use
**1. Use URL shortening**
```sh
# Create a short URL code
curl -X POST -v -H "Content-Type: application/json" -d '{"url":"<INSERT_YOUR_URL_HERE>"}' "localhost:3000/shorten"
# Response will contain a short <code>
```
**To use the code:** http://localhost:3000/go/<INSERT_YOUR_CODE_HERE> (**NB!** Note the `/go` prefix in the URL!)

**2. Short URL expiration**
> Short URL codes will automatically expire after 24h

**3. One-time links**
```sh
# Create a short URL code with one_time=true
curl -X POST -v -H "Content-Type: application/json" -d '{"url":"<INSERT_YOUR_URL_HERE>","one_time":true}' "localhost:3000/shorten"
# Response will contain a short <code>
```
**To use the code:** http://localhost:3000/go/<INSERT_YOUR_CODE_HERE>

**4. Analytics**
```sh
curl "localhost:3000/go/<code>/analytics"
```

**5. Rate limiter**
> `POST /shorten` endpoint is rate limited at 10 req/min. Try it by runnin this endpoint 11 times.

**6. Observability stack**
- To access prometheus UI directly: http://localhost:9090
- To access Grafana dashboard: http://localhost:3001 (user: `admin`, password: `admin`)


## Architecture Diagram

### API
```mermaid
flowchart LR
    Client -->|POST /shorten| API
    Client -->|GET /go/:code| API
    Client -->|GET /go/:code/analytics| API

    subgraph Web Server
        API --> rate-limiter
        API --> DB[(MySQL)]
        API --> Cache[Local Cache]
    end

    DB -->|store & retrieve| urls
```

### URL Shortening Flow
```mermaid
flowchart TD
  User[User / Client]
  API[API Layer<br/>HTTP Server]
  RateLimiter[Rate Limiter<br/>node-cache]
  AppLogic[Application Logic]
  DB[(Database<br/>urls table)]
  Metrics[Metrics<br/>Prometheus/Grafana]

  User -->|POST /shorten| API
  API --> RateLimiter
  RateLimiter -->|Allow| AppLogic
  RateLimiter -.->|429| User

  AppLogic -->|Generate code,<br/>validate URL| AppLogic
  AppLogic -->|Store URL record| DB
  AppLogic -->|Return short code| User

  AppLogic --> Metrics
```

### URL Redirection Flow
```mermaid
flowchart TD
  User[User / Client]
  API[API Layer<br/>HTTP Server]
  AppLogic[Application Logic]
  DB[(Database<br/>urls table)]
  Metrics[Metrics<br/>Prometheus/Grafana]

  User -->|GET /go/:code| API
  API --> AppLogic
  AppLogic -->|Lookup code,<br/>check expiration,<br/>check one-time| DB

  AppLogic -->|Increment visits| DB
  AppLogic -->|Redirect 302| User
  AppLogic --> Metrics
```

## API Documentation

### Shorten URL

**POST** `/shorten`

Request:

```jsonc
{
  "url": "https://example.com",
  "one_time": true // optional
}
```

Response:

```jsonc
{
  "code": "aB3x9Z"
}
```

### Redirect to URL

**GET** `/go/:code`

Redirects user to the original URL. Handles expiration and one-time use logic.

### Analytics

**GET** `/go/:code/analytics`

Response:

```jsonc
{
  "visits": 42
}
```

## Database Schema

```sql
CREATE TABLE urls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original_url VARCHAR(2048) NOT NULL,
  code VARCHAR(6) UNIQUE NOT NULL,
  one_time BOOLEAN DEFAULT FALSE,
  visits INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Tradeoffs and Architectural Decisions

* Chose random 6-character codes over sequential generation to avoid predictability and maintain low collision probability.
* Implemented a fixed-window rate limiter using local memory cache for simplicity in MVP. A distributed cache like Redis is planned for future scalability.
* One-time links and analytics logic combined temporarily for simplicity, but should ideally be decoupled in future iterations.

## Future Improvements

* **URL Normalization:** Prevent duplicate URLs with minor differences (e.g., trailing slashes).
* **Distributed Caching:** Move rate limiting counters to Redis for horizontal scaling.
* **Advanced Rate Limiting:** Implement sliding window rate limiting algorithm.
* **Link Cleanup:** Scheduled cleanup of expired and obsolete links.
* **Security:** Checking URLs against known malicious domains.
* **Performance:** Cache redirects for faster responses.
* **Enhanced Analytics:** Track user agent, IP addresses, and referrers
* **Enhanced Observability:** Implement Prometheus metrics and Grafana dashboards.
* **Code Quality:** Add linter, prettier, and pre-commit hooks
