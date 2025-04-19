"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./sectionSponsors.module.css";

export default function SectionSponsors() {
  // Array con datos de cada sponsor
  const sponsors = [
    {
      src: "/img/sponsors/agromart.jpg",
      href: "https://agromart.es/",
      alt: "Agromart",
    },
    {
      src: "/img/sponsors/algaida.jpg",
      href: "https://ajalgaida.net/",
      alt: "Ajuntament d'Algaida",
    },
    {
      src: "/img/sponsors/algalia.png",
      href: "https://algaliasport.net/",
      alt: "Algalia Sport",
    },
    {
      src: "/img/sponsors/caixa.jpg",
      href: "https://fundacionlacaixa.org/",
      alt: "Obra Social La Caixa",
    },
    {
      src: "/img/sponsors/dimoni.jpg",
      href: "https://www.instagram.com/restaurante_caldimoni",
      alt: "Restaurant Ca'l Dimoni",
    },
    {
      src: "/img/sponsors/lago.png",
      href: "https://lagosuministros.com/",
      alt: "Lago Suministros Medicos",
    },
    {
      src: "/img/sponsors/onfitness.png",
      href: "https://www.onfitnessalgaida.com/",
      alt: "Onfitness Algaida",
    },
    {
      src: "/img/sponsors/jpocovi.png",
      href: "https://www.juanpocovi.es/",
      alt: "Juan Pocovi Cárnicas",
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
