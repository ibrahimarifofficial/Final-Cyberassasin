'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import CategoryForm from '@/components/admin/CategoryForm'
import ImageWithFallback from '@/components/ImageWithFallback'
import '@/css/admin-dashboard.css'

// Dynamically import editor to avoid SSR issues
const PostEditor = dynamic(() => import('@/components/admin/PostEditor'), {
  ssr: false,
})

interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featuredImage?: string
  published: boolean
  featured: boolean
  views: number
  category?: string
  tags: string[]
  createdAt: string
  author: {
    name?: string
    email: string
  }
}

type ActiveTab = 'dashboard' | 'posts' | 'categories'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const [categories, setCategories] = useState<any[]>([])
  const [editingCategory, setEditingCategory] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchPosts()
      fetchCategories()
    }
  }, [session])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewPost = () => {
    setSelectedPost(null)
    setShowEditor(true)
  }

  const handleEditPost = (post: Post) => {
    setSelectedPost(post)
    setShowEditor(true)
  }

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchPosts()
        if (selectedPost?.id === id) {
          setSelectedPost(null)
          setShowEditor(false)
        }
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  const handleEditorClose = () => {
    setShowEditor(false)
    setSelectedPost(null)
    fetchPosts()
  }

  if (status === 'loading') {
    return (
      <div className="admin-loading">
        <div>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (showEditor) {
    return (
      <PostEditor
        post={selectedPost}
        onClose={handleEditorClose}
        onSave={fetchPosts}
      />
    )
  }

  const publishedPosts = posts.filter(p => p.published).length
  const draftPosts = posts.filter(p => !p.published).length
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0)
  const userInitials = (session.user?.name || session.user?.email || 'A').charAt(0).toUpperCase()

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link href="/" className="admin-sidebar-logo">
            <ImageWithFallback
              src="/assets/images/logo.png"
              alt="CyberAssassin Logo"
              width={150}
              height={150}
              className="admin-sidebar-logo-img"
              style={{ objectFit: 'contain' }}
            />
          </Link>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section">
            <p className="admin-nav-section-title">Main</p>
            <button
              className={`admin-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="admin-nav-item-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </span>
              <span>Dashboard</span>
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <span className="admin-nav-item-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </span>
              <span>Posts</span>
              {posts.length > 0 && (
                <span className="admin-nav-item-badge">{posts.length}</span>
              )}
            </button>
            <button
              className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <span className="admin-nav-item-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7h16M4 12h16M4 17h16"></path>
                </svg>
              </span>
              <span>Categories</span>
              {categories.length > 0 && (
                <span className="admin-nav-item-badge">{categories.length}</span>
              )}
            </button>
          </div>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar">{userInitials}</div>
            <div className="admin-user-details">
              <p className="admin-user-name">{session.user?.name || 'Admin'}</p>
              <p className="admin-user-email">{session.user?.email}</p>
            </div>
          </div>
          <button
            className="admin-logout-btn"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {/* Header */}
        <header className="admin-header">
          <h1 className="admin-header-title">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'posts' && 'Posts'}
            {activeTab === 'categories' && 'Categories'}
          </h1>
          <div className="admin-header-actions">
            {activeTab === 'posts' && (
              <button className="admin-header-btn" onClick={handleNewPost}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>New Post</span>
              </button>
            )}
            {activeTab === 'categories' && (
              <button
                className="admin-header-btn"
                onClick={() => setEditingCategory({ name: '', description: '' })}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>New Category</span>
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="admin-content-wrapper">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <h3 className="admin-stat-title">Total Posts</h3>
                    <div className="admin-stat-icon posts">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                      </svg>
                    </div>
                  </div>
                  <p className="admin-stat-value">{posts.length}</p>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <h3 className="admin-stat-title">Published</h3>
                    <div className="admin-stat-icon published">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  </div>
                  <p className="admin-stat-value">{publishedPosts}</p>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <h3 className="admin-stat-title">Drafts</h3>
                    <div className="admin-stat-icon drafts">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                      </svg>
                    </div>
                  </div>
                  <p className="admin-stat-value">{draftPosts}</p>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-header">
                    <h3 className="admin-stat-title">Total Views</h3>
                    <div className="admin-stat-icon views">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </div>
                  </div>
                  <p className="admin-stat-value">{totalViews.toLocaleString()}</p>
                </div>
              </div>

              {/* Recent Posts */}
              <div className="admin-content-card">
                <div className="admin-card-header">
                  <h2 className="admin-card-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                    <span>Recent Posts</span>
                  </h2>
                  <button
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => setActiveTab('posts')}
                  >
                    View All
                  </button>
                </div>
                {loading ? (
                  <div className="admin-loading">Loading posts...</div>
                ) : posts.length === 0 ? (
                  <div className="admin-empty-state">
                    <div className="admin-empty-state-icon">📝</div>
                    <h3 className="admin-empty-state-title">No posts yet</h3>
                    <p className="admin-empty-state-text">Create your first post to get started</p>
                    <button className="admin-btn admin-btn-primary" onClick={handleNewPost}>
                      Create Post
                    </button>
                  </div>
                ) : (
                  <div className="admin-posts-list">
                    {posts.slice(0, 5).map((post) => (
                      <div key={post.id} className="admin-post-item" onClick={() => handleEditPost(post)}>
                        {post.featuredImage && (
                          <div className="admin-post-image">
                            <Image
                              src={post.featuredImage}
                              alt={post.title}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        <div className="admin-post-content">
                          <h3 className="admin-post-title">{post.title}</h3>
                          <div className="admin-post-meta">
                            <span className="admin-post-meta-item">
                              {post.published ? (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                  <span>Published</span>
                                </>
                              ) : (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                  </svg>
                                  <span>Draft</span>
                                </>
                              )}
                            </span>
                            {post.featured && (
                              <span className="admin-post-meta-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <span>Featured</span>
                              </span>
                            )}
                            <span className="admin-post-meta-item">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                              <span>{post.views} views</span>
                            </span>
                            <span className="admin-post-meta-item">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                              </svg>
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </span>
                          </div>
                          {post.excerpt && (
                            <p className="admin-post-excerpt">{post.excerpt}</p>
                          )}
                        </div>
                        <div className="admin-post-actions">
                          <button
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditPost(post)
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePost(post.id)
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="admin-content-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  <span>All Posts ({posts.length})</span>
                </h2>
              </div>
              {loading ? (
                <div className="admin-loading">Loading posts...</div>
              ) : posts.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="admin-empty-state-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                  </div>
                  <h3 className="admin-empty-state-title">No posts yet</h3>
                  <p className="admin-empty-state-text">Create your first post to get started</p>
                  <button className="admin-btn admin-btn-primary" onClick={handleNewPost}>
                    Create Post
                  </button>
                </div>
              ) : (
                <div className="admin-posts-list">
                  {posts.map((post) => (
                    <div key={post.id} className="admin-post-item" onClick={() => handleEditPost(post)}>
                      {post.featuredImage && (
                        <div className="admin-post-image">
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div className="admin-post-content">
                        <h3 className="admin-post-title">{post.title}</h3>
                        <div className="admin-post-meta">
                          <span className="admin-post-meta-item">
                            {post.published ? (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="12" y1="8" x2="12" y2="12"></line>
                                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <span>Draft</span>
                              </>
                            )}
                          </span>
                          {post.featured && (
                            <span className="admin-post-meta-item">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                              <span>Featured</span>
                            </span>
                          )}
                          <span className="admin-post-meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>{post.views} views</span>
                          </span>
                          <span className="admin-post-meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </span>
                          {post.category && (
                            <span className="admin-post-meta-item">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 7h16M4 12h16M4 17h16"></path>
                              </svg>
                              <span>{post.category}</span>
                            </span>
                          )}
                        </div>
                        {post.excerpt && (
                          <p className="admin-post-excerpt">{post.excerpt}</p>
                        )}
                      </div>
                      <div className="admin-post-actions">
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditPost(post)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePost(post.id)
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="admin-content-card">
              <div className="admin-card-header">
                <h2 className="admin-card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7h16M4 12h16M4 17h16"></path>
                  </svg>
                  <span>Categories ({categories.length})</span>
                </h2>
              </div>
              {categories.length === 0 ? (
                <div className="admin-empty-state">
                  <div className="admin-empty-state-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7h16M4 12h16M4 17h16"></path>
                    </svg>
                  </div>
                  <h3 className="admin-empty-state-title">No categories yet</h3>
                  <p className="admin-empty-state-text">Create your first category to organize posts</p>
                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => setEditingCategory({ name: '', description: '' })}
                  >
                    Create Category
                  </button>
                </div>
              ) : (
                <div className="admin-categories-list">
                  {categories.map((cat) => (
                    <div key={cat.id} className="admin-category-item">
                      <div className="admin-category-info">
                        <h3 className="admin-category-name">{cat.name}</h3>
                        {cat.description && (
                          <p className="admin-category-description">{cat.description}</p>
                        )}
                        <p className="admin-category-slug">Slug: {cat.slug}</p>
                      </div>
                      <div className="admin-post-actions">
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => setEditingCategory(cat)}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={async () => {
                            if (confirm('Delete this category?')) {
                              try {
                                const response = await fetch(`/api/categories/${cat.id}`, {
                                  method: 'DELETE'
                                })
                                if (response.ok) {
                                  fetchCategories()
                                }
                              } catch (error) {
                                alert('Failed to delete category')
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="admin-modal-overlay" onClick={() => setEditingCategory(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                {editingCategory.id ? 'Edit Category' : 'New Category'}
              </h2>
            </div>
            <CategoryForm
              category={editingCategory}
              onSave={async (name: string, description: string) => {
                try {
                  const url = editingCategory.id
                    ? `/api/categories/${editingCategory.id}`
                    : '/api/categories'
                  const method = editingCategory.id ? 'PUT' : 'POST'
                  
                  const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description })
                  })

                  if (response.ok) {
                    fetchCategories()
                    setEditingCategory(null)
                  } else {
                    const error = await response.json()
                    alert(error.error || 'Failed to save category')
                  }
                } catch (error) {
                  alert('Failed to save category')
                }
              }}
              onCancel={() => setEditingCategory(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
