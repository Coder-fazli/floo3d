"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";

export function Highlight({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("bg-blue-500/10 p-1 py-0.5 font-bold text-blue-500", className)}>
      {children}
    </span>
  );
}

function TestimonialCard({ description, name, img, role, className }: {
  name: string; role: string; img?: string; description: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn(
      "mb-4 flex w-full cursor-pointer break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl p-4",
      "border border-border bg-card/50 shadow-sm",
      "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
      className,
    )}>
      <div className="text-sm font-normal text-muted-foreground select-none">
        {description}
        <div className="flex flex-row py-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="size-4 fill-blue-500 text-blue-500" />
          ))}
        </div>
      </div>
      <div className="flex w-full items-center justify-start gap-5 select-none">
        <img
          width={40}
          height={40}
          src={img || ""}
          alt={name}
          className="size-10 rounded-full ring-1 ring-blue-500/20 ring-offset-2"
        />
        <div>
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-xs font-normal text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Interior Designer",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
    description: <p>I upload a floor plan and get a photorealistic 3D render in seconds. <Highlight>MyHomeStyler completely replaced our old rendering pipeline.</Highlight> Clients love seeing their space before construction.</p>,
  },
  {
    name: "James Okafor",
    role: "Real Estate Agent",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
    description: <p>We use it for every listing now. <Highlight>Buyers can visualize the space in different styles without visiting.</Highlight> Our conversion rate went up noticeably.</p>,
  },
  {
    name: "Lena Bauer",
    role: "Homeowner",
    img: "https://randomuser.me/api/portraits/women/68.jpg",
    description: <p>I had a rough sketch of my apartment renovation. Uploaded it and got a stunning 3D render. <Highlight>Saved me from a very expensive design mistake.</Highlight></p>,
  },
  {
    name: "Carlos Rivera",
    role: "Architect",
    img: "https://randomuser.me/api/portraits/men/55.jpg",
    description: <p><Highlight>The blueprint-to-3D conversion is shockingly accurate.</Highlight> I use it to quickly show clients what their space will look like before the detailed plans are done.</p>,
  },
  {
    name: "Amina Hassan",
    role: "Property Developer",
    img: "https://randomuser.me/api/portraits/women/12.jpg",
    description: <p>We generate renders for all our floor plan variations in minutes. <Highlight>What used to take a week now takes an afternoon.</Highlight> Huge time saver for our team.</p>,
  },
  {
    name: "Tom Eriksson",
    role: "Renovation Contractor",
    img: "https://randomuser.me/api/portraits/men/14.jpg",
    description: <p>Clients come with photos of their rooms and I show them the redesign on the spot. <Highlight>It closes deals faster than anything else I have tried.</Highlight></p>,
  },
  {
    name: "Yuki Tanaka",
    role: "Freelance Designer",
    img: "https://randomuser.me/api/portraits/women/28.jpg",
    description: <p>The isometric view is my favourite. <Highlight>It gives clients a real sense of depth and scale</Highlight> that flat floor plans simply cannot communicate.</p>,
  },
  {
    name: "Marco Rossi",
    role: "Furniture Retailer",
    img: "https://randomuser.me/api/portraits/men/76.jpg",
    description: <p>We use the virtual staging tool to show customers how our furniture looks in their space. <Highlight>Returns dropped significantly</Highlight> since we started doing this.</p>,
  },
  {
    name: "Priya Kapoor",
    role: "Urban Planner",
    img: "https://randomuser.me/api/portraits/women/90.jpg",
    description: <p>I generated a full apartment floor plan in under a minute just by describing the rooms. <Highlight>No design software needed at all.</Highlight> Incredibly intuitive.</p>,
  },
];

export type Testimonial = {
  name: string;
  role: string;
  img?: string;
  description: React.ReactNode;
};

export default function TestimonialsMarquee({ items }: { items?: Testimonial[] }) {
  const data = items ?? testimonials;
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-10">
      <div className="absolute top-20 -left-20 z-10 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute -right-20 bottom-20 z-10 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-foreground mb-4 text-center text-4xl leading-[1.2] font-bold tracking-tighter md:text-5xl">
          What Our Users Are Saying
        </h2>
        <h3 className="text-muted-foreground mx-auto mb-8 max-w-lg text-center text-lg font-medium tracking-tight text-balance">
          Don&apos;t just take our word for it. Here&apos;s what{" "}
          <span className="bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent">
            homeowners & designers
          </span>{" "}
          are saying about{" "}
          <span className="font-semibold text-blue-500">MyHomeStyler</span>
        </h3>
      </motion.div>

      <div className="relative mt-6 max-h-screen overflow-hidden">
        <div className="gap-4 md:columns-2 xl:columns-3 2xl:columns-4">
          {Array(Math.ceil(data.length / 3))
            .fill(0)
            .map((_, i) => (
              <Marquee
                vertical
                key={i}
                repeat={2}
                className={cn({
                  "[--duration:60s]": i === 1,
                  "[--duration:30s]": i === 2,
                  "[--duration:70s]": i === 3,
                })}
              >
                {data.slice(i * 3, (i + 1) * 3).map((card, idx) => (
                  <TestimonialCard key={idx} {...card} />
                ))}
              </Marquee>
            ))}
        </div>
        <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full bg-gradient-to-t from-20%" />
        <div className="from-background pointer-events-none absolute inset-x-0 top-0 h-1/4 w-full bg-gradient-to-b from-20%" />
      </div>
    </section>
  );
}
