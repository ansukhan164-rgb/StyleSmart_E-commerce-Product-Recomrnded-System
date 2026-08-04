import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion'
import {
  Search, ShoppingCart, Heart, X, ChevronRight, ChevronLeft,
  Star, Filter, SlidersHorizontal, Eye, TrendingUp, Sparkles,
  ArrowRight, Tag, Package, Truck, Shield, RotateCcw, Menu,
  Plus, Minus, Trash2, Check, Grid3X3, LayoutList, ZoomIn,
  HeartOff, Share2, Clock, Award, Zap, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  products, type Product, categories, subcategories, brands
} from './data/products'
import {
  getRecommendations, getTrendingProducts, getNewArrivals,
  getBestSellers, getDiscountedProducts, searchProducts,
  filterProducts, type UserProfile
} from './lib/recommendations'

// ==================== ANIMATION VARIANTS ====================
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } }
}

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } }
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
}

const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } }
}

// ==================== HELPER COMPONENTS ====================
function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          className={cn(
            s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
          )}
        />
      ))}
    </div>
  )
}

// ==================== HEADER ====================
function Header({
  cartCount, onCartClick, onSearch, searchQuery, setSearchQuery,
  onLogoClick, onNavigate, activePage
}: {
  cartCount: number
  onCartClick: () => void
  onSearch: (q: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  onLogoClick: () => void
  onNavigate: (page: string) => void
  activePage: string
}) {
  const [mobileMenu, setMobileMenu] = useState(false)

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.button
            onClick={onLogoClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              StyleSmart
            </span>
          </motion.button>

          <nav className="hidden md:flex items-center gap-1">
            {['Home', 'Trending', 'New Arrivals', 'Sale'].map(item => (
              <motion.button
                key={item}
                onClick={() => onNavigate(item === 'Home' ? 'home' : item.toLowerCase().replace(' ', '-'))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  activePage === (item === 'Home' ? 'home' : item.toLowerCase().replace(' ', '-'))
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {item}
              </motion.button>
            ))}
          </nav>

          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); onSearch(e.target.value) }}
                placeholder="Search 100+ products..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); onSearch('') }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCartClick}
              className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-50"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="p-4 space-y-2">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); onSearch(e.target.value) }}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              {['Home', 'Trending', 'New Arrivals', 'Sale'].map(item => (
                <button
                  key={item}
                  onClick={() => {
                    onNavigate(item === 'Home' ? 'home' : item.toLowerCase().replace(' ', '-'))
                    setMobileMenu(false)
                  }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

// ==================== HERO BANNER ====================
function HeroBanner({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [current, setCurrent] = useState(0)
  const slides = [
    {
      title: 'Summer Collection\nUp to 60% OFF',
      subtitle: 'Discover the hottest trends of the season',
      gradient: 'from-violet-600 via-purple-600 to-indigo-700',
      accent: 'from-amber-400 to-orange-500',
    },
    {
      title: 'New Arrivals\nJust Dropped',
      subtitle: 'Be the first to rock the latest styles',
      gradient: 'from-rose-500 via-pink-500 to-fuchsia-600',
      accent: 'from-cyan-400 to-blue-500',
    },
    {
      title: 'Ethnic Wear\nCelebration Edit',
      subtitle: 'Traditional meets contemporary',
      gradient: 'from-amber-500 via-orange-500 to-red-600',
      accent: 'from-emerald-400 to-teal-500',
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-2xl mx-4 mt-4 max-w-7xl lg:mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6 }}
          className={cn(
            'relative bg-gradient-to-br p-8 md:p-12 lg:p-16 min-h-[280px] md:min-h-[360px] flex flex-col justify-center',
            slides[current].gradient
          )}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white/20 blur-3xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative z-10"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white whitespace-pre-line leading-tight">
              {slides[current].title}
            </h2>
            <p className="mt-4 text-white/80 text-base md:text-lg max-w-md">
              {slides[current].subtitle}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('trending')}
              className={cn(
                'mt-6 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r shadow-lg',
                slides[current].accent
              )}
            >
              Shop Now <ArrowRight className="inline w-4 h-4 ml-1" />
            </motion.button>
          </motion.div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === current ? 'w-8 bg-white' : 'w-4 bg-white/40'
                )}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => setCurrent(c => (c + 1) % slides.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ==================== FEATURES BAR ====================
function FeaturesBar() {
  const features = [
    { icon: Truck, label: 'Free Shipping', desc: 'On orders above ₹999' },
    { icon: RotateCcw, label: 'Easy Returns', desc: '30-day return policy' },
    { icon: Shield, label: 'Secure Payment', desc: '100% secure checkout' },
    { icon: Award, label: 'Authentic Brands', desc: '100% genuine products' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 mt-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            variants={fadeUp}
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <f.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{f.label}</p>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ==================== CATEGORY CARDS ====================
function CategorySection({ onCategoryClick }: { onCategoryClick: (cat: string) => void }) {
  const categoryImages: Record<string, string> = {
    Men: 'https://picsum.photos/seed/catmen/400/300',
    Women: 'https://picsum.photos/seed/catwomen/400/300',
    Footwear: 'https://picsum.photos/seed/catfoot/400/300',
    Accessories: 'https://picsum.photos/seed/catacc/400/300',
  }

  return (
    <AnimatedSection className="max-w-7xl mx-auto px-4 mt-10">
      <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-full" />
        <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
      </motion.div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map(cat => (
          <motion.button
            key={cat.name}
            variants={cardHover}
            initial="rest"
            whileHover="hover"
            onClick={() => onCategoryClick(cat.name)}
            className="relative overflow-hidden rounded-2xl group aspect-[4/3]"
          >
            <img
              src={categoryImages[cat.name]}
              alt={cat.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <span className="text-2xl mb-1 block">{cat.icon}</span>
              <h3 className="text-white font-bold text-lg">{cat.name}</h3>
              <p className="text-white/70 text-sm">{cat.count} products</p>
            </div>
          </motion.button>
        ))}
      </div>
    </AnimatedSection>
  )
}

// ==================== PRODUCT CARD ====================
function ProductCard({
  product, onAddToCart, onToggleWish, isWished, onQuickView, index = 0
}: {
  product: Product
  onAddToCart: (p: Product) => void
  onToggleWish: (id: string) => void
  isWished: boolean
  onQuickView: (p: Product) => void
  index?: number
}) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      variants={fadeUp}
      initial="rest"
      whileHover="hover"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      <motion.div variants={cardHover} className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        )}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-transform duration-500',
            hovered && 'scale-110',
            !imgLoaded && 'opacity-0'
          )}
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount >= 35 && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full">
              {product.discount}% OFF
            </span>
          )}
          {product.newArrival && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold rounded-full">
              NEW
            </span>
          )}
          {product.trending && (
            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> HOT
            </span>
          )}
        </div>

        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-2 inset-x-2 flex gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={e => { e.stopPropagation(); onAddToCart(product) }}
                className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold rounded-xl shadow-lg hover:from-violet-700 hover:to-indigo-700 transition-all"
              >
                Add to Cart
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={e => { e.stopPropagation(); onQuickView(product) }}
                className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center shadow-lg hover:bg-white"
              >
                <Eye className="w-4 h-4 text-gray-700" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          onClick={e => { e.stopPropagation(); onToggleWish(product.id) }}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm"
        >
          <Heart
            className={cn('w-4 h-4', isWished ? 'fill-rose-500 text-rose-500' : 'text-gray-400')}
          />
        </motion.button>
      </motion.div>

      <div className="p-3">
        <p className="text-[10px] font-medium text-violet-600 uppercase tracking-wider">{product.brand}</p>
        <h3 className="text-sm font-semibold text-gray-900 mt-0.5 line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-1.5 mt-1">
          <StarRating rating={product.rating} size={12} />
          <span className="text-[10px] text-gray-500">({product.reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-base font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-2">
          {product.colors.slice(0, 4).map((c, i) => (
            <div
              key={i}
              className="w-3.5 h-3.5 rounded-full border border-gray-200"
              style={{ backgroundColor: getColorHex(c) }}
              title={c}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-[10px] text-gray-400">+{product.colors.length - 4}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function getColorHex(color: string): string {
  const map: Record<string, string> = {
    'White': '#ffffff', 'Black': '#1a1a1a', 'Navy': '#1e3a5f', 'Grey': '#9ca3af',
    'Red': '#ef4444', 'Blue': '#3b82f6', 'Green': '#22c55e', 'Yellow': '#eab308',
    'Pink': '#ec4899', 'Purple': '#a855f7', 'Orange': '#f97316', 'Brown': '#92400e',
    'Beige': '#d4c5a9', 'Cream': '#fef3c7', 'Tan': '#d2b48c', 'Olive': '#6b8e23',
    'Burgundy': '#800020', 'Rust': '#b7410e', 'Teal': '#008080', 'Camel': '#c19a6b',
    'Charcoal': '#36454f', 'Ivory': '#fffff0', 'Sage': '#9caf88',
    'Lavender': '#e6e6fa', 'Peach': '#ffcba4', 'Coral': '#ff7f50',
    'Champagne': '#f7e7ce', 'Emerald': '#50c878', 'Rose': '#ff007f',
    'Mustard': '#ffdb58', 'Wine': '#722f37', 'Gold': '#d4af37',
    'Silver': '#c0c0c0', 'Sky Blue': '#87ceeb', 'Mint': '#98ff98',
    'Lilac': '#c8a2c8', 'Midnight Blue': '#191970',
    'Medium Blue': '#0000cd', 'Light Blue': '#add8e6',
    'Dark Blue': '#00008b', 'Royal Blue': '#4169e1',
    'Deep Red': '#8b0000', 'Powder Blue': '#b0e0e6',
    'Sage Green': '#9cad8c', 'Forest Green': '#228b22',
    'All White': '#ffffff', 'All Black': '#1a1a1a',
    'Black White': '#333333', 'White Black': '#f5f5f5',
    'White Red': '#ff4444', 'Navy Stripe': '#1e3a5f',
    'Blue White': '#4477bb', 'Red Navy': '#8b1a1a',
    'Blue Orange': '#3b82f6', 'Green Yellow': '#6b8e23',
    'Blue Tie-Dye': '#6366f1', 'Pink Tie-Dye': '#ec4899',
    'Volt Green': '#ccff00', 'Sky Blue Stripe': '#87ceeb',
    'Grey Stripe': '#9ca3af', 'Blue Check': '#3b82f6',
    'Green Check': '#22c55e', 'Black Print': '#1a1a1a',
    'Blue Print': '#3b82f6', 'Palm Print': '#22c55e',
    'Floral Print': '#ec4899', 'Navy Floral': '#1e3a5f',
    'Burgundy Floral': '#800020', 'Medium Wash': '#6b8fa3',
    'Dark Wash': '#2c3e50', 'Light Wash': '#87ceeb',
    'Stone Wash': '#a8b5c2', 'Maroon Print': '#800020',
    'Blush Pink': '#de5d83', 'Classic Red': '#ef4444',
    'Classic Black': '#1a1a1a', 'Classic White': '#ffffff',
    'Army Green': '#4b5320', 'Matte Black': '#28282b',
    'Crystal Clear': '#e8e8e8', 'Black Grey': '#333333',
    'Silver Blue': '#7cb9e8', 'Gold Green': '#d4af37',
    'Gold Silver': '#d4af37', 'Black Red': '#8b0000',
    'Floral Blue': '#3b82f6', 'Floral Red': '#ef4444',
    'Indigo Print': '#4b0082', 'Red Print': '#ef4444',
    'Nude': '#e3bc9a', 'Grey Blue': '#7cb9e8',
  }
  return map[color] || '#d1d5db'
}

// ==================== PRODUCT DETAIL MODAL ====================
function ProductDetail({
  product, onClose, onAddToCart, onToggleWish, isWished, onRecommend
}: {
  product: Product
  onClose: () => void
  onAddToCart: (p: Product, size?: string, color?: string) => void
  onToggleWish: (id: string) => void
  isWished: boolean
  onRecommend: (p: Product) => Product[]
}) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const related = onRecommend(product)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">{product.brand}</p>
            <h2 className="text-lg font-bold text-gray-900">{product.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={product.images[activeImg]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute top-3 left-3 flex gap-1">
                  {product.discount >= 35 && (
                    <span className="px-2 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-lg">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      'w-16 h-20 rounded-xl overflow-hidden border-2 transition-all',
                      i === activeImg ? 'border-violet-500' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={product.rating} size={16} />
                <span className="text-sm text-gray-600">{product.rating}</span>
                <span className="text-sm text-gray-400">({product.reviews.toLocaleString()} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    <span className="text-sm font-semibold text-emerald-600">Save ₹{(product.originalPrice - product.price).toLocaleString()}</span>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-4">{product.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {[`📦 ${product.fabric}`, `🎨 ${product.pattern}`, `✨ ${product.occasion}`].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">Color: {selectedColor}</p>
                <div className="flex gap-2">
                  {product.colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center',
                        selectedColor === c ? 'border-violet-500 ring-2 ring-violet-200' : 'border-gray-200'
                      )}
                    >
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: getColorHex(c) }} />
                    </button>
                  ))}
                </div>
              </div>

              {product.sizes[0] !== 'Free Size' && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Size: {selectedSize}</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={cn(
                          'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                          selectedSize === s
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'border-gray-200 text-gray-700 hover:border-violet-300'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <p className="text-sm font-semibold text-gray-900">Qty:</p>
                <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold min-w-[40px] text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="p-2 hover:bg-gray-50">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    for (let i = 0; i < qty; i++) onAddToCart(product, selectedSize, selectedColor)
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-violet-700 hover:to-indigo-700 transition-all"
                >
                  <ShoppingCart className="inline w-4 h-4 mr-2" />
                  Add to Cart
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onToggleWish(product.id)}
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all',
                    isWished ? 'bg-rose-50 border-rose-300' : 'border-gray-200 hover:border-rose-300'
                  )}
                >
                  <Heart className={cn('w-5 h-5', isWished ? 'fill-rose-500 text-rose-500' : 'text-gray-400')} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-gray-300"
                >
                  <Share2 className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6">
                {[
                  { icon: Truck, text: 'Free Delivery' },
                  { icon: RotateCcw, text: '30-Day Returns' },
                  { icon: Shield, text: 'Warranty' },
                ].map(f => (
                  <div key={f.text} className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-xl">
                    <f.icon className="w-4 h-4 text-violet-500" />
                    <span className="text-[10px] font-medium text-gray-600">{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                You May Also Like
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {related.slice(0, 4).map(rp => (
                  <div key={rp.id} className="text-center">
                    <img src={rp.image} alt={rp.name} className="w-full aspect-[3/4] object-cover rounded-xl" />
                    <p className="text-xs font-medium text-gray-900 mt-2 line-clamp-1">{rp.name}</p>
                    <p className="text-sm font-bold text-violet-600">₹{rp.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==================== CART SIDEBAR ====================
function CartSidebar({
  items, isOpen, onClose, onUpdateQty, onRemove
}: {
  items: { product: Product; qty: number; size?: string; color?: string }[]
  isOpen: boolean
  onClose: () => void
  onUpdateQty: (id: string, qty: number) => void
  onRemove: (id: string) => void
}) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.qty, 0)
  const saved = items.reduce((sum, item) => sum + (item.product.originalPrice - item.product.price) * item.qty, 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-violet-500" />
                Your Cart ({items.reduce((s, i) => s + i.qty, 0)})
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <p className="text-sm text-gray-400 mt-1">Add some products to get started!</p>
                </div>
              ) : (
                items.map(item => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-violet-600 uppercase">{item.product.brand}</p>
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</h4>
                      {(item.size || item.color) && (
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {item.size && `Size: ${item.size}`}{item.size && item.color && ' • '}{item.color && `Color: ${item.color}`}
                        </p>
                      )}
                      <p className="text-sm font-bold text-gray-900 mt-1">₹{(item.product.price * item.qty).toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => onUpdateQty(item.product.id, Math.max(1, item.qty - 1))}
                            className="p-1 hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold">{item.qty}</span>
                          <button
                            onClick={() => onUpdateQty(item.product.id, item.qty + 1)}
                            className="p-1 hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemove(item.product.id)}
                          className="p-1 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold">₹{total.toLocaleString()}</span>
                </div>
                {saved > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> You save
                    </span>
                    <span className="font-semibold text-emerald-600">₹{saved.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-semibold text-emerald-600">{total >= 999 ? 'FREE' : '₹99'}</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>₹{(total + (total >= 999 ? 0 : 99)).toLocaleString()}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg"
                >
                  Proceed to Checkout
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ==================== FILTER PANEL ====================
function FilterPanel({
  isOpen, onClose, filters, setFilters
}: {
  isOpen: boolean
  onClose: () => void
  filters: {
    brand: string[]
    priceRange: [number, number]
    minRating: number
    gender: string
    occasion: string
    sortBy: string
  }
  setFilters: (f: any) => void
}) {
  const [localBrands, setLocalBrands] = useState<string[]>(filters.brand)
  const [localPrice, setLocalPrice] = useState(filters.priceRange)
  const [localRating, setLocalRating] = useState(filters.minRating)
  const [localGender, setLocalGender] = useState(filters.gender)
  const [localOccasion, setLocalOccasion] = useState(filters.occasion)

  const applyFilters = () => {
    setFilters({
      ...filters,
      brand: localBrands,
      priceRange: localPrice,
      minRating: localRating,
      gender: localGender,
      occasion: localOccasion,
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 z-40 w-full max-w-sm bg-white shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-violet-500" /> Filters
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm font-semibold mb-2">Gender</p>
                <div className="flex gap-2 flex-wrap">
                  {['', 'men', 'women', 'unisex'].map(g => (
                    <button
                      key={g}
                      onClick={() => setLocalGender(g)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize',
                        localGender === g ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200 hover:border-violet-300'
                      )}
                    >
                      {g || 'All'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Price Range</p>
                <input
                  type="range"
                  min={0}
                  max={15000}
                  step={100}
                  value={localPrice[1]}
                  onChange={e => setLocalPrice([0, Number(e.target.value)])}
                  className="w-full accent-violet-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹0</span>
                  <span className="font-semibold text-violet-600">₹{localPrice[1].toLocaleString()}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Minimum Rating</p>
                <div className="flex gap-2">
                  {[0, 3, 3.5, 4, 4.5].map(r => (
                    <button
                      key={r}
                      onClick={() => setLocalRating(r)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        localRating === r ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200'
                      )}
                    >
                      {r === 0 ? 'All' : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Brand</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {brands.map(b => (
                    <label key={b} className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localBrands.includes(b)}
                        onChange={() =>
                          setLocalBrands(prev =>
                            prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
                          )
                        }
                        className="w-4 h-4 rounded border-gray-300 text-violet-600 accent-violet-600"
                      />
                      <span className="text-sm text-gray-700">{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Occasion</p>
                <div className="flex gap-2 flex-wrap">
                  {['', 'Casual', 'Formal', 'Party', 'Sports', 'Ethnic', 'Work'].map(o => (
                    <button
                      key={o}
                      onClick={() => setLocalOccasion(o)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        localOccasion === o ? 'bg-violet-600 text-white border-violet-600' : 'border-gray-200'
                      )}
                    >
                      {o || 'All'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={applyFilters}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setLocalBrands([])
                  setLocalPrice([0, 15000])
                  setLocalRating(0)
                  setLocalGender('')
                  setLocalOccasion('')
                }}
                className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Clear All
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ==================== RECOMMENDATION SECTION ====================
function RecommendationSection({
  title, icon: Icon, products: prods, onAddToCart, onToggleWish, wishedIds, onQuickView
}: {
  title: string
  icon: any
  products: Product[]
  onAddToCart: (p: Product) => void
  onToggleWish: (id: string) => void
  wishedIds: Set<string>
  onQuickView: (p: Product) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) el.addEventListener('scroll', checkScroll)
    return () => el?.removeEventListener('scroll', checkScroll)
  }, [checkScroll])

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -320 : 320
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  return (
    <AnimatedSection className="max-w-7xl mx-auto px-4 mt-10">
      <motion.div variants={fadeUp} className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center border transition-all',
              canScrollLeft ? 'border-gray-300 hover:bg-gray-50' : 'border-gray-100 text-gray-300'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center border transition-all',
              canScrollRight ? 'border-gray-300 hover:bg-gray-50' : 'border-gray-100 text-gray-300'
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <motion.div
        ref={scrollRef}
        variants={staggerContainer}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {prods.map((p, i) => (
          <motion.div key={p.id} variants={fadeUp} className="flex-shrink-0 w-[200px] md:w-[220px]">
            <ProductCard
              product={p}
              onAddToCart={onAddToCart}
              onToggleWish={onToggleWish}
              isWished={wishedIds.has(p.id)}
              onQuickView={onQuickView}
              index={i}
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatedSection>
  )
}

// ==================== DEAL TIMER ====================
function DealTimer() {
  const [time, setTime] = useState({ h: 23, m: 45, s: 12 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(t => {
        let { h, m, s } = t
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) { h = 23; m = 59; s = 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className="flex items-center gap-1.5">
      {[
        { val: pad(time.h), label: 'H' },
        { val: pad(time.m), label: 'M' },
        { val: pad(time.s), label: 'S' },
      ].map((t, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 text-white text-sm font-bold px-2 py-1 rounded-lg min-w-[36px] text-center">
            {t.val}
          </div>
          {i < 2 && <span className="text-rose-500 font-bold">:</span>}
        </div>
      ))}
    </div>
  )
}

// ==================== MAIN APP ====================
export default function App() {
  const [page, setPage] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[] | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [cart, setCart] = useState<{ product: Product; qty: number; size?: string; color?: string }[]>([])
  const [wishedIds, setWishedIds] = useState<Set<string>>(new Set())
  const [viewedIds, setViewedIds] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('popular')
  const [filters, setFilters] = useState({
    brand: [] as string[],
    priceRange: [0, 15000] as [number, number],
    minRating: 0,
    gender: '',
    occasion: '',
    sortBy: 'popular',
  })

  const profile: UserProfile = useMemo(() => ({
    viewedProducts: viewedIds,
    purchasedProducts: [],
    likedProducts: Array.from(wishedIds),
    cartItems: cart.map(c => c.product.id),
    preferredCategories: viewedIds.reduce((acc, id) => {
      const p = products.find(pr => pr.id === id)
      if (p) acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    preferredBrands: viewedIds.reduce((acc, id) => {
      const p = products.find(pr => pr.id === id)
      if (p) acc[p.brand] = (acc[p.brand] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    preferredPriceRange: { min: 0, max: 15000 },
    searchHistory: [],
  }), [viewedIds, wishedIds, cart])

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
    if (q.trim().length > 0) {
      setSearchResults(searchProducts(q))
      setPage('search')
    } else {
      setSearchResults(null)
      setPage('home')
    }
  }, [])

  const addToCart = useCallback((product: Product, size?: string, color?: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.size === size && i.color === color)
      if (existing) return prev.map(i => i === existing ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product, qty: 1, size, color }]
    })
  }, [])

  const updateCartQty = useCallback((id: string, qty: number) => {
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty } : i))
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(i => i.product.id !== id))
  }, [])

  const toggleWish = useCallback((id: string) => {
    setWishedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const openProduct = useCallback((product: Product) => {
    setSelectedProduct(product)
    setViewedIds(prev => prev.includes(product.id) ? prev : [...prev, product.id])
  }, [])

  const displayedProducts = useMemo(() => {
    let result = searchResults || products
    if (activeCategory) {
      result = result.filter(p => p.category === activeCategory)
    }
    return filterProducts(result, {
      brand: filters.brand.length > 0 ? filters.brand : undefined,
      priceRange: filters.priceRange,
      minRating: filters.minRating || undefined,
      gender: filters.gender || undefined,
      occasion: filters.occasion || undefined,
      sortBy,
    })
  }, [searchResults, activeCategory, filters, sortBy])

  const trending = useMemo(() => getTrendingProducts(10), [])
  const newArrivals = useMemo(() => getNewArrivals(10), [])
  const bestSellers = useMemo(() => getBestSellers(10), [])
  const deals = useMemo(() => getDiscountedProducts(10), [])
  const recommendations = useMemo(() => getRecommendations(profile, undefined, 12), [profile])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30">
      <Header
        cartCount={cartCount}
        onCartClick={() => setCartOpen(true)}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onLogoClick={() => { setPage('home'); setActiveCategory(null); setSearchQuery(''); setSearchResults(null) }}
        onNavigate={(p) => { setPage(p); setActiveCategory(null); setSearchResults(null) }}
        activePage={page}
      />

      <AnimatePresence mode="wait">
        {page === 'home' && !searchResults && (
          <motion.div
            key="home"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            <HeroBanner onNavigate={(p) => { setPage(p); setActiveCategory(null) }} />
            <FeaturesBar />
            <CategorySection onCategoryClick={(cat) => { setActiveCategory(cat); setPage('browse') }} />

            {viewedIds.length > 0 && recommendations.length > 0 && (
              <RecommendationSection
                title="Recommended for You"
                icon={Sparkles}
                products={recommendations}
                onAddToCart={addToCart}
                onToggleWish={toggleWish}
                wishedIds={wishedIds}
                onQuickView={openProduct}
              />
            )}

            <RecommendationSection
              title="Trending Now"
              icon={TrendingUp}
              products={trending}
              onAddToCart={addToCart}
              onToggleWish={toggleWish}
              wishedIds={wishedIds}
              onQuickView={openProduct}
            />

            <AnimatedSection className="max-w-7xl mx-auto px-4 mt-10">
              <motion.div variants={fadeUp} className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <Zap className="w-5 h-5 text-amber-300" />
                    <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">Flash Sale Ends In</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">Up to 70% OFF on 100+ Products</h3>
                  <p className="text-white/80 mt-1">Don't miss out on these incredible deals!</p>
                </div>
                <DealTimer />
              </motion.div>
            </AnimatedSection>

            <RecommendationSection
              title="Best Sellers"
              icon={Award}
              products={bestSellers}
              onAddToCart={addToCart}
              onToggleWish={toggleWish}
              wishedIds={wishedIds}
              onQuickView={openProduct}
            />

            <RecommendationSection
              title="New Arrivals"
              icon={Package}
              products={newArrivals}
              onAddToCart={addToCart}
              onToggleWish={toggleWish}
              wishedIds={wishedIds}
              onQuickView={openProduct}
            />

            <RecommendationSection
              title="Hot Deals"
              icon={Tag}
              products={deals}
              onAddToCart={addToCart}
              onToggleWish={toggleWish}
              wishedIds={wishedIds}
              onQuickView={openProduct}
            />

            <AnimatedSection className="max-w-7xl mx-auto px-4 mt-10">
              <motion.div variants={fadeUp} className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-center">
                <Sparkles className="w-10 h-10 text-amber-300 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-white">AI-Powered Recommendations</h3>
                <p className="text-white/80 mt-2 max-w-md mx-auto">
                  Our smart engine learns your style preferences and curates personalized picks just for you.
                  Browse more to unlock better recommendations!
                </p>
                <div className="flex items-center justify-center gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{products.length}</p>
                    <p className="text-xs text-white/70">Products</p>
                  </div>
                  <div className="w-px h-10 bg-white/30" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{brands.length}</p>
                    <p className="text-xs text-white/70">Brands</p>
                  </div>
                  <div className="w-px h-10 bg-white/30" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{subcategories.length}</p>
                    <p className="text-xs text-white/70">Categories</p>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          </motion.div>
        )}

        {(page !== 'home' || searchResults) && (
          <motion.div
            key="browse"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
            className="max-w-7xl mx-auto px-4 mt-6"
          >
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {searchResults ? `Search: "${searchQuery}"` : activeCategory || page.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">{displayedProducts.length} products found</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                </motion.button>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </motion.div>

            <motion.div variants={fadeUp} className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {['All', ...categories.map(c => c.name)].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === 'All' ? null : cat)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                    (cat === 'All' && !activeCategory) || activeCategory === cat
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'
                  )}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            {displayedProducts.length === 0 ? (
              <motion.div variants={fadeUp} className="text-center py-20">
                <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-500">No products found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms</p>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
              >
                {displayedProducts.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={addToCart}
                    onToggleWish={toggleWish}
                    isWished={wishedIds.has(p.id)}
                    onQuickView={openProduct}
                    index={i}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatedSection className="max-w-7xl mx-auto px-4 mt-16 mb-8">
        <motion.footer variants={fadeUp} className="bg-gray-900 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">StyleSmart</span>
              </div>
              <p className="text-sm text-gray-400">AI-powered fashion recommendations tailored just for you.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Shop</h4>
              <div className="space-y-2">
                {['Men', 'Women', 'Footwear', 'Accessories'].map(c => (
                  <button key={c} onClick={() => { setActiveCategory(c); setPage('browse') }}
                    className="block text-sm text-gray-400 hover:text-white transition-colors">
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Support</h4>
              <div className="space-y-2">
                {['Help Center', 'Track Order', 'Returns', 'Contact Us'].map(s => (
                  <p key={s} className="text-sm text-gray-400">{s}</p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
              <div className="space-y-2">
                {['About Us', 'Careers', 'Blog', 'Privacy Policy'].map(s => (
                  <p key={s} className="text-sm text-gray-400">{s}</p>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center">
            <p className="text-xs text-gray-500">© 2026 StyleSmart — AI-Powered Shopping. Built with ❤️ by Ansarul & Dibboo.</p>
          </div>
        </motion.footer>
      </AnimatedSection>

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
            onToggleWish={toggleWish}
            isWished={wishedIds.has(selectedProduct.id)}
            onRecommend={(p) => getRecommendations(profile, p, 8)}
          />
        )}
      </AnimatePresence>

      <CartSidebar
        items={cart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateCartQty}
        onRemove={removeFromCart}
      />

      <FilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  )
}
