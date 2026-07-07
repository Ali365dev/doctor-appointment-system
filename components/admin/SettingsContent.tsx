"use client";

import { useState } from "react";

const tabs = [
  { id: "clinic", label: "Clinic Settings", icon: "business" },
  { id: "payment", label: "Payment Settings", icon: "payments" },
  { id: "notifications", label: "Notifications", icon: "notifications" },
  { id: "security", label: "Security", icon: "lock" },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const sessions = [
  { device: "MacBook Pro 16\"", os: "macOS 14.2", location: "Karachi, Pakistan", icon: "laptop_mac", current: true },
  { device: "iPhone 15 Pro", os: "iOS 17.2", location: "Karachi, Pakistan", icon: "smartphone", current: false },
];

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState("clinic");
  const [activedays, setActiveDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const [stripeConnected, setStripeConnected] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("jazzcash");
  const [notifications, setNotifications] = useState({
    confirmEmail: true, confirmSMS: true,
    reminderEmail: true, reminderSMS: false,
    surveyPush: true,
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function toggleDay(d: string) {
    setActiveDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  }

  return (
    <div className="px-gutter py-lg overflow-y-auto h-[calc(100vh-72px)]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-xl">
          <div>
            <h2 className="text-headline-lg font-bold text-on-surface">Settings</h2>
            <p className="text-on-surface-variant text-body-md">Manage clinic configuration, payments, and security preferences.</p>
          </div>
          <button
            onClick={handleSave}
            className={`px-md py-sm rounded-xl font-bold shadow-lg transition-all flex items-center gap-xs ${saved ? "bg-secondary text-on-secondary" : "bg-primary text-on-primary hover:brightness-110"}`}
          >
            <span className="material-symbols-outlined text-[20px]">{saved ? "check_circle" : "save"}</span>
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-xs bg-surface-container-low p-xs rounded-2xl mb-xl">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-xs px-sm py-sm rounded-xl text-label-md font-semibold transition-all ${activeTab === t.id ? "bg-surface shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-surface/50"}`}
            >
              <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab: Clinic Settings */}
        {activeTab === "clinic" && (
          <div className="space-y-lg">
            {/* Scheduling */}
            <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
              <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">schedule</span> Scheduling
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mb-md">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Default Slot Duration</label>
                  <select
                    defaultValue="5 minutes"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                  >
                    <option>5 minutes</option>
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                    <option>60 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Buffer Time Between Slots</label>
                  <select
                    defaultValue="5 minutes"
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface"
                  >
                    <option>None</option>
                    <option>5 minutes</option>
                    <option>10 minutes</option>
                    <option>15 minutes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-sm">Working Days & Hours</label>
                <div className="space-y-xs">
                  {days.map((d) => {
                    const active = activedays.includes(d);
                    return (
                      <div key={d} className={`flex items-center gap-md p-sm rounded-xl transition-colors ${active ? "bg-primary/5 border border-primary/20" : "border border-outline-variant/50"}`}>
                        <label className="flex items-center gap-sm cursor-pointer w-36 shrink-0">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => toggleDay(d)}
                            className="w-4 h-4 rounded border-outline accent-primary"
                          />
                          <span className={`text-label-md font-semibold ${active ? "text-primary" : "text-on-surface-variant"}`}>{d}</span>
                        </label>
                        {active ? (
                          <div className="flex items-center gap-xs flex-1">
                            <input type="time" defaultValue="08:00" className="bg-surface border border-outline-variant rounded-lg px-sm py-xs text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" />
                            <span className="text-on-surface-variant text-sm">to</span>
                            <input type="time" defaultValue="18:00" className="bg-surface border border-outline-variant rounded-lg px-sm py-xs text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none" />
                          </div>
                        ) : (
                          <span className="text-caption text-on-surface-variant italic">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Clinic Branding */}
            <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
              <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary">palette</span> Clinic Branding
              </h3>
              <div className="flex items-center gap-md">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-outline-variant flex items-center justify-center bg-surface-container-low cursor-pointer hover:border-primary transition-colors group">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary">upload_file</span>
                </div>
                <div>
                  <p className="font-semibold text-on-surface">Clinic Logo</p>
                  <p className="text-caption text-on-surface-variant mb-sm">PNG or SVG, 512×512px recommended</p>
                  <button className="text-sm text-primary border border-primary/30 px-sm py-xs rounded-lg hover:bg-primary/5 transition-colors">Upload Logo</button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab: Payment Settings */}
        {activeTab === "payment" && (
          <div className="space-y-lg">
            {/* Stripe */}
            <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
              <div className="flex items-center justify-between mb-md">
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 bg-[#635bff] rounded-xl flex items-center justify-center text-white text-label-md font-extrabold tracking-tight">S</div>
                  <div>
                    <h3 className="text-headline-md font-semibold">Stripe</h3>
                    <p className="text-caption text-on-surface-variant">International cards & online checkout</p>
                  </div>
                </div>
                <div className="flex items-center gap-sm">
                  {stripeConnected && (
                    <span className="flex items-center gap-xs text-sm text-secondary font-semibold">
                      <span className="w-2 h-2 bg-secondary rounded-full" /> Connected
                    </span>
                  )}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input checked={stripeConnected} onChange={() => setStripeConnected((v) => !v)} type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              </div>
              {stripeConnected && (
                <div className="bg-surface-container-low rounded-xl p-sm border border-outline-variant flex items-center justify-between">
                  <div>
                    <p className="text-caption font-semibold text-on-surface">Account: acct_1Pk9SjBNqtjPd...</p>
                    <p className="text-caption text-on-surface-variant">Last payout: $1,250 on Oct 28, 2024</p>
                  </div>
                  <button className="text-sm text-primary font-semibold hover:underline">Manage in Stripe</button>
                </div>
              )}
            </section>

            {/* Local Payments */}
            <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
              <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-tertiary">account_balance_wallet</span> Local Payment Method
              </h3>
              <div className="flex gap-sm mb-md">
                {[{ id: "jazzcash", label: "JazzCash", dot: "bg-[#f64c1c]" }, { id: "easypaisa", label: "Easypaisa", dot: "bg-[#1db04e]" }].map((m) => (
                  <label key={m.id} className={`flex-1 flex items-center gap-sm p-md border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === m.id ? "border-primary bg-primary/5" : "border-outline-variant hover:border-primary/30"}`}>
                    <input type="radio" name="payMethod" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="accent-primary" />
                    <span className={`w-3 h-3 rounded-full ${m.dot}`} />
                    <span className="font-semibold text-on-surface">{m.label}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-md">
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">Account Number</label>
                  <input type="text" defaultValue="+92 300 1234567" className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-on-surface" />
                </div>
                <div>
                  <label className="block text-label-md text-on-surface-variant mb-xs">QR Code Upload</label>
                  <div className="border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center gap-sm cursor-pointer hover:border-primary transition-colors group bg-surface-container-lowest">
                    <span className="material-symbols-outlined text-3xl text-outline group-hover:text-primary">qr_code_2</span>
                    <p className="text-sm text-on-surface-variant">Drop QR image here or <span className="text-primary font-semibold">browse</span></p>
                    <p className="text-caption text-outline">PNG or JPG, max 5 MB</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Tab: Notifications */}
        {activeTab === "notifications" && (
          <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
            <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">notifications_active</span> Notification Preferences
            </h3>
            <div className="space-y-lg">
              {[
                {
                  label: "Appointment Confirmations",
                  desc: "Sent immediately when an appointment is booked.",
                  icon: "event_available",
                  channels: [
                    { key: "confirmEmail", label: "Email" },
                    { key: "confirmSMS", label: "SMS" },
                  ],
                },
                {
                  label: "24-Hour Reminders",
                  desc: "Remind patient and doctor one day before.",
                  icon: "alarm",
                  channels: [
                    { key: "reminderEmail", label: "Email" },
                    { key: "reminderSMS", label: "SMS" },
                  ],
                },
                {
                  label: "Follow-up Surveys",
                  desc: "Post-appointment satisfaction surveys.",
                  icon: "rate_review",
                  channels: [
                    { key: "surveyPush", label: "Push Notification" },
                  ],
                },
              ].map((group) => (
                <div key={group.label} className="p-md bg-surface-container-lowest rounded-xl border border-outline-variant">
                  <div className="flex items-center gap-sm mb-md">
                    <span className="material-symbols-outlined text-primary">{group.icon}</span>
                    <div>
                      <p className="font-semibold text-on-surface">{group.label}</p>
                      <p className="text-caption text-on-surface-variant">{group.desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-md flex-wrap">
                    {group.channels.map((ch) => (
                      <label key={ch.key} className={`flex items-center gap-sm px-md py-sm border-2 rounded-xl cursor-pointer transition-all ${notifications[ch.key as keyof typeof notifications] ? "border-primary bg-primary/5 text-primary" : "border-outline-variant text-on-surface-variant"}`}>
                        <input
                          type="checkbox"
                          checked={notifications[ch.key as keyof typeof notifications]}
                          onChange={() => setNotifications((prev) => ({ ...prev, [ch.key]: !prev[ch.key as keyof typeof notifications] }))}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="font-semibold text-sm">{ch.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tab: Security */}
        {activeTab === "security" && (
          <div className="space-y-lg">
            {/* Password Change */}
            <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
              <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">key</span> Change Password
              </h3>
              <div className="space-y-md max-w-md">
                {[["Current Password","Enter current password"],["New Password","At least 12 characters"],["Confirm New Password","Repeat new password"]].map(([label, ph]) => (
                  <div key={label}>
                    <label className="block text-label-md text-on-surface-variant mb-xs">{label}</label>
                    <div className="relative">
                      <input type="password" placeholder={ph} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-sm pr-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                      <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-on-surface">visibility</span>
                    </div>
                  </div>
                ))}
                <button className="bg-primary text-on-primary px-md py-sm rounded-xl font-bold hover:brightness-110 transition-all shadow-sm">Update Password</button>
              </div>
            </section>

            {/* Active Sessions */}
            <section className="bg-surface border border-outline-variant rounded-2xl p-md shadow-sm">
              <h3 className="text-headline-md font-semibold mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary">devices</span> Active Sessions
              </h3>
              <div className="space-y-sm">
                {sessions.map((s) => (
                  <div key={s.device} className={`flex items-center gap-md p-md rounded-xl border transition-colors ${s.current ? "border-primary/30 bg-primary/5" : "border-outline-variant bg-surface-container-lowest"}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.current ? "bg-primary/10 text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                      <span className="material-symbols-outlined text-[28px]">{s.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-xs">
                        <p className="font-semibold text-on-surface">{s.device}</p>
                        {s.current && <span className="text-[10px] font-bold px-xs py-[1px] bg-primary/10 text-primary rounded-full uppercase tracking-wide">Current</span>}
                      </div>
                      <p className="text-caption text-on-surface-variant">{s.os} · {s.location}</p>
                    </div>
                    {!s.current && (
                      <button className="text-sm text-error font-semibold border border-error/30 px-sm py-xs rounded-lg hover:bg-error/5 transition-colors">Log Out</button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
