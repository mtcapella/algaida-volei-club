import SectionClub from "./components/sectionClub";
import SectionInicio from "./components/sectionInicio";
import SectionSponsors from "./components/sectionSponsors";
import SectionUbicacion from "./components/sectionUbicacion";

export default function Home() {
  return (
    <>
      <SectionInicio />
      <SectionClub />
      <SectionUbicacion />
      <SectionSponsors />
    </>
  );
}
