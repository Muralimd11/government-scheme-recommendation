import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { NotificationItem } from "../../types";
import { Sidebar } from "../../components/common/Sidebar";
import { useLanguage } from "../../context/LanguageContext";
import {
  Notifications as NotifIcon,
  Campaign as AnnounceIcon,
  CheckCircleOutlined as ReadIcon
} from "@mui/icons-material";

export const NotificationsPage: React.FC = () => {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifs();
    } catch (e) {
      // Ignore
    }
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row">
      <Sidebar type="FARMER" />

      <main className="flex-1 p-4 md:p-8 max-w-4xl">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6">
          <div className="flex items-center gap-2 mb-1">
            <NotifIcon className="text-[#003366]" />
            <h1 className="text-2xl font-bold text-[#003366]">
              {language === "ta" ? "அரசு அறிவிப்புகள் & எச்சரிக்கைகள்" : "Government Alerts & Advisories"}
            </h1>
          </div>
          <p className="text-xs text-neutral-600">
            Official department broadcasts, district-level input distribution schedules, and monsoon crop advisories.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center text-xs text-neutral-500">
            No active announcements at this time.
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n._id}
                className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-blue-50 text-[#003366] shrink-0 mt-0.5">
                    <AnnounceIcon fontSize="small" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-neutral-900 text-sm">
                        {language === "ta" && n.titleTamil ? n.titleTamil : n.title}
                      </h3>
                      {n.targetDistrict && (
                        <span className="text-[10px] bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                          {n.targetDistrict}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      {language === "ta" && n.messageTamil ? n.messageTamil : n.message}
                    </p>
                    <span className="text-[10px] text-neutral-400 mt-2 block">
                      Published: {new Date(n.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => markRead(n._id)}
                  className="text-neutral-400 hover:text-green-700 text-xs shrink-0 cursor-pointer"
                  title="Mark as read"
                >
                  <ReadIcon fontSize="small" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
