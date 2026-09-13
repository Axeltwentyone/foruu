import { letter } from '../content'
import Paragraph from './Paragraph'

export default function LetterBody() {
  return (
    <section className="px-6 sm:px-10 py-20 sm:py-28 max-w-xl mx-auto">
      <p className="font-body text-xl sm:text-2xl text-ink-soft mb-10 sm:mb-14 text-right">
        {letter.date}
      </p>

      <h1 className="font-display text-4xl sm:text-5xl text-ink mb-10 sm:mb-14">
        {letter.salutation}
      </h1>

      <div className="space-y-8 sm:space-y-10">
        {letter.paragraphs.map((text, i) => (
          <Paragraph key={i}>{text}</Paragraph>
        ))}
      </div>

      <p className="font-body text-2xl sm:text-3xl text-ink mt-14 sm:mt-20 leading-relaxed">
        {letter.closing}
      </p>

      <p className="font-display text-3xl sm:text-4xl text-ink mt-8 sm:mt-10 text-right">
        {letter.signature}
      </p>

        <p className="font-display text-3xl sm:text-4xl text-ink mt-8 sm:mt-10 text-right">
        {letter.signature2}
      </p>
    </section>
  )
}
