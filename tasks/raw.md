# Product Reviews & Ratings System: Implementation Spec

I want you to implement a complete, professional system for user reviews and product ratings.

Before starting the implementation, first thoroughly review the current project structure, the frontend and backend architecture, the database models, the authentication system, the roles, the APIs, and the existing components, then implement the new feature in line with the project's current architecture. Avoid creating parallel or unnecessary structures.

---

## 1. Submitting a review as a user

Create a section titled **"User Reviews"** on each product's detail page.
Only users who are logged in to their account should be able to submit a review.
Each review must include the following:

- User name
- Review text
- The user's rating of the product
- Rating displayed as stars
- Date the review was submitted
- Like count
- Dislike count
- Like button
- Dislike button

The product rating must be recorded and displayed using a 5-star system.
When submitting a review, the user must be able to rate the product from 1 to 5 stars.
If the user is not logged in, show an appropriate login/sign-up message instead of the review form.

---

## 2. Comment reply system

The reply system must be strictly one-way.
The conversation flow should be:

```
User → Comment → Admin Reply
```

That means:

- A user submits a comment.
- Only an Admin can reply to it.
- After the Admin replies, the user must not be able to respond to the Admin's reply.
- Users must also not be able to reply to other users' comments.
- No multi-level Thread or Reply system should be created.

The Admin's reply must be displayed beneath the corresponding user's comment, and it must be visually obvious that the reply was posted by an Admin, for example with a Badge or Label such as:
**"Admin Reply"**

---

## 3. Like / Dislike

Users and Admins must be able to Like or Dislike each comment.
Next to each comment, display:

- Like icon
- Like count
- Dislike icon
- Dislike count

The Like / Dislike behavior must be logical:

- Each user may have only one active Vote per comment.
- A user must not be able to Like and Dislike the same comment simultaneously.
- If a user has already Liked and clicks Like again, their Vote is removed.
- If a user has Liked and clicks Dislike, the Vote changes from Like to Dislike.
- The same logic applies to Dislike.
- The user's current Vote status must be clearly indicated in the UI.

This feature must also be enabled for Admins.
If possible, implement the Vote logic as a separate model/table in the database to prevent a user from voting multiple times.

---

## 4. Comment management in the Admin panel

Create a new section titled **"Comment Management"** in the Admin Dashboard.
This section must be accessible only to users with the Admin-related Role.
At the top of the Comment Management page, place three Tabs:

1. All Messages
2. Unanswered
3. Answered

The Tabs must filter based on the actual status of the Comments.

---

## 5. Admin capabilities

Admin must be able to perform the following actions on each comment:

### View

View:

- User name
- Comment text
- Related product
- Submitted rating
- Date
- Like count
- Dislike count
- Reply status

### Reply

Admin must be able to reply directly to a user's comment.
The reply must be linked to that same Comment and displayed beneath the user's comment on the product page.
After the reply is submitted, the Comment's status must change to:
**"Answered"**

### Edit

Admin must be able to edit the text of a user's comment.
If necessary, indicate that the comment was edited by an Admin.

### Delete

Admin must be able to delete a comment.
Before deletion, show an appropriate Confirmation Dialog.
Deletion must be handled correctly in the Backend, and the relationships tied to the Comment, Reply, and Votes must also be managed.

---

## 6. Comment status

Define a specific status for each Comment.
At minimum, the statuses are:

- `UNANSWERED`
- `ANSWERED`

This status must be managed in the Backend and Database and not merely computed from the UI.

---

## 7. Database Design

Design the database models according to the project's current structure.
The minimum required entities:

### Comment

Including items such as:

- id
- userId
- productId
- content
- rating
- status
- createdAt
- updatedAt

### Reply

Including items such as:

- id
- commentId
- adminId
- content
- createdAt
- updatedAt

### CommentVote

For managing Like / Dislike:

- id
- commentId
- userId
- type
- createdAt
- updatedAt

The Vote type can be:

- `LIKE`
- `DISLIKE`

To prevent duplicate votes, place a Unique Constraint on the combination:
`commentId + userId`

Before creating new models, be sure to review the existing User, Product, and Role models in the project and, where they exist, use those.

---

## 8. Backend / API

Implement all necessary operations in the Backend.
The minimum required operations:

- Create Comment
- Get a Product's Comments
- Get Comments for the Admin Dashboard
- Filter Comments by status
- Create Reply by Admin
- Edit Comment by Admin
- Delete Comment by Admin
- Like a Comment
- Dislike a Comment
- Remove a Vote
- Change a Vote from Like to Dislike and vice versa

All Endpoints / Resolvers must use the project's existing Authentication and Authorization system.
A regular user must not be able to:

- Create a Reply
- Edit other users' Comments
- Delete a Comment
- Access Admin APIs

And Admin must be able to perform the defined management operations.

---

## 9. Product Frontend

On the Product Detail page, create a professional UI consistent with the site's current design.
Suggested structure:

**User Reviews**

- Product average rating
- Number of reviews
- Rating summary displayed with stars
- Review form for logged-in users
- List of comments
- Admin reply beneath the corresponding Comment

For each Comment, display something similar to the following structure:

```
User name
★★★★★
Comment text...
👍 12   👎 2
Admin Reply:
Admin reply text...
```

The UI must be fully Responsive and display correctly on mobile as well.

---

## 10. Admin Dashboard UI

The Comment Management page must be consistent with the Design System and components of the current Admin Dashboard.
At the top of the page:

```
All Messages | Unanswered | Answered
```

And for each Comment, include appropriate management actions such as:

- View
- Reply
- Edit
- Delete

For sensitive operations such as Delete, use a Confirmation Dialog.

---

## 11. Authorization and Security

Security in this section is very important.
Be sure to verify:

- Only authenticated users can submit Comments.
- `userId` must be taken from the Token/Session and must not be forgeable from the Client.
- A user must not be able to submit a Comment on behalf of another user.
- Only Admin can submit a Reply.
- Only Admin can Edit/Delete Comments.
- Votes must be recorded against the real user.
- All Authorization checks must also be enforced in the Backend, not relying solely on Frontend protection.

---

## 12. UX

Use appropriate Loading States for async operations.
For success or error, use the project's existing Notification system.
After submitting a Comment:

- The form should be cleared.
- The new Comment should be displayed.
- The UI state should update without requiring a full page Refresh.

After a Like / Dislike, the vote count and icon state should also update without a full page Refresh.
Also create an appropriate UI for the Empty State.
For example:

> No reviews have been submitted for this product yet. Be the first to share your review.

---

## 13. Important implementation notes

Before changing any code:

1. Review the project structure.
2. Review the current Authentication system.
3. Review the existing Roles and Permissions.
4. Review the User and Product models.
5. Review the current GraphQL/API structure.
6. Review the existing pattern for the Admin Dashboard.
7. Find reusable UI components.

Then develop the Comment feature using the existing architecture.
Avoid adding new dependencies without real need.
Avoid hardcoding user, Admin, or Product information.
Avoid duplicating existing project logic.

---

## 14. Expected output

This feature must be implemented completely, end-to-end:

```
Database → Backend → Authentication / Authorization → API / GraphQL → Product Detail UI → Admin Dashboard
```

At the end:

- Specify the changed files.
- Create the necessary Migrations.
- Create or update the Types / Inputs / DTOs / Resolvers / Services in the appropriate project structure.
- Add all necessary Error Handling.
- Do not create unused code.
- If the project's tests or Build can be run, run them at the end and fix any errors that arise.

> **Important:** First review the project and understand the current architecture, then begin the implementation. Do not create new files or architecture without reviewing the existing structure.
