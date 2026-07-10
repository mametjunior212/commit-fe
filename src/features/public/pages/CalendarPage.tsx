import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const CalendarPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-20">
        <section className="container-wide mx-auto px-4 sm:px-6">
          <div className="rounded-[2rem] border border-foreground/10 bg-card p-8">
            <h1 className="text-4xl font-syne font-bold tracking-tight">Calendar</h1>
            <p className="mt-4 text-lg text-foreground/70">Halaman calendar dipindah ke struktur fitur publik.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CalendarPage;
