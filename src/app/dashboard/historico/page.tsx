import QuickSightDashboard from "@/components/quicksight/QuickSightDashboard";

const DashboardPage = () => {
  return (
      <div className="w-full overflow-x-hidden">
          <div className="px-4 sm:px-6 py-8 max-w-full mx-auto">
              <header className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">Monitoreo de Motores y Sistemas</p>
              </header>

              {/* Incrustar el dashboard de QuickSight */}
              <QuickSightDashboard />
          </div>
      </div>
  );
};

export default DashboardPage;