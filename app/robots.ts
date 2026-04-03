import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/2d-to-3d-floor-plan-converter'],
                disallow: ['/secure-7x9/', '/api/', '/dashboard/', '/sign-in/', '/sign-up/'],
            },
            {
                userAgent: 'GPTBot',
                allow: ['/', '/2d-to-3d-floor-plan-converter'],
            },
            {
                userAgent: 'PerplexityBot',
                allow: ['/', '/2d-to-3d-floor-plan-converter'],
            },
            {
                userAgent: 'ClaudeBot',
                allow: ['/', '/2d-to-3d-floor-plan-converter'],
            },
        ],
        sitemap: 'https://myhomestyler.com/sitemap.xml',
    }
}