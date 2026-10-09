import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-[#eef2f9] dark:bg-[#060912]">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6 animate-float">🛸</div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          This page drifted away into space. Let's get you back.
        </p>
        <Link to="/dashboard" className="btn-primary inline-flex mt-6 px-6 py-3">
          🏠 Back to dashboard
        </Link>
      </div>
    </div>
  );
}
