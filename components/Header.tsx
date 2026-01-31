"use client";
import { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Header() {
  const container = useRef(null);

  useGSAP(() => {
    // 1. Entrance: Logo slides in, links stagger up
    const tl = gsap.timeline();
    tl.from(".logo", { x: -50, opacity: 0, duration: 0.8, ease: "power3.out" })
      .from(".nav-item", { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }, "-=0.4");

    // 2. Scroll Effect: Header darkens and shrinks
    const scrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top -10%",
        end: "top -20%",
        scrub: true,
      },
    });

    scrollTl.to(container.current, {
      backgroundColor: "#032221", // Dark Green
      height: "70px",
      borderBottom: "1px solid #00DF81", // Caribbean Green accent
    })
    .to(".logo", {
      color: "#00DF81", // Caribbean Green
    }, "<");
  }, { scope: container });

  return (
    <header 
      ref={container} 
      className="fixed top-0 w-full h-24 flex items-center justify-between px-12 z-50 text-anti-flash-white font-axiforma transition-all duration-300"
    >
      <Link href="/" className="logo text-2xl font-bold tracking-tighter text-black">
        LeafLine<span className="text-[#000000]">.</span>
      </Link>
      
      <nav className="flex gap-8 font-medium">
        {['About', 'Work', 'Experience', 'Contact'].map((item) => (
          <Link 
            key={item} 
            href={`${item.toLowerCase()}`} 
            className="nav-item hover:text-caribbean-green transition-colors duration-200"
          >
            {item}
          </Link>
        ))}
      </nav>
    </header>
  );
}