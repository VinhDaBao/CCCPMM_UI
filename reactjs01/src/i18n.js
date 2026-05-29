import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      sidebar: {
        dashboard: "Dashboard",
        workspace: "Workspace",
        assets: "Asset Library",
        settings: "Settings",
        users: "Manage Users",
        logout: "Log out",
        menu: "MENU"
      },
      topbar: {
        search: "Search anything...",
        new_script: "New Script",
      }
    }
  },
  vi: {
    translation: {
      sidebar: {
        dashboard: "Bảng điều khiển",
        workspace: "Bàn làm việc",
        assets: "Kho Tài Nguyên",
        settings: "Cài đặt",
        users: "Quản lý Users",
        logout: "Đăng xuất",
        menu: "DANH MỤC"
      },
      topbar: {
        search: "Tìm kiếm...",
        new_script: "Tạo kịch bản",
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Ngôn ngữ mặc định là Tiếng Anh
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;