import {Footer} from "./components/footer";
import {Header} from "./components/header";
import {Hero} from "./components/hero";
import {InstagramSection} from "./components/instagram-section";
import {ProductsSection} from "./components/products-section";
import {LadingPageProps} from "./types";

const mainSectionText = "Segundas-feiras na Feira do Produtor Rural\nFeitos com fermentação natural e assados na pedra!";

const socialLinks = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_LINK || "",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_LINK || "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_LINK || "",
};

export function LadingPageScreen(props: LadingPageProps) {
  return (
    <>
      <Header socialLinks={socialLinks} />

      <main className="pt-16">
        <Hero mainSectionText={mainSectionText} socialLinks={socialLinks} />
        <ProductsSection products={props.products} />
        <InstagramSection posts={props.posts} instagramLink={socialLinks.instagram} />
      </main>

      <Footer socialLinks={socialLinks} />
    </>
  );
}
