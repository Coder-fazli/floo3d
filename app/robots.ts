import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/secure-7x9/', '/api/', '/dashboard/', '/sign-in/', '/sign-up/'],
        },
        sitemap: 'https://myhomestyler.com/sitemap.xml',
    }
}