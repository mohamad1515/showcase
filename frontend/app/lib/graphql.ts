import type { Product } from "./products";

const graphqlUrl = process.env.GRAPHQL_URL ?? "http://localhost:4000/graphql";

const productFields = `
  slug
  name
  tagline
  summary
  description
  features
  category
  price
  weight
`;

async function graphqlRequest<T>(query: string, variables?: Record<string, unknown>) {
  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }

  if (!payload.data) {
    throw new Error("GraphQL response did not include data.");
  }

  return payload.data;
}

export async function getProducts() {
  const data = await graphqlRequest<{ products: Product[] }>(`
    query Products {
      products {
        ${productFields}
      }
    }
  `);

  return data.products;
}

export async function getProductBySlug(slug: string) {
  try {
    const data = await graphqlRequest<{ product: Product }>(
      `
        query Product($slug: String!) {
          product(slug: $slug) {
            ${productFields}
          }
        }
      `,
      { slug },
    );

    return data.product;
  } catch {
    return null;
  }
}
