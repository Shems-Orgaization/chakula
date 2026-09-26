// components/reminder-popover.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell, X, Clock3, Volume2, VolumeX, Check, Loader2,
  Sunrise, Sun, Moon, Calendar, Settings2, ChevronRight, Trash2
} from "lucide-react";

interface ReminderSetting {
  id: string;
  meal_type: "morning" | "lunch" | "evening";
  enabled: boolean;
  reminder_time: string;
  days_of_week: number[];
  quiet_hours_start: string;
  quiet_hours_end: string;
}

interface ReminderHistoryItem {
  id: string;
  meal_type: string;
  title: string;
  message: string;
  fired_at: string;
  read: boolean;
}

interface ReminderPopoverProps {
  onClose: () => void;
  onOpenPlanner: () => void;
}

const MEAL_META = {
  morning: { label: "Morning", icon: Sunrise, defaultTime: "07:30" },
  lunch: { label: "Lunch", icon: Sun, defaultTime: "12:30" },
  evening: { label: "Evening", icon: Moon, defaultTime: "19:00" },
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function ReminderPopover({ onClose, onOpenPlanner }: ReminderPopoverProps) {
  const [settings, setSettings] = useState<ReminderSetting[]>([]);
  const [history, setHistory] = useState<ReminderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("reminder-sound") !== "off";
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reminders");
      const data = await res.json();
      setSettings(data.settings ?? []);
      setHistory(data.history ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("reminder-sound", next ? "on" : "off");
  };

  const updateSetting = async (
    meal_type: "morning" | "lunch" | "evening",
    updates: Partial<ReminderSetting>
  ) => {
    setSaving(meal_type);
    // Optimistic
    setSettings((prev) =>
      prev.map((s) => (s.meal_type === meal_type ? { ...s, ...updates } : s))
    );
    try {
      await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal_type, ...updates }),
      });
    } catch (err) {
      console.error(err);
      await loadData(); // Rollback
    } finally {
      setSaving(null);
    }
  };

  const toggleDay = (meal_type: "morning" | "lunch" | "evening", day: number) => {
    const setting = settings.find((s) => s.meal_type === meal_type);
    if (!setting) return;
    const days = setting.days_of_week || [];
    const next = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day].sort();
    if (next.length === 0) return; // Don't allow 0 days
    updateSetting(meal_type, { days_of_week: next });
  };

  const markAllRead = async () => {
    await fetch("/api/reminders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mark_all_read: true }),
    });
    setHistory((prev) => prev.map((h) => ({ ...h, read: true })));
  };

  const clearHistory = async () => {
    if (!confirm("Clear all reminder history?")) return;
    await fetch("/api/reminders", { method: "DELETE" });
    setHistory([]);
  };

  const unreadCount = history.filter((h) => !h.read).length;

  // Find next upcoming reminder
  const nextReminder = (() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const today = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon...7=Sun

    const upcoming: { time: string; label: string; minutesUntil: number }[] = [];

    for (const setting of settings) {
      if (!setting.enabled) continue;
      if (!setting.days_of_week?.includes(today)) continue;
      const [h, m] = setting.reminder_time.split(":").map(Number);
      const minutes = h * 60 + m;
      if (minutes > currentMinutes) {
        upcoming.push({
          time: setting.reminder_time,
          label: MEAL_META[setting.meal_type].label,
          minutesUntil: minutes - currentMinutes,
        });
      }
    }

    upcoming.sort((a, b) => a.minutesUntil - b.minutesUntil);
    return upcoming[0];
  })();

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full z-50 mt-2 w-[min(400px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-accent" />
          <h3 className="font-semibold">Reminders</h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSound}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
            title={soundEnabled ? "Sound on" : "Sound off"}
          >
            {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`rounded-lg p-1.5 transition hover:bg-secondary ${
              showSettings ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Settings"
            title="Reminder settings"
          >
            <Settings2 className="size-4" />
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-5 animate-spin text-accent" />
        </div>
      ) : showSettings ? (
        /* ============ SETTINGS VIEW ============ */
        <div className="max-h-[70vh] overflow-y-auto">
          {/* Next reminder */}
          {nextReminder && (
            <div className="border-b border-border bg-accent/5 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Next reminder
              </p>
              <p className="mt-1 text-sm font-semibold">
                {nextReminder.label} · {nextReminder.time}
                <span className="ml-2 font-normal text-muted-foreground">
                  (in {nextReminder.minutesUntil} min)
                </span>
              </p>
            </div>
          )}

          {/* Settings per meal */}
          <div className="divide-y divide-border">
            {(["morning", "lunch", "evening"] as const).map((meal) => {
              const setting = settings.find((s) => s.meal_type === meal);
              const meta = MEAL_META[meal];
              const Icon = meta.icon;
              if (!setting) return null;

              return (
                <div key={meal} className="p-4">
                  {/* Toggle row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-10 items-center justify-center rounded-xl ${
                          setting.enabled
                            ? "bg-accent/10 text-accent"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{meta.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {setting.enabled
                            ? `Daily at ${setting.reminder_time}`
                            : "Disabled"}
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={setting.enabled}
                        onChange={(e) =>
                          updateSetting(meal, { enabled: e.target.checked })
                        }
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-secondary transition peer-checked:bg-accent">
                        <div className="size-5 translate-y-0.5 translate-x-0.5 rounded-full bg-white shadow transition peer-checked:translate-x-[22px]" />
                      </div>
                    </label>
                  </div>

                  {/* Time + Days (only when enabled) */}
                  {setting.enabled && (
                    <div className="mt-3 space-y-3">
                      {/* Time */}
                      <div className="flex items-center gap-2">
                        <Clock3 className="size-3.5 text-muted-foreground" />
                        <input
                          type="time"
                          value={setting.reminder_time}
                          onChange={(e) =>
                            updateSetting(meal, { reminder_time: e.target.value })
                          }
                          className="rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:border-accent"
                        />
                        {saving === meal && (
                          <Loader2 className="size-3 animate-spin text-accent" />
                        )}
                      </div>

                      {/* Days */}
                      <div className="flex items-center gap-1.5">
                        {DAY_LABELS.map((day, idx) => {
                          const dayNum = idx + 1;
                          const active = setting.days_of_week?.includes(dayNum);
                          return (
                            <button
                              key={idx}
                              onClick={() => toggleDay(meal, dayNum)}
                              className={`flex size-7 items-center justify-center rounded-md text-xs font-semibold transition ${
                                active
                                  ? "bg-accent text-accent-foreground"
                                  : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Push notification CTA */}
          <div className="border-t border-border bg-secondary/30 p-4">
            <p className="text-xs text-muted-foreground">
              💡 In-app reminders only. We'll notify you here while you're using Chakula.
            </p>
          </div>
        </div>
      ) : (
        /* ============ NOTIFICATIONS VIEW ============ */
        <div className="max-h-[70vh] overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Bell className="size-10 text-muted-foreground/30" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="max-w-[240px] text-xs text-muted-foreground">
                We'll remind you to plan meals, cook, and shop.
              </p>
            </div>
          ) : (
            <>
              {/* Mark all / Clear */}
              <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4 py-2">
                <button
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className="text-xs font-semibold text-accent hover:underline disabled:opacity-40"
                >
                  Mark all read
                </button>
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="size-3" />
                  Clear
                </button>
              </div>

              {/* History list */}
              <div className="divide-y divide-border">
                {history.map((item) => {
                  const meta = MEAL_META[item.meal_type as keyof typeof MEAL_META];
                  const Icon = meta?.icon || Bell;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 transition ${
                        !item.read ? "bg-accent/5" : ""
                      }`}
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Icon className="size-4 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold">{item.title}</p>
                          {!item.read && (
                            <span className="mt-1 size-2 shrink-0 rounded-full bg-accent" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.message}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {timeAgo(item.fired_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* CTA to planner */}
          <button
            onClick={onOpenPlanner}
            className="flex w-full items-center justify-between border-t border-border bg-secondary/30 px-4 py-3 text-sm font-semibold transition hover:bg-secondary"
          >
            <span className="flex items-center gap-2">
              <Calendar className="size-4 text-accent" />
              Plan your meals
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}