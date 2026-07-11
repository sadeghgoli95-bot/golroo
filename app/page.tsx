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
import PageReveal from "@/components/PageReveal";
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
        <PageReveal />
        <ReadingProgress />
        <AmbientLight />
        <PageNoise />
        <ScrollIndicator />
        <Hero />
        <QuoteBlock quote="هر تغییری از جایی آغاز می‌شود که انسان احساس کند تجربه‌اش واقعاً فهمیده شده است." />
        <QuestionBlock
          question="کودک شما دقیقاً از چه چیزی محافظت می‌کند؟"
          text="گاهی آنچه ما به عنوان مشکل می‌بینیم، آخرین راهی است که کودک برای حفظ تعادل روانی خود پیدا کرده است. شاید پیش از آنکه به دنبال تغییر باشیم، لازم باشد بفهمیم این رفتار از چه چیزی محافظت می‌کند."
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
