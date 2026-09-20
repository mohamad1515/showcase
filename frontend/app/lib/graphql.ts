import type {
  AdminUser,
  Category,
  Product,
  ProductInput,
  Cart,
  Order,
  Slider,
  Flavor,
  Brand,
  Comment,
  CommentInput,
  CommentStatus,
  ProductReviews,
  VoteType,
} from "./products";
import { GRAPHQL_URL } from "./config";

const graphqlUrl = GRAPHQL_URL;

const productFields = `
  id
  slug
  persianName
  englishName
  brand
  brands
  status
  rating
  flavor
  flavors
  productType
  summary
  description
  features
  category
  price
  compareAtPrice
  weight
  reviewCount
  tags
  stock
  mainImage
  galleryImages
  name
  tagline
  quantity
  images
  createdAt
  updatedAt
`;

const cartFields = `
  id
  total
  itemCount
  items {
    id
    quantity
    lineTotal
    product {
      ${productFields}
    }
  }
`;

const orderFields = `
  id
  status
  total
  createdAt
  items {
    id
    productId
    productName
    unitPrice
    quantity
    total
  }
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

const flavorFields = `
  id
  name
`;

const brandFields = `
  id
  name
`;

const sliderFields = `
  id
  title
  subtitle
  image
  link
`;

const commentFields = `
  id
  userName
  rating
  content
  status
  editedByAdmin
  createdAt
  updatedAt
  likeCount
  dislikeCount
  myVote
  reply {
    id
    content
    adminName
    createdAt
    updatedAt
  }
  productSlug
  productName
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

export async function getCart() {
  const data = await graphqlRequest<{ myCart: Cart }>(`
    query MyCart {
      myCart {
        ${cartFields}
      }
    }
  `);
  return data.myCart;
}

export async function addCartItem(productSlug: string, quantity = 1) {
  const data = await graphqlRequest<{ addCartItem: Cart }>(
    `
      mutation AddCartItem($input: AddCartItemInput!) {
        addCartItem(input: $input) {
          ${cartFields}
        }
      }
    `,
    { input: { productSlug, quantity } },
  );
  return data.addCartItem;
}

export async function updateCartItem(itemId: string, quantity: number) {
  const data = await graphqlRequest<{ updateCartItem: Cart }>(
    `
      mutation UpdateCartItem($input: UpdateCartItemInput!) {
        updateCartItem(input: $input) {
          ${cartFields}
        }
      }
    `,
    { input: { itemId: Number(itemId), quantity } },
  );
  return data.updateCartItem;
}

export async function removeCartItem(itemId: string) {
  const data = await graphqlRequest<{ removeCartItem: Cart }>(
    `
      mutation RemoveCartItem($itemId: Float!) {
        removeCartItem(itemId: $itemId) {
          ${cartFields}
        }
      }
    `,
    { itemId: Number(itemId) },
  );
  return data.removeCartItem;
}

export async function createOrderFromCart() {
  const data = await graphqlRequest<{ createOrderFromCart: Order }>(`
    mutation CreateOrderFromCart {
      createOrderFromCart {
        ${orderFields}
      }
    }
  `);
  return data.createOrderFromCart;
}

export async function getOrders() {
  const data = await graphqlRequest<{ myOrders: Order[] }>(`
    query MyOrders {
      myOrders {
        ${orderFields}
      }
    }
  `);
  return data.myOrders;
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

export async function getFlavors() {
  const data = await graphqlRequest<{ flavors: Flavor[] }>(`
    query Flavors { flavors { ${flavorFields} } }
  `);
  return data.flavors;
}

export async function getBrands() {
  const data = await graphqlRequest<{ brands: Brand[] }>(`
    query Brands { brands { ${brandFields} } }
  `);
  return data.brands;
}

export async function createBrand(name: string) {
  const data = await graphqlRequest<{ createBrand: Brand }>(
    `mutation CreateBrand($input: CreateBrandInput!) { createBrand(input: $input) { ${brandFields} } }`,
    { input: { name } },
  );
  return data.createBrand;
}

export async function updateBrand(id: string, name: string) {
  const data = await graphqlRequest<{ updateBrand: Brand }>(
    `mutation UpdateBrand($id: Float!, $input: UpdateBrandInput!) { updateBrand(id: $id, input: $input) { ${brandFields} } }`,
    { id: Number(id), input: { name } },
  );
  return data.updateBrand;
}

export async function removeBrand(id: string) {
  const data = await graphqlRequest<{ removeBrand: Brand }>(
    `mutation RemoveBrand($id: Float!) { removeBrand(id: $id) { ${brandFields} } }`,
    { id: Number(id) },
  );
  return data.removeBrand;
}

export async function createFlavor(name: string) {
  const data = await graphqlRequest<{ createFlavor: Flavor }>(
    `mutation CreateFlavor($input: CreateFlavorInput!) { createFlavor(input: $input) { ${flavorFields} } }`,
    { input: { name } },
  );
  return data.createFlavor;
}

export async function updateFlavor(id: string, name: string) {
  const data = await graphqlRequest<{ updateFlavor: Flavor }>(
    `mutation UpdateFlavor($id: Float!, $input: UpdateFlavorInput!) { updateFlavor(id: $id, input: $input) { ${flavorFields} } }`,
    { id: Number(id), input: { name } },
  );
  return data.updateFlavor;
}

export async function removeFlavor(id: string) {
  const data = await graphqlRequest<{ removeFlavor: Flavor }>(
    `mutation RemoveFlavor($id: Float!) { removeFlavor(id: $id) { ${flavorFields} } }`,
    { id: Number(id) },
  );
  return data.removeFlavor;
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

export async function getProductReviews(productSlug: string) {
  const data = await graphqlRequest<{ productReviews: ProductReviews }>(
    `
      query ProductReviews($productSlug: String!) {
        productReviews(productSlug: $productSlug) {
          average
          count
          distribution
          comments {
            ${commentFields}
          }
        }
      }
    `,
    { productSlug },
  );
  return data.productReviews;
}

export async function getAdminComments(status?: CommentStatus) {
  const data = await graphqlRequest<{ adminComments: Comment[] }>(
    `
      query AdminComments($status: CommentStatus) {
        adminComments(status: $status) {
          ${commentFields}
        }
      }
    `,
    { status },
  );
  return data.adminComments;
}

export async function createComment(input: CommentInput) {
  const data = await graphqlRequest<{ createComment: Comment }>(
    `
      mutation CreateComment($input: CreateCommentInput!) {
        createComment(input: $input) {
          ${commentFields}
        }
      }
    `,
    { input },
  );
  return data.createComment;
}

/** Like or dislike; repeating the same vote removes it, the other type switches it. */
export async function voteComment(commentId: string, type: VoteType) {
  const data = await graphqlRequest<{ voteComment: Comment }>(
    `
      mutation VoteComment($commentId: Float!, $type: VoteType!) {
        voteComment(commentId: $commentId, type: $type) {
          ${commentFields}
        }
      }
    `,
    { commentId: Number(commentId), type },
  );
  return data.voteComment;
}

export async function replyToComment(commentId: string, content: string) {
  const data = await graphqlRequest<{ replyToComment: Comment }>(
    `
      mutation ReplyToComment($commentId: Float!, $content: String!) {
        replyToComment(commentId: $commentId, content: $content) {
          ${commentFields}
        }
      }
    `,
    { commentId: Number(commentId), content },
  );
  return data.replyToComment;
}

export async function updateComment(commentId: string, content: string) {
  const data = await graphqlRequest<{ updateComment: Comment }>(
    `
      mutation UpdateComment($commentId: Float!, $content: String!) {
        updateComment(commentId: $commentId, content: $content) {
          ${commentFields}
        }
      }
    `,
    { commentId: Number(commentId), content },
  );
  return data.updateComment;
}

export async function removeComment(commentId: string) {
  const data = await graphqlRequest<{ removeComment: Comment }>(
    `
      mutation RemoveComment($commentId: Float!) {
        removeComment(commentId: $commentId) {
          ${commentFields}
        }
      }
    `,
    { commentId: Number(commentId) },
  );
  return data.removeComment;
}
