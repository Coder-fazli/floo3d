import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    // Private / user-specific areas — not for indexing (English + Arabic variants)
    const disallow = [
        '/secure-7x9', '/api', '/dashboard', '/sign-in', '/sign-up',
        '/visualizer', '/projects', '/new', '/color-test',
        '/ar/secure-7x9', '/ar/dashboard', '/ar/sign-in', '/ar/sign-up',
        '/ar/visualizer', '/ar/projects', '/ar/new', '/ar/color-test',
    ];

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/ar'],
                disallow,
            },
            {
                userAgent: 'GPTBot',
                allow: ['/', '/ar', '/2d-to-3d-floor-plan-converter', '/floor-plan-generator'],
                disallow,
            },
            {
                userAgent: 'PerplexityBot',
                allow: ['/', '/ar', '/2d-to-3d-floor-plan-converter', '/floor-plan-generator'],
                disallow,
            },
            {
                userAgent: 'ClaudeBot',
                allow: ['/', '/ar', '/2d-to-3d-floor-plan-converter', '/floor-plan-generator'],
                disallow,
            },
        ],
        sitemap: 'https://myhomestyler.com/sitemap.xml',
        host: 'https://myhomestyler.com',
    }
}