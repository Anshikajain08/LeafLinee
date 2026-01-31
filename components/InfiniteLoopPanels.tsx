"use client";
import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const StackedSections = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const panels = gsap.utils.toArray(".panel");
      
      panels.forEach((panel: any, i) => {
        ScrollTrigger.create({
          trigger: panel,
          start: "top top",
          pin: i !== panels.length - 1,
          pinSpacing: false, // This allows the next panel to overlap
          snap: 1 / (panels.length - 1), // Optional: snaps to the panel
        });

        if (i < panels.length - 1) {
          gsap.to(panel.querySelector(".panel-content"), {
            y: -50,
            opacity: 0,
            scale: 0.9,
            ease: "none",
            scrollTrigger: {
              trigger: panel,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });
    }, containerRef);

    return () => context.revert();
  }, []);

  const sections = [
    { title: "The Foundation", color: "bg-rich-black", text: "text-anti-flash", border: "border-bangladesh-green" },
    { title: "The Growth", color: "bg-dark-green", text: "text-mountain-meadow", border: "border-caribbean-green" },
    { title: "The Peak", color: "bg-bangladesh-green", text: "text-caribbean-green", border: "border-anti-flash" },
  ];

  return (
    <main ref={containerRef} className="bg-rich-black">
      {sections.map((section, index) => (
        <section
          key={index}
          className={`panel h-screen w-full flex items-center justify-center border-b ${section.color} ${section.border}`}
          style={{ zIndex: index, position: "relative" }}
        >
          <div className="panel-content text-center px-10">
            <h1 className={`text-6xl md:text-8xl font-bold mb-4 ${section.text}`}>
              {section.title}
            </h1>
            <div className={`h-1 w-24 mx-auto bg-caribbean-green`} />
            <p className="mt-8 text-anti-flash/70 max-w-md mx-auto">
              Custom component for your portfolio using the Axiforma style.
            </p>
          </div>
        </section>
      ))}
    </main>
  );
};

export default StackedSections;