# QuickBite frontend audit — 2026 modernization

Baseline: `main` at `da9196c`. Audited source routes and rendered the existing build at 320, 375, 390, 427, 768, 1024, 1366 and 1920 px. Protected screens used local browser sessions and intercepted, realistic read responses; no production records were changed. Screenshots and the temporary audit harness are excluded from commits.

| Route / screen | Current condition and issue | Planned improvement | Mobile and functional risk |
| --- | --- | --- | --- |
| `/` Home | Strong orange/navy identity and food imagery; tall three-row mobile header delays hero; large desktop hero | Compact navigation, tighter hero and section rhythm, preserve food images and loading behavior | Keep featured food and collections visible without clipping |
| `/menu` Menu | Search, filters and cards work; title and filters consume first viewport; search lacks an accessible label | Compact header/filter grouping, clear search label and filter states | Preserve sorting, category selection, Add to Cart |
| `/login` Login | Basic centered form with excessive blank space; labels lack field associations | Sharper auth panel, associated labels, password visibility, accessible errors | Keep existing role redirects and login API |
| `/register` Register | Long single-column form, seven unlabeled fields | Structured customer/delivery fields and responsive form spacing | Keep registration payload and conditional vehicle fields |
| `/careers` Careers | Simple content card with large title band | Improve reading hierarchy and compact spacing | Preserve existing information |
| `/contact` Contact | Simple informational card | Improve reading hierarchy and action clarity | Keep existing links/content |
| `/support` Support | Simple informational card | Improve reading hierarchy and action clarity | Keep existing links/content |
| `/customer/cart` Cart | Functional list and summary; mobile header uses ~300 px; card image/content require tighter hierarchy | Compact header, consistent item controls and summary | Quantity/remove calls stay intact; mock writes only during verification |
| `/customer/checkout` Checkout | Clear step content but tall header and unassociated field labels | Improve form labels, payment selection, summary and narrow stacking | Preserve mock card disclaimer and order/payment payloads |
| `/customer/orders` My Orders | Stats and detailed order cards; excessive vertical lead-in | Compact stats/search/filters and readable order actions | Preserve filter, cancellation and tracking |
| `/customer/orders/:orderId/track` Tracking | Step timeline and order detail present | Strengthen current-step hierarchy and responsive detail cards | Preserve status mapping and read behavior |
| `/profile` Profile | Shared role route; five or more unassociated fields in settled view | Consistent account panel, associated labels and save feedback | Preserve role-specific fields and profile update |
| `/delivery/dashboard` Delivery dashboard | Desktop sidebar stacks above all content on mobile, filling almost a viewport | Compact mobile delivery header and bottom navigation; concise stats | Preserve assigned/active/completed data and quick actions |
| `/delivery/assigned-orders` Assigned orders | Same sidebar burden; order status and accept/reject actions present | Put order and actions first on mobile, improve form labels | Preserve status transition and rejection workflow |
| `/delivery/completed-orders` Completed orders | Same sidebar burden; detailed history cards | Compact history and responsive order detail | Preserve order history and payment details |
| `/admin/dashboard` Admin dashboard | Desktop shell is usable; large cards and mixed emoji iconography | More consistent desktop density, metrics and typography | Keep existing calculations and notifications |
| `/admin/categories` Categories | CRUD table and form; narrow viewport overflows at 320/390 | Responsive data presentation and labeled fields | Preserve CRUD; no production write tests |
| `/admin/foods` Foods | CRUD form/cards; eight unassociated fields | Better field grouping, previews and responsive layout | Preserve image URLs and food payloads |
| `/admin/collections` Collections | CRUD form/cards; five unassociated fields | Better field grouping, previews and responsive layout | Preserve collection ordering and payloads |
| `/admin/orders` Orders | Dense order cards and status/assignment controls | Clarify information hierarchy and select labels | Preserve assignments and status actions |

`/customer/dashboard` is a redirect to `/menu`; `CustomerDashboard.jsx` is not routed. Shared components: `Navbar`, `AdminLayout`, `DeliveryLayout`, `FoodCard`, `PageHeader`, `BackButton`, `LoadingSpinner`, `EmptyState`, `StatusBadge`, `NotificationBell`. Existing CSS has repeated overrides and no consistent focus-visible treatment. Shared tokens, field focus, motion and control sizing should be standardized before page polish. Admin remains desktop-first; its narrow fallback should stay usable.

## Verification boundary

Public catalog reads may use the deployed API. Customer, Delivery and Admin UI checks use local mock sessions and intercepted API data. Account creation, checkout, cart mutations, order changes, profile saves and Admin CRUD must not write to production during this modernization. Real backend end-to-end testing awaits dedicated accounts.
