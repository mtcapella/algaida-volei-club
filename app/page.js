import SectionClub from "./components/sectionClub";
import SectionInicio from "./components/sectionInicio";
import SectionUbicacion from "./components/sectionUbicacion";

export default function Home() {
  return (
    <>
      <SectionInicio />
      <SectionClub />
      <SectionUbicacion />
    </>
  );
}
