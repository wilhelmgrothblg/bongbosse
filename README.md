# ⚡ Harry Boy 2.0 - Smart Stryktipset Generator

> The Smart, Transparent, Customizable Stryktipset Generator

Harry Boy 2.0 is a revolutionary web application that generates optimized Stryktipset rows using real bookmaker odds, probability modeling, and Monte Carlo simulation. It's like Harry Boy meets Moneyball — algorithmic, but transparent.

![Harry Boy 2.0 Screenshot](https://via.placeholder.com/800x400?text=Harry+Boy+2.0+Screenshot)

## 🎯 What This Does

Harry Boy 2.0 automatically generates optimized Stryktipset rows (13 matches) based on:

- ✅ **Real bookmaker odds** (probability weighting)
- ✅ **Your chosen risk profile** (safe / balanced / risky)
- ✅ **Optional personal biases** (e.g., "always 1 on Liverpool" 😄)
- ✅ **Smart filters** (max number of away wins, avoid all favorites, etc.)
- ✅ **Monte Carlo simulation** with 100,000+ iterations

You end up with:

- 🎲 1–10 optimized Stryktipset rows
- 📊 Expected hit probability for each outcome level
- 💰 Theoretical payout distribution
- 🧠 A feeling of control and understanding behind the automation

## 🌟 Core Features

### 1️⃣ Match & Odds Import

- Automatically loads 13 Stryktipset matches for the current round
- Fetches bookmaker odds for each match (1/X/2)
- Converts odds → implied probabilities → normalized probabilities (removes vig)

### 2️⃣ Risk Profiles

Choose from three strategic approaches:

| Profile         | Behavior     | Description                                       |
| --------------- | ------------ | ------------------------------------------------- |
| 🟢 **Safe**     | Conservative | Picks statistical favorites with minimal variance |
| 🟡 **Balanced** | Mixed        | Balances favorites, draws, and value picks        |
| 🔴 **Risky**    | Aggressive   | Targets high-value underdogs for maximum payout   |

### 3️⃣ Smart Generation Algorithms

- **Weighted Random**: Probability-based selection with risk adjustment
- **EV-Based Selection**: Focuses on Expected Value opportunities
- **Multi-Row Coverage**: Optimizes across multiple rows for system play

### 4️⃣ Advanced Filters & Rules

Customize your generation with:

- Minimum/maximum draws
- Away win limits
- Favorite threshold controls
- Personal biases (force specific outcomes)

### 5️⃣ Monte Carlo Simulation

- 100,000+ iteration simulation for each row
- Probability calculations for 10+, 11+, 12+, 13 correct
- Expected payout modeling
- Confidence intervals for detailed analysis

### 6️⃣ Beautiful UI

- Responsive design with Tailwind CSS
- Probability heatmaps (green = likely, red = risky)
- Real-time generation and simulation
- Mobile-friendly interface

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bongbosse.git
cd bongbosse

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 How It Works

### The Algorithm

1. **Odds Processing**: Convert bookmaker odds to normalized probabilities

   ```typescript
   const impliedProbs = { home: 1/odds.home, draw: 1/odds.draw, away: 1/odds.away };
   const total = sum(impliedProbs);
   const normalizedProbs = { home: impliedProbs.home/total, ... };
   ```

2. **Risk Adjustment**: Modify probabilities based on user's risk profile

   ```typescript
   function adjustProbability(prob: number, riskFactor: number): number {
   	const bias = 1 + riskFactor * (0.5 - prob);
   	return prob * bias;
   }
   ```

3. **Row Generation**: Generate outcomes using weighted random or EV-based selection

4. **Monte Carlo Simulation**: Run 100k+ simulations to calculate hit probabilities

### Example Output

```
Row 1 (Balanced Strategy):
[H][D][A][H][H][D][A][H][D][H][A][H][D]
Expected: 8.4/13 correct
10+ correct: 23.4%
11+ correct: 8.7%
12+ correct: 2.1%
13 correct: 0.3%
Expected payout: 147 SEK
```

## 🎮 Usage Guide

### Basic Workflow

1. **Select Risk Profile**: Choose Safe, Balanced, or Risky
2. **Configure Strategy**: Pick generation method and number of rows
3. **Set Filters**: Add constraints like max draws, away wins, etc.
4. **Generate Rows**: Click "Generate Harry Boy 2.0 Rows"
5. **Run Simulation**: Click "Simulate" to get probability analysis

### Advanced Features

#### Personal Biases

Force specific outcomes for matches where you have strong opinions:

```
Match 7 (Liverpool vs Arsenal): Always pick "1" (Liverpool)
```

#### System Play

Generate multiple rows with optimized coverage:

- Different risk distributions across rows
- Diversity scoring to avoid duplicates
- System-wide probability analysis

## 🧮 Technical Architecture

### Backend (SvelteKit)

- **Framework**: SvelteKit with TypeScript
- **API Routes**: RESTful endpoints for data and generation
- **Algorithms**: Custom probability and simulation engines

### Frontend (Svelte 5)

- **UI Framework**: Svelte 5 with runes
- **Styling**: Tailwind CSS with custom components
- **State Management**: Reactive Svelte stores

### Key Libraries

- **Vite**: Build tool and dev server
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling

## 📁 Project Structure

```
src/
├── lib/
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Core algorithms
│   │   ├── odds.ts      # Odds processing & probability
│   │   ├── rowGenerator.ts  # Row generation logic
│   │   └── simulation.ts    # Monte Carlo simulation
│   └── components/      # Reusable UI components
├── routes/
│   ├── api/            # API endpoints
│   │   ├── stryktipset/    # Match data
│   │   ├── generate/       # Row generation
│   │   └── simulate/       # Simulation
│   ├── +layout.svelte  # App layout
│   ├── +page.svelte    # Main page
│   └── +page.ts        # Page data loading
└── app.css             # Global styles
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📈 Roadmap

- [ ] **Real Odds Integration**: Connect to live bookmaker APIs
- [ ] **Historical Analysis**: Track performance vs actual results
- [ ] **Advanced Strategies**: ML-based outcome prediction
- [ ] **Social Features**: Share and compare rows with friends
- [ ] **Mobile App**: React Native companion app
- [ ] **Multi-League Support**: Expand beyond Swedish football

## 🐛 Known Issues

- Mock odds currently used (real API integration needed)
- Payout calculations are estimates (need Svenska Spel integration)
- Mobile optimization needs refinement

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the original "Harry Boy" concept
- Swedish Stryktipset system
- SvelteKit and Svelte community
- Mathematical modeling from various sports betting resources

---

**Built with ❤️ and ⚡ by the Harry Boy 2.0 team**

_"Making Stryktipset smart, one probability at a time"_
