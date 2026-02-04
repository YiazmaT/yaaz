import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-622ea89f140d461aa67cb5a19b61f344.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pub-3d83aa328a754ef480a222990fc09240.r2.dev",
      },
      //yaaz
      {
        protocol: "https",
        hostname: "https://pub-97580840637e4132a8480aa54c5a043c.r2.dev",
      },
    ],
  },
};

export default nextConfig;
