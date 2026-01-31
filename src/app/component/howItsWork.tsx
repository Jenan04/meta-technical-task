'use client';
import Link from 'next/link';

export default function LandingSections() {
  return (
    <main className="bg-[#EBE5DD] text-[#162B1E]">

      <section className="max-w-7xl mx-auto px-6 md:px-[80px] py-20">
        <h2 className="text-3xl md:text-4xl font-serif italic text-center mb-12">
          How Share Space Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: 'Enter as Guest',
              desc: 'Start exploring without creating an account.'
            },
            {
              title: 'Browse & Discover',
              desc: 'Move freely between shared spaces and content.'
            },
            {
              title: 'Join When Ready',
              desc: 'Create an account only when you want more control.'
            }
          ].map((item, i) => (
            <div
              key={i}
              className="bg-[#F6F2ED] rounded-3xl p-8 shadow-sm hover:shadow-md transition"
            >
              <div className="text-4xl font-bold mb-4 text-[#576238]">
                0{i + 1}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {item.title}
              </h3>
              <p className="text-[#3E4A42] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#F2EEE8] py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-[80px]">
          <h2 className="text-3xl md:text-4xl font-serif italic mb-12">
            What You Can Do
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              'Discover shared spaces',
              'Save what matters to you',
              'Switch roles seamlessly',
              'Enjoy a calm, focused experience'
            ].map((text, i) => (
              <div
                key={i}
                className="bg-[#EBE5DD] rounded-2xl p-6 border border-[#576238]/20"
              >
                <p className="font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-6 md:px-[80px]">
        <h2 className="text-3xl md:text-4xl font-serif italic text-center mb-12">
          Choose Your Experience
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl p-8 bg-[#F6F2ED] shadow-sm">
            <h3 className="text-2xl font-semibold mb-4">Guests</h3>
            <ul className="space-y-3 text-[#3E4A42]">
              <li>• Explore freely</li>
              <li>• No account needed</li>
              <li>• Instant access</li>
            </ul>
          </div>

          <div className="rounded-3xl p-8 bg-[#576238] text-white shadow-sm">
            <h3 className="text-2xl font-semibold mb-4">Members</h3>
            <ul className="space-y-3">
              <li>• Create & manage spaces</li>
              <li>• Save & personalize</li>
              <li>• Full control experience</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F2EEE8] text-center">
        <p className="max-w-3xl mx-auto text-2xl md:text-3xl font-serif italic text-[#3E4A42]">
          “A shared space should feel open — not gated.”
        </p>
      </section>

      <section className="py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-serif italic mb-6">
          Ready to explore?
        </h2>

        <Link href="/explore">
          <span className="inline-block px-10 py-4 rounded-full text-white font-medium
            bg-[linear-gradient(90deg,_#576238_0%,_#CFCAC0_100%)]
            hover:opacity-90 transition">
            Get Started
          </span>
        </Link>
      </section>

    </main>
  );
}
