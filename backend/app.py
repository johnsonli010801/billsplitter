from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import uuid
import os

app = Flask(__name__)
CORS(app)  # Allow frontend to communicate with backend

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///bill_splitter.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Models
class Event(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    users = db.relationship('User', backref='event', lazy=True, cascade='all, delete-orphan')
    expenses = db.relationship('Expense', backref='event', lazy=True, cascade='all, delete-orphan')

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    event_id = db.Column(db.String(36), db.ForeignKey('event.id'), nullable=False)

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    paid_by = db.Column(db.String(50), nullable=False)
    event_id = db.Column(db.String(36), db.ForeignKey('event.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    split_users = db.relationship('ExpenseSplit', backref='expense', lazy=True, cascade='all, delete-orphan')

class ExpenseSplit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    expense_id = db.Column(db.Integer, db.ForeignKey('expense.id'), nullable=False)
    user_name = db.Column(db.String(50), nullable=False)

# Helper Functions
def calculate_balances(event_id):
    event = Event.query.get_or_404(event_id)
    users = [user.name for user in event.users]
    balances = {user: 0.0 for user in users}
    
    for expense in event.expenses:
        split_with = [split.user_name for split in expense.split_users]
        if not split_with:  # If no specific split, use all users
            split_with = users
        
        if split_with:  # Avoid division by zero
            split_amount = expense.amount / len(split_with)
            
            # Person who paid gets credited
            if expense.paid_by in balances:
                balances[expense.paid_by] += expense.amount
            
            # Each person in split owes their share
            for user in split_with:
                if user in balances:
                    balances[user] -= split_amount
    
    return balances

def calculate_settlements(balances):
    settlements = []
    creditors = [(user, balance) for user, balance in balances.items() if balance > 0.01]
    debtors = [(user, balance) for user, balance in balances.items() if balance < -0.01]
    
    for creditor, credit_amount in creditors:
        for debtor, debt_amount in debtors:
            if abs(debt_amount) > 0.01 and credit_amount > 0.01:
                settlement_amount = min(credit_amount, abs(debt_amount))
                settlements.append({
                    'from': debtor,
                    'to': creditor,
                    'amount': round(settlement_amount, 2)
                })
                credit_amount -= settlement_amount
                debt_amount += settlement_amount
                
                # Update the amounts for next iteration
                for i, (c, _) in enumerate(creditors):
                    if c == creditor:
                        creditors[i] = (c, credit_amount)
                        break
                for i, (d, _) in enumerate(debtors):
                    if d == debtor:
                        debtors[i] = (d, debt_amount)
                        break
    
    return [s for s in settlements if s['amount'] > 0.01]

# API Routes
@app.route('/api/events', methods=['POST'])
def create_event():
    data = request.json
    event = Event(
        name=data.get('name', 'New Event'),
        description=data.get('description', '')
    )
    db.session.add(event)
    db.session.commit()
    
    return jsonify({
        'id': event.id,
        'name': event.name,
        'description': event.description,
        'created_at': event.created_at.isoformat()
    }), 201

@app.route('/api/events/<event_id>', methods=['GET'])
def get_event(event_id):
    event = Event.query.get_or_404(event_id)
    users = [{'name': user.name} for user in event.users]
    
    expenses = []
    for expense in event.expenses:
        split_with = [split.user_name for split in expense.split_users]
        expenses.append({
            'id': expense.id,
            'description': expense.description,
            'amount': expense.amount,
            'paid_by': expense.paid_by,
            'split_with': split_with if split_with else [user.name for user in event.users],
            'created_at': expense.created_at.isoformat()
        })
    
    balances = calculate_balances(event_id)
    settlements = calculate_settlements(balances)
    total_expenses = sum(expense.amount for expense in event.expenses)
    
    return jsonify({
        'id': event.id,
        'name': event.name,
        'description': event.description,
        'users': users,
        'expenses': expenses,
        'balances': balances,
        'settlements': settlements,
        'total_expenses': total_expenses,
        'created_at': event.created_at.isoformat()
    })

@app.route('/api/events/<event_id>/users', methods=['POST'])
def add_user(event_id):
    event = Event.query.get_or_404(event_id)
    data = request.json
    user_name = data.get('name', '').strip()
    
    if not user_name:
        return jsonify({'error': 'Name is required'}), 400
    
    # Check if user already exists
    existing_user = User.query.filter_by(event_id=event_id, name=user_name).first()
    if existing_user:
        return jsonify({'error': 'User already exists'}), 400
    
    user = User(name=user_name, event_id=event_id)
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'name': user.name}), 201

@app.route('/api/events/<event_id>/users/<user_name>', methods=['DELETE'])
def remove_user(event_id, user_name):
    user = User.query.filter_by(event_id=event_id, name=user_name).first_or_404()
    
    # Remove user from all expense splits
    ExpenseSplit.query.filter_by(user_name=user_name).delete()
    
    # Remove expenses paid by this user
    Expense.query.filter_by(event_id=event_id, paid_by=user_name).delete()
    
    db.session.delete(user)
    db.session.commit()
    
    return '', 204

@app.route('/api/events/<event_id>/expenses', methods=['POST'])
def add_expense(event_id):
    event = Event.query.get_or_404(event_id)
    data = request.json
    
    description = data.get('description', '').strip()
    amount = data.get('amount', 0)
    paid_by = data.get('paid_by', '').strip()
    split_with = data.get('split_with', [])
    
    if not description or not amount or not paid_by:
        return jsonify({'error': 'Description, amount, and paid_by are required'}), 400
    
    try:
        amount = float(amount)
    except ValueError:
        return jsonify({'error': 'Invalid amount'}), 400
    
    expense = Expense(
        description=description,
        amount=amount,
        paid_by=paid_by,
        event_id=event_id
    )
    db.session.add(expense)
    db.session.flush()  # Get the expense ID
    
    # Add split users
    for user_name in split_with:
        split = ExpenseSplit(expense_id=expense.id, user_name=user_name)
        db.session.add(split)
    
    db.session.commit()
    
    return jsonify({
        'id': expense.id,
        'description': expense.description,
        'amount': expense.amount,
        'paid_by': expense.paid_by,
        'split_with': split_with,
        'created_at': expense.created_at.isoformat()
    }), 201

@app.route('/api/events/<event_id>/expenses/<int:expense_id>', methods=['DELETE'])
def remove_expense(event_id, expense_id):
    expense = Expense.query.filter_by(id=expense_id, event_id=event_id).first_or_404()
    db.session.delete(expense)
    db.session.commit()
    return '', 204

@app.route('/api/events/<event_id>/calculate', methods=['GET'])
def calculate_event_balances(event_id):
    balances = calculate_balances(event_id)
    settlements = calculate_settlements(balances)
    
    return jsonify({
        'balances': balances,
        'settlements': settlements
    })

# Root endpoint (optional - for testing)
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': 'Bill Splitter API is running!',
        'version': '1.0',
        'endpoints': {
            'health': '/api/health',
            'create_event': 'POST /api/events',
            'get_event': 'GET /api/events/{event_id}'
        }
    })

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Bill Splitter API is running'})

# Add this endpoint to see all data
@app.route('/api/debug/all-data', methods=['GET'])
def get_all_data():
    events = []
    for event in Event.query.all():
        events.append({
            'id': event.id,
            'name': event.name,
            'created_at': event.created_at.isoformat(),
            'users': [u.name for u in event.users],
            'expenses': [
                {
                    'description': e.description,
                    'amount': e.amount,
                    'paid_by': e.paid_by,
                    'split_with': [s.user_name for s in e.split_users]
                }
                for e in event.expenses
            ]
        })
    
    return jsonify({
        'total_events': len(events),
        'events': events
    })
# Create tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)