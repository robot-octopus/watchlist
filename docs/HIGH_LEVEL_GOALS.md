# Tastytrade Watchlist App (Take Home Challenge)

This is a SvelteKit-based watchlist application for Tastytrade's Open API Certification environment.

## Features

- Svelte front-end with modern CSS layout (Flexbox)
- Secure login with Tastytrade sandbox credentials
- Full CRUD support for watchlists
- Realtime price data (polling or streaming)
- Auto-complete symbol search
- Optional: Symbol details with 24-hour chart

## Core Goals

- Authenticate using sandbox credentials to retrieve a session token
- List, switch, create, delete, and modify watchlists
- Search and add symbols using auto-complete
- Display quotes with at least 5s polling (bonus: streaming)
- Follow Svelte and accessibility best practices

## UX Expectations

- Responsive layout (Grid/Flexbox)
- Clear watchlist switching UI
- Table with Symbol, Bid, Ask, Last Price
- Create/modify/delete with clean UX
- Bonus: Symbol click = detail + chart

## Tech Requirements

- Svelte or SvelteKit
- No jQuery
- Open-source libraries allowed (e.g., chart.js)
- Clean architecture, component separation
- README + disclosure of AI use

## Bonus

- Streaming market data
- 24-hour candle chart on symbol click
