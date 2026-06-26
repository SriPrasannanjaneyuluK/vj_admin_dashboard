/** Static shell — logo, branding, and navigation. Not database content. */
export const STATIC_SITE = {
  name: "VJ AI Forge",
  tagline: "Code With Confidence",
  caption: "Professional technology education",
  email: "hello@vjaiforge.com",
  logo: "/logo.png",
  navLinks: [
    { label: "Courses", href: "#courses" },
    { label: "Learnings", href: "#learnings" },
    { label: "Contact", href: "#contact" },
  ],
} as const;
