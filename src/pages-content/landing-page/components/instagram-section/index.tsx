"use client";
import {useState, useEffect} from "react";
import Image from "next/image";
import Script from "next/script";
import {InstagramPost} from "../instagram-post";
import {InstagramSectionProps} from "./types";

const primaryColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#172722";
const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR || "#CBD894";

export function InstagramSection(props: InstagramSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="bg-gradient-to-b from-white to-gray-50">
      <div className="h-20 md:h-24 relative" style={{background: `linear-gradient(to bottom, ${secondaryColor}, white)`}}>
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full" style={{backgroundColor: `${primaryColor}20`}} />
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full" style={{backgroundColor: `${primaryColor}30`}} />
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{backgroundColor: `${primaryColor}40`}} />
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{backgroundColor: `${primaryColor}50`}} />
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full" style={{backgroundColor: `${primaryColor}60`}} />
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full" style={{backgroundColor: `${primaryColor}70`}} />
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{backgroundColor: `${primaryColor}80`}} />
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{backgroundColor: `${primaryColor}90`}} />
          </div>
          <div className="rounded-full p-2 shadow-lg" style={{backgroundColor: primaryColor}}>
            <Image src="/assets/icon.png" alt="Logo" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{backgroundColor: `${primaryColor}90`}} />
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" style={{backgroundColor: `${primaryColor}80`}} />
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full" style={{backgroundColor: `${primaryColor}70`}} />
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full" style={{backgroundColor: `${primaryColor}60`}} />
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{backgroundColor: `${primaryColor}50`}} />
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full" style={{backgroundColor: `${primaryColor}40`}} />
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full" style={{backgroundColor: `${primaryColor}30`}} />
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full" style={{backgroundColor: `${primaryColor}20`}} />
          </div>
        </div>
      </div>
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Me segue no Instagram!</h2>
            <a
              href={props.instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all hover:scale-105"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              @paodemato
            </a>
          </div>

          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w=[500px]">
              {!mounted
                ? props.posts.map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden h-[600px] flex items-center justify-center">
                      <div className="animate-pulse bg-gray-200 w-full h-full" />
                    </div>
                  ))
                : props.posts.map((post, index) => <InstagramPost key={`post-${index}`} html={post || ""} />)}
            </div>
          </div>
        </div>

        <Script async src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
      </div>
    </section>
  );
}
