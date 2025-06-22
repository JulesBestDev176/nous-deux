import { Button } from "@/components/ui/button";
import { LogOut, X } from "lucide-react";

const MobileMenu = ({ isOpen, onClose, menuItems, activeSection, setActiveSection, currentUser, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">💕</div>
            <div>
              <h2 className="font-bold text-gray-800">Nous Deux</h2>
              <p className="text-sm text-gray-600">{currentUser} 💕</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeSection === item.id 
                    ? "bg-pink-500 text-white" 
                    : "text-gray-700 hover:bg-pink-50"
                }`}
                onClick={() => {
                  setActiveSection(item.id);
                  onClose();
                }}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
          
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:bg-red-50"
              onClick={() => {
                onLogout();
                onClose();
              }}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;