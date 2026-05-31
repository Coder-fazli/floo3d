import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface BlogPost {
  title: string;
  description: string;
  image: string | null;
  publishDate: string;
  readMoreLink: string;
  category: string;
}

const FALLBACK: BlogPost[] = [
  {
    category: "DESIGN",
    description: "How AI is changing the way homeowners and architects visualize spaces before they build.",
    image: "https://images.unsplash.com/photo-1558174685-430919a96c8d",
    publishDate: "Coming soon",
    readMoreLink: "/blog",
    title: "The Future of AI in Home Design",
  },
  {
    category: "FLOOR PLANS",
    description: "Everything you need to know about converting a 2D blueprint into a photorealistic 3D render.",
    image: "https://images.unsplash.com/photo-1466228432269-af42b400b934",
    publishDate: "Coming soon",
    readMoreLink: "/blog",
    title: "2D to 3D: A Complete Guide for Homeowners",
  },
  {
    category: "INTERIOR",
    description: "Explore the top design styles our AI supports and how to choose the right one for your space.",
    image: "https://images.unsplash.com/photo-1605907126120-f68611516ecc",
    publishDate: "Coming soon",
    readMoreLink: "/blog",
    title: "Modern vs Scandinavian: Which Style Fits You?",
  },
];

export default function BlogsSection({ posts }: { posts?: BlogPost[] }) {
  const articles = posts && posts.length > 0 ? posts : FALLBACK;

  return (
    <section className="bg-white px-4 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center sm:mb-12">
          <p className="mb-3 font-medium text-gray-600 text-xs uppercase tracking-wider sm:mb-4">
            THE JOURNAL
          </p>
          <h2 className="font-normal text-2xl text-gray-900 tracking-tight sm:text-3xl md:text-5xl">
            Design Tips & AI Insights
          </h2>
        </div>
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <div
              className="cursor-pointer border border-gray-300/50 bg-white/50 shadow-none backdrop-blur-sm transition-shadow hover:shadow-md flex flex-col"
              key={index}
            >
              <div className="p-0 flex flex-col flex-1">
                <div className="relative mb-4 sm:mb-6">
                  {article.image ? (
                    <Image
                      alt={article.title}
                      className="aspect-square h-64 w-full object-cover sm:h-72 md:h-80"
                      height={1080}
                      src={article.image}
                      width={1920}
                    />
                  ) : (
                    <div className="aspect-square h-64 w-full bg-gradient-to-br from-orange-50 to-orange-100 sm:h-72 md:h-80" />
                  )}
                  <p className="absolute top-0 left-0 bg-white px-2 py-0.5 font-medium text-[10px] text-black uppercase sm:-top-0.5 sm:-left-0.5 sm:px-3 sm:py-1 sm:text-xs">
                    #{article.category}
                  </p>
                </div>
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 flex flex-col flex-1">
                  <h3 className="mb-2 font-normal text-base text-gray-900 tracking-tight sm:mb-2 sm:text-lg md:text-2xl line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="mb-4 text-gray-600 text-xs leading-relaxed sm:mb-6 sm:text-sm line-clamp-3">
                    {article.description}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-auto">
                    <Link
                      className="group relative flex items-center overflow-hidden font-medium text-gray-900 text-xs transition-colors hover:text-gray-700 sm:text-sm"
                      href={article.readMoreLink}
                    >
                      <span className="mr-2 overflow-hidden border border-gray-200 p-2 transition-colors duration-300 ease-in group-hover:bg-black group-hover:text-white sm:p-3">
                        <ArrowRight className="h-3 w-3 translate-x-0 opacity-100 transition-all duration-500 ease-in group-hover:translate-x-8 group-hover:opacity-0 sm:h-4 sm:w-4" />
                        <ArrowRight className="absolute top-1/2 -left-4 h-4 w-4 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:left-2 sm:-left-5 sm:h-4 sm:w-4 sm:group-hover:left-3" />
                      </span>
                      Read more
                    </Link>
                    <span className="flex items-center gap-2 text-[10px] text-gray-500 sm:gap-3 sm:text-xs">
                      {article.publishDate}
                      <span className="w-6 border-gray-300 border-t sm:w-16" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-600 text-gray-600 hover:text-black transition-colors"
          >
            View all articles <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
