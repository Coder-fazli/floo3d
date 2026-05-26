import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/2d-to-3d-floor-plan-converter', '/floor-plan-generator', '/blog/'],
                disallow: ['/secure-7x9/', '/api/', '/dashboard/', '/sign-in/', '/sign-up/'],
            },
            {
                userAgent: 'GPTBot',
                allow: ['/', '/2d-to-3d-floor-plan-converter', '/floor-plan-generator'],
            },
            {
                userAgent: 'PerplexityBot',
                allow: ['/', '/2d-to-3d-floor-plan-converter', '/floor-plan-generator'],
            },
            {
                userAgent: 'ClaudeBot',
                allow: ['/', '/2d-to-3d-floor-plan-converter', '/floor-plan-generator'],
            },
        ],
        sitemap: 'https://myhomestyler.com/sitemap.xml',
    }
}