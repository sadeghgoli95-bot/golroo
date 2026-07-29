import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OpeningLetter from "@/components/OpeningLetter";
import QuoteBlock from "@/components/QuoteBlock";
import QuestionBlock from "@/components/QuestionBlock";
import Observation from "@/components/Observation";
import JournalRotator from "@/components/JournalRotator";
import Manifesto from "@/components/Manifesto";
import ReadingPause from "@/components/ReadingPause";
import Thinking from "@/components/Thinking";
import Story from "@/components/Story";
import Services from "@/components/Services";
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
          <QuoteBlock quote="لازم نیست مطمئن باشید که مشکلی وجود دارد. اگر چیزی در رفتار، احساس یا رابطه با فرزندتان ذهن شما را مشغول کرده است، همان نگرانی می‌تواند نقطه مناسبی برای آغاز یک گفت‌وگو باشد." />
        </Reveal>
        <Reveal>
          <QuestionBlock
            question="اگر رفتار فرزندتان می‌توانست حرف بزند، چه چیزی می‌گفت؟"
            text="گاهی رفتار، مسئله اصلی نیست؛ نزدیک‌ترین راهی است که کودک برای نشان دادن تجربه‌ای پیدا کرده که هنوز نمی‌تواند آن را با کلمات بیان کند. فهمیدن این تجربه، اغلب نقطه‌ای است که مسیر گفت‌وگو و تغییر از آن آغاز می‌شود."
          />
        </Reveal>

        {/* 3. A new way of seeing — before any solution, a different lens */}
        <Reveal>
          <Story />
        </Reveal>
        <Reveal>
          <Observation />
        </Reveal>

        {/* Breathing pause before the trust cluster */}
        <ReadingPause text="شخصیت کودک، فقط با آنچه برایش اتفاق می‌افتد شکل نمی‌گیرد؛ با تجربهٔ فهمیده شدن و فهمیده نشدن نیز شکل می‌گیرد." />

        {/* 4. Trust — earned through writing, thinking, philosophy; not claims */}
        <Reveal>
          <JournalRotator />
        </Reveal>
        <Reveal>
          <Thinking />
        </Reveal>
        <Reveal>
          <Manifesto />
        </Reveal>

        {/* 5. Professional approach — only introduced after trust */}
        <Reveal>
          <Services />
        </Reveal>

        {/* 6. Low-pressure contact */}
        <Reveal>
          <Contact />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
