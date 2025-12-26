'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LegalModal from '@/components/LegalModal'
import BackToTop from '@/components/BackToTop'
import BlogHero from '@/components/blog/BlogHero'
import FeaturedPostsSection from '@/components/blog/FeaturedPostsSection'
import BlogSidebar from '@/components/blog/BlogSidebar'
import BlogList from '@/components/blog/BlogList'
import BlogPagination from '@/components/blog/BlogPagination'
import SortByDropdown from '@/components/blog/SortByDropdown'
import BlogHelpBox from '@/components/blog/BlogHelpBox'

// Empty default posts - only admin-created posts will show
const defaultBlogPosts: any[] = []

type SortOption = 'most-recent' | 'most-old' | 'most-viewed' | 'alphabetical'

export default function BlogArchivePage() {
  useSmoothScroll()
  const [blogPosts, setBlogPosts] = useState(defaultBlogPosts)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('most-recent')
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 6

  useEffect(() => {
    // Fetch posts from database API
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts/public')
        if (response.ok) {
          const data = await response.json()
          const dbPosts = data.posts || []
          
          console.log('📝 Fetched posts from database:', dbPosts.length)
          console.log('📝 Posts:', dbPosts.map((p: any) => ({ title: p.title, slug: p.slug, published: p.published })))
          
          // Convert database posts to blog format
          const convertedPosts = dbPosts.map((p: any) => {
            const contentLength = (p.content || '').length
            const readTime = Math.ceil(contentLength / 1000) || 5
            const date = new Date(p.createdAt)
            const plainContent = p.content ? p.content.replace(/<[^>]*>/g, '') : ''
            const excerpt = p.excerpt || plainContent.substring(0, 150) + (plainContent.length > 150 ? '...' : '')
            
            return {
              id: p.id,
              title: p.title,
              excerpt: excerpt,
              image: p.featuredImage || 'https://madebydesignesia.com/php/cyberguard/images/misc/s1.webp',
              category: p.category || 'Blog',
              date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              readTime: `${readTime} min read`,
              slug: p.slug,
              featured: p.featured || false,
              views: p.views || 0,
            }
          })
          
          // Merge with default posts (for fallback/example posts)
          const existingSlugs = new Set(convertedPosts.map((p: any) => p.slug))
          const defaultPosts = defaultBlogPosts.filter((p: any) => !existingSlugs.has(p.slug))
          const allPosts = [...convertedPosts, ...defaultPosts]
          
          console.log('✅ Total posts after merge:', allPosts.length)
          setBlogPosts(allPosts)
        } else {
          console.error('❌ API response not OK:', response.status)
          // Fallback to default posts if API fails
          setBlogPosts(defaultBlogPosts)
        }
      } catch (error) {
        console.error('❌ Error fetching posts:', error)
        // Fallback to default posts
        setBlogPosts(defaultBlogPosts)
      }
    }

    fetchPosts()
  }, [])

  // Get unique categories from all posts - only show categories that have posts
  const categories = useMemo(() => {
    // Get all unique categories from posts, filtering out null, undefined, and empty strings
    const uniqueCats = new Set(
      blogPosts
        .map((p) => p.category)
        .filter((cat) => cat && cat.trim() !== '') // Remove null, undefined, empty
    )
    
    // Only include 'All' and categories that have at least one post
    const cats = ['All', ...Array.from(uniqueCats)]
    
    // Filter to only show categories that actually have posts
    return cats.filter((cat) => {
      if (cat === 'All') return true
      return blogPosts.some((p) => p.category === cat)
    })
  }, [blogPosts])

  // Filter posts (include ALL posts, not excluding featured)
  const filteredPosts = useMemo(() => {
    let filtered = blogPosts.filter(post => {
      // Category matching - handle null/undefined categories
      const postCategory = post.category || ''
      const matchesCategory = selectedCategory === 'All' || postCategory === selectedCategory
      
      // Search matching
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
      
      return matchesCategory && matchesSearch
    })
    
    console.log('🔍 Filtered posts:', filtered.length)
    console.log('📋 Posts in list:', filtered.map((p: any) => ({ title: p.title, featured: p.featured })))

    // Sort posts
    switch (sortBy) {
      case 'most-recent':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case 'most-old':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case 'most-viewed':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return filtered
  }, [blogPosts, selectedCategory, searchQuery, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage)

  // Reset to page 1 when filters change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  return (
    <>
      <Header />
      <main>
        <BlogHero />

        {/* Featured Posts Section */}
        <FeaturedPostsSection posts={blogPosts} />

        {/* Main Content Area */}
        <section className="blog-main-content">
          <div className="container">
            <div className="blog-layout">
              {/* Left Side - Main Content */}
              <div className="blog-main">
                {/* Sort By Dropdown */}
                <SortByDropdown
                  value={sortBy}
                  onChange={handleSortChange}
                />

                {/* Blog List */}
                <BlogList posts={paginatedPosts} />

                {/* Pagination */}
                <BlogPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>

              {/* Right Side - Sidebar */}
              <BlogSidebar
                posts={blogPosts}
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
              />
            </div>
          </div>
        </section>

        {/* Help Box */}
        <section className="blog-help-section">
          <div className="container">
            <BlogHelpBox />
          </div>
        </section>
      </main>
      <Footer />
      <LegalModal />
      <BackToTop />
      <a href="#blog-hero" className="skip-to-content">Skip to main content</a>
    </>
  )
}


