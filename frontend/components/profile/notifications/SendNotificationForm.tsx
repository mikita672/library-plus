"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import {
  sendNotificationToUser,
  sendNotificationToAll,
  suggestUsers,
  UserSuggestion,
} from "@/lib/api/notifications";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export default function SendNotificationForm() {
  const [sendToAll, setSendToAll] = useState(false);
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedEmail = useDebounce(email, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sendToAll && debouncedEmail.length >= 2) {
      void suggestUsers(debouncedEmail).then((data) => {
        setSuggestions(data);
        setShowSuggestions(true);
      });
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedEmail, sendToAll]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSend = useCallback(async () => {
    if (!body.trim()) {
      toast.error("Message body is required");
      return;
    }
    if (!sendToAll && !email.trim()) {
      toast.error("Please enter a user email");
      return;
    }

    setSending(true);
    let ok: boolean;
    if (sendToAll) {
      ok = await sendNotificationToAll(body);
    } else {
      ok = await sendNotificationToUser(email, body);
    }

    if (ok) {
      toast.success(sendToAll ? "Notification sent to all users" : "Notification sent");
      setBody("");
      if (!sendToAll) setEmail("");
    } else {
      toast.error("Failed to send notification");
    }
    setSending(false);
  }, [sendToAll, email, body]);

  const selectSuggestion = (s: UserSuggestion) => {
    setEmail(s.email);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold uppercase">Send Notification</h2>

      <div className="flex items-center gap-3">
        <Switch
          id="send-to-all"
          checked={sendToAll}
          onCheckedChange={setSendToAll}
        />
        <Label htmlFor="send-to-all" className="cursor-pointer">
          Send to everyone
        </Label>
      </div>

      {!sendToAll && (
        <div className="space-y-2 relative" ref={wrapperRef}>
          <Label htmlFor="recipient-email">Recipient email</Label>
          <Input
            id="recipient-email"
            placeholder="Enter user email..."
            className="rounded-none"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
          />
          {showSuggestions && debouncedEmail.length >= 2 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
              {suggestions.length > 0 ? (
                suggestions.map((s) => (
                  <button
                    key={s.email}
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-accent transition-colors text-sm cursor-pointer"
                    onClick={() => selectSuggestion(s)}
                  >
                    <span className="font-medium">
                      {s.name ? `${s.name} (${s.email})` : s.email}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                  User not found.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notif-body">Message</Label>
        <Textarea
          id="notif-body"
          className="w-full min-h-[120px] rounded-none resize-y"
          placeholder="Enter your message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={sending}
        style={{ cursor: "pointer" }}
      >
        {sending ? "Sending..." : "Send"}
      </Button>
    </div>
  );
}