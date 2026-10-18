const steps = [
  { verb: 'Matcha', image: '/images/city/night-579.jpg', text: 'Berätta vad du är sugen på. Vi visar tre kvällar och säger varför de passar.' },
  { verb: 'Skicka', image: '/images/city/night-171.jpg', text: 'Samla gänget i en plan och skicka länken. Ingen behöver skapa ett konto.' },
  { verb: 'Rösta', image: '/images/city/night-195.jpg', text: 'Alla röstar, arrangören stänger. Blir det lika bestämmer du.' },
  { verb: 'Gå', image: '/images/city/night-220.jpg', text: 'Vi skickar dig till säljaren för biljetten. Resten är kvällen.' },
] as const;

/** One verb at a time. The verbs, read in order, are the heading and the sequence. */
export function HowItWorks() {
  return (
    <section className="how" aria-labelledby="how-title">
      <h2 id="how-title" className="sr-only">Så funkar Gänget: matcha, skicka, rösta, gå</h2>
      <ol>
        {steps.map(step => (
          <li key={step.verb} className="how__panel">
            <img className="how__photo" src={step.image} alt="" width={1600} height={1000} loading="lazy" />
            <div className="how__scrim" aria-hidden="true" />
            <p className="how__verb display" data-reveal>{step.verb}</p>
            <p className="how__text" data-reveal style={{ '--i': 1 } as React.CSSProperties}>{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
