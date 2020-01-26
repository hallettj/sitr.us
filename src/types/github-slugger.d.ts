declare module "github-slugger" {
  export default class GithubSlugger {
    /**
     * Generate a unique slug.
     * @param value String of text to slugify
     * @param maintainCase [false] Keep the current case, otherwise make all lowercase
     * @returns A unique slug string
     */
    slug(value: string, maintainCase?: boolean): string

    /**
     * Reset - Forget all previous slugs
     */
    reset(): void
  }
}
