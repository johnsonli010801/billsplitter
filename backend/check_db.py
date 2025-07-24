from app import app, db, Event, User, Expense, ExpenseSplit

with app.app_context():
    print("=== ALL EVENTS ===")
    events = Event.query.all()
    for event in events:
        print(f"Event: {event.name} (ID: {event.id})")
        print(f"  Created: {event.created_at}")
        print(f"  Users: {[u.name for u in event.users]}")
        print(f"  Expenses: {len(event.expenses)}")
        for expense in event.expenses:
            print(f"    - {expense.description}: ${expense.amount} paid by {expense.paid_by}")
        print()
    
    print(f"Total Events: {len(events)}")
    print(f"Total Users: {User.query.count()}")
    print(f"Total Expenses: {Expense.query.count()}")