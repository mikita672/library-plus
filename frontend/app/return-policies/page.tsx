"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReturnPoliciesPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto bg-card p-8 rounded-lg shadow-sm border">
        <h1 className="text-3xl font-bold mb-6">Library Plus Return Policies</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. General Rental Terms</h2>
            <p className="mb-2">
              All books rented from Library Plus are subject to our standard rental periods. 
              Users must select a rental duration between 14 and 30 days during checkout.
            </p>
            <p>
              By checking out a book, you agree to return the item on or before the due date in the same condition it was received.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Overdue Fines</h2>
            <p className="mb-2">
              Items returned after the due date will incur a fine of <span className="font-medium text-foreground">$1.00 per day</span>.
            </p>
            <p>
              Overdue fines are calculated automatically and will appear on your account. You will not be able to rent additional books if your account has an outstanding balance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Book Condition and Damages</h2>
            <p className="mb-2">
              When returning a book, our staff will inspect its condition.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-medium text-foreground">Good Condition:</span> No fines applied. The book has normal wear and tear but no new significant damage.
              </li>
              <li>
                <span className="font-medium text-foreground">Minor Damages:</span> Includes torn pages, slight liquid damage, or heavy creasing. A fine equal to <span className="font-medium text-foreground">one-third (1/3) of the book's repurchase price</span> will be charged.
              </li>
              <li>
                <span className="font-medium text-foreground">Major Damages or Lost:</span> If the book is unreadable or lost, you will be charged the <span className="font-medium text-foreground">full repurchase price</span> of the book.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Renewals</h2>
            <p>
              If you need more time with a book, please contact our support team or visit your local branch before the due date. Renewals are subject to availability and cannot be processed if another user has requested the item.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
