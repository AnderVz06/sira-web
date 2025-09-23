import Sidebar from "@/components/layout/sidebar/Sidebar";
import { Outlet } from "react-router";

const App = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-screen w-full overflow-hidden pl-[5px]">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
