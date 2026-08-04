#!/bin/bash
# ==========================================
# StyleAI - One-Click Setup Script
# ==========================================
set -e

echo "=========================================="
echo "  StyleAI - E-Commerce Recommendation SaaS"
echo "  Setting up..."
echo "=========================================="

cd styleai-app 2>/dev/null || true

echo "[1/4] Installing dependencies..."
npm install
npm install framer-motion lucide-react clsx tailwind-merge
npm install -D tailwindcss @tailwindcss/vite @types/node

echo "[2/4] Installing shadcn/ui..."
npx shadcn@latest init --defaults
npx shadcn@latest add button card badge input label textarea tabs table dialog alert progress separator scroll-area skeleton tooltip avatar dropdown-menu sheet popover select checkbox switch --yes

echo "[3/4] Creating directories..."
mkdir -p src/data src/lib src/components/ui

echo "[4/4] Done!"
echo ""
echo "Run: npm run dev"
echo "Open: http://localhost:5173"
