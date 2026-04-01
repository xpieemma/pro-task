const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen" role="status" aria-label="Loading">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
  </div>
);

export default LoadingSpinner;
