import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#162B1E] text-[#EBE5DD]">
      <div className="max-w-7xl mx-auto px-6 md:px-[80px] py-16">

        <div className="grid md:grid-cols-3 gap-12">

          <div>
            <h3 className="text-2xl font-serif italic mb-4">
              Share Space
            </h3>
            <p className="text-[#CFCAC0] leading-relaxed max-w-sm">
              A calm place to explore, share, and grow —  
              without pressure, without gates.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#EBE5DD]">
              Explore
            </h4>
            <ul className="space-y-3 text-[#CFCAC0]">
              <li>
                <Link href="/explore" className="hover:text-white transition">
                  Spaces
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition">
                  How it works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">
              Get Started
            </h4>
            <p className="text-[#CFCAC0] mb-6">
              Join when you’re ready —  
              exploring is always free.
            </p>

            <Link href="/signup">
              <span
                className="
                  inline-block px-8 py-3 rounded-full font-medium 
                  bg-[linear-gradient(90deg,_#CFCAC0_0%,_#576238_100%)]
                  hover:opacity-90 transition
                "
              >
                Get Started
              </span>
            </Link>
          </div>
        </div>

        <div className="border-t border-[#576238]/40 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-sm text-[#CFCAC0]">
            © {new Date().getFullYear()} Share Space. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm text-[#CFCAC0]">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
