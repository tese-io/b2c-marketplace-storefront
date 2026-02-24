import { BlogPost } from '@/types/blog';
import { BlogCard } from '@/components/organisms';

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "ESG Audits: What to Look For",
    excerpt:
      "How to choose and scope ESG assurance and audits that meet stakeholder and regulatory expectations.",
    image: '/images/blog/post-1.jpg',
    category: 'ESG',
    href: '#',
  },
  {
    id: 2,
    title: 'Building a Sustainability Strategy',
    excerpt:
      'Practical steps to align your business with sustainability goals and transparent reporting.',
    image: '/images/blog/post-2.jpg',
    category: 'GUIDES',
    href: '#',
  },
  {
    id: 3,
    title: 'Carbon and Climate Services',
    excerpt:
      'From footprinting to offsets: navigate carbon and climate-related products and services.',
    image: '/images/blog/post-3.jpg',
    category: 'CLIMATE',
    href: '#',
  },
];

export function BlogSection() {
  return (
    <section className='bg-tertiary container'>
      <div className='flex items-center justify-between mb-12'>
        <h2 className='heading-lg text-tertiary'>
          RESOURCES & INSIGHTS
        </h2>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3'>
        {blogPosts.map((post, index) => (
          <BlogCard
            key={post.id}
            index={index}
            post={post}
          />
        ))}
      </div>
    </section>
  );
}
