import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { NotificationItem } from "../../types";
import { Sidebar } from "../../components/common/Sidebar";
import {
  Campaign as AnnounceIcon,
  Send as SendIcon,
  NotificationsActive as AlertIcon
} from "@mui/icons-material";

const TN_DISTRICTS = [
  "All Districts", "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
];

export const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [titleTamil, setTitleTamil] = useState("");
  const [message, setMessage] = useState("");
  const [messageTamil, setMessageTamil] = useState("");
  const [targetDistrict, setTargetDistrict] = useState("All Districts");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.data.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSending(true);
      setSuccess(null);
      await api.createNotification({
        title,
        titleTamil: titleTamil || title,
        message,
        messageTamil: messageTamil || message,
        targetDistrict: targetDistrict === "All Districts" ? undefined : targetDistrict,
        category: "ANNOUNCEMENT"
      });
      setSuccess("Official advisory broadcasted successfully to farmers.");
      setTitle("");
      setTitleTamil("");
      setMessage("");
      setMessageTamil("");
      fetchNotifs();
    } catch (err: any) {
      alert(err.message || "Failed to broadcast announcement.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full bg-[#F5F5F5] min-h-screen flex flex-col md:flex-row">
      <Sidebar type="ADMIN" />

      <main className="flex-1 p-4 md:p-8 max-w-6xl">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-6">
          <div className="flex items-center gap-2 mb-1">
            <AnnounceIcon className="text-[#003366]" />
            <h1 className="text-2xl font-bold text-[#003366]">
              Government Broadcast & Farmer Advisories
            </h1>
          </div>
          <p className="text-xs text-neutral-600">
            Publish district-targeted crop alerts, subsidy enrollment deadlines, and seasonal weather advisories.
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded text-xs mb-6">
            {success}
          </div>
        )}

        {/* Create Broadcast */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-xs mb-8">
          <h2 className="text-sm font-bold text-[#003366] uppercase tracking-wider mb-4 border-b border-neutral-200 pb-2">
            Publish New Department Advisory
          </h2>

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Advisory Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cauvery Delta Paddy Procurement Schedule"
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Advisory Title (Tamil)
                </label>
                <input
                  type="text"
                  value={titleTamil}
                  onChange={(e) => setTitleTamil(e.target.value)}
                  placeholder="e.g. காவிரி டெல்டா நெல் கொள்முதல் கால அட்டவணை"
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-700 mb-1">
                  Target District *
                </label>
                <select
                  value={targetDistrict}
                  onChange={(e) => setTargetDistrict(e.target.value)}
                  className="w-full border border-neutral-300 rounded px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#003366]"
                >
                  {TN_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Message Content (English) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Details of inputs, opening dates of direct purchase centres, or subsidy requirements..."
                  className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Message Content (Tamil)
                </label>
                <textarea
                  rows={3}
                  value={messageTamil}
                  onChange={(e) => setMessageTamil(e.target.value)}
                  placeholder="விவரங்கள் மற்றும் வழிகாட்டுதல்கள்..."
                  className="w-full border border-neutral-300 rounded p-2 text-xs focus:outline-none focus:border-[#003366]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="bg-[#003366] hover:bg-blue-900 text-white font-bold px-6 py-2 rounded text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <SendIcon fontSize="small" />
              <span>{sending ? "Broadcasting..." : "Broadcast to Registered Farmers"}</span>
            </button>
          </form>
        </div>

        {/* Existing Announcements */}
        <div className="bg-white rounded-lg border border-neutral-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 font-bold text-sm text-[#003366]">
            Past Broadcasts ({notifications.length})
          </div>

          <div className="divide-y divide-neutral-200 text-xs">
            {notifications.map((n) => (
              <div key={n._id} className="p-4 hover:bg-neutral-50">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-neutral-900">{n.title}</h3>
                    {n.titleTamil && <p className="text-neutral-500">{n.titleTamil}</p>}
                  </div>
                  <span className="text-[11px] bg-blue-50 text-[#003366] px-2 py-0.5 rounded font-semibold border border-blue-200">
                    {n.targetDistrict || "All Districts"}
                  </span>
                </div>
                <p className="text-neutral-700 mt-2 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-neutral-400 mt-2 block">
                  Broadcasted: {new Date(n.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
