import {LadingPageScreen} from "@/src/pages-content/landing-page";
import {prisma} from "../src/lib/prisma";

async function getInstagramPosts() {
  const posts = await prisma.instagramPost.findMany({
    orderBy: {
      index: "asc",
    },
    where: {tenant_id: "c7b87076-18eb-4220-a40b-791c43187422"},
  });

  return posts.map((post) => post.html);
}

async function getLandingPageProducts() {
  const products = await prisma.product.findMany({
    where: {
      display_landing_page: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      name: true,
      description: true,
      image: true,
    },
  });

  return products;
}

export const revalidate = 0; // Disable cache - always fetch fresh data

export default async function Home() {
  const posts = await getInstagramPosts();
  const products = await getLandingPageProducts();

  return <LadingPageScreen posts={posts} products={products} />;
}
