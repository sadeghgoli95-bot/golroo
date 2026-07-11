import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JournalGrid from "@/components/Journal/JournalGrid";

export default function Journal() {
  return (
    <>
      <Navbar />
      <main>
        <section className="editorial-space">
          <div className="container">
            <p className="overline">THERAPEUTIC JOURNAL</p>
            <h1 className="display">مشاهده‌هایی از اتاق درمان</h1>
            <p className="lead">
              این نوشته‌ها آموزش نیستند؛
              دعوتی هستند برای مکث و مشاهده.
            </p>
          </div>
        </section>
        <section>
          <div className="container">
            <JournalGrid />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
