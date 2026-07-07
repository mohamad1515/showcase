import type {
  AdminUser,
  Category,
  Product,
  ProductInput,
  Slider,
} from "./products";
import { GRAPHQL_URL } from "./config";

const graphqlUrl = GRAPHQL_URL;

const productFields = `
  id
  slug
  name
  tagline
  summary
  description
  features
  category
  price
  weight
  quantity
  images
  createdAt
  updatedAt
`;

const userFields = `
  id
  name
  email
  role
  is_active
  created_at
`;

const categoryFields = `
  id
  slug
  name
  description
`;

const sliderFields = `
  id
  title
  subtitle
  image
  link
`;

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // If running in browser and token exists, include Authorization header
  if (typeof window !== "undefined") {
    try {
      const token = window.localStorage.getItem("auth-token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    } catch {
      // ignore localStorage errors
    }
  }

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers,
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

  if (!data.product) {
    throw new Error(`Product not found: ${slug}`);
  }

  return data.product;
}

export async function createProduct(input: ProductInput) {
  const data = await graphqlRequest<{ createProduct: Product }>(
    `
      mutation CreateProduct($input: CreateProductInput!) {
        createProduct(input: $input) {
          ${productFields}
        }
      }
    `,
    { input },
  );

  return data.createProduct;
}

export async function updateProduct(
  slug: string,
  input: Partial<ProductInput>,
) {
  const data = await graphqlRequest<{ updateProduct: Product }>(
    `
      mutation UpdateProduct($slug: String!, $input: UpdateProductInput!) {
        updateProduct(slug: $slug, input: $input) {
          ${productFields}
        }
      }
    `,
    { slug, input },
  );

  return data.updateProduct;
}

export async function removeProduct(slug: string) {
  const data = await graphqlRequest<{ removeProduct: Product }>(
    `
      mutation RemoveProduct($slug: String!) {
        removeProduct(slug: $slug) {
          ${productFields}
        }
      }
    `,
    { slug },
  );

  return data.removeProduct;
}

export async function getUsers() {
  const data = await graphqlRequest<{ users: AdminUser[] }>(`
    query Users {
      users {
        ${userFields}
      }
    }
  `);
  return data.users;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const data = await graphqlRequest<{ createUser: AdminUser }>(
    `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          ${userFields}
        }
      }
    `,
    { input },
  );
  return data.createUser;
}

export async function updateUser(
  id: string,
  input: { name?: string; email?: string; password?: string },
) {
  const data = await graphqlRequest<{ updateUser: AdminUser }>(
    `
      mutation UpdateUser($id: Float!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
          ${userFields}
        }
      }
    `,
    { id: Number(id), input },
  );
  return data.updateUser;
}

export async function setUserActive(id: string, isActive: boolean) {
  const data = await graphqlRequest<{ setUserActive: AdminUser }>(
    `
      mutation SetUserActive($id: Float!, $isActive: Boolean!) {
        setUserActive(id: $id, isActive: $isActive) {
          ${userFields}
        }
      }
    `,
    { id: Number(id), isActive },
  );
  return data.setUserActive;
}

export async function getCategories() {
  const data = await graphqlRequest<{ categories: Category[] }>(`
    query Categories {
      categories {
        ${categoryFields}
      }
    }
  `);
  return data.categories;
}

export async function createCategory(input: {
  slug: string;
  name: string;
  description?: string;
}) {
  const data = await graphqlRequest<{ createCategory: Category }>(
    `
      mutation CreateCategory($input: CreateCategoryInput!) {
        createCategory(input: $input) {
          ${categoryFields}
        }
      }
    `,
    { input },
  );
  return data.createCategory;
}

export async function updateCategory(
  slug: string,
  input: { slug?: string; name?: string; description?: string },
) {
  const data = await graphqlRequest<{ updateCategory: Category }>(
    `
      mutation UpdateCategory($slug: String!, $input: UpdateCategoryInput!) {
        updateCategory(slug: $slug, input: $input) {
          ${categoryFields}
        }
      }
    `,
    { slug, input },
  );
  return data.updateCategory;
}

export async function removeCategory(slug: string) {
  const data = await graphqlRequest<{ removeCategory: Category }>(
    `
      mutation RemoveCategory($slug: String!) {
        removeCategory(slug: $slug) {
          ${categoryFields}
        }
      }
    `,
    { slug },
  );
  return data.removeCategory;
}

export async function getSliders() {
  const data = await graphqlRequest<{ sliders: Slider[] }>(`
    query Sliders {
      sliders {
        ${sliderFields}
      }
    }
  `);
  return data.sliders;
}

export async function createSlider(input: {
  title: string;
  subtitle: string;
  image: string;
  link?: string;
}) {
  const data = await graphqlRequest<{ createSlider: Slider }>(
    `
      mutation CreateSlider($input: CreateSliderInput!) {
        createSlider(input: $input) {
          ${sliderFields}
        }
      }
    `,
    { input },
  );
  return data.createSlider;
}

export async function updateSlider(
  id: string,
  input: { title?: string; subtitle?: string; image?: string; link?: string },
) {
  const data = await graphqlRequest<{ updateSlider: Slider }>(
    `
      mutation UpdateSlider($id: Float!, $input: UpdateSliderInput!) {
        updateSlider(id: $id, input: $input) {
          ${sliderFields}
        }
      }
    `,
    { id: Number(id), input },
  );
  return data.updateSlider;
}

export async function removeSlider(id: string) {
  const data = await graphqlRequest<{ removeSlider: Slider }>(
    `
      mutation RemoveSlider($id: Float!) {
        removeSlider(id: $id) {
          ${sliderFields}
        }
      }
    `,
    { id: Number(id) },
  );
  return data.removeSlider;
}
