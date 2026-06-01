export const SITE_URL = "https://myhomestyler.com";

/**
 * Build an absolute, locale-aware URL.
 *   localizedUrl("/")              → https://myhomestyler.com
 *   localizedUrl("/", "ar")        → https://myhomestyler.com/ar
 *   localizedUrl("/my-post", "ar") → https://myhomestyler.com/ar/my-post
 *
 * Only use this for pages that have a REAL distinct route per locale
 * (the home page and blog posts). Static pages — pricing, tools, legal —
 * are served on a single URL (Arabic via cookie), so they have ONE
 * canonical and no cross-locale hreflang.
 */
export function localizedUrl(path: string, locale: string = "en"): string {
  const clean = path === "/" ? "" : path;
  return locale === "ar" ? `${SITE_URL}/ar${clean}` : `${SITE_URL}${clean}`;
}
