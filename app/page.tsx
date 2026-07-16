import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import QuoteBlock from "@/components/QuoteBlock";
import QuestionBlock from "@/components/QuestionBlock";
import Observation from "@/components/Observation";
import JournalPreview from "@/components/JournalPreview";
import Manifesto from "@/components/Manifesto";
import ReadingPause from "@/components/ReadingPause";
import Thinking from "@/components/Thinking";
import Lens from "@/components/Lens";
import Story from "@/components/Story";
import Approach from "@/components/Approach";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import GridOverlay from "@/components/GridOverlay";
import ReadingProgress from "@/components/ReadingProgress";
import AmbientLight from "@/components/AmbientLight";
import PageNoise from "@/components/PageNoise";
import ScrollIndicator from "@/components/ScrollIndicator";

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
        <Hero />
        <QuoteBlock quote="لازم نیست مطمئن باشید که مشکلی وجود دارد. اگر چیزی در رفتار، احساس یا رابطه با فرزندتان ذهن شما را مشغول کرده است، همان نگرانی می‌تواند نقطه مناسبی برای آغاز یک گفت‌وگو باشد." />
        <QuestionBlock
          question="اگر رفتار فرزندتان می‌توانست حرف بزند، چه چیزی می‌گفت؟"
          text="گاهی رفتار، مسئله اصلی نیست؛ نزدیک‌ترین راهی است که کودک برای نشان دادن تجربه‌ای پیدا کرده که هنوز نمی‌تواند آن را با کلمات بیان کند. فهمیدن این تجربه، اغلب نقطه‌ای است که مسیر گفت‌وگو و تغییر از آن آغاز می‌شود."
        />
        <Observation />
        <JournalPreview />
        <Manifesto />
        <ReadingPause text="شاید مهم‌ترین اتفاق درمان، زمانی رخ می‌دهد که برای اولین بار احساس می‌کنیم کسی واقعاً تجربه ما را دیده است." />
        <Thinking />
        <Lens />
        <Story />
        <Approach />
        <Services />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
