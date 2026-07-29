import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OpeningLetter from "@/components/OpeningLetter";
import QuestionBlock from "@/components/QuestionBlock";
import JournalRotator from "@/components/JournalRotator";
import ServicesPreview from "@/components/ServicesPreview";
import ApproachPreview from "@/components/ApproachPreview";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import GridOverlay from "@/components/GridOverlay";
import ReadingProgress from "@/components/ReadingProgress";
import AmbientLight from "@/components/AmbientLight";
import PageNoise from "@/components/PageNoise";
import ScrollIndicator from "@/components/ScrollIndicator";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <GridOverlay />
        <ReadingProgress />
        <AmbientLight />
        <PageNoise />
        <ScrollIndicator />

        {/* 1. Hero — immediate emotional recognition */}
        <Hero />

        {/* 2. Recognition — "این سایت می‌فهمد من چه چیزی را تجربه می‌کنم" */}
        <Reveal>
          <OpeningLetter />
        </Reveal>
        <Reveal>
          <QuestionBlock
            question="اگر رفتار فرزندتان می‌توانست حرف بزند، چه چیزی می‌گفت؟"
            text="گاهی رفتار، مسئله اصلی نیست؛ نزدیک‌ترین راهی است که کودک برای نشان دادن تجربه‌ای پیدا کرده که هنوز نمی‌تواند آن را با کلمات بیان کند. فهمیدن این تجربه، اغلب نقطه‌ای است که مسیر گفت‌وگو و تغییر از آن آغاز می‌شود."
          />
        </Reveal>

        {/* 3. Journal preview — 3 rotating articles, full reading lives on /journal */}
        <Reveal>
          <JournalRotator />
        </Reveal>

        {/* 4. Services preview — 3 cards, full detail lives on /about */}
        <Reveal>
          <ServicesPreview />
        </Reveal>

        {/* 5. Why this approach — short teaser, full philosophy lives on /about */}
        <Reveal>
          <ApproachPreview />
        </Reveal>

        {/* 6. Contact CTA — one calm action */}
        <Reveal>
          <Contact />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
