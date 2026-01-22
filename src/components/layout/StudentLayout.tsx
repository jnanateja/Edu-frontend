import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Calendar, Bell, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_email");
    navigate("/");
  };

  const navigation = [
    { name: "Dashboard", href: "/student/dashboard", icon: Home },
    { name: "My Courses", href: "#", icon: BookOpen },
    { name: "Schedule", href: "#", icon: Calendar },
    { name: "Settings", href: "#", icon: Settings },
  ];

  const userEmail = localStorage.getItem("user_email") || "student@example.com";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/student/dashboard" className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">EduLearn</span>
              </Link>

              <div className="hidden md:ml-10 md:flex md:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? "text-green-600 bg-green-50"
                          : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-700 hover:text-green-600">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative group">
                <button className="flex items-center text-sm text-gray-700 hover:text-gray-900">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">S</span>
                  </div>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-50 border">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-medium text-gray-900">Student Account</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                  <Link
                    to="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>

              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-gray-700" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg ${
                      isActive
                        ? "text-green-600 bg-green-50"
                        : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} EduLearn. Empowering students through education.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentLayout;