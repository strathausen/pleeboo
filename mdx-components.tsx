import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allow all default markdown elements
    ...components,
    // You can override specific components here if needed
    // h1: ({ children }) => <h1 className="text-4xl font-bold">{children}</h1>,
  };
}
