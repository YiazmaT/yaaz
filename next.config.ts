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
    ],
  },
};

export default nextConfig;
