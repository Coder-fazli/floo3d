import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    // Private / user-specific areas — not for indexing (English + Arabic + Spanish variants)
    const disallow = [
        '/secure-7x9', '/api', '/dashboard', '/sign-in', '/sign-up',
        '/visualizer', '/projects', '/new', '/color-test',
        '/ar/secure-7x9', '/ar/dashboard', '/ar/sign-in', '/ar/sign-up',
        '/ar/visualizer', '/ar/projects', '/ar/new', '/ar/color-test',
        '/es/secure-7x9', '/es/dashboard', '/es/sign-in', '/es/sign-up',
        '/es/visualizer', '/es/projects', '/es/new', '/es/color-test',
    ];

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/ar', '/es'],
                disallow,
            },
            {
                userAgent: 'GPTBot',
                allow: ['/', '/ar', '/es', '/2d-to-3d-floor-plan-converter', '/floor-plan-generator'],
                disallow,
            },
            {
                userAgent: 'PerplexityBot',
                allow: ['/', '/ar', '/es', '/2d-to-3d-floor-plan-converter', '/floor-plan-generator'],
                disallow,
            },
            {
                userAgent: 'ClaudeBot',
                allow: ['/', '/ar', '/es', '/2d-to-3d-floor-plan-converter', '/floor-plan-generator'],
                disallow,
            },
        ],
        sitemap: 'https://myhomestyler.com/sitemap.xml',
        host: 'https://myhomestyler.com',
    }
}