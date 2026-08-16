# TAPP Global Market Data — Founder Prototype

## Current objective

TAPP is a 24/7 platform. Individual instruments may be continuously tradable or may belong to venues with trading sessions. The platform must distinguish an inactive venue from a failed feed.

## Implemented in this update

- Browser market data flows through `/api/market/quotes`; provider credentials stay server-side.
- BTC is classified as a continuous 24/7 instrument and remains freshness-checked at all times.
- Current U.S. equity/ETF prototype symbols are session-aware. When their session is inactive, the last authoritative provider quote is retained and labeled `session-inactive` rather than `stale`.
- Session-inactive authoritative prices are never overwritten by the random-walk simulator.
- Only a stale instrument that is expected to be active degrades the global feed status.
- Gateway-unconfigured and gateway-error states retain an explicit simulated fallback for Founder testing.
- Frontend polling is throttled for the current Finnhub Founder/free REST allowance.

## Prototype limitations

The current session registry is intentionally small: BTC plus the U.S.-listed symbols already displayed by the Founder Prototype. It does not yet model exchange holidays, half-days, extended-hours entitlement differences, futures maintenance windows, forex weekends, or Asian/European exchanges.

The long-term implementation should replace the prototype registry with canonical venue calendars and provider-entitlement metadata so U.S., European, Asian, futures, forex, crypto, and other markets can be synchronized into one TAPP global market layer.

Finnhub REST polling is suitable only for Founder testing at the present symbol/user count. Production-scale 24/7 delivery will require licensed streaming/batched market data, shared server-side caching/fan-out, provider redundancy, and rate-limit controls.
