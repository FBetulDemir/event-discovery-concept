import { ArrowDownRight, ArrowUpRight, MapPin } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { EventDiscovery } from '@/components/discovery/EventDiscovery';
import { MatchPromo } from '@/components/discovery/MatchPromo';

export default function HomePage() {
  return (
    <PageContainer className="discovery-page">
      <section className="discovery-intro" aria-labelledby="discovery-heading">
        <div>
          <p className="eyebrow"><MapPin size={14} aria-hidden="true" /> GÖTEBORG, VI SES UTE</p>
          <h1 id="discovery-heading">Bra kvällar.<br /><span>Ännu bättre minnen.</span></h1>
        </div>
        <div className="intro-aside">
          <p>Dansgolv, livescener och nya favoriter.<br />Hitta något som gör kvällen till din.</p>
          <a href="#event-list">Upptäck vad som händer <ArrowDownRight size={19} aria-hidden="true" /></a>
        </div>
      </section>
      <section className="discovery-hero" aria-labelledby="hero-heading">
        <img src="/images/hero.jpg" alt="Publikhav framför en stor scen med varma strålkastare" width={1400} height={700} fetchPriority="high" />
        <div className="hero-content">
          <span className="hero-kicker">UT UR VARDAGEN. IN I KVÄLLEN.</span>
          <h2 id="hero-heading">Staden är vaken.<br />Är du?</h2>
          <p>Från första låten till sista dansen.<br />Upptäck Göteborg, en kväll i taget.</p>
          <a className="button button--primary" href="#event-list">Hitta din kväll <ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
        <span className="hero-caption">GÖTEBORG AFTER HOURS <span aria-hidden="true">↗</span></span>
      </section>
      <EventDiscovery />
      <MatchPromo />
      <footer className="discovery-footer">
        <span className="footer-wordmark">VIP MONKEY®</span><p>Fler kvällar att minnas.</p>
      </footer>
    </PageContainer>
  );
}