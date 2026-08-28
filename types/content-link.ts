export interface ContentLink {
  name: string;
  url: string;
}

export const toContentLinks = (
  links: ContentLink[] | undefined,
  legacyUrl?: string,
): ContentLink[] => {
  if (links?.length) return links;
  return legacyUrl ? [{ name: "Link 1", url: legacyUrl }] : [];
};
