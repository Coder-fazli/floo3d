import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/ar/',
                    '/ar',
                    '/2d-to-3d-floor-plan-converter',
                    '/floor-plan-generator',
                    '/blog/',
                    '/pricing',
                    '/contact',
                ],
                disallow: ['/secure-7x9/', '/api/', '/dashboard/', '/sign-in/', '/sign-up/'],
            },
            {
                userAgent: 'GPTBot',
                allow: ['/', '/ar/', '/2d-to-3d-floor-plan-converter', '/floor-plan-generator'],
            },
            {
                userAgent: 'PerplexityBot',
                allow: ['/', '/ar/', '/2d-to-3d-floor-plan-converter', '/floor-plan-generator'],
            },
            {
                userAgent: 'ClaudeBot',
                allow: ['/', '/ar/', '/2d-to-3d-floor-plan-converter', '/floor-plan-generator'],
            },
        ],
        sitemap: 'https://myhomestyler.com/sitemap.xml',
    }
}