"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getBookById, getBookUnitById } from "@/lib/api/books";
import { getUserById } from "@/lib/api/users";

export function ClientNameCell({ userId }: { userId: string }) {
  const [name, setName] = useState<string>("Loading...");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let active = true;
    getUserById(userId)
      .then((user) => {
        if (!active) return;
        if (user) {
          setName(user.name ?? "Unknown");
          setEmail(user.email ?? "");
        } else {
          setName("Unknown User");
        }
      })
      .catch(() => {
        if (active) setName("Error");
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <div>
      <div className="font-medium text-sm">{name}</div>
      {email && <div className="text-xs text-muted-foreground">{email}</div>}
    </div>
  );
}

export function BookTitleCell({ bookUnitId }: { bookUnitId: string }) {
  const [title, setTitle] = useState<string>("Loading...");

  useEffect(() => {
    let active = true;

    async function fetchBook() {
      try {
        const unit = await getBookUnitById(bookUnitId);
        if (!unit) {
          if (active) setTitle("Unknown Book");
          return;
        }
        const book = await getBookById(unit.bookId);
        if (!active) return;
        if (book) {
          setTitle(book.title);
        } else {
          setTitle("Unknown Book");
        }
      } catch {
        if (active) setTitle("Error");
      }
    }

    void fetchBook();

    return () => {
      active = false;
    };
  }, [bookUnitId]);

  if (title === "Loading..." || title === "Unknown Book" || title === "Error") {
    return <span className="text-muted-foreground text-sm">{title}</span>;
  }

  return (
    <Link
      href={`/profile/dashboard/book-catalog?search=${encodeURIComponent(title)}`}
      className="text-primary text-sm underline underline-offset-2 hover:text-primary/80"
    >
      {title}
    </Link>
  );
}
