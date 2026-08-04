import { products, type Product } from '../data/products'

export interface UserProfile {
  viewedProducts: string[]
  purchasedProducts: string[]
  likedProducts: string[]
  cartItems: string[]
  preferredCategories: Record<string, number>
  preferredBrands: Record<string, number>
  preferredPriceRange: { min: number; max: number }
  searchHistory: string[]
}

function getEmptyProfile(): UserProfile {
  return {
    viewedProducts: [],
    purchasedProducts: [],
    likedProducts: [],
    cartItems: [],
    preferredCategories: {},
    preferredBrands: {},
    preferredPriceRange: { min: 0, max: 100000 },
    searchHistory: [],
  }
}

function calculateContentSimilarity(a: Product, b: Product): number {
  let score = 0
  if (a.category === b.category) score += 3
  if (a.subcategory === b.subcategory) score += 5
  if (a.brand === b.brand) score += 4
  if (a.gender === b.gender) score += 2
  if (a.fabric === b.fabric) score += 1
  if (a.occasion === b.occasion) score += 2
  if (a.pattern === b.pattern) score += 1
  const sharedTags = a.tags.filter(t => b.tags.includes(t))
  score += sharedTags.length * 1.5
  const priceDiff = Math.abs(a.price - b.price) / Math.max(a.price, b.price)
  score += (1 - priceDiff) * 2
  return score
}

export function getRecommendations(
  profile: UserProfile | null,
  currentProduct?: Product,
  count: number = 12
): Product[] {
  const p = profile || getEmptyProfile()
  const interactedIds = new Set([
    ...p.viewedProducts,
    ...p.purchasedProducts,
    ...p.likedProducts,
    ...p.cartItems,
  ])

  if (currentProduct) {
    return products
      .filter(prod => prod.id !== currentProduct.id)
      .map(prod => ({
        product: prod,
        score: calculateContentSimilarity(currentProduct, prod) +
          (p.preferredCategories[prod.category] || 0) * 0.5 +
          (p.preferredBrands[prod.brand] || 0) * 0.3,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.product)
  }

  const scored = products.map(prod => {
    let score = 0
    score += (p.preferredCategories[prod.category] || 0) * 2
    score += (p.preferredBrands[prod.brand] || 0) * 1.5
    if (prod.trending) score += 3
    if (prod.bestSeller) score += 4
    if (prod.newArrival) score += 2
    score += (prod.rating / 5) * 3
    score += Math.min(prod.reviews / 1000, 5)
    if (prod.discount > 35) score += 2
    interactedIds.forEach(id => {
      const viewed = products.find(p2 => p2.id === id)
      if (viewed) {
        score += calculateContentSimilarity(viewed, prod) * 0.3
      }
    })
    if (interactedIds.has(prod.id)) score -= 10
    return { product: prod, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(item => item.product)
}

export function getTrendingProducts(count: number = 10): Product[] {
  return products
    .filter(p => p.trending || p.bestSeller)
    .sort((a, b) => {
      const scoreA = a.rating * 2 + (a.trending ? 5 : 0) + (a.bestSeller ? 5 : 0) + a.discount / 10
      const scoreB = b.rating * 2 + (b.trending ? 5 : 0) + (b.bestSeller ? 5 : 0) + b.discount / 10
      return scoreB - scoreA
    })
    .slice(0, count)
}

export function getNewArrivals(count: number = 10): Product[] {
  return products
    .filter(p => p.newArrival)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count)
}

export function getBestSellers(count: number = 10): Product[] {
  return products
    .filter(p => p.bestSeller)
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, count)
}

export function getProductsByCategory(category: string, count?: number): Product[] {
  const filtered = products.filter(p => p.category === category)
  return count ? filtered.slice(0, count) : filtered
}

export function getProductsBySubcategory(subcategory: string): Product[] {
  return products.filter(p => p.subcategory === subcategory)
}

export function getProductsByBrand(brand: string): Product[] {
  return products.filter(p => p.brand === brand)
}

export function getDiscountedProducts(count: number = 10): Product[] {
  return [...products]
    .sort((a, b) => b.discount - a.discount)
    .slice(0, count)
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase()
  return products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.subcategory.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q)) ||
    p.description.toLowerCase().includes(q) ||
    p.fabric.toLowerCase().includes(q) ||
    p.occasion.toLowerCase().includes(q)
  )
}

export function filterProducts(
  allProducts: Product[],
  filters: {
    category?: string
    subcategory?: string
    brand?: string[]
    priceRange?: [number, number]
    minRating?: number
    gender?: string
    sizes?: string[]
    colors?: string[]
    occasion?: string
    fabric?: string
    inStock?: boolean
    sortBy?: string
  }
): Product[] {
  let result = [...allProducts]

  if (filters.category) {
    result = result.filter(p => p.category === filters.category)
  }
  if (filters.subcategory) {
    result = result.filter(p => p.subcategory === filters.subcategory)
  }
  if (filters.brand && filters.brand.length > 0) {
    result = result.filter(p => filters.brand!.includes(p.brand))
  }
  if (filters.priceRange) {
    result = result.filter(p => p.price >= filters.priceRange![0] && p.price <= filters.priceRange![1])
  }
  if (filters.minRating) {
    result = result.filter(p => p.rating >= filters.minRating!)
  }
  if (filters.gender) {
    result = result.filter(p => p.gender === filters.gender || p.gender === 'unisex')
  }
  if (filters.occasion) {
    result = result.filter(p => p.occasion === filters.occasion)
  }
  if (filters.fabric) {
    result = result.filter(p => p.fabric === filters.fabric)
  }
  if (filters.inStock !== undefined) {
    result = result.filter(p => p.inStock === filters.inStock)
  }

  switch (filters.sortBy) {
    case 'price-low':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-high':
      result.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      result.sort((a, b) => b.rating - a.rating)
      break
    case 'discount':
      result.sort((a, b) => b.discount - a.discount)
      break
    case 'popular':
      result.sort((a, b) => b.reviews - a.reviews)
      break
    case 'newest':
      result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0))
      break
    default:
      break
  }

  return result
}

export function buildProfileFromInteractions(
  interactions: {
    view?: string[]
    purchase?: string[]
    like?: string[]
    cart?: string[]
    searches?: string[]
  }
): UserProfile {
  const profile = getEmptyProfile()
  profile.viewedProducts = interactions.view || []
  profile.purchasedProducts = interactions.purchase || []
  profile.likedProducts = interactions.like || []
  profile.cartItems = interactions.cart || []
  profile.searchHistory = interactions.searches || []

  const allInteracted = [
    ...profile.viewedProducts,
    ...profile.purchasedProducts,
    ...profile.likedProducts,
  ]

  allInteracted.forEach(id => {
    const product = products.find(p => p.id === id)
    if (product) {
      profile.preferredCategories[product.category] =
        (profile.preferredCategories[product.category] || 0) + 1
      profile.preferredBrands[product.brand] =
        (profile.preferredBrands[product.brand] || 0) + 1
    }
  })

  return profile
}
