/** One logo asset variant. `svg` is the canonical lockup; `png`/`png2x`
 *  back it for contexts that can't rasterise SVG (e.g. print). */
export interface BrandLogoVariant {
  svg: string;
  png?: string;
  png2x?: string;
}

export interface BrandSocial {
  key: string;
  label: string;
  url: string;
  iconUrl?: string;
}

/** `GET /platform/branding` — the tenant's logo suite + social links. */
export interface Branding {
  logos: {
    /** The single canonical lockup most surfaces use. */
    primary: BrandLogoVariant;
    /** Full-colour variant (e.g. splash/auth). */
    color: BrandLogoVariant;
    /** Monochrome variant for dark surfaces. */
    dark: BrandLogoVariant;
  };
  socials: BrandSocial[];
}