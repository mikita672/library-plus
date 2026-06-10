# Objective
Implement a Book Rating and Review system for the Library Plus application.

# Requirements

## 1. "Leave a Review" Feature (My Rentals)
- In the user's rentals view, for any rental that has the status **"Returned"**, display an action button labeled "Leave review".
- Clicking this button should open a modal/popup.
- Inside the popup, the user must be able to:
  - Select a star rating from 1 to 5.
  - Enter optional review text.
  - Cancel or Confirm the submission.

## 2. Display Reviews on the Book Page
- On the individual book page, display the reviews underneath the description (in the "Additional information" section).
- Implement pagination displaying exactly **3 reviews per page**.
- For each review, display:
  - The reviewer's username. If the username is null, display their email address without the domain part (i.e., strip everything from the `@` symbol onwards; `user@example.com` becomes `user`).
  - The reviewer's profile picture. If the profile picture is unavailable, use a letter placeholder, maintaining the exact same logic and UI used everywhere else in the application.
  - The star rating and the review text.

## 3. Catalog Display
- In the catalog view (where book cards are listed), display the book's overall rating.
- Show the visual star rating alongside small text indicating the number of reviews.
- If a book has no reviews, explicitly display: `0 stars 0 reviews`.

## 4. Technical Constraints & Code Style
- **DO NOT** leave any comments in the code.
- You must use `shadcn mcp`.
- Strictly adhere to the coding style and conventions of the previously created components in the project. Maintain consistent imports, typings, component structures, and styling paradigms.
