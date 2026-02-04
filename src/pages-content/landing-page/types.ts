export interface LandingPageProduct {
  name: string;
  description: string | null;
  image: string | null;
}

export interface LadingPageProps {
  posts: string[];
  products: LandingPageProduct[];
}
