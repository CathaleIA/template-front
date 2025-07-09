import QuickSightDashboard from "@/components/quicksight/QuickSightDashboard";

const DashboardPage = () => {

  return (
    <div className="w-full overflow-x-hidden">
      <div className="px-4 sm:px-6 py-8 max-w-full mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
            Monitoreo de Motores y Sistemas
          </p>
        </header>

        <div className="bg-gray-100 text-gray-800 p-4 rounded-md text-sm mb-8">
          <p><strong>App Origin:</strong> {process.env.AMPLIFY_APP_ORIGIN}</p>
          <p><strong>AWS Account:</strong> {process.env.AWS_ACCOUNT_ID}</p>
          <p><strong>Región:</strong> {process.env.REGION}</p>
          <p><strong>KEY ID:</strong> {process.env.NEXT_PUBLIC_ACCESS_KEY_ID}</p>
          <p><strong>SECRET ACCESS</strong> {process.env.NEXT_PUBLIC_SECRET_ACCESS_KEY}</p>
        </div>

        {/* Incrustar el dashboard de QuickSight */}
        <QuickSightDashboard />
      </div>
    </div>
  );
};


export default DashboardPage;