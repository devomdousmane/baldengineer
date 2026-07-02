"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power2.out" });
  ScrollTrigger.defaults({ markers: false });
}

export { gsap, ScrollTrigger };
