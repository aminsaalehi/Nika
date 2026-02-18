import dynamic from "next/dynamic";

const HeroParticles = dynamic(
  () => import("@/components/HeroParticles").then((mod) => mod.HeroParticles),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="relative w-full min-h-screen h-screen" style={{ minHeight: "100vh" }}>
      <HeroParticles />
    </main>
  );
}
