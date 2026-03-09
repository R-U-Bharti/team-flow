import { BoardView } from "./features/board";

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* App Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-sm">
              <img src="/logo.jpg" alt="logo" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 tracking-tight leading-none">
                TeamFlow
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Workflow Board
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              By Kumar R U Bharti
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BoardView />
      </main>
    </div>
  );
}

export default App;
