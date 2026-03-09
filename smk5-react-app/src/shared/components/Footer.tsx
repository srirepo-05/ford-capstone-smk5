// currentYear is computed once at module load time — always shows the correct year
const currentYear = new Date().getFullYear();

const Footer = () => (
  <footer className="bg-slate-800 text-white mt-auto">
    <div className="mx-auto max-w-7xl px-4 py-6 text-center">
      <p className="text-sm text-slate-400">
        &copy; {currentYear} SRIStore. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
