"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxImageProps {
  src: string;
  alt: string;
}

export default function ParallaxImage({ src, alt }: ParallaxImageProps) {
  const container = useRef(null);

  useGSAP(
    () => {
      gsap.from(container.current, {
        scrollTrigger: {
          trigger: container.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="w-full h-[60vh] relative overflow-hidden rounded-sm bg-pine"
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover opacity-80 hover:scale-105 transition-transform duration-700 ease-out"
      />
    </section>
  );
}