import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';

export const metadata: Metadata = { title: 'Integritet' };

/**
 * What Gänget collects and why, in plain words. Also satisfies the Ticketmaster API terms, which
 * require telling visitors how data is collected, used, stored and disclosed.
 */
export default function PrivacyPage() {
  return (
    <PageContainer>
      <article className="page plan legal enter">
        <h1 className="head">Så hanterar vi din data</h1>
        <p className="lead muted measure">Kort och rakt. Vi samlar det som behövs för att gänget ska kunna bestämma, inget mer.</p>

        <section>
          <h2 className="lead">Vad vi sparar</h2>
          <ul>
            <li><strong>Gästsession:</strong> när du skapar eller går med i en plan får du ett anonymt konto på den här enheten, med ett slumpat id.</li>
            <li><strong>Namn:</strong> det namn du skriver när du går med. Det visas för de andra i planen.</li>
            <li><strong>Planer, röster och kommentarer</strong> du gör, och vilka event som lagts i en plan.</li>
            <li><strong>E-post och lösenord</strong> om du skapar ett konto. Lösenordet sparas krypterat (hashat) av vår inloggningstjänst, aldrig i klartext.</li>
            <li><strong>I din webbläsare:</strong> ditt senast använda namn och valt tema (mörkt eller ljust). Inget annat, inga reklam- eller spårningscookies.</li>
          </ul>
        </section>

        <section>
          <h2 className="lead">Vem ser vad</h2>
          <ul>
            <li>En plan, dess röster och dess kommentarer ser bara de som är med i planen. Den som har länken kan se planens namn, datum, vilka som är med och alternativen innan hen går med.</li>
            <li>Kommentarer på event är offentliga för inloggade besökare och kräver konto.</li>
            <li>Vi säljer inte data och visar ingen reklam.</li>
          </ul>
        </section>

        <section>
          <h2 className="lead">Event och biljetter</h2>
          <p>Evenemangen hämtas från säljarnas öppna listor, i dag Ticketmaster. Vi säljer inga biljetter: du skickas till säljaren, och köpet följer deras villkor och integritetspolicy. När ett event läggs i en plan sparar vi en liten kopia av dess uppgifter (namn, plats, tid, bild-länk, pris och biljettlänk) så att planen fungerar även om säljaren ändrar eller tar bort listan. Vi tar bort säljarens uppgifter om säljaren eller arrangören ber oss göra det.</p>
        </section>

        <section>
          <h2 className="lead">Var datan finns</h2>
          <p>Databasen och inloggningen drivs av Supabase i Stockholm (EU). Sidan körs på Vercel. Båda är våra underleverantörer och behandlar data enbart för vår räkning.</p>
        </section>

        <section>
          <h2 className="lead">Dina val</h2>
          <p>Du kan be om att få se, rätta eller radera din data, och du kan när som helst sluta använda tjänsten. Raderar vi ditt konto försvinner även dina röster och kommentarer. Kontaktuppgifter publiceras när tjänsten lanseras.</p>
        </section>

        <p className="small muted">Gänget är ett oberoende koncept under utveckling. Den här texten beskriver hur det fungerar i dag och uppdateras när det ändras.</p>
      </article>
    </PageContainer>
  );
}
