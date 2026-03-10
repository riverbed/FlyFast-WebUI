# Component Inventory

## Overview

**Total Files**: 41 source files
**Programming Languages**: JavaScript (JSX), JSON, CSS
**Framework**: React 18.3.1
**Architecture**: Single Page Application (SPA)

---

## Application Source Code

### Pages (Route Components)
| Component | Path | Purpose |
|-----------|------|---------|
| Home | `src/pages/Home/Home.js` | Landing page with search form |
| SearchFlight | `src/pages/SearchFlight/SearchFlight.js` | Flight search results page |
| Checkout | `src/pages/Checkout/Checkout.js` | Purchase completion page |

**Count**: 3 page components

---

### Layout Components
| Component | Path | Purpose |
|-----------|------|---------|
| ApplicationContainer | `src/components/ApplicationContainer/ApplicationContainer.js` | App shell with CartProvider |
| ApplicationHeader | `src/components/ApplicationContainer/ApplicationHeader.js` | Navigation header |

**Count**: 2 layout components

---

### Feature Components
| Component | Path | Purpose |
|-----------|------|---------|
| Search | `src/components/Search/Search.js` | Flight search form |
| SearchResults | `src/components/SearchResults/SearchResults.js` | Search results container |
| Results | `src/components/SearchResults/Results.js` | Results grid display |
| NoResults | `src/components/SearchResults/NoResults.js` | Empty results message |
| TripCard | `src/components/TripCard/TripCard.js` | Individual flight card |
| TripCard FlightDetails | `src/components/TripCard/FlightDetails.js` | Flight details helper |
| Flight | `src/components/Flight/Flight.js` | Flight component |
| Cart | `src/components/Cart/Cart.js` | Shopping cart display |
| EmptyCart | `src/components/Cart/EmptyCart.js` | Empty cart message |
| Cart FlightDetails | `src/components/Cart/FlightDetails.js` | Cart flight details |
| Confirmation | `src/components/Breakdown/Confirmation.js` | Purchase confirmation |
| Cost | `src/components/Breakdown/Cost.js` | Cost breakdown display |
| Username | `src/components/Authentication/Username.js` | User display |

**Count**: 13 feature components

---

### Services and Utilities
| Module | Path | Purpose |
|--------|------|---------|
| Context | `src/services/Context.js` | Cart state management |
| Flight | `src/services/Flight.js` | API client |
| Tracing | `src/services/Tracing.js` | OpenTelemetry setup |
| CustomTracing | `src/services/CustomTracing.js` | Custom trace utilities |
| Functions | `src/services/Functions.js` | Utility functions |
| AirportInformation | `src/components/Search/AirportInformation.js` | Airport utilities |

**Count**: 6 service modules

---

### Static Data Files
| File | Path | Purpose |
|------|------|---------|
| AirportsData | `src/components/Search/AirportsData.json` | Airport reference data |
| SeatData | `src/components/Search/SeatData.json` | Seat class options |
| TripData | `src/components/Search/TripData.json` | Trip type options |

**Count**: 3 data files

---

### Entry Points and Configuration
| File | Path | Purpose |
|------|------|---------|
| index.js | `src/index.js` | Application bootstrap |
| App.js | `src/App.js` | Root component with routing |
| setupProxy.js | `src/setupProxy.js` | Dev proxy configuration |
| setupTests.js | `src/setupTests.js` | Test environment setup |
| reportWebVitals.js | `src/reportWebVitals.js` | Performance monitoring |

**Count**: 5 configuration files

---

### Styles
| File | Path | Purpose |
|------|------|---------|
| index.css | `src/index.css` | Global styles |
| App.css | `src/App.css` | Root component styles |

**Count**: 2 style files
**Note**: Components may have additional inline styles via Mantine's styling system

---

### Tests
| File | Path | Purpose |
|------|------|---------|
| App.test.js | `src/App.test.js` | App component tests |

**Count**: 1 test file
**Coverage**: Minimal (smoke test only)

---

### Public Assets
| File | Path | Purpose |
|------|------|---------|
| index.html | `public/index.html` | HTML template |
| manifest.json | `public/manifest.json` | PWA manifest |
| robots.txt | `public/robots.txt` | SEO robots file |

**Count**: 3 public files

---

## Infrastructure and Deployment

### Docker
| File | Path | Purpose |
|------|------|---------|
| Dockerfile | `Dockerfile` | Multi-stage container build |
| default.conf.template | `default.conf.template` | NGINX config template |
| .dockerignore | `.dockerignore` | Docker ignore rules |

**Count**: 3 Docker files

---

### Configuration Files
| File | Path | Purpose |
|------|------|---------|
| package.json | `package.json` | npm package metadata |
| package-lock.json | `package-lock.json` | Dependency lock file |
| .env.example | `.env.example` | Environment variable template |
| .gitignore | `.gitignore` | Git ignore rules |

**Count**: 4 configuration files

---

### Documentation
| File | Path | Purpose |
|------|------|---------|
| README.md | `README.md` | Project documentation |
| LICENSE | `LICENSE` | License file |

**Count**: 2 documentation files

---

## Component Categorization by Type

### Smart Components (Stateful)
- Search (manages search form state)
- SearchResults (fetches and manages results state)
- Cart (reads from CartContext)
- ApplicationContainer (provides CartContext)

**Count**: 4 smart components

### Presentational Components (Stateless)
- TripCard
- FlightDetails (multiple implementations)
- EmptyCart
- NoResults
- Results
- Confirmation
- Cost
- Username
- ApplicationHeader

**Count**: 9 presentational components

### Page Components (Route Handlers)
- Home
- SearchFlight
- Checkout

**Count**: 3 page components

---

## Component Usage Matrix

| Component | Used By | Uses |
|-----------|---------|------|
| App | index.js | ApplicationContainer, Router, Routes |
| ApplicationContainer | App | ApplicationHeader, CartProvider |
| ApplicationHeader | ApplicationContainer | Username, Cart indicator |
| Home | Router | Search |
| Search | Home | AirportInformation, Flight service |
| SearchFlight | Router | SearchResults, Flight service |
| SearchResults | SearchFlight | Results, NoResults, Flight |
| Results | SearchResults | TripCard |
| NoResults | SearchResults | - |
| TripCard | Results | FlightDetails, CartContext |
| Cart | ApplicationHeader | FlightDetails, EmptyCart, CartContext |
| Checkout | Router | Cart, Breakdown, CartContext |
| Breakdown | Checkout | Cost, Confirmation |

---

## Reusable vs Single-Use Components

### Reusable Components (Used in Multiple Places)
- FlightDetails (used in TripCard and Cart)
- ApplicationHeader (used in ApplicationContainer)

**Count**: 2 truly reusable components

### Single-Use Components (Used in One Place)
- Most other components are single-use
- Opportunity for increased reusability

**Count**: 21 single-use components

---

## Component Complexity Assessment

### High Complexity
- **Search**: Complex form with multiple inputs, autocomplete, validation
- **SearchResults**: Data fetching, state management, conditional rendering
- **ApplicationContainer**: Context provider, layout management

**Count**: 3 high complexity

### Medium Complexity
- **TripCard**: Multiple display modes, cart integration
- **Cart**: List rendering, item management
- **Checkout**: Purchase flow coordination

**Count**: 3 medium complexity

### Low Complexity
- **Home**: Simple layout
- **Results**: Simple map over data
- **NoResults**: Static message
- **EmptyCart**: Static message
- **Confirmation**: Static message
- **Cost**: Simple calculation display
- **Username**: Simple display
- **ApplicationHeader**: Simple navigation

**Count**: 8 low complexity

---

## Total Count Summary

| Category | Count |
|----------|-------|
| **React Components** | **23** |
| Pages | 3 |
| Layout Components | 2 |
| Feature Components | 13 |
| Smart Components | 4 |
| Presentational Components | 9 |
| | |
| **Services/Utilities** | **6** |
| | |
| **Static Data Files** | **3** |
| | |
| **Configuration** | **5** |
| | |
| **Tests** | **1** |
| | |
| **Styles** | **2** |
| | |
| **Public Assets** | **3** |
| | |
| **Infrastructure** | **7** |
| Docker files | 3 |
| Build config | 4 |
| | |
| **Documentation** | **2** |
| | |
| **TOTAL SOURCE FILES** | **52** |
