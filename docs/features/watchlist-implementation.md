# Watchlist Implementation Plan

## 🎯 Goal: Complete Watchlist CRUD + Real-Time Quotes

### 📋 Overview

Implement full watchlist management with Tastytrade API integration, including create/read/update/delete operations and 5-second quote polling.

## Phase 1: Watchlist CRUD Operations

### 🎯 Objective

Implement basic watchlist management using Tastytrade's watchlist endpoints.

### 📝 Tasks

#### 1.1 Watchlist API Client

**File:** `src/lib/api/clients/watchlists.ts`

```typescript
export class WatchlistClient {
  async getWatchlists(): Promise<Watchlist[]>;
  async createWatchlist(name: string): Promise<Watchlist>;
  async deleteWatchlist(id: string): Promise<void>;
  async addSymbol(watchlistId: string, symbol: string): Promise<void>;
  async removeSymbol(watchlistId: string, symbol: string): Promise<void>;
}
```

#### 1.2 Watchlist Store

**File:** `src/lib/stores/watchlist.ts`

```typescript
interface WatchlistStore {
  watchlists: Watchlist[]
  activeWatchlist: Watchlist | null
  loading: boolean
  error: string | null
}

// Actions
export const watchlistStore = {
  loadWatchlists()
  createWatchlist(name: string)
  deleteWatchlist(id: string)
  setActiveWatchlist(id: string)
  addSymbol(symbol: string)
  removeSymbol(symbol: string)
}
```

#### 1.3 Watchlist Data Types

**File:** `src/lib/api/types/watchlists.ts`

```typescript
interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  createdAt: string;
  updatedAt: string;
}

interface WatchlistSymbol {
  symbol: string;
  addedAt: string;
}
```

### ✅ Acceptance Criteria

- [ ] Can create new watchlists with custom names
- [ ] Can delete existing watchlists
- [ ] Can switch between multiple watchlists
- [ ] Can add symbols to active watchlist
- [ ] Can remove symbols from active watchlist
- [ ] All operations sync with Tastytrade API
- [ ] Error handling for all CRUD operations

### 📊 Estimated Effort: 8-10 hours

---

## Phase 2: Symbol Search Integration

### 🎯 Objective

Implement auto-complete symbol search when adding symbols to watchlists.

### 📝 Tasks

#### 2.1 Symbol Search API Client

**File:** `src/lib/api/clients/symbol-search.ts`

```typescript
export class SymbolSearchClient {
  async searchSymbols(query: string): Promise<Symbol[]>;
  async getSymbolDetails(symbol: string): Promise<SymbolDetails>;
}
```

#### 2.2 Symbol Search Component

**File:** `src/lib/components/AddSymbolForm.svelte`

```svelte
<script>
  // Auto-complete search input
  // Debounced API calls
  // Symbol selection handling
  // Add to active watchlist
</script>
```

#### 2.3 Search Results UI

- Dropdown with symbol suggestions
- Symbol details on hover/selection
- Recent symbols cache
- Search history

### ✅ Acceptance Criteria

- [ ] Auto-complete search works with <3 character delay
- [ ] Shows symbol details (name, exchange, type)
- [ ] Can select symbol from dropdown
- [ ] Symbol gets added to active watchlist
- [ ] Search history persists during session
- [ ] Handles API errors gracefully

### 📊 Estimated Effort: 6-8 hours

---

## Phase 3: Real-Time Quote Display

### 🎯 Objective

Display real-time quotes for watchlist symbols with 5-second updates.

### 📝 Tasks

#### 3.1 Market Data API Client

**File:** `src/lib/api/clients/market-metrics.ts`

```typescript
export class MarketDataClient {
  async getQuotes(symbols: string[]): Promise<Quote[]>;
  async subscribeToQuotes(symbols: string[], callback: (quotes: Quote[]) => void);
  async unsubscribeFromQuotes(symbols: string[]);
}
```

#### 3.2 Quote Data Store

**File:** `src/lib/stores/quotes.ts`

```typescript
interface QuoteStore {
  quotes: Map<string, Quote>
  lastUpdate: Date
  subscriptions: Set<string>
  isStreaming: boolean
}

// Real-time quote management
export const quotesStore = {
  subscribeToSymbols(symbols: string[])
  unsubscribeFromSymbols(symbols: string[])
  updateQuotes(quotes: Quote[])
  startPolling()
  stopPolling()
}
```

#### 3.3 Watchlist Table Component

**File:** `src/lib/components/WatchlistTable.svelte`

```svelte
<!-- Displays symbols with real-time quotes -->
<table>
  <thead>
    <tr>
      <th>Symbol</th>
      <th>Bid</th>
      <th>Ask</th>
      <th>Last</th>
      <th>Change</th>
      <th>% Change</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each watchlistSymbols as symbol}
      <tr>
        <!-- Real-time quote data -->
      </tr>
    {/each}
  </tbody>
</table>
```

### ✅ Acceptance Criteria

- [ ] Displays bid, ask, last price for each symbol
- [ ] Shows price change and percentage change
- [ ] Color-coded positive/negative changes (green/red)
- [ ] Updates every 5 seconds automatically
- [ ] Subscription management (start/stop on watchlist change)
- [ ] Loading states during quote fetching
- [ ] Error handling for failed quote requests

### 📊 Estimated Effort: 8-10 hours

---

## Phase 4: Watchlist Manager UI

### 🎯 Objective

Create the main watchlist management interface with tabs and controls.

### 📝 Tasks

#### 4.1 Watchlist Manager Component

**File:** `src/lib/components/WatchlistManager.svelte`

```svelte
<script>
  // Tab-based watchlist switching
  // Create/delete watchlist controls
  // Active watchlist state management
</script>

<div class="watchlist-manager">
  <!-- Watchlist tabs -->
  <!-- Create new watchlist button -->
  <!-- Active watchlist content -->
  <!-- Add symbol form -->
  <!-- Watchlist table -->
</div>
```

#### 4.2 Watchlist Tabs Component

```svelte
<!-- Tab navigation for switching watchlists -->
{#each watchlists as watchlist}
  <button
    class:active={watchlist.id === activeWatchlist?.id}
    on:click={() => setActiveWatchlist(watchlist.id)}
  >
    {watchlist.name}
    <button on:click={() => deleteWatchlist(watchlist.id)}>×</button>
  </button>
{/each}
```

#### 4.3 Create Watchlist Form

```svelte
<form on:submit={handleCreateWatchlist}>
  <input bind:value={newWatchlistName} placeholder="Watchlist name" required />
  <button type="submit">Create</button>
</form>
```

### ✅ Acceptance Criteria

- [ ] Tab interface for switching between watchlists
- [ ] Create new watchlist with custom name
- [ ] Delete watchlist with confirmation
- [ ] Active watchlist highlighted in tabs
- [ ] Empty state when no watchlists exist
- [ ] Loading states during CRUD operations
- [ ] Mobile-responsive design

### 📊 Estimated Effort: 6-8 hours

---

## Phase 5: Integration & Polish

### 🎯 Objective

Integrate all watchlist components and add polish features.

### 📝 Tasks

#### 5.1 Main Watchlist Page

**File:** `src/routes/+page.svelte`

```svelte
<script>
  import WatchlistManager from '$lib/components/WatchlistManager.svelte';
  // Initialize watchlist data on page load
  // Handle authentication state
</script>

<main>
  {#if $auth.isAuthenticated}
    <WatchlistManager />
  {:else}
    <!-- Login prompt -->
  {/if}
</main>
```

#### 5.2 Quote Streaming Management

- Auto-subscribe to quotes when watchlist changes
- Unsubscribe from old symbols when switching watchlists
- Pause streaming when page is hidden
- Resume streaming when page is visible

#### 5.3 Error Handling & UX

- Network error recovery
- API rate limiting handling
- Optimistic updates for better UX
- Confirmation dialogs for destructive actions

#### 5.4 Performance Optimization

- Debounce symbol search
- Throttle quote updates
- Lazy load watchlist data
- Cache symbol search results

### ✅ Acceptance Criteria

- [ ] Complete watchlist workflow works end-to-end
- [ ] Quote streaming performs well (no memory leaks)
- [ ] Error handling provides good user feedback
- [ ] UI remains responsive during all operations
- [ ] Mobile experience is smooth
- [ ] Page loads quickly with authentication

### 📊 Estimated Effort: 4-6 hours

---

## 📊 Total Implementation Plan

| Phase                     | Effort | Dependencies | Priority |
| ------------------------- | ------ | ------------ | -------- |
| Phase 1: CRUD Operations  | 8-10h  | Auth system  | High     |
| Phase 2: Symbol Search    | 6-8h   | Phase 1      | High     |
| Phase 3: Real-Time Quotes | 8-10h  | Phase 1      | High     |
| Phase 4: Watchlist UI     | 6-8h   | Phases 1-3   | Medium   |
| Phase 5: Integration      | 4-6h   | All phases   | Medium   |

**Total Estimated Effort:** 32-42 hours

## 🚀 Implementation Strategy

### Week 1: Core Foundation (Phases 1-2)

- Watchlist CRUD operations
- Symbol search functionality
- Basic data flow

### Week 2: Real-Time Features (Phase 3)

- Quote API integration
- Real-time updates
- Performance optimization

### Week 3: UI & Polish (Phases 4-5)

- Complete UI implementation
- Integration testing
- UX improvements

## 📱 Mobile Considerations

### Responsive Design Requirements

- Watchlist tabs adapt to mobile screens
- Table scrolling on small screens
- Touch-friendly buttons and inputs
- Optimized quote display for mobile

### Performance for Mobile

- Efficient quote polling
- Minimal data usage
- Battery-conscious updates
- Offline state handling

## 🧪 Testing Strategy

### Unit Tests

- Watchlist store operations
- API client methods
- Quote update logic
- Symbol search functionality

### Integration Tests

- Complete watchlist workflow
- Real-time quote updates
- Error handling scenarios
- Mobile responsive behavior

### Performance Tests

- Quote polling efficiency
- Memory usage during streaming
- Network error recovery
- Large watchlist handling
