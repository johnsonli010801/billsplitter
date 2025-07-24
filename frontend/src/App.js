import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Receipt, Calculator, Share, PartyPopper, Gift, Coffee } from 'lucide-react';

const API_BASE_URL = 'https://billsplitter-production.up.railway.app/api';

export default function BillSplitterApp() {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [newEventName, setNewEventName] = useState('');
  const [joinEventId, setJoinEventId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paid_by: '',
    split_with: []
  });

  // Auto-clear success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadEventData = async (eventId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
      if (!response.ok) throw new Error('Event not found');
      const data = await response.json();
      setEventData(data);
      setError('');
    } catch (err) {
      setError('Failed to load event: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    if (!newEventName.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEventName.trim() })
      });
      
      if (!response.ok) throw new Error('Failed to create event');
      const event = await response.json();
      
      setCurrentEvent(event.id);
      setNewEventName('');
      setSuccess('🎉 Event created successfully!');
      await loadEventData(event.id);
    } catch (err) {
      setError('Failed to create event: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async () => {
    if (!joinEventId.trim()) return;
    
    setCurrentEvent(joinEventId.trim());
    await loadEventData(joinEventId.trim());
    setJoinEventId('');
  };

  const addUser = async () => {
    if (!newUserName.trim() || !currentEvent) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/events/${currentEvent}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newUserName.trim() })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add user');
      }
      
      setNewUserName('');
      setSuccess(`✨ ${newUserName.trim()} joined the party!`);
      await loadEventData(currentEvent);
    } catch (err) {
      setError('Failed to add user: ' + err.message);
    }
  };

  const removeUser = async (userName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${currentEvent}/users/${encodeURIComponent(userName)}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to remove user');
      await loadEventData(currentEvent);
      setSuccess(`👋 ${userName} left the event`);
    } catch (err) {
      setError('Failed to remove user: ' + err.message);
    }
  };

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.paid_by || !currentEvent) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/events/${currentEvent}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          paid_by: newExpense.paid_by,
          split_with: newExpense.split_with
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add expense');
      }
      
      setSuccess(`💰 ${newExpense.description} added to the bill!`);
      setNewExpense({ description: '', amount: '', paid_by: '', split_with: [] });
      await loadEventData(currentEvent);
    } catch (err) {
      setError('Failed to add expense: ' + err.message);
    }
  };

  const removeExpense = async (expenseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${currentEvent}/expenses/${expenseId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to remove expense');
      await loadEventData(currentEvent);
      setSuccess('🗑️ Expense removed');
    } catch (err) {
      setError('Failed to remove expense: ' + err.message);
    }
  };

  const toggleUserInSplit = (user) => {
    const updatedSplitWith = newExpense.split_with.includes(user)
      ? newExpense.split_with.filter(u => u !== user)
      : [...newExpense.split_with, user];
    setNewExpense({...newExpense, split_with: updatedSplitWith});
  };

  const copyWebsiteLink = () => {
    const link = window.location.origin;
    navigator.clipboard.writeText(link);
    setSuccess('🔗 Website link copied! Share it so others can join or create events!');
  };

  const copyEventLink = () => {
    const link = `${window.location.origin}?event=${currentEvent}`;
    navigator.clipboard.writeText(link);
    setSuccess('🎉 Event link copied! Share it with friends to join this specific event!');
  };

  const startNewEvent = () => {
    setCurrentEvent(null);
    setEventData(null);
    setError('');
    setSuccess('');
    window.history.pushState({}, '', window.location.pathname);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event');
    if (eventId) {
      setCurrentEvent(eventId);
      loadEventData(eventId);
    }
  }, []);

  // Welcome/Landing Page
  if (!currentEvent) {
    return (
      <div 
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          minHeight: '100vh',
          width: '100vw',
          margin: 0,
          padding: '2rem',
          boxSizing: 'border-box',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'auto'
        }}
      >
        <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
          {success && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '1rem', 
              backgroundColor: '#10b981', 
              color: 'white', 
              borderRadius: '1rem', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              textAlign: 'center', 
              fontWeight: '600'
            }} className="animate-pulse">
              {success}
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6" style={{ border: '3px solid #8b5cf6' }}>
            <div className="text-center mb-8">
              <div className="mb-6">
                <Receipt size={80} className="mx-auto" style={{ color: '#8b5cf6' }} />
              </div>
              <h1 
                className="text-5xl font-bold mb-4"
                style={{ 
                  background: 'linear-gradient(45deg, #8b5cf6, #ec4899)', 
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Bill Splitter
              </h1>
              <p className="text-gray-600 text-xl mb-2">Split bills like a party! 🎉</p>
              <p className="text-gray-500">Create events, add expenses, and see who owes what!</p>
            </div>
            
            {error && (
              <div style={{ 
                backgroundColor: 'rgba(248, 113, 113, 0.1)', 
                border: '2px solid #f87171', 
                color: '#7f1d1d', 
                padding: '1rem', 
                borderRadius: '0.75rem', 
                marginBottom: '1.5rem',
                fontWeight: '600'
              }}>
                <strong>Oops!</strong> {error}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Create Event Section */}
              <div 
                className="p-6 rounded-2xl border-3"
                style={{ 
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  border: '3px solid #a855f7'
                }}
              >
                <div className="flex items-center mb-4">
                  <PartyPopper className="text-white mr-3" size={28} />
                  <h2 className="text-2xl font-bold text-white">Create New Event</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && createEvent()}
                    placeholder="🎪 Event name (e.g., John's Birthday)"
                    style={{ 
                      flex: '1', 
                      minWidth: '200px',
                      padding: '0.75rem 1rem', 
                      borderRadius: '0.75rem', 
                      border: '2px solid white', 
                      fontSize: '1.125rem',
                      outline: 'none',
                      color: '#1f2937',
                      backgroundColor: 'white'
                    }}
                  />
                  <button
                    onClick={createEvent}
                    disabled={loading}
                    className="px-8 py-3 bg-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{ 
                      color: '#8b5cf6',
                      transform: loading ? 'scale(0.95)' : 'scale(1)'
                    }}
                  >
                    Create ✨
                  </button>
                </div>
              </div>
              
              {/* Join Event Section */}
              <div 
                className="p-6 rounded-2xl border-3"
                style={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                  border: '3px solid #3b82f6'
                }}
              >
                <div className="flex items-center mb-4">
                  <Gift className="text-white mr-3" size={28} />
                  <h2 className="text-2xl font-bold text-white">Join Existing Event</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={joinEventId}
                    onChange={(e) => setJoinEventId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && joinEvent()}
                    placeholder="🎫 Enter event ID"
                    style={{ 
                      flex: '1', 
                      minWidth: '200px',
                      padding: '0.75rem 1rem', 
                      borderRadius: '0.75rem', 
                      border: '2px solid white', 
                      fontSize: '1.125rem',
                      outline: 'none',
                      color: '#1f2937',
                      backgroundColor: 'white'
                    }}
                  />
                  <button
                    onClick={joinEvent}
                    disabled={loading}
                    className="px-8 py-3 bg-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{ 
                      color: '#3b82f6',
                      transform: loading ? 'scale(0.95)' : 'scale(1)'
                    }}
                  >
                    Join 🚀
                  </button>
                </div>
              </div>

              {/* Share Website Button */}
              <div className="text-center pt-4">
                <button
                  onClick={copyWebsiteLink}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ 
                    background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                  }}
                >
                  <Share size={24} />
                  Share Website 🌐
                </button>
                <p className="text-gray-600 mt-3 text-sm">Share this link so others can create or join events!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !eventData) {
    return (
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
          width: '100vw',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="text-center bg-white p-8 rounded-3xl shadow-2xl">
          <div className="text-6xl mb-4 animate-spin">🎪</div>
          <div className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>Loading your event...</div>
        </div>
      </div>
    );
  }

  if (!eventData) return null;

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
        padding: '2rem',
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto'
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {success && (
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem', 
            backgroundColor: '#10b981', 
            color: 'white', 
            borderRadius: '1rem', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            textAlign: 'center', 
            fontWeight: 'bold', 
            fontSize: '1.125rem'
          }} className="animate-pulse">
            {success}
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6" style={{ border: '3px solid #8b5cf6' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ minWidth: '250px' }}>
              <h1 
                className="text-4xl font-bold mb-2 flex items-center gap-3"
                style={{ 
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  fontSize: '2.5rem',
                  fontWeight: '700'
                }}
              >
                <Receipt style={{ color: 'white' }} />
                {eventData.name}
              </h1>
              <p style={{ 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                textShadow: '1px 1px 3px rgba(0,0,0,0.5)' 
              }}>
                <span 
                  style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '9999px', 
                    fontSize: '0.875rem', 
                    fontFamily: 'monospace', 
                    fontWeight: '600',
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    color: '#8b5cf6',
                    border: '2px solid white'
                  }}
                >
                  {currentEvent}
                </span>
                <strong>Event ID</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyEventLink}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' }}
              >
                <Share size={20} />
                Share Event
              </button>
              <button
                onClick={startNewEvent}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}
              >
                <Plus size={20} />
                New Event
              </button>
            </div>
          </div>
          
          {error && (
            <div style={{ 
              marginTop: '1rem', 
              backgroundColor: 'rgba(248, 113, 113, 0.1)', 
              border: '2px solid #f87171', 
              color: '#7f1d1d', 
              padding: '1rem', 
              borderRadius: '0.75rem',
              fontWeight: '600'
            }}>
              <strong>Oops!</strong> {error}
            </div>
          )}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '1.5rem' 
        }}>
          {/* Add Users Section */}
          <div 
            className="bg-white rounded-3xl shadow-2xl p-6"
            style={{ border: '3px solid #10b981' }}
          >
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              marginBottom: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              color: '#1f2937'
            }}>
              <Users style={{ color: '#10b981' }} size={32} />
              Party People ({eventData.users.length})
            </h2>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addUser()}
                placeholder="👤 Enter person's name"
                style={{ 
                  flex: '1', 
                  minWidth: '200px',
                  padding: '0.75rem 1rem', 
                  border: '2px solid #10b981', 
                  borderRadius: '0.75rem', 
                  fontSize: '1.125rem',
                  outline: 'none',
                  color: '#1f2937',
                  backgroundColor: 'white'
                }}
              />
              <button
                onClick={addUser}
                className="px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <Plus size={20} />
                Add
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {eventData.users.map((user, index) => (
                <div 
                  key={user.name} 
                  className="flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-300 hover:shadow-lg"
                  style={{ backgroundColor: '#f0fdf4', borderColor: '#10b981' }}
                >
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#1f2937', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem' 
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {index === 0 ? '🎉' : index === 1 ? '🎊' : index === 2 ? '✨' : '🎁'}
                    </span>
                    <span style={{ fontSize: '1.125rem', color: '#374151', fontWeight: '700' }}>{user.name}</span>
                  </span>
                  <button
                    onClick={() => removeUser(user.name)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 p-2 rounded-lg transition-all duration-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Expense Section */}
          <div 
            className="bg-white rounded-3xl shadow-2xl p-6"
            style={{ border: '3px solid #f59e0b' }}
          >
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              marginBottom: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              color: '#1f2937'
            }}>
              <Coffee style={{ color: '#f59e0b' }} size={32} />
              Add Expense
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                placeholder="🛍️ What was purchased?"
                style={{ 
                  width: '100%',
                  padding: '0.75rem 1rem', 
                  border: '2px solid #f59e0b', 
                  borderRadius: '0.75rem', 
                  fontSize: '1.125rem',
                  outline: 'none',
                  color: '#1f2937',
                  backgroundColor: 'white'
                }}
              />
              
              <input
                type="number"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                placeholder="💰 Amount ($)"
                style={{ 
                  width: '100%',
                  padding: '0.75rem 1rem', 
                  border: '2px solid #f59e0b', 
                  borderRadius: '0.75rem', 
                  fontSize: '1.125rem',
                  outline: 'none',
                  color: '#1f2937',
                  backgroundColor: 'white'
                }}
              />
              
              <select
                value={newExpense.paid_by}
                onChange={(e) => setNewExpense({...newExpense, paid_by: e.target.value})}
                style={{ 
                  width: '100%',
                  padding: '0.75rem 1rem', 
                  border: '2px solid #f59e0b', 
                  borderRadius: '0.75rem', 
                  fontSize: '1.125rem',
                  outline: 'none',
                  color: '#1f2937',
                  backgroundColor: 'white'
                }}
              >
                <option value="">💳 Who paid?</option>
                {eventData.users.map(user => (
                  <option key={user.name} value={user.name}>{user.name}</option>
                ))}
              </select>

              <div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '0.75rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem' 
                }}>
                  <span>🎯</span>
                  Split with (leave empty for everyone):
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {eventData.users.map(user => (
                    <button
                      key={user.name}
                      onClick={() => toggleUserInSplit(user.name)}
                      style={{
                        padding: '0.5rem 1rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        transition: 'all 0.3s',
                        backgroundColor: newExpense.split_with.includes(user.name) ? '#8b5cf6' : '#e5e7eb',
                        color: newExpense.split_with.includes(user.name) ? 'white' : '#374151',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={addExpense}
                disabled={!newExpense.description || !newExpense.amount || !newExpense.paid_by}
                className="w-full px-6 py-4 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                style={{ 
                  background: !newExpense.description || !newExpense.amount || !newExpense.paid_by 
                    ? '#9ca3af' 
                    : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
                }}
              >
                <Plus size={24} />
                Add Expense 💸
              </button>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        {eventData.expenses.length > 0 && (
          <div 
            className="bg-white rounded-3xl shadow-2xl p-6 mb-6"
            style={{ border: '3px solid #3b82f6' }}
          >
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              marginBottom: '1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              color: '#1f2937'
            }}>
              <Receipt style={{ color: '#3b82f6' }} size={32} />
              Expenses (Total: <span style={{ color: '#10b981' }}>${eventData.total_expenses.toFixed(2)}</span>)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {eventData.expenses.map((expense, index) => (
                <div 
                  key={expense.id} 
                  className="flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg"
                  style={{ backgroundColor: '#eff6ff', borderColor: '#3b82f6' }}
                >
                  <div>
                    <h3 style={{ 
                      fontWeight: '700', 
                      fontSize: '1.125rem', 
                      color: '#1f2937', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      marginBottom: '0.25rem' 
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {index % 4 === 0 ? '🍕' : index % 4 === 1 ? '🍺' : index % 4 === 2 ? '🎂' : '☕'}
                      </span>
                      {expense.description}
                    </h3>
                    <p style={{ color: '#4b5563', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '600', color: '#10b981' }}>
                        ${expense.amount.toFixed(2)}
                      </span> paid by{' '}
                      <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                        {expense.paid_by}
                      </span>
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Split between: {expense.split_with.join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => removeExpense(expense.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100 p-3 rounded-xl transition-all duration-300"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settlement Calculations */}
        {eventData.users.length > 0 && eventData.expenses.length > 0 && (
          <div 
            className="bg-white rounded-3xl shadow-2xl p-6"
            style={{ border: '3px solid #10b981' }}
          >
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '700', 
              marginBottom: '2rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              color: '#1f2937'
            }}>
              <Calculator style={{ color: '#10b981' }} size={36} />
              Who Owes What 🧮
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '2rem' 
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  color: '#1f2937', 
                  marginBottom: '1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem' 
                }}>
                  <span>📊</span>
                  Individual Balances
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(eventData.balances).map(([user, balance]) => (
                    <div 
                      key={user} 
                      className="flex justify-between p-4 rounded-xl font-semibold text-lg border-2 transition-all duration-300"
                      style={{
                        backgroundColor: balance > 0.01 ? '#f0fdf4' : balance < -0.01 ? '#fef2f2' : '#f9fafb',
                        borderColor: balance > 0.01 ? '#10b981' : balance < -0.01 ? '#ef4444' : '#9ca3af',
                        color: balance > 0.01 ? '#065f46' : balance < -0.01 ? '#991b1b' : '#374151'
                      }}
                    >
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        color: balance > 0.01 ? '#065f46' : balance < -0.01 ? '#991b1b' : '#374151',
                        fontSize: '1.125rem',
                        fontWeight: '600'
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>
                          {balance > 0.01 ? '💰' : balance < -0.01 ? '💸' : '⚖️'}
                        </span>
                        {user}
                      </span>
                      <span className="font-bold">
                        {balance > 0.01 ? `+$${balance.toFixed(2)} 🎉` :
                         balance < -0.01 ? `-$${Math.abs(balance).toFixed(2)} 💳` :
                         'All Good! ✅'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  color: '#1f2937', 
                  marginBottom: '1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem' 
                }}>
                  <span>🔄</span>
                  Settlements Needed
                </h3>
                {eventData.settlements.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {eventData.settlements.map((settlement, index) => (
                      <div 
                        key={index} 
                        className="p-4 rounded-xl border-2 transition-all duration-300"
                        style={{ backgroundColor: '#dbeafe', borderColor: '#3b82f6' }}
                      >
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem', 
                            fontSize: '1.125rem', 
                            fontWeight: '700', 
                            marginBottom: '0.5rem' 
                          }}>
                            <span style={{ color: '#ef4444', fontWeight: '700' }}>{settlement.from}</span>
                            <span style={{ color: '#6b7280' }}>owes</span>
                            <span style={{ color: '#10b981', fontWeight: '700' }}>{settlement.to}</span>
                          </div>
                          <div style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: '700', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '0.5rem',
                            color: '#1e40af' 
                          }}>
                            <span>💰</span>
                            ${settlement.amount.toFixed(2)}
                            <span>💰</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    borderRadius: '0.75rem', 
                    border: '2px solid #10b981',
                    backgroundColor: '#f0fdf4'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#065f46' }}>
                      Everyone is settled up!
                    </div>
                    <div style={{ color: '#16a34a', marginTop: '0.5rem' }}>
                      No money needs to change hands! 🎊
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }
        
        body {
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        .animate-spin {
          animation: spin 2s linear infinite;
        }
      `}</style>
    </div>
  );
}