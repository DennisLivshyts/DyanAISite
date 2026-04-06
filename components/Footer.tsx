export default function Footer() {
  return (
    <footer className="border-t border-navy-700 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
        <span>
          <span className="text-white font-medium">Dyan</span>
          <span className="text-green-500 font-medium">AI</span>
          <span className="text-white font-medium"> Labs</span>
          {" "}— Business Integrations for a Modern Era
        </span>
        <div className="flex items-center gap-6">
          <a href="mailto:livshytsd@dyanailabs.com" className="hover:text-gray-400 transition-colors">
            livshytsd@dyanailabs.com
          </a>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
