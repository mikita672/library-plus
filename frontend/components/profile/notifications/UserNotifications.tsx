"use client";

import { useCallback, useEffect, useState } from "react";
import { Notification } from "@/types/user/Notification";
import { getNotifications, getNotificationsCount, markNotificationRead } from "@/lib/api/notifications";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [data, count] = await Promise.all([
      getNotifications(page),
      getNotificationsCount(),
    ]);
    setNotifications(data);
    setTotalPages(Math.max(1, count.pagesCount));
    setLoading(false);
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => void fetchData(), 0);
    return () => clearTimeout(t);
  }, [fetchData]);

  const handleClick = async (n: Notification) => {
    setActiveNotification(n);
    if (!n.isRead) {
      await markNotificationRead(n.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
      );
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold uppercase">Notifications</h1>

      {loading ? (
        <div className="text-center py-8 text-primary font-medium">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 text-primary font-medium">No notifications</div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className="flex items-center justify-between p-4 border border-primary rounded-none cursor-pointer hover:bg-secondary transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  <span className={`text-sm font-bold ${n.isRead ? "text-foreground font-medium" : "text-primary"}`}>
                    {n.subject}
                  </span>
                </div>
                <p className="text-xs text-foreground mt-1 truncate">
                  {n.text.length > 100 ? n.text.substring(0, 100) + "..." : n.text}
                </p>
              </div>
              <span className="text-xs text-primary shrink-0 ml-4 font-medium">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      <PaginationControls
        pageNumber={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <Dialog
        open={activeNotification !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) { setActiveNotification(null); }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{activeNotification?.subject}</DialogTitle>
            <DialogDescription className="text-base">
              {activeNotification?.text}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full flex items-center justify-between!">
            <div className={activeNotification?.createdAt ? "" : "invisible"}>
              Notification from:{" "}
              {activeNotification?.createdAt
                ? new Date(activeNotification.createdAt).toLocaleString()
                : ""}
            </div>
            <DialogClose asChild>
              <Button style={{ cursor: "pointer" }} type="button">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
