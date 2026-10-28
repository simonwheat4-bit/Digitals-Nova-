import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  ArrowLeft,
  Search, 
  Tag, 
  Share2,
  CheckCircle2
} from 'lucide-react';
import { BLOG_POSTS } from '../data/websiteData';
import CtaSection from '../components/CtaSection';

export default function Blog({ navigate }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const categories = ['All', 'Digital Marketing', 'Web Development', 'E-Commerce'];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setNewsletterSubscribed(true);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 pt-28 pb-16">
      
      {/* If viewing a single post */}
      {selectedPost ? (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-200 mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Articles</span>
          </button>

          <div className="card-glass rounded-3xl p-8 sm:p-12 border border-cyan-500/30">
            <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium">
                {selectedPost.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedPost.readTime}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {selectedPost.date}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-6">
              {selectedPost.title}
            </h1>

            <div className="flex items-center gap-3 pb-6 mb-8 border-b border-slate-800 text-xs text-slate-400">
              <div className="w-9 h-9 rounded-full bg-navy-850 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                DS
              </div>
              <div>
                <span className="text-white font-semibold block">{selectedPost.author}</span>
                <span>Published on DigitalSnove Insights</span>
              </div>
            </div>

            <div className="space-y-6 text-sm sm:text-base text-slate-300 leading-relaxed">
              <p className="text-lg font-medium text-cyan-200 border-l-2 border-cyan-400 pl-4 italic">
                {selectedPost.excerpt}
              </p>
              <p>{selectedPost.content}</p>
              
              <h2 className="text-xl font-bold text-white pt-4">Key Takeaways for Growth-Oriented Brands</h2>
              <ul className="space-y-2.5 pl-4 list-disc text-slate-300">
                <li>Prioritize user experience and sub-second load times across every touchpoint.</li>
                <li>Leverage data analytics to eliminate conversion bottlenecks before scaling spend.</li>
                <li>Design mobile-first interfaces that reduce friction in checkout and inquiry flows.</li>
                <li>Maintain coherent omnichannel branding across visual, content, and code assets.</li>
              </ul>
            </div>

            <div className="mt-12 pt-6 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => navigate('/quote')}
                className="btn-primary text-xs px-5 py-2.5 rounded-full font-bold flex items-center gap-1.5"
              >
                <span>Discuss Your Project With Us</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Return to Blog
              </button>
            </div>
          </div>
        </article>
      ) : (
        <>
          {/* Header Banner */}
          <section className="relative py-16 lg:py-20 overflow-hidden border-b border-slate-800/80 text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Insights & Intelligence
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                DigitalSnove{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                  Engineering & Growth Blog
                </span>
              </h1>

              <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Actionable perspectives on web engineering, digital marketing ROI, UX design, and emerging automated technologies.
              </p>

              {/* Search & Category Filter */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-navy-900 border border-slate-700/80 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? 'btn-primary text-navy-950 font-bold'
                        : 'bg-navy-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Articles Listing Grid */}
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="cursor-pointer card-glass rounded-3xl p-7 border border-slate-800/80 hover:border-cyan-400/50 flex flex-col justify-between group shadow-card-glow"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" /> {post.readTime}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug mb-3">
                      {post.title}
                    </h3>

                    <p className="text-slate-400 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-6">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" /> {post.date}
                    </span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1 group-hover:text-cyan-200">
                      Read Article <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Newsletter Subscription Box */}
            <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-blue-950/60 border border-cyan-500/30 text-center max-w-3xl mx-auto shadow-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block mb-2">
                DIGITALSNOVE DISPATCH
              </span>
              <h3 className="text-2xl font-bold text-white mb-2">
                Stay Ahead of Global Tech & Marketing Trends
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto mb-6">
                Receive our monthly digest covering digital growth strategies, web performance optimizations, and AI automation insights. No spam.
              </p>

              {newsletterSubscribed ? (
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>You're subscribed! Thank you for joining our community.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your work email address"
                    required
                    className="flex-1 px-4 py-3 rounded-full bg-navy-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="btn-primary text-xs px-6 py-3 rounded-full font-bold shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </section>

          <CtaSection navigate={navigate} />
        </>
      )}

    </div>
  );
}
