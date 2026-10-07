import Link from "next/link";
import { MarkdownAsync } from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/code-block";
import { resolveAssetSrc, resolveDocHref } from "@/lib/doc-links";
import type { Element } from "hast";

/**
 * A <picture> in the docs carries a light image and a dark source for
 * prefers-color-scheme. The site picks its theme with a class, so the
 * source would follow the system and ignore the toggle. Render both images
 * and let the theme class choose, as the header logo does.
 */
function pictureSources(node: Element | undefined) {
  let img: Element | undefined;
  let dark: string | undefined;
  for (const child of node?.children ?? []) {
    if (child.type !== "element") continue;
    if (child.tagName === "img") img = child;
    if (
      child.tagName === "source" &&
      String(child.properties.media ?? "").includes("dark")
    ) {
      dark = String(child.properties.srcSet ?? "");
    }
  }
  return { img, dark };
}

export async function Markdown({
  content,
  baseSegments,
}: {
  content: string;
  /**
   * [slug, ...directory of the markdown file on disk, relative to docs/],
   * e.g. ["augments-adk-python", "a2a"] for docs/a2a/index.md.
   */
  baseSegments: string[];
}) {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <MarkdownAsync
        remarkPlugins={[remarkGfm, remarkFrontmatter]}
        disallowedElements={["script", "style", "iframe"]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
          [
            rehypePrettyCode,
            {
              theme: {
                light: "github-light-default",
                dark: "github-dark-default",
              },
              keepBackground: false,
            },
          ],
        ]}
        components={{
          a: ({ href, children }) => {
            const resolved = resolveDocHref(baseSegments, href ?? "");
            if (/^https?:/i.test(resolved)) {
              return (
                <a href={resolved} target="_blank" rel="noreferrer">
                  {children}
                </a>
              );
            }
            return <Link href={resolved}>{children}</Link>;
          },
          img: ({ src, alt, width }) => {
            const resolved = resolveAssetSrc(
              baseSegments,
              typeof src === "string" ? src : "",
            );
            // eslint-disable-next-line @next/next/no-img-element -- synced static assets
            return <img src={resolved} alt={alt ?? ""} width={width} />;
          },
          picture: ({ node }) => {
            const { img, dark } = pictureSources(node);
            if (!img) return null;
            const src = resolveAssetSrc(
              baseSegments,
              String(img.properties.src ?? ""),
            );
            const alt = String(img.properties.alt ?? "");
            const width = img.properties.width as number | string | undefined;
            if (!dark) {
              // eslint-disable-next-line @next/next/no-img-element -- synced static assets
              return <img src={src} alt={alt} width={width} />;
            }
            return (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- synced static assets */}
                <img
                  src={src}
                  alt={alt}
                  width={width}
                  className="dark:hidden"
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- synced static assets */}
                <img
                  src={resolveAssetSrc(baseSegments, dark)}
                  alt={alt}
                  width={width}
                  className="hidden dark:block"
                />
              </>
            );
          },
          source: () => null,
          // Keep the <pre>: it preserves whitespace and carries the prose
          // surface styles. When the fence names a language, rehype-pretty-code
          // sets data-language / data-theme on it, so pass the props through.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `node` is the hast node, not a DOM attribute
          pre: ({ node: _node, children, ...props }) => (
            <CodeBlock>
              <pre {...props}>{children}</pre>
            </CodeBlock>
          ),
        }}
      >
        {content}
      </MarkdownAsync>
    </div>
  );
}
