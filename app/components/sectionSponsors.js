"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./SectionSponsors.module.css";

export default function SectionSponsors() {
  // Array con datos de cada sponsor
  const sponsors = [
    {
      src: "/img/sponsor1.png",
      href: "https://sponsor1.com",
      alt: "Sponsor Uno",
    },
    {
      src: "/img/sponsor2.svg",
      href: "https://sponsor2.com",
      alt: "Sponsor Dos",
    },
    {
      src: "/img/sponsor3.png",
      href: "https://sponsor3.com",
      alt: "Sponsor Tres",
    },
    {
      src: "/img/sponsor4.svg",
      href: "https://sponsor4.com",
      alt: "Sponsor Cuatro",
    },
    {
      src: "/img/sponsor5.png",
      href: "https://sponsor5.com",
      alt: "Sponsor Cinco",
    },
    {
      src: "/img/sponsor6.svg",
      href: "https://sponsor6.com",
      alt: "Sponsor Seis",
    },
  ];

  return (
    <section id="sponsors" className={styles.sectionSponsors}>
      <h2 className={styles.title}>Patrocinadores</h2>
      <div className={styles.sponsorsGrid}>
        {sponsors.map(({ src, href, alt }, i) => (
          <Link
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.logoLink}
          >
            <Image
              src={src}
              alt={alt}
              width={160}
              height={80}
              className={styles.logo}
              unoptimized
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
